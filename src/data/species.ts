/**
 * Species catalogue. To add a species, append an entry here. Nothing else needs to change.
 *
 * Fields:
 *  - id: stable, lowercase, never reuse.
 *  - biome: which part of the garden it grows in (must be unlocked by garden level).
 *  - rarity: affects Seed Book styling only.
 *  - unlock: how the species becomes available. 'starter' is owned from day one; 'dew' is bought in
 *    the shop (set dewCost too); the rest unlock automatically from milestones.
 *  - form: which parametric SVG renderer in src/art/plants draws it:
 *      tree    params.canopy: 'round' | 'conical' | 'layered' | 'weeping' | 'palm' | 'broad'
 *      flower  params.petals: number, params.petal: 'round' | 'pointed' | 'cup'
 *      shrub   params.shape: 'mound' | 'spiky' | 'hedge'
 *      cactus  params.shape: 'barrel' | 'saguaro' | 'prickly'
 *      mushroom params.cap: 'flat' | 'bell' | 'funnel'
 *      fern    params.fronds: number
 *  - palette: primary (foliage), secondary (shade), accent (bloom/fruit), stem.
 */
import type { Species } from '@/types';

export const SPECIES: Species[] = [
  // Meadow
  {
    id: 'daisy',
    name: 'Sun Daisy',
    biome: 'meadow',
    rarity: 'common',
    unlock: { kind: 'starter' },
    dewCost: 0,
    flavour: 'Turns to face whatever light it can find.',
    form: 'flower',
    palette: { primary: '#fff8e7', secondary: '#f3e2b4', accent: '#f2c14e', stem: '#6c9a3e' },
    params: { petals: 10, petal: 'round' },
  },
  {
    id: 'poppy',
    name: 'Field Poppy',
    biome: 'meadow',
    rarity: 'common',
    unlock: { kind: 'dew', cost: 40 },
    dewCost: 40,
    flavour: 'Loud colour, quiet nature.',
    form: 'flower',
    palette: { primary: '#e8553f', secondary: '#c23c2b', accent: '#2d2a32', stem: '#6c9a3e' },
    params: { petals: 5, petal: 'cup' },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    biome: 'meadow',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 120 },
    dewCost: 120,
    flavour: 'Smells like the end of a good day.',
    form: 'shrub',
    palette: { primary: '#8d8ac2', secondary: '#6b67a6', accent: '#b8a6e8', stem: '#7e9a5a' },
    params: { shape: 'spiky' },
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    biome: 'meadow',
    rarity: 'uncommon',
    unlock: { kind: 'sessionMinutes', minutes: 60 },
    dewCost: 0,
    flavour: 'Grown by finishing a session of an hour or more.',
    form: 'flower',
    palette: { primary: '#f6c04a', secondary: '#dc9f2c', accent: '#5a3b1e', stem: '#5e8c3a' },
    params: { petals: 14, petal: 'pointed' },
  },

  // Orchard
  {
    id: 'apple',
    name: 'Little Apple',
    biome: 'orchard',
    rarity: 'common',
    unlock: { kind: 'starter' },
    dewCost: 0,
    flavour: 'Small tree, generous fruit.',
    form: 'tree',
    palette: { primary: '#6fae4b', secondary: '#4d8a36', accent: '#e4553f', stem: '#7a5436' },
    params: { canopy: 'round' },
  },
  {
    id: 'hazel',
    name: 'Hazel',
    biome: 'orchard',
    rarity: 'common',
    unlock: { kind: 'dew', cost: 60 },
    dewCost: 60,
    flavour: 'A tidy shrub that keeps its own counsel.',
    form: 'shrub',
    palette: { primary: '#86b24f', secondary: '#5e8a35', accent: '#c58a4a', stem: '#6f5236' },
    params: { shape: 'mound' },
  },
  {
    id: 'cherry',
    name: 'Blossom Cherry',
    biome: 'orchard',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 150 },
    dewCost: 150,
    flavour: 'Blooms briefly and completely.',
    form: 'tree',
    palette: { primary: '#f1b6cb', secondary: '#dd8ea9', accent: '#ffffff', stem: '#6b4a3a' },
    params: { canopy: 'broad' },
  },
  {
    id: 'pear',
    name: 'Old Pear',
    biome: 'orchard',
    rarity: 'rare',
    unlock: { kind: 'sessions', count: 100 },
    dewCost: 0,
    flavour: 'Unlocked after 100 sessions. Patient, like you.',
    form: 'tree',
    palette: { primary: '#8bbf5a', secondary: '#5f9238', accent: '#d6c84f', stem: '#5f4231' },
    params: { canopy: 'layered' },
  },

  // Wetland
  {
    id: 'marshfern',
    name: 'Marsh Fern',
    biome: 'wetland',
    rarity: 'common',
    unlock: { kind: 'starter' },
    dewCost: 0,
    flavour: 'Unfurls one frond at a time.',
    form: 'fern',
    palette: { primary: '#5aa66a', secondary: '#3c7f4b', accent: '#8fd49a', stem: '#4b6b3c' },
    params: { fronds: 5 },
  },
  {
    id: 'mosscap',
    name: 'Moss Cap',
    biome: 'wetland',
    rarity: 'common',
    unlock: { kind: 'dew', cost: 50 },
    dewCost: 50,
    flavour: 'Appears overnight, stays all week.',
    form: 'mushroom',
    palette: { primary: '#b56b4a', secondary: '#8f4f36', accent: '#f1e6d2', stem: '#efe3cf' },
    params: { cap: 'bell' },
  },
  {
    id: 'willow',
    name: 'Weeping Willow',
    biome: 'wetland',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 180 },
    dewCost: 180,
    flavour: 'Leans over the water to listen.',
    form: 'tree',
    palette: { primary: '#9cc96a', secondary: '#6f9c45', accent: '#c9e4a1', stem: '#6d5a44' },
    params: { canopy: 'weeping' },
  },
  {
    id: 'lotus',
    name: 'Pond Lotus',
    biome: 'wetland',
    rarity: 'rare',
    unlock: { kind: 'streak', days: 7 },
    dewCost: 0,
    flavour: 'Unlocked by a 7-day streak. Rises clean from the mud.',
    form: 'flower',
    palette: { primary: '#f6c6d8', secondary: '#e49ab8', accent: '#f3d35e', stem: '#4f8d5f' },
    params: { petals: 8, petal: 'pointed' },
  },

  // Forest (garden level 3)
  {
    id: 'oak',
    name: 'Oak',
    biome: 'forest',
    rarity: 'common',
    unlock: { kind: 'dew', cost: 200 },
    dewCost: 200,
    flavour: 'Slow, then suddenly enormous.',
    form: 'tree',
    palette: { primary: '#4f8f4a', secondary: '#376a34', accent: '#9a7a3f', stem: '#5c4330' },
    params: { canopy: 'broad' },
  },
  {
    id: 'birch',
    name: 'Silver Birch',
    biome: 'forest',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 220 },
    dewCost: 220,
    flavour: 'Pale bark, light leaves, lighter mood.',
    form: 'tree',
    palette: { primary: '#a8d26b', secondary: '#78a84a', accent: '#e9f3d2', stem: '#e8e4dc' },
    params: { canopy: 'layered' },
  },
  {
    id: 'chanterelle',
    name: 'Chanterelle',
    biome: 'forest',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 160 },
    dewCost: 160,
    flavour: 'Hides under leaves; worth looking for.',
    form: 'mushroom',
    palette: { primary: '#f0a830', secondary: '#c9821a', accent: '#f8d784', stem: '#f1c66b' },
    params: { cap: 'funnel' },
  },
  {
    id: 'pine',
    name: 'Tall Pine',
    biome: 'forest',
    rarity: 'rare',
    unlock: { kind: 'totalHours', hours: 25 },
    dewCost: 0,
    flavour: 'Unlocked at 25 hours of focus. Evergreen, like a habit.',
    form: 'tree',
    palette: { primary: '#3f7d55', secondary: '#2b5a3c', accent: '#6fae7c', stem: '#5a3f2e' },
    params: { canopy: 'conical' },
  },

  // Desert (garden level 4)
  {
    id: 'barrel',
    name: 'Barrel Cactus',
    biome: 'desert',
    rarity: 'common',
    unlock: { kind: 'dew', cost: 220 },
    dewCost: 220,
    flavour: 'Stores what it needs and asks for nothing.',
    form: 'cactus',
    palette: { primary: '#6fa86a', secondary: '#4c8148', accent: '#f0b24a', stem: '#4c8148' },
    params: { shape: 'barrel' },
  },
  {
    id: 'saguaro',
    name: 'Saguaro',
    biome: 'desert',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 320 },
    dewCost: 320,
    flavour: 'Grows an arm every few decades. No rush.',
    form: 'cactus',
    palette: { primary: '#7fb57a', secondary: '#588a55', accent: '#fff2c7', stem: '#588a55' },
    params: { shape: 'saguaro' },
  },
  {
    id: 'prickly',
    name: 'Prickly Pear',
    biome: 'desert',
    rarity: 'rare',
    unlock: { kind: 'sessionMinutes', minutes: 120 },
    dewCost: 0,
    flavour: 'Unlocked by a two-hour session. Flowers after the longest heat.',
    form: 'cactus',
    palette: { primary: '#7ab46e', secondary: '#548a4b', accent: '#e4588d', stem: '#548a4b' },
    params: { shape: 'prickly' },
  },

  // Alpine (garden level 5)
  {
    id: 'edelweiss',
    name: 'Edelweiss',
    biome: 'alpine',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 300 },
    dewCost: 300,
    flavour: 'Small, woolly, unbothered by altitude.',
    form: 'flower',
    palette: { primary: '#f4f1e8', secondary: '#d9d4c4', accent: '#e9c85a', stem: '#7a9a6a' },
    params: { petals: 9, petal: 'pointed' },
  },
  {
    id: 'larch',
    name: 'Larch',
    biome: 'alpine',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 340 },
    dewCost: 340,
    flavour: 'The conifer that turns gold and lets go.',
    form: 'tree',
    palette: { primary: '#9fbf5c', secondary: '#6f9038', accent: '#e2b84a', stem: '#6a4b36' },
    params: { canopy: 'conical' },
  },

  // Tropical (garden level 6)
  {
    id: 'palm',
    name: 'Fan Palm',
    biome: 'tropical',
    rarity: 'uncommon',
    unlock: { kind: 'dew', cost: 400 },
    dewCost: 400,
    flavour: 'Bends in every storm and breaks in none.',
    form: 'tree',
    palette: { primary: '#4fae68', secondary: '#357f49', accent: '#e9c46a', stem: '#9a7b56' },
    params: { canopy: 'palm' },
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus',
    biome: 'tropical',
    rarity: 'rare',
    unlock: { kind: 'dew', cost: 450 },
    dewCost: 450,
    flavour: 'One enormous flower a day. Enough.',
    form: 'flower',
    palette: { primary: '#f0607a', secondary: '#c93f5c', accent: '#ffd166', stem: '#3f8a4f' },
    params: { petals: 5, petal: 'round' },
  },

  // Sanctuary (garden level 7)
  {
    id: 'elderoak',
    name: 'Elder Oak',
    biome: 'forest',
    rarity: 'legendary',
    unlock: { kind: 'gardenLevel', level: 7 },
    dewCost: 0,
    flavour: 'Only grows in a Sanctuary. Older than the path that leads to it.',
    form: 'tree',
    palette: { primary: '#2f7a52', secondary: '#1f5a3b', accent: '#c7e36b', stem: '#4a3626' },
    params: { canopy: 'broad' },
  },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s]),
);

export const STARTER_SPECIES_IDS = SPECIES.filter((s) => s.unlock.kind === 'starter').map(
  (s) => s.id,
);

export function getSpecies(id: string): Species {
  const s = SPECIES_BY_ID[id];
  if (!s) throw new Error(`Unknown species: ${id}`);
  return s;
}
