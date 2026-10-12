import { useId } from 'react';
import type { GrowthStage, PlantVariant, Species } from '@/types';
import { detailAmount, formScale, wiltPalette } from './plants/common';
import { Seed, Soil, Sprout } from './plants/Stages';
import { Tree } from './plants/Tree';
import { Flower } from './plants/Flower';
import { Shrub } from './plants/Shrub';
import { Cactus } from './plants/Cactus';
import { Mushroom } from './plants/Mushroom';
import { Fern } from './plants/Fern';

export interface PlantArtProps {
  species: Species;
  /** 0..1 growth; drives stage and in-stage scaling. */
  growth: number;
  stage?: GrowthStage;
  wilted?: boolean;
  variant?: PlantVariant;
  size?: number;
  className?: string;
  /** Draw the soil mound (off inside garden tiles, which have their own ground). */
  soil?: boolean;
  /** Deterministic variation (0..1). */
  seed?: number;
  title?: string;
}

const VARIANT_SCALE: Record<PlantVariant, number> = { standard: 1, mature: 1.15, ancient: 1.3 };

/** A plant at any point of its life, drawn into a 200x200 box with the ground at y=170. */
export function PlantArt({
  species,
  growth,
  wilted = false,
  variant = 'standard',
  size = 240,
  className,
  soil = true,
  seed = 0.5,
  title,
}: PlantArtProps) {
  const id = useId();
  const g = Math.max(0, Math.min(1, growth));
  const palette = wilted ? wiltPalette(species.palette) : species.palette;
  const scale = formScale(g) * VARIANT_SCALE[variant];
  const detail = wilted ? 0.4 : detailAmount(g);
  const params = species.params ?? {};
  const props = { palette, params, growth: g, detail, wilted, seed };
  const Form = {
    tree: Tree,
    flower: Flower,
    shrub: Shrub,
    cactus: Cactus,
    mushroom: Mushroom,
    fern: Fern,
  }[species.form];
  const glowId = `${id}-glow`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title ?? `${species.name}${wilted ? ', wilted' : ''}`}
      overflow="visible"
    >
      {variant === 'ancient' && (
        <defs>
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={species.palette.accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={species.palette.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      <g transform="translate(100 170)">
        {variant === 'ancient' && !wilted && g >= 0.8 && (
          <ellipse cx="0" cy="-80" rx="95" ry="95" fill={`url(#${glowId})`} />
        )}
        {soil && <Soil wide={1 + (VARIANT_SCALE[variant] - 1) * 1.5} />}
        {g < 0.1 && <Seed growth={g} palette={palette} />}
        {g >= 0.1 && g < 0.4 && <Sprout growth={g} palette={palette} wilted={wilted} />}
        {g >= 0.4 && (
          <g transform={`scale(${scale})`}>
            <Form {...props} />
          </g>
        )}
      </g>
    </svg>
  );
}
