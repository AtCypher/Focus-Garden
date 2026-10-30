import type { DecorationKind } from '@/types';

/** Decorations for sale in the shop (cost > 0) or earned in seasonal events (cost 0). */
export const EVENT_DECORATIONS: DecorationKind[] = ['pumpkin', 'snowman', 'maypole', 'bonfire'];

export const DECORATION_INFO: Record<
  DecorationKind,
  { name: string; cost: number; blurb: string }
> = {
  bench: { name: 'Bench', cost: 90, blurb: 'Somewhere to sit and look at what grew.' },
  lantern: { name: 'Lantern', cost: 110, blurb: 'A warm light for late sessions.' },
  path: {
    name: 'Stone path',
    cost: 50,
    blurb: 'A few flat stones. Place several to make a trail.',
  },
  fence: { name: 'Fence', cost: 60, blurb: 'A little wooden fence.' },
  rock: { name: 'Mossy rock', cost: 40, blurb: 'It was here before the garden.' },
  shed: { name: 'Garden shed', cost: 260, blurb: 'For tools, seeds and the occasional nap.' },
  birdbath: { name: 'Bird bath', cost: 140, blurb: 'Birds arrive sooner with one of these.' },
  pumpkin: { name: 'Harvest pumpkin', cost: 0, blurb: 'Earned during Harvest Week in autumn.' },
  snowman: { name: 'Snow friend', cost: 0, blurb: 'Earned during Winter Lights.' },
  maypole: { name: 'Maypole', cost: 0, blurb: 'Earned during Spring Bloom.' },
  bonfire: { name: 'Midsummer bonfire', cost: 0, blurb: 'Earned during Midsummer.' },
};
