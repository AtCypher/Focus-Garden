import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { getDB, resetDBForTests, DB_VERSION, MIGRATIONS } from './db';
import { idbPersistence, loadAll } from './repo';
import { parseImport, serializeExport } from './exportImport';
import { emptyData } from '@/app/store/appStore';
import type { Plant, Session } from '@/types';

const session: Session = {
  id: 's1',
  startedAt: '2026-10-12T09:00:00.000Z',
  endedAt: '2026-10-12T09:25:00.000Z',
  plannedMinutes: 25,
  actualMinutes: 25,
  mode: 'countdown',
  strictness: 'standard',
  speciesId: 'daisy',
  tagId: 'tag-study',
  outcome: 'completed',
  note: 'Read chapter 3',
  dewEarned: 33,
  round: null,
};
const plant: Plant = {
  id: 'p1',
  sessionId: 's1',
  speciesId: 'daisy',
  variant: 'standard',
  biome: 'meadow',
  wilted: false,
  grownAt: '2026-10-12T09:25:00.000Z',
  tile: { col: 0, row: 0 },
};

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDBForTests();
});

describe('database', () => {
  it('creates every store on first open with the current version', async () => {
    const db = await getDB();
    expect(db.version).toBe(DB_VERSION);
    expect([...db.objectStoreNames].sort()).toEqual([
      'decorations',
      'kv',
      'plants',
      'sessions',
      'tags',
    ]);
    expect(MIGRATIONS).toHaveLength(DB_VERSION);
  });

  it('loads defaults from an empty database and seeds the default tags', async () => {
    const data = await loadAll();
    expect(data.sessions).toEqual([]);
    expect(data.tags.map((t) => t.name)).toEqual(['Study', 'Work', 'Reading']);
    expect(await (await getDB()).count('tags')).toBe(3);
    // Deleting every tag sticks: no reseed once anything else is stored.
    await idbPersistence.putSettings(emptyData().settings);
    for (const t of data.tags) await idbPersistence.deleteTag(t.id);
    expect((await loadAll()).tags).toEqual([]);
    expect(data.wallet.dew).toBe(0);
    expect(data.settings.companionName).toBe('Pip');
  });

  it('round-trips sessions, plants and settings', async () => {
    await idbPersistence.putSession(session);
    await idbPersistence.putPlant(plant);
    await idbPersistence.putSettings({ ...emptyData().settings, companionName: 'Moss' });
    await idbPersistence.putWallet({ ...emptyData().wallet, dew: 120 });
    const data = await loadAll();
    expect(data.sessions).toEqual([session]);
    expect(data.plants).toEqual([plant]);
    expect(data.settings.companionName).toBe('Moss');
    expect(data.wallet.dew).toBe(120);
  });

  it('merges new default settings into stored older settings', async () => {
    const partial = { companionName: 'Fern' } as unknown as ReturnType<
      typeof emptyData
    >['settings'];
    await idbPersistence.putSettings(partial);
    const data = await loadAll();
    expect(data.settings.companionName).toBe('Fern');
    expect(data.settings.dailyGoalMinutes).toBe(60);
    expect(data.settings.pomodoro.focusMinutes).toBe(25);
  });

  it('replaceAll swaps the whole dataset and clearAll empties it', async () => {
    await idbPersistence.putSession(session);
    const fresh = emptyData();
    fresh.sessions = [{ ...session, id: 's2' }];
    await idbPersistence.replaceAll(fresh);
    expect((await loadAll()).sessions.map((s) => s.id)).toEqual(['s2']);
    await idbPersistence.clearAll();
    expect((await loadAll()).sessions).toEqual([]);
  });
});

describe('export / import', () => {
  it('round-trips through JSON', () => {
    const data = emptyData();
    data.sessions = [session];
    data.plants = [plant];
    data.wallet = { ...data.wallet, dew: 77 };
    const text = serializeExport(data, new Date('2026-10-12T10:00:00Z'));
    const result = parseImport(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.sessions).toEqual([session]);
    expect(result.data.plants).toEqual([plant]);
    expect(result.data.wallet.dew).toBe(77);
    expect(result.data.settings).toEqual(data.settings);
    expect(result.summary).toMatchObject({ sessions: 1, plants: 1, dew: 77, schemaVersion: 1 });
  });

  it('rejects junk and non-Grove files with readable errors', () => {
    expect(parseImport('not json')).toEqual({ ok: false, errors: ['The file is not valid JSON.'] });
    expect(parseImport('[]').ok).toBe(false);
    const other = parseImport(JSON.stringify({ app: 'other', schemaVersion: 1 }));
    expect(other.ok).toBe(false);
  });

  it('rejects files from a newer schema', () => {
    const r = parseImport(JSON.stringify({ app: 'grove', schemaVersion: 99 }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/newer/);
  });

  it('reports invalid records by index', () => {
    const data = emptyData();
    const text = serializeExport(data);
    const broken = JSON.parse(text);
    broken.sessions = [{ ...session, outcome: 'exploded' }];
    broken.plants = [{ ...plant, speciesId: 'nope' }];
    const r = parseImport(JSON.stringify(broken));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain('sessions[0] has missing or invalid fields');
      expect(r.errors.some((e) => e.includes('unknown species'))).toBe(true);
    }
  });

  it('always keeps the starter species owned after import', () => {
    const data = emptyData();
    data.wallet = { ...data.wallet, ownedSpeciesIds: ['oak'] };
    const r = parseImport(serializeExport(data));
    expect(r.ok && r.data.wallet.ownedSpeciesIds.sort()).toEqual([
      'apple',
      'daisy',
      'marshfern',
      'oak',
    ]);
  });
});
