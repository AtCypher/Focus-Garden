import type { Biome } from '@/types';
import type { TimeOfDay } from '@/features/garden/daylight';

/** Wildlife that may show up in a biome once it is restored enough. */
export interface Visitor {
  id: string;
  name: string;
  biome: Biome;
  /** Minimum restoration (0..1) of the biome. */
  minRestoration: number;
  /** Chance per day, 0..1. */
  chance: number;
  /** Only at these times of day, if set. */
  times?: TimeOfDay[];
  blurb: string;
}

export const VISITORS: Visitor[] = [
  {
    id: 'bee',
    name: 'Bumblebee',
    biome: 'meadow',
    minRestoration: 0.25,
    chance: 0.6,
    times: ['day', 'dawn'],
    blurb: 'Busy, round, unbothered.',
  },
  {
    id: 'hedgehog',
    name: 'Hedgehog',
    biome: 'meadow',
    minRestoration: 0.5,
    chance: 0.3,
    times: ['dusk', 'night'],
    blurb: 'Snuffles along the edge at dusk.',
  },
  {
    id: 'robin',
    name: 'Robin',
    biome: 'orchard',
    minRestoration: 0.25,
    chance: 0.5,
    blurb: 'Follows anyone with a spade.',
  },
  {
    id: 'squirrel',
    name: 'Red squirrel',
    biome: 'orchard',
    minRestoration: 0.5,
    chance: 0.35,
    blurb: 'Audits the hazels daily.',
  },
  {
    id: 'frog',
    name: 'Frog',
    biome: 'wetland',
    minRestoration: 0.25,
    chance: 0.5,
    blurb: 'Sits very still, then does not.',
  },
  {
    id: 'heron',
    name: 'Heron',
    biome: 'wetland',
    minRestoration: 0.5,
    chance: 0.25,
    times: ['dawn', 'day'],
    blurb: 'Stands in the pond like it owns it.',
  },
  {
    id: 'fox',
    name: 'Fox',
    biome: 'forest',
    minRestoration: 0.5,
    chance: 0.3,
    times: ['dusk', 'night'],
    blurb: 'Passes through, never stays.',
  },
  {
    id: 'deer',
    name: 'Roe deer',
    biome: 'forest',
    minRestoration: 1,
    chance: 0.2,
    times: ['dawn', 'dusk'],
    blurb: 'Only when the forest is whole.',
  },
  {
    id: 'owl',
    name: 'Tawny owl',
    biome: 'forest',
    minRestoration: 0.5,
    chance: 0.35,
    times: ['night'],
    blurb: 'You hear it before you see it.',
  },
  {
    id: 'lizard',
    name: 'Lizard',
    biome: 'desert',
    minRestoration: 0.25,
    chance: 0.5,
    times: ['day'],
    blurb: 'Warms up on the rocks.',
  },
  {
    id: 'goat',
    name: 'Mountain goat',
    biome: 'alpine',
    minRestoration: 0.5,
    chance: 0.3,
    blurb: 'Stands where nothing should stand.',
  },
  {
    id: 'parrot',
    name: 'Parrot',
    biome: 'tropical',
    minRestoration: 0.5,
    chance: 0.4,
    times: ['day'],
    blurb: 'Says something you would rather not repeat.',
  },
];

export const VISITOR_BY_ID: Record<string, Visitor> = Object.fromEntries(
  VISITORS.map((v) => [v.id, v]),
);
