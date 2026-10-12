import type { SpeciesPalette } from '@/types';

/** Soil mound every plant sits on. Drawn in garden tiles too, so keep it low and simple. */
export function Soil({ wide = 1, color = '#8d5f3b' }: { wide?: number; color?: string }) {
  return (
    <g>
      <ellipse cx="0" cy="0" rx={36 * wide} ry="9" fill={color} />
      <ellipse cx="-8" cy="-2" rx={18 * wide} ry="4" fill="#a7764a" opacity="0.55" />
    </g>
  );
}

/** Stage 0: a seed just breaking the soil. growth 0..0.1 */
export function Seed({ growth, palette }: { growth: number; palette: SpeciesPalette }) {
  const t = Math.min(1, growth / 0.1);
  return (
    <g>
      <ellipse cx="0" cy={-3 - t * 4} rx="7" ry="5" fill="#6d4a2e" />
      <path d={`M-2 ${-5 - t * 4} q2 -3 4 0`} stroke="#4d3425" strokeWidth="1.2" fill="none" />
      <path
        d={`M0 ${-6 - t * 4} v${-6 * t}`}
        stroke={palette.stem}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Stage 1: sprout with two leaves. growth 0.1..0.4 */
export function Sprout({
  growth,
  palette,
  wilted,
}: {
  growth: number;
  palette: SpeciesPalette;
  wilted: boolean;
}) {
  const t = Math.min(1, Math.max(0, (growth - 0.1) / 0.3));
  const h = 14 + t * 26;
  const leaf = 8 + t * 10;
  const droop = wilted ? 18 : 0;
  return (
    <g>
      <path
        d={`M0 -2 Q${wilted ? 6 : 2} ${-h / 2} 0 ${-h}`}
        stroke={palette.stem}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <g transform={`translate(0 ${-h + 6}) rotate(${-50 + droop})`}>
        <ellipse cx={-leaf * 0.6} cy="0" rx={leaf * 0.7} ry={leaf * 0.38} fill={palette.primary} />
      </g>
      <g transform={`translate(0 ${-h + 2}) rotate(${50 - droop})`}>
        <ellipse cx={leaf * 0.6} cy="0" rx={leaf * 0.7} ry={leaf * 0.38} fill={palette.secondary} />
      </g>
    </g>
  );
}
