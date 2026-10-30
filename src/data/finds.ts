/** Small things Pip brings back after a session. Weight = relative chance among unowned finds. */
export interface Find {
  id: string;
  name: string;
  blurb: string;
  weight: number;
}

export const FINDS: Find[] = [
  { id: 'feather', name: 'Grey feather', blurb: 'From a very polite pigeon.', weight: 10 },
  { id: 'stone', name: 'Smooth stone', blurb: 'Perfectly pocket-sized.', weight: 10 },
  { id: 'acorn', name: 'Acorn', blurb: 'An oak in waiting.', weight: 9 },
  { id: 'shell', name: 'Snail shell', blurb: 'Empty. The snail moved on.', weight: 8 },
  { id: 'pinecone', name: 'Pine cone', blurb: 'Opens when the weather is dry.', weight: 8 },
  { id: 'button', name: 'Brass button', blurb: 'Nobody has claimed it.', weight: 6 },
  { id: 'marble', name: 'Blue marble', blurb: 'There is a whole sky in it.', weight: 6 },
  { id: 'seedpacket', name: 'Old seed packet', blurb: 'Unlabelled. Mysterious.', weight: 5 },
  { id: 'bottlecap', name: 'Bottle cap', blurb: 'Pip insists it is treasure.', weight: 5 },
  { id: 'key', name: 'Tiny key', blurb: 'It must open something.', weight: 3 },
  { id: 'clover', name: 'Four-leaf clover', blurb: 'Found on the first try, honestly.', weight: 2 },
  { id: 'egg', name: 'Blue eggshell', blurb: 'The chick is long gone.', weight: 2 },
];

export const FIND_BY_ID: Record<string, Find> = Object.fromEntries(FINDS.map((f) => [f.id, f]));
