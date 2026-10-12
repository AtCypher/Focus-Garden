/**
 * Garden levels. Thresholds are lifetime minutes of completed focus. Tune freely: everything else
 * (grid size, scenery, biome unlocks) is derived from the level number.
 */
import type { Biome } from '@/types';
import { BIOMES } from './biomes';

export interface GardenLevel {
  level: number;
  name: string;
  /** Lifetime completed focus minutes needed. */
  minutes: number;
  cols: number;
  rows: number;
  /** One-line description shown on level-up. */
  blurb: string;
  features: GardenFeature[];
}

export type GardenFeature =
  | 'grass'
  | 'butterflies'
  | 'path'
  | 'pond'
  | 'hills'
  | 'stream'
  | 'snowcaps'
  | 'birds'
  | 'ambient'
  | 'nightSky'
  | 'fireflies';

const H = 60;

export const GARDEN_LEVELS: GardenLevel[] = [
  {
    level: 1,
    name: 'Patch',
    minutes: 0,
    cols: 4,
    rows: 4,
    blurb: 'A small bare plot with room for 16 plants.',
    features: [],
  },
  {
    level: 2,
    name: 'Meadow',
    minutes: 5 * H,
    cols: 6,
    rows: 5,
    blurb: 'The plot expands. Grass grows in and butterflies arrive.',
    features: ['grass', 'butterflies'],
  },
  {
    level: 3,
    name: 'Grove',
    minutes: 15 * H,
    cols: 8,
    rows: 6,
    blurb: 'A path and a pond appear, and the Forest biome opens.',
    features: ['grass', 'butterflies', 'path', 'pond'],
  },
  {
    level: 4,
    name: 'Valley',
    minutes: 40 * H,
    cols: 10,
    rows: 7,
    blurb: 'Hills rise and a stream runs through. The Desert biome opens.',
    features: ['grass', 'butterflies', 'path', 'pond', 'hills', 'stream'],
  },
  {
    level: 5,
    name: 'Highlands',
    minutes: 80 * H,
    cols: 12,
    rows: 8,
    blurb: 'Snow caps the far edge. The Alpine biome opens.',
    features: ['grass', 'butterflies', 'path', 'pond', 'hills', 'stream', 'snowcaps'],
  },
  {
    level: 6,
    name: 'Wildwood',
    minutes: 150 * H,
    cols: 14,
    rows: 9,
    blurb: 'Birds move in and the garden has its own sounds. The Tropical biome opens.',
    features: [
      'grass',
      'butterflies',
      'path',
      'pond',
      'hills',
      'stream',
      'snowcaps',
      'birds',
      'ambient',
    ],
  },
  {
    level: 7,
    name: 'Sanctuary',
    minutes: 300 * H,
    cols: 16,
    rows: 10,
    blurb: 'A night sky with fireflies, and rare species unlock.',
    features: [
      'grass',
      'butterflies',
      'path',
      'pond',
      'hills',
      'stream',
      'snowcaps',
      'birds',
      'ambient',
      'nightSky',
      'fireflies',
    ],
  },
];

export function getGardenLevel(totalMinutes: number): GardenLevel {
  let current = GARDEN_LEVELS[0];
  for (const l of GARDEN_LEVELS) if (totalMinutes >= l.minutes) current = l;
  return current;
}

export function getLevelByNumber(level: number): GardenLevel {
  return GARDEN_LEVELS[Math.max(0, Math.min(GARDEN_LEVELS.length - 1, level - 1))];
}

export function nextGardenLevel(totalMinutes: number): GardenLevel | null {
  const cur = getGardenLevel(totalMinutes);
  return GARDEN_LEVELS.find((l) => l.level === cur.level + 1) ?? null;
}

/** 0..1 progress from the current level to the next (1 at max level). */
export function levelProgress(totalMinutes: number): number {
  const cur = getGardenLevel(totalMinutes);
  const next = nextGardenLevel(totalMinutes);
  if (!next) return 1;
  return Math.min(1, Math.max(0, (totalMinutes - cur.minutes) / (next.minutes - cur.minutes)));
}

export function unlockedBiomes(level: number): Biome[] {
  return BIOMES.filter((b) => b.unlockLevel <= level).map((b) => b.id);
}

export function tileCount(level: GardenLevel): number {
  return level.cols * level.rows;
}
