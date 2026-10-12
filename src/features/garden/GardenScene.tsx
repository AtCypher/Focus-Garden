import { useMemo } from 'react';
import type { Biome, TilePosition } from '@/types';
import type { GardenLevel } from '@/data/gardenLevels';
import { BIOME_BY_ID } from '@/data/biomes';
import { getSpecies } from '@/data/species';
import { mix } from '@/art/plants/common';
import { PlantArt } from '@/art/PlantArt';
import { DecorationArt } from '@/art/Decorations';
import { SceneryBack, SceneryFront } from '@/art/Scenery';
import {
  biomeOfTile,
  gardenBounds,
  tileKey,
  tileToScreen,
  TILE_H,
  TILE_W,
  type GardenLayout,
} from './layout';
import { SEASON_TINTS, TIME_TINTS, type Season, type TimeOfDay } from './daylight';

export interface GardenSceneProps {
  level: GardenLevel;
  layout: GardenLayout;
  restoration: Record<Biome, number>;
  time?: TimeOfDay;
  season?: Season | null;
  selectedId?: string | null;
  /** Arrange mode: free tiles become targets. */
  arranging?: boolean;
  onSelectPlant?: (id: string) => void;
  onSelectDecoration?: (id: string) => void;
  onSelectTile?: (tile: TilePosition) => void;
  interactive?: boolean;
  className?: string;
  /** Explicit pixel size (for rasterising); otherwise fills its container. */
  width?: number;
  height?: number;
  id?: string;
}

