import { describe, expect, it } from 'vitest';
import {
  GARDEN_LEVELS,
  getGardenLevel,
  levelProgress,
  nextGardenLevel,
  unlockedBiomes,
} from '@/data/gardenLevels';
import {
  biomeOfTile,
  biomeRegions,
  chooseTileForNewPlant,
  layoutGarden,
  nextFreeTile,
  restoration,
  tileKey,
} from './layout';
import type { Plant } from '@/types';

const plant = (
  id: string,
  biome: Plant['biome'],
  tile: Plant['tile'] = null,
  wilted = false,
): Plant => ({
  id,
  sessionId: id,
  speciesId: 'daisy',
  variant: 'standard',
  biome,
  wilted,
  grownAt: '2026-10-12T09:00:00.000Z',
  tile,
});

describe('garden levels', () => {
  it('maps lifetime minutes to levels at the documented thresholds', () => {
    expect(getGardenLevel(0).name).toBe('Patch');
    expect(getGardenLevel(5 * 60 - 1).name).toBe('Patch');
    expect(getGardenLevel(5 * 60).name).toBe('Meadow');
    expect(getGardenLevel(15 * 60).name).toBe('Grove');
    expect(getGardenLevel(40 * 60).name).toBe('Valley');
    expect(getGardenLevel(80 * 60).name).toBe('Highlands');
    expect(getGardenLevel(150 * 60).name).toBe('Wildwood');
    expect(getGardenLevel(300 * 60).name).toBe('Sanctuary');
    expect(getGardenLevel(10_000 * 60).name).toBe('Sanctuary');
  });
  it('has 16 tiles at level 1 and strictly growing grids', () => {
    expect(GARDEN_LEVELS[0].cols * GARDEN_LEVELS[0].rows).toBe(16);
    for (let i = 1; i < GARDEN_LEVELS.length; i++) {
      expect(GARDEN_LEVELS[i].cols * GARDEN_LEVELS[i].rows).toBeGreaterThan(
        GARDEN_LEVELS[i - 1].cols * GARDEN_LEVELS[i - 1].rows,
      );
      expect(GARDEN_LEVELS[i].minutes).toBeGreaterThan(GARDEN_LEVELS[i - 1].minutes);
    }
  });
  it('reports progress to the next level', () => {
    expect(nextGardenLevel(0)?.name).toBe('Meadow');
    expect(levelProgress(150)).toBeCloseTo(0.5);
    expect(nextGardenLevel(300 * 60)).toBeNull();
    expect(levelProgress(300 * 60)).toBe(1);
  });
  it('unlocks biomes by level', () => {
    expect(unlockedBiomes(1)).toEqual(['meadow', 'orchard', 'wetland']);
    expect(unlockedBiomes(3)).toContain('forest');
    expect(unlockedBiomes(4)).toContain('desert');
    expect(unlockedBiomes(5)).toContain('alpine');
    expect(unlockedBiomes(6)).toContain('tropical');
  });
});

describe('layout', () => {
  const L1 = GARDEN_LEVELS[0];
  const L3 = GARDEN_LEVELS[2];

  it('splits columns between unlocked biomes and covers every tile', () => {
    const regions = biomeRegions(L1);
    expect(regions.map((r) => r.biome)).toEqual(['meadow', 'orchard', 'wetland']);
    expect(regions.reduce((n, r) => n + r.tiles, 0)).toBe(16);
    expect(biomeRegions(L3).map((r) => r.biome)).toContain('forest');
    expect(biomeOfTile(L1, { col: 0, row: 0 })).toBe('meadow');
    expect(biomeOfTile(L1, { col: 9, row: 0 })).toBeNull();
  });

  it('fills a biome tile by tile and reports when full', () => {
    const occupied = new Set<string>();
    const tiles = [];
    for (;;) {
      const t = nextFreeTile(L1, 'wetland', occupied);
      if (!t) break;
      occupied.add(tileKey(t));
      tiles.push(t);
    }
    expect(tiles.length).toBe(biomeRegions(L1).find((r) => r.biome === 'wetland')!.tiles);
    expect(new Set(tiles.map(tileKey)).size).toBe(tiles.length);
  });

  it('keeps valid stored tiles, relocates invalid ones and overflows when full', () => {
    const plants = [
      plant('a', 'meadow', { col: 0, row: 0 }),
      plant('b', 'meadow', { col: 0, row: 0 }), // collision: relocated
      plant('c', 'meadow', { col: 3, row: 0 }), // wrong region: relocated
      plant('d', 'orchard', { col: 2, row: 1 }),
      plant('e', 'orchard'),
    ];
    const layout = layoutGarden(L1, plants, []);
    expect(layout.placed.find((p) => p.plant.id === 'a')?.tile).toEqual({ col: 0, row: 0 });
    expect(layout.placed.find((p) => p.plant.id === 'b')?.tile).not.toEqual({ col: 0, row: 0 });
    expect(biomeOfTile(L1, layout.placed.find((p) => p.plant.id === 'c')!.tile)).toBe('meadow');
    expect(layout.placed.find((p) => p.plant.id === 'd')?.tile).toEqual({ col: 2, row: 1 });
    expect(layout.overflow).toEqual([]);
    expect(new Set(layout.placed.map((p) => tileKey(p.tile))).size).toBe(5);

    const many = Array.from({ length: 30 }, (_, i) => plant(`m${i}`, 'meadow'));
    const full = layoutGarden(L1, many, []);
    expect(full.placed.length).toBe(biomeRegions(L1).find((r) => r.biome === 'meadow')!.tiles);
    expect(full.overflow.length).toBe(30 - full.placed.length);
  });

  it('never places a plant on a decoration', () => {
    const deco = { id: 'x', kind: 'bench' as const, tile: { col: 0, row: 0 }, placedAt: '' };
    const layout = layoutGarden(L1, [plant('a', 'meadow', { col: 0, row: 0 })], [deco]);
    expect(layout.placed[0].tile).not.toEqual({ col: 0, row: 0 });
    expect(chooseTileForNewPlant(1, 'meadow', [], [deco])).not.toEqual({ col: 0, row: 0 });
  });

  it('quantises restoration by living plants per biome', () => {
    expect(restoration(L1, []).meadow).toBe(0);
    const meadowTiles = biomeRegions(L1).find((r) => r.biome === 'meadow')!.tiles;
    const some = Array.from({ length: Math.ceil(meadowTiles * 0.5) }, (_, i) =>
      plant(`p${i}`, 'meadow'),
    );
    expect(restoration(L1, some).meadow).toBe(0.5);
    const all = Array.from({ length: meadowTiles }, (_, i) => plant(`p${i}`, 'meadow'));
    expect(restoration(L1, all).meadow).toBe(1);
    const dead = all.map((p) => ({ ...p, wilted: true }));
    expect(restoration(L1, dead).meadow).toBe(0);
  });
});
