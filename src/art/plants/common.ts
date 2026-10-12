import type { SpeciesPalette } from '@/types';

/** Mix a hex colour towards another by t (0..1). */
export function mix(hex: string, towards: string, t: number): string {
  const a = parse(hex);
  const b = parse(towards);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Dried-out version of a palette for wilted plants. */
export function wiltPalette(p: SpeciesPalette): SpeciesPalette {
  return {
    primary: mix(p.primary, '#9a8a6a', 0.75),
    secondary: mix(p.secondary, '#7a6a4e', 0.75),
    accent: mix(p.accent, '#8a7a5e', 0.8),
    stem: mix(p.stem, '#6b5a44', 0.6),
  };
}

export interface FormProps {
  palette: SpeciesPalette;
  params: Record<string, string | number>;
  /** 0..1 overall growth. */
  growth: number;
  /** 0..1 how much of the "full" details (blooms, fruit, extra fronds) to show. */
  detail: number;
  wilted: boolean;
  /** Deterministic per-plant variation seed, 0..1. */
  seed: number;
}

/** Scale of the main form for a growth value, used by the sapling and full stages. */
export function formScale(growth: number): number {
  if (growth < 0.4) return 0;
  if (growth < 0.8) return 0.45 + ((growth - 0.4) / 0.4) * 0.4;
  return 0.85 + ((growth - 0.8) / 0.2) * 0.15;
}

export function detailAmount(growth: number): number {
  return growth < 0.8 ? 0 : (growth - 0.8) / 0.2;
}

/** Tiny deterministic PRNG so the same plant always looks the same. */
export function rng(seed: number): () => number {
  let s = Math.floor(seed * 2 ** 31) || 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

export function num(
  params: Record<string, string | number>,
  key: string,
  fallback: number,
): number {
  const v = params[key];
  return typeof v === 'number' ? v : fallback;
}

export function str(
  params: Record<string, string | number>,
  key: string,
  fallback: string,
): string {
  const v = params[key];
  return typeof v === 'string' ? v : fallback;
}