const GREY = { top: '#bdb8ae', side: '#948f85', grass: '#c9c4ba' };
const PLANT_SIZE = 76;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** The isometric garden as one SVG. Pure presentation; interaction is reported through callbacks. */
export function GardenScene({
  level,
  layout,
  restoration,
  time = 'day',
  season = null,
  selectedId = null,
  arranging = false,
  onSelectPlant,
  onSelectDecoration,
  onSelectTile,
  interactive = true,
  className = '',
  width,
  height,
  id,
}: GardenSceneProps) {
  const bounds = useMemo(() => gardenBounds(level), [level]);
  const tall = level.features.includes('hills') || level.features.includes('snowcaps');
  const pad = { l: 60, r: 60, t: tall ? 170 : 110, b: 70 };
  const vb = {
    x: bounds.minX - pad.l,
    y: bounds.minY - pad.t,
    w: bounds.maxX - bounds.minX + pad.l + pad.r,
    h: bounds.maxY - bounds.minY + pad.t + pad.b,
  };
  const night = time === 'night';
  const tint = TIME_TINTS[time];
  const seasonTint = season ? SEASON_TINTS[season] : null;

  const tiles = useMemo(() => {
    const out: { tile: TilePosition; biome: Biome; x: number; y: number }[] = [];
    for (let row = 0; row < level.rows; row++)
      for (let col = 0; col < level.cols; col++) {
        const t = { col, row };
        const { x, y } = tileToScreen(t);
        out.push({ tile: t, biome: biomeOfTile(level, t) ?? 'meadow', x, y });
      }
    return out;
  }, [level]);

  const items = useMemo(() => {
    const list: { key: string; depth: number; node: JSX.Element }[] = [];
    for (const d of layout.decorations) {
      const { x, y } = tileToScreen(d.tile);
      const selected = d.id === selectedId;
      list.push({
        key: d.id,
        depth: d.tile.col + d.tile.row,
        node: (
          <g
            transform={`translate(${x} ${y + 6})`}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={`Decoration: ${d.kind}`}
            onClick={() => onSelectDecoration?.(d.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectDecoration?.(d.id);
              }
            }}
            className={interactive ? 'focus-ring cursor-pointer' : ''}
          >
            {selected && (
              <ellipse
                cx="0"
                cy="-4"
                rx="30"
                ry="14"
                fill="none"
                stroke="#3ea6cd"
                strokeWidth="3"
              />
            )}
            <DecorationArt kind={d.kind} />
          </g>
        ),
      });
    }
    for (const { plant, tile } of layout.placed) {
      const { x, y } = tileToScreen(tile);
      const species = getSpecies(plant.speciesId);
      const selected = plant.id === selectedId;
      const scale = plant.variant === 'ancient' ? 1.25 : plant.variant === 'mature' ? 1.12 : 1;
      const size = PLANT_SIZE * scale;
      const label = `${species.name}${plant.wilted ? ', wilted' : ''}${plant.variant !== 'standard' ? `, ${plant.variant}` : ''}, grown ${new Date(plant.grownAt).toLocaleDateString()}`;
      list.push({
        key: plant.id,
        depth: tile.col + tile.row + 0.5,
        node: (
          <g
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={label}
            onClick={() => onSelectPlant?.(plant.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPlant?.(plant.id);
              }
            }}
            className={interactive ? 'focus-ring cursor-pointer' : ''}
          >
            {selected && (
              <ellipse
                cx={x}
                cy={y + 4}
                rx="30"
                ry="14"
                fill="none"
                stroke="#3ea6cd"
                strokeWidth="3"
              />
            )}
            <svg
              x={x - size / 2}
              y={y + 6 - size * 0.85}
              width={size}
              height={size}
              viewBox="0 0 200 200"
              overflow="visible"
            >
              <PlantArt
                species={species}
                growth={1}
                wilted={plant.wilted}
                variant={plant.variant}
                size={200}
                soil={false}
                seed={hash(plant.id)}
                title={label}
              />
            </svg>
          </g>
        ),
      });
    }
    list.sort((a, b) => a.depth - b.depth);
    return list;
  }, [layout, selectedId, interactive, onSelectPlant, onSelectDecoration]);

  const sizeProps = width && height ? { width, height } : { width: '100%', height: '100%' };

  return (
    <svg
      id={id}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={`${level.name} garden with ${layout.placed.length} plants`}
      {...sizeProps}
    >
      <defs>
        <linearGradient id="gd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint.skyTop} />
          <stop offset="100%" stopColor={tint.skyBottom} />
        </linearGradient>
      </defs>
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#gd-sky)" rx="24" />
      <SceneryBack features={level.features} box={bounds} night={night} />

      {/* terrain */}
      <g>
        {tiles.map(({ tile, biome, x, y }) => {
          const ground = BIOME_BY_ID[biome].ground;
          const r = restoration[biome] ?? 0;
          const top = mix(GREY.top, ground.top, r);
          const side = mix(GREY.side, ground.side, r);
          const free = !layout.occupied.has(tileKey(tile));
          const target = arranging && free && interactive;
          const hw = TILE_W / 2;
          const hh = TILE_H / 2;
          const diamond = `M${x} ${y - hh} L${x + hw} ${y} L${x} ${y + hh} L${x - hw} ${y} Z`;
          return (
            <g key={tileKey(tile)}>
              {tile.row === level.rows - 1 && (
                <path
                  d={`M${x - hw} ${y} L${x} ${y + hh} L${x} ${y + hh + 14} L${x - hw} ${y + 14} Z`}
                  fill={side}
                />
              )}
              {tile.col === level.cols - 1 && (
                <path
                  d={`M${x} ${y + hh} L${x + hw} ${y} L${x + hw} ${y + 14} L${x} ${y + hh + 14} Z`}
                  fill={mix(side, '#000', 0.15)}
                />
              )}
              <path
                d={diamond}
                fill={top}
                stroke={mix(top, '#000', 0.08)}
                strokeWidth="1"
                className={target ? 'cursor-pointer' : undefined}
                role={target ? 'button' : undefined}
                tabIndex={target ? 0 : undefined}
                aria-label={
                  target ? `Empty ${biome} tile ${tile.col + 1}, ${tile.row + 1}` : undefined
                }
                onClick={target ? () => onSelectTile?.(tile) : undefined}
                onKeyDown={
                  target
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTile?.(tile);
                        }
                      }
                    : undefined
                }
              />
              {target && <circle cx={x} cy={y} r="5" fill="#3ea6cd" opacity="0.8" />}
              {level.features.includes('grass') && r >= 0.5 && (
                <path
                  d={`M${x - 12} ${y + 4} l2 -6 l2 6 M${x + 10} ${y - 3} l2 -6 l2 6`}
                  stroke={ground.grass}
                  strokeWidth="1.5"
                  fill="none"
                />
              )}
            </g>
          );
        })}
      </g>

      {items.map((i) => (
        <g key={i.key}>{i.node}</g>
      ))}

      <SceneryFront features={level.features} box={bounds} night={night} />

      {tint.opacity > 0 && (
        <rect
          x={vb.x}
          y={vb.y}
          width={vb.w}
          height={vb.h}
          fill={tint.color}
          opacity={tint.opacity}
          rx="24"
          pointerEvents="none"
        />
      )}
      {seasonTint && (
        <rect
          x={vb.x}
          y={vb.y}
          width={vb.w}
          height={vb.h}
          fill={seasonTint.color}
          opacity={seasonTint.opacity}
          rx="24"
          pointerEvents="none"
        />
      )}
    </svg>
  );
}
