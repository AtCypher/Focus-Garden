import { describe, expect, it } from 'vitest';
import { SPECIES, STARTER_SPECIES_IDS } from './species';
import { BIOME_BY_ID, STARTING_BIOMES } from './biomes';

describe('species catalogue', () => {
  it('ships 24 regular species plus seasonal and challenge ones, with unique ids', () => {
    const regular = SPECIES.filter(
      (s) => s.unlock.kind !== 'season' && s.unlock.kind !== 'challenge',
    );
    expect(regular).toHaveLength(24);
    expect(SPECIES.filter((s) => s.unlock.kind === 'season')).toHaveLength(4);
    expect(SPECIES.filter((s) => s.unlock.kind === 'challenge')).toHaveLength(4);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
  });
  it('has one starter per starting biome', () => {
    const starterBiomes = STARTER_SPECIES_IDS.map((id) => SPECIES.find((s) => s.id === id)!.biome);
    expect([...starterBiomes].sort()).toEqual([...STARTING_BIOMES].sort());
  });
  it('keeps dew cost consistent with the unlock condition', () => {
    for (const s of SPECIES) {
      if (s.unlock.kind === 'dew') expect(s.dewCost).toBe(s.unlock.cost);
      else expect(s.dewCost).toBe(0);
      expect(BIOME_BY_ID[s.biome]).toBeDefined();
    }
  });
});
