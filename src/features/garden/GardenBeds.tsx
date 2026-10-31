import { useMemo } from 'react';
import type { Biome, Decoration, Plant } from '@/types';
import type { GardenLevel } from '@/data/gardenLevels';
import { BIOME_BY_ID, BIOMES } from '@/data/biomes';
import { getSpecies } from '@/data/species';
import { PlantArt } from '@/art/PlantArt';
import { DecorationArt } from '@/art/Decorations';
import { VisitorArt } from '@/art/Visitors';
import { SceneryBack } from '@/art/Scenery';
import { mix } from '@/art/plants/common';
import type { Sighting } from '@/features/collection/rituals';
import { TIME_TINTS, type Season, type TimeOfDay } from './daylight';
import { biomeOfTile } from './layout';

export interface GardenBedsProps {
  level: GardenLevel;
  plants: Plant[];
  decorations: Decoration[];
  restoration: Record<Biome, number>;
  time: TimeOfDay;
  season: Season | null;
  visitors: Sighting[];
  weather: 'rain' | 'sun' | 'mist' | null;
  selectedId: string | null;
  arranging: boolean;
  onSelectPlant: (id: string) => void;
  onSelectDecoration: (id: string) => void;
}

const COLS = 5;
const CELL = 80;
const ROW_H = 54;
const PLANT = 78;
const MAX_PER_BED = 30;
const GREY = { top: '#bdb8ae', side: '#948f85' };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * The garden as a column of beds, one per unlocked biome. Plants stand in rows on their bed and
 * the page simply scrolls: no panning, no zooming, big plants.
 */
