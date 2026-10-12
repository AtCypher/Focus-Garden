import type { Biome } from '@/types';

export interface BiomeInfo {
  id: Biome;
  name: string;
  /** Garden level at which the biome appears. */
  unlockLevel: number;
  description: string;
  /** Fully restored ground colours (light theme). Grey versions are derived at render time. */
  ground: { top: string; side: string; grass: string };
}

export const BIOMES: BiomeInfo[] = [
  {
    id: 'meadow',
    name: 'Meadow',
    unlockLevel: 1,
    description: 'Open grass and wildflowers.',
    ground: { top: '#9ccb6b', side: '#6f9a48', grass: '#b9df87' },
  },
  {
    id: 'orchard',
    name: 'Orchard',
    unlockLevel: 1,
    description: 'Fruit trees and hedges in neat rows.',
    ground: { top: '#a7c66a', side: '#7a9647', grass: '#c4dc8c' },
  },
  {
    id: 'wetland',
    name: 'Wetland',
    unlockLevel: 1,
    description: 'Soft ground by the water: ferns, reeds and mushrooms.',
    ground: { top: '#7fb98a', side: '#55865f', grass: '#9fd1a7' },
  },
  {
    id: 'forest',
    name: 'Forest',
    unlockLevel: 3,
    description: 'Tall trees and deep shade.',
    ground: { top: '#5f9a5a', side: '#3f6e3c', grass: '#80b579' },
  },
  {
    id: 'desert',
    name: 'Desert',
    unlockLevel: 4,
    description: 'Warm sand and patient cacti.',
    ground: { top: '#e5c98a', side: '#b8975a', grass: '#f0dba8' },
  },
  {
    id: 'alpine',
    name: 'Alpine',
    unlockLevel: 5,
    description: 'Thin air, hardy flowers and larches.',
    ground: { top: '#a9c4b2', side: '#728f7f', grass: '#c9dccf' },
  },
  {
    id: 'tropical',
    name: 'Tropical',
    unlockLevel: 6,
    description: 'Lush, humid and bright.',
    ground: { top: '#6cbf7c', side: '#438a55', grass: '#8fd79a' },
  },
];

export const BIOME_BY_ID: Record<Biome, BiomeInfo> = Object.fromEntries(
  BIOMES.map((b) => [b.id, b]),
) as Record<Biome, BiomeInfo>;

export const STARTING_BIOMES: Biome[] = BIOMES.filter((b) => b.unlockLevel === 1).map((b) => b.id);
