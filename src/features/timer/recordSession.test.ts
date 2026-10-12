import { describe, expect, it } from 'vitest';
import { reduce, start, type EngineConfig } from './engine';
import { buildRecords, isFirstSessionOfDay } from './recordSession';
import type { Session } from '@/types';

const MIN = 60_000;
const T0 = new Date(2026, 9, 12, 9, 0, 0).getTime();
const cfg: EngineConfig = {
  mode: 'countdown',
  plannedMinutes: 25,
  strictness: 'standard',
  speciesId: 'apple',
  tagId: null,
  round: null,
  minuteMs: MIN,
};

describe('buildRecords', () => {
  it('creates a session and a placed plant for a completed block', () => {
    const done = reduce(start(cfg, T0), { type: 'tick' }, T0 + 25 * MIN);
    const { session, plant } = buildRecords({
      state: done,
      existingSessions: [],
      chooseTile: () => ({ col: 1, row: 2 }),
    });
    expect(session.outcome).toBe('completed');
    expect(session.actualMinutes).toBe(25);
    expect(session.dewEarned).toBe(28 + 5); // standard bonus + first of day
    expect(plant).toMatchObject({
      speciesId: 'apple',
      biome: 'orchard',
      wilted: false,
      variant: 'standard',
      tile: { col: 1, row: 2 },
    });
    expect(plant?.sessionId).toBe(session.id);
  });

  it('creates a wilted plant with no dew for a wilted block', () => {
    const gone = reduce(
      reduce(start(cfg, T0), { type: 'hide' }, T0 + 5 * MIN),
      { type: 'show' },
      T0 + 6 * MIN,
    );
    const { session, plant } = buildRecords({
      state: gone,
      existingSessions: [],
      chooseTile: () => null,
    });
    expect(session.outcome).toBe('wilted');
    expect(session.dewEarned).toBe(0);
    expect(plant?.wilted).toBe(true);
    expect(plant?.tile).toBeNull();
  });

  it('creates no plant for a cancelled block', () => {
    const c = reduce(start(cfg, T0), { type: 'cancel' }, T0 + 2000);
    const { plant } = buildRecords({ state: c, existingSessions: [], chooseTile: () => null });
    expect(plant).toBeNull();
  });

  it('marks mature and ancient variants by length', () => {
    const long = reduce(
      start({ ...cfg, plannedMinutes: 120 }, T0),
      { type: 'tick' },
      T0 + 120 * MIN,
    );
    expect(
      buildRecords({ state: long, existingSessions: [], chooseTile: () => null }).plant?.variant,
    ).toBe('ancient');
  });

  it('only pays the first-of-day bonus once per local day', () => {
    const earlier: Session = {
      id: 'a',
      startedAt: new Date(T0 - 60 * MIN).toISOString(),
      endedAt: new Date(T0 - 30 * MIN).toISOString(),
      plannedMinutes: 30,
      actualMinutes: 30,
      mode: 'countdown',
      strictness: 'gentle',
      speciesId: 'daisy',
      tagId: null,
      outcome: 'completed',
      note: '',
      dewEarned: 35,
      round: null,
    };
    expect(isFirstSessionOfDay([earlier], T0)).toBe(false);
    expect(isFirstSessionOfDay([{ ...earlier, outcome: 'wilted' }], T0)).toBe(true);
    const done = reduce(start(cfg, T0), { type: 'tick' }, T0 + 25 * MIN);
    expect(
      buildRecords({ state: done, existingSessions: [earlier], chooseTile: () => null }).session
        .dewEarned,
    ).toBe(28);
  });
});
