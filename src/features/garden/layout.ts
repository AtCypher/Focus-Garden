/**
 * Pure garden layout: which tiles belong to which biome, where a new plant goes, and how a set of
 * plants is arranged for display. Nothing here touches React or storage.
 */
import type { Biome, Decoration, Plant, TilePosition } from '@/types';
import { getLevelByNumber, unlockedBiomes, type GardenLevel } from '@/data/gardenLevels';

export const TILE_W = 64;
export const TILE_H = 32;

export interface BiomeRegion {
  biome: Biome;
  /** Inclusive column range. */
  colStart: number;
  colEnd: number;
  tiles: number;
}

/** Biomes occupy vertical strips of columns, in catalogue order, widest first. */
export function biomeRegions(level: GardenLevel): BiomeRegion[] {
  const biomes = unlockedBiomes(level.level);
  const base = Math.floor(level.cols / biomes.length);
  let extra = level.cols - base * biomes.length;
  const regions: BiomeRegion[] = [];
  let col = 0;
  for (const biome of biomes) {
    const width = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    regions.push({ biome, colStart: col, colEnd: col + width - 1, tiles: width * level.rows });
    col += width;
  }
  return regions;
}

export function biomeOfTile(level: GardenLevel, tile: TilePosition): Biome | null {
  if (tile.col < 0 || tile.row < 0 || tile.col >= level.cols || tile.row >= level.rows) return null;
  const r = biomeRegions(level).find((x) => tile.col >= x.colStart && tile.col <= x.colEnd);
  return r?.biome ?? null;
}

export function tileKey(t: TilePosition): string {
  return `${t.col},${t.row}`;
}

/** All tiles of a biome, front rows first so the garden fills towards the viewer last. */
export function biomeTiles(level: GardenLevel, biome: Biome): TilePosition[] {
  const region = biomeRegions(level).find((r) => r.biome === biome);
  if (!region) return [];
  const out: TilePosition[] = [];
  // Alternate rows to avoid a strict wall of plants; keep it deterministic.
  for (let row = 0; row < level.rows; row++) {
    const cols: number[] = [];
    for (let c = region.colStart; c <= region.colEnd; c++) cols.push(c);
    if (row % 2 === 1) cols.reverse();
    for (const col of cols) out.push({ col, row });
  }
  return out;
}

export function nextFreeTile(
  level: GardenLevel,
  biome: Biome,
  occupied: Set<string>,
): TilePosition | null {
  for (const t of biomeTiles(level, biome)) if (!occupied.has(tileKey(t))) return t;
  return null;
}

export interface PlacedPlant {
  plant: Plant;
  tile: TilePosition;
}

export interface GardenLayout {
  placed: PlacedPlant[];
  /** Plants that did not fit in their biome. */
  overflow: Plant[];
  decorations: Decoration[];
  occupied: Set<string>;
}

/**
 * Arrange plants for display. A plant keeps its stored tile when it is inside its biome's region
 * and free; otherwise it takes the next free tile of its biome. Decorations are placed first and
 * keep their tiles when still in bounds.
 */
export function layoutGarden(
  level: GardenLevel,
  plants: Plant[],
  decorations: Decoration[],
): GardenLayout {
  const occupied = new Set<string>();
  const keptDecorations = decorations.filter((d) => biomeOfTile(level, d.tile) !== null);
  for (const d of keptDecorations) occupied.add(tileKey(d.tile));

  const placed: PlacedPlant[] = [];
  const pending: Plant[] = [];
  for (const p of plants) {
    if (p.tile && biomeOfTile(level, p.tile) === p.biome && !occupied.has(tileKey(p.tile))) {
      occupied.add(tileKey(p.tile));
      placed.push({ plant: p, tile: p.tile });
    } else {
      pending.push(p);
    }
  }
  const overflow: Plant[] = [];
  for (const p of pending) {
    const t = nextFreeTile(level, p.biome, occupied);
    if (t) {
      occupied.add(tileKey(t));
      placed.push({ plant: p, tile: t });
    } else {
      overflow.push(p);
    }
  }
  return { placed, overflow, decorations: keptDecorations, occupied };
}

/** Restoration of each biome: 0, 0.25, 0.5 or 1 depending on how full it is with living plants. */
export function restoration(level: GardenLevel, plants: Plant[]): Record<Biome, number> {
  const out = {} as Record<Biome, number>;
  for (const r of biomeRegions(level)) {
    const alive = plants.filter((p) => p.biome === r.biome && !p.wilted).length;
    const ratio = r.tiles === 0 ? 0 : alive / r.tiles;
    out[r.biome] = ratio >= 0.75 ? 1 : ratio >= 0.4 ? 0.5 : ratio >= 0.15 ? 0.25 : 0;
  }
  return out;
}

/** Isometric projection of a tile's centre, relative to the grid origin. */
export function tileToScreen(t: TilePosition): { x: number; y: number } {
  return { x: ((t.col - t.row) * TILE_W) / 2, y: ((t.col + t.row) * TILE_H) / 2 };
}

export function gardenBounds(level: GardenLevel): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const corners = [
    tileToScreen({ col: 0, row: 0 }),
    tileToScreen({ col: level.cols - 1, row: 0 }),
    tileToScreen({ col: 0, row: level.rows - 1 }),
    tileToScreen({ col: level.cols - 1, row: level.rows - 1 }),
  ];
  return {
    minX: Math.min(...corners.map((c) => c.x)) - TILE_W / 2,
    maxX: Math.max(...corners.map((c) => c.x)) + TILE_W / 2,
    minY: Math.min(...corners.map((c) => c.y)) - TILE_H / 2,
    maxY: Math.max(...corners.map((c) => c.y)) + TILE_H / 2,
  };
}

/** Lifetime focus minutes: completed sessions only. */
export function totalFocusMinutes(sessions: { outcome: string; actualMinutes: number }[]): number {
  return sessions.reduce((n, s) => (s.outcome === 'completed' ? n + s.actualMinutes : n), 0);
}

/** Pick a tile for a new plant given the current level and existing plants/decorations. */
export function chooseTileForNewPlant(
  levelNumber: number,
  biome: Biome,
  plants: Plant[],
  decorations: Decoration[],
): TilePosition | null {
  const level = getLevelByNumber(levelNumber);
  const { occupied } = layoutGarden(level, plants, decorations);
  return nextFreeTile(level, biome, occupied);
}
