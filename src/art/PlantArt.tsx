import type { GrowthStage, Species } from '@/types';

export interface PlantArtProps {
  species: Species;
  /** 0..1 growth; drives stage and in-stage scaling. */
  growth: number;
  stage: GrowthStage;
  wilted?: boolean;
  variant?: 'standard' | 'mature' | 'ancient';
  size?: number;
  className?: string;
}

/** Placeholder until the parametric plant renderers land in phase 3. */
export function PlantArt({ species, growth, size = 240, className }: PlantArtProps) {
  const r = 20 + growth * 60;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={species.name}
    >
      <ellipse cx="100" cy="170" rx="70" ry="14" fill="#8d5f3b" />
      <rect
        x="97"
        y={170 - growth * 70}
        width="6"
        height={growth * 70}
        fill={species.palette.stem}
      />
      <circle cx="100" cy={170 - growth * 70 - r * 0.6} r={r} fill={species.palette.primary} />
    </svg>
  );
}