export function GardenBeds({
  level,
  plants,
  decorations,
  restoration,
  time,
  season,
  visitors,
  weather,
  selectedId,
  arranging,
  onSelectPlant,
  onSelectDecoration,
}: GardenBedsProps) {
  const night = time === 'night';
  const tint = TIME_TINTS[time];
  const biomes = useMemo(() => BIOMES.filter((b) => b.unlockLevel <= level.level), [level]);
  const byBiome = useMemo(() => {
    const m = new Map<Biome, Plant[]>();
    for (const b of biomes) m.set(b.id, []);
    for (const p of [...plants].sort((a, b) => a.grownAt.localeCompare(b.grownAt)))
      m.get(p.biome)?.push(p);
    return m;
  }, [plants, biomes]);
  const decoByBiome = useMemo(() => {
    const m = new Map<Biome, Decoration[]>();
    for (const d of decorations) {
      const b = biomeOfTile(level, d.tile) ?? biomes[0]?.id;
      if (!b) continue;
      m.set(b, [...(m.get(b) ?? []), d]);
    }
    return m;
  }, [decorations, level, biomes]);

  const horizonBox = { minX: 0, maxX: 800, minY: 70, maxY: 150 };

  return (
    <div className="flex flex-col gap-3">
      {/* Horizon banner: the sky and the level's scenery. */}
      <div className="overflow-hidden rounded-3xl" style={{ background: tint.skyBottom }}>
        <svg
          viewBox="0 0 800 170"
          className="block h-auto w-full"
          role="img"
          aria-label={`${level.name} skyline`}
        >
          <defs>
            <linearGradient id="beds-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tint.skyTop} />
              <stop offset="100%" stopColor={tint.skyBottom} />
            </linearGradient>
          </defs>
          <rect width="800" height="170" fill="url(#beds-sky)" />
          {!night && <circle cx="700" cy="44" r="22" fill="#ffe08a" opacity="0.9" />}
          <SceneryBack features={level.features} box={horizonBox} night={night} />
          <rect
            x="0"
            y="150"
            width="800"
            height="20"
            fill={mix(GREY.top, '#9ccb6b', Math.max(...Object.values(restoration), 0))}
          />
          {weather === 'rain' && (
            <g stroke="#7fc3e0" strokeWidth="1.5" opacity="0.7" className="gd-rain">
              {Array.from({ length: 30 }, (_, i) => (
                <path key={i} d={`M${(i * 53) % 800} ${(i * 37) % 150} l-4 12`} />
              ))}
            </g>
          )}
          {weather === 'mist' && <rect width="800" height="170" fill="#dfe8f2" opacity="0.35" />}
          {season && (
            <rect
              width="800"
              height="170"
              fill={
                season === 'autumn'
                  ? '#e5a05a'
                  : season === 'winter'
                    ? '#dfe8f2'
                    : season === 'spring'
                      ? '#d6f5c6'
                      : '#fff3b0'
              }
              opacity={season === 'winter' ? 0.2 : 0.08}
            />
          )}
          {tint.opacity > 0 && (
            <rect width="800" height="170" fill={tint.color} opacity={tint.opacity} />
          )}
        </svg>
      </div>

      {biomes.map((biome) => {
        const list = byBiome.get(biome.id) ?? [];
        const shownPlants = list.slice(-MAX_PER_BED);
        const extra = list.length - shownPlants.length;
        const r = restoration[biome.id] ?? 0;
        const top = mix(GREY.top, biome.ground.top, r);
        const side = mix(GREY.side, biome.ground.side, r);
        const rows = Math.max(1, Math.ceil(shownPlants.length / COLS));
        const height = 40 + rows * ROW_H + 70;
        const width = COLS * CELL;
        const decos = decoByBiome.get(biome.id) ?? [];
        const sightings = visitors.filter((v) => v.visitor.biome === biome.id);
        return (
          <section key={biome.id} className="card overflow-hidden" aria-label={`${biome.name} bed`}>
            <header className="flex items-baseline justify-between px-4 pt-3">
              <h2 className="text-sm font-semibold">{biome.name}</h2>
              <p className="text-muted text-xs">
                {list.length} plant{list.length === 1 ? '' : 's'} · {Math.round(r * 100)}% restored
              </p>
            </header>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="block h-auto w-full"
              role="group"
              aria-label={`${biome.name}: ${list.length} plants`}
            >
              {/* ground: a soft slab, back rows higher */}
              <path
                d={`M0 ${height - 60} Q${width / 2} ${height - 76} ${width} ${height - 60} L${width} ${height - 20} Q${width / 2} ${height - 4} 0 ${height - 20} Z`}
                fill={side}
              />
              <path
                d={`M0 ${height - 64} Q${width / 2} ${height - 80} ${width} ${height - 64} L${width} ${height - 28} Q${width / 2} ${height - 12} 0 ${height - 28} Z`}
                fill={top}
              />
              {level.features.includes('grass') && r >= 0.5 && (
                <g stroke={biome.ground.grass} strokeWidth="1.5" fill="none">
                  {Array.from({ length: 12 }, (_, i) => (
                    <path key={i} d={`M${20 + i * 32} ${height - 36 + (i % 3) * 4} l2 -7 l2 7`} />
                  ))}
                </g>
              )}
              {list.length === 0 && (
                <text
                  x={width / 2}
                  y={height - 40}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#5b6b5e"
                  fontFamily="system-ui, sans-serif"
                >
                  Nothing here yet
                </text>
              )}
              {shownPlants.map((p, i) => {
                // Fill from the back row so the newest plants stand in front.
                const idx = shownPlants.length - 1 - i;
                const row = rows - 1 - Math.floor(idx / COLS);
                const col = idx % COLS;
                const offset = (row % 2) * (CELL / 2);
                const x = col * CELL + CELL / 2 + (rows > 1 ? offset * 0.3 : 0);
                const y = 40 + row * ROW_H + (height - 40 - rows * ROW_H - 46);
                const species = getSpecies(p.speciesId);
                const scale =
                  (p.variant === 'ancient' ? 1.2 : p.variant === 'mature' ? 1.1 : 1) *
                  (0.84 + (row / Math.max(1, rows - 1 || 1)) * 0.16);
                const size = PLANT * scale;
                const selected = p.id === selectedId;
                const label = `${species.name}${p.wilted ? ', wilted' : ''}${p.variant !== 'standard' ? `, ${p.variant}` : ''}, grown ${new Date(p.grownAt).toLocaleDateString()}`;
                return (
                  <g
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    className={`focus-ring cursor-pointer ${arranging ? 'gd-visitor' : ''}`}
                    onClick={() => onSelectPlant(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectPlant(p.id);
                      }
                    }}
                  >
                    {selected && (
                      <ellipse
                        cx={x}
                        cy={y + 6}
                        rx="30"
                        ry="10"
                        fill="none"
                        stroke="#3ea6cd"
                        strokeWidth="3"
                      />
                    )}
                    <ellipse cx={x} cy={y + 6} rx="22" ry="6" fill="#000" opacity="0.08" />
                    <svg
                      x={x - size / 2}
                      y={y + 8 - size * 0.85}
                      width={size}
                      height={size}
                      viewBox="0 0 200 200"
                      overflow="visible"
                    >
                      <PlantArt
                        species={species}
                        growth={1}
                        wilted={p.wilted}
                        variant={p.variant}
                        size={200}
                        soil={false}
                        seed={hash(p.id)}
                        title={label}
                      />
                    </svg>
                  </g>
                );
              })}
              {decos.map((d, i) => (
                <g
                  key={d.id}
                  transform={`translate(${width - 36 - i * 44} ${height - 30})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Decoration: ${d.kind}`}
                  className="focus-ring cursor-pointer"
                  onClick={() => onSelectDecoration(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDecoration(d.id);
                    }
                  }}
                >
                  {d.id === selectedId && (
                    <ellipse
                      cx="0"
                      cy="-4"
                      rx="30"
                      ry="12"
                      fill="none"
                      stroke="#3ea6cd"
                      strokeWidth="3"
                    />
                  )}
                  <DecorationArt kind={d.kind} />
                </g>
              ))}
              {sightings.map((v, i) => (
                <g
                  key={v.visitor.id}
                  transform={`translate(${30 + i * 48} ${height - 30})`}
                  className="gd-visitor"
                  role="img"
                  aria-label={`${v.visitor.name} visiting`}
                >
                  <VisitorArt id={v.visitor.id} />
                </g>
              ))}
              {weather === 'sun' && (
                <circle cx={width - 30} cy="22" r="12" fill="#ffe08a" opacity="0.8" />
              )}
              {tint.opacity > 0 && (
                <rect
                  width={width}
                  height={height}
                  fill={tint.color}
                  opacity={tint.opacity * 0.6}
                  pointerEvents="none"
                />
              )}
            </svg>
            {extra > 0 && (
              <p className="text-muted px-4 pb-3 text-xs">
                +{extra} older plant{extra === 1 ? '' : 's'} in this bed (see the Stats timeline).
              </p>
            )}
            {list.length === 0 && (
              <p className="text-muted px-4 pb-3 text-xs">{BIOME_BY_ID[biome.id].description}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
