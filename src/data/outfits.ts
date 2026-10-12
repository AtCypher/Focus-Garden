export interface Outfit {
  id: string;
  name: string;
  cost: number;
  blurb: string;
}

export const OUTFITS: Outfit[] = [
  { id: 'none', name: 'Just Pip', cost: 0, blurb: 'As nature intended.' },
  { id: 'strawhat', name: 'Straw hat', cost: 150, blurb: 'For long afternoons in the sun.' },
  { id: 'scarf', name: 'Woolly scarf', cost: 120, blurb: 'Cold-morning sessions.' },
  { id: 'beanie', name: 'Beanie', cost: 120, blurb: 'Keeps the sprout warm too.' },
  {
    id: 'glasses',
    name: 'Reading glasses',
    cost: 100,
    blurb: 'Pip read the whole seed catalogue.',
  },
];
