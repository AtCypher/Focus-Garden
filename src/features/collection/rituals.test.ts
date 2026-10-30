import { describe, expect, it } from 'vitest';
import { emptyProgress } from '@/data/defaults';
import { GARDEN_LEVELS } from '@/data/gardenLevels';
import type { Biome, Session } from '@/types';
import {
  companionLevel,
  countEventSession,
  dailyVisit,
  evaluateChallenges,
  hashUnit,
  recordSightings,
  rollFind,
  visitorsToday,
} from './rituals';
import { activeEvent } from '@/data/events';
import { plantableSpecies, speciesStatus, unlockContext } from './unlocks';
import { DEFAULT_WALLET } from '@/data/defaults';
import { getSpecies } from '@/data/species';

const session = (start: Date, minutes: number, over: Partial<Session> = {}): Session => ({
  id: `${start.getTime()}`,
  startedAt: start.toISOString(),
  endedAt: new Date(start.getTime() + minutes * 60_000).toISOString(),
  plannedMinutes: minutes,
  actualMinutes: minutes,
  mode: 'countdown',
  strictness: 'standard',
  speciesId: 'daisy',
  tagId: null,
  outcome: 'completed',
  note: '',
  dewEarned: minutes,
  round: null,
  ...over,
});

describe('daily visit', () => {
  it('pays once per day, more on a streak', () => {
    const p = emptyProgress();
    const first = dailyVisit(p, '2026-10-30', 0);
    expect(first?.dew).toBe(5);
    expect(dailyVisit({ ...p, ...first!.patch }, '2026-10-30', 0)).toBeNull();
    expect(dailyVisit(p, '2026-10-30', 3)?.dew).toBe(10);
  });
});

describe("Pip's finds", () => {
  it('is deterministic per session and only hands out unowned finds', () => {
    const ids = Array.from({ length: 200 }, (_, i) => `s${i}`);
    const found = ids.map((id) => rollFind(id, []));
    expect(found.filter(Boolean).length).toBeGreaterThan(40);
    expect(found.filter(Boolean).length).toBeLessThan(110);
    expect(rollFind('s1', [])).toBe(rollFind('s1', []));
    const all = [
      'feather',
      'stone',
      'acorn',
      'shell',
      'pinecone',
      'button',
      'marble',
      'seedpacket',
      'bottlecap',
      'key',
      'clover',
      'egg',
    ];
    expect(ids.map((id) => rollFind(id, all)).every((f) => f === null)).toBe(true);
  });
  it('hashes into 0..1', () => {
    expect(hashUnit('a')).toBeGreaterThanOrEqual(0);
    expect(hashUnit('a')).toBeLessThan(1);
  });
});

describe('visitors', () => {
  const restored = {
    meadow: 1,
    orchard: 1,
    wetland: 1,
    forest: 1,
    desert: 1,
    alpine: 1,
    tropical: 1,
  } as Record<Biome, number>;
  it('only brings visitors to unlocked, restored biomes at the right time, deterministically', () => {
    const l1 = GARDEN_LEVELS[0];
    const a = visitorsToday('2026-10-30', l1, restored, 'day', new Set());
    const b = visitorsToday('2026-10-30', l1, restored, 'day', new Set());
    expect(a.map((s) => s.visitor.id)).toEqual(b.map((s) => s.visitor.id));
    expect(a.every((s) => ['meadow', 'orchard', 'wetland'].includes(s.visitor.biome))).toBe(true);
    expect(a.every((s) => !s.visitor.times || s.visitor.times.includes('day'))).toBe(true);
    const none = visitorsToday(
      '2026-10-30',
      l1,
      { ...restored, meadow: 0, orchard: 0, wetland: 0 },
      'day',
      new Set(),
    );
    expect(none).toEqual([]);
  });
  it('records sightings once per day and reports first-timers', () => {
    const l1 = GARDEN_LEVELS[0];
    const days = ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'];
    let p = emptyProgress();
    let firsts = 0;
    for (const d of days) {
      const s = visitorsToday(d, l1, restored, 'day', new Set());
      const r = recordSightings(p, s, d, `${d}T10:00:00.000Z`);
      if (r) {
        firsts += r.firstSeen.length;
        p = { ...p, ...r.patch };
        expect(recordSightings(p, s, d, `${d}T11:00:00.000Z`)).toBeNull();
      }
    }
    expect(p.visitors.length).toBe(firsts);
    expect(p.visitors.length).toBeGreaterThan(0);
  });
});

describe('events', () => {
  it('finds the active event by date and grants the reward at the threshold', () => {
    expect(activeEvent(new Date(2026, 9, 3))?.id).toBe('harvest-week');
    expect(activeEvent(new Date(2026, 9, 20))).toBeNull();
    let p = emptyProgress();
    const d = new Date(2026, 9, 3);
    for (let i = 1; i <= 3; i++) {
      const r = countEventSession(p, d)!;
      p = { ...p, ...r.patch };
      expect(r.reward?.id ?? null).toBe(i === 3 ? 'harvest-week' : null);
    }
    expect(countEventSession(p, d)?.reward).toBeNull();
    expect(countEventSession(p, new Date(2026, 9, 20))).toBeNull();
  });
});

describe('challenges', () => {
  it('tracks met days, fails on a missed past day, completes after 7', () => {
    const p = emptyProgress();
    p.challenges = [
      {
        id: 'early-bird',
        startedDay: '2026-10-20',
        completedAt: null,
        metDays: [],
        failedAt: null,
      },
    ];
    const early = (day: number) => session(new Date(2026, 9, day, 7, 30), 25);
    const seven = [20, 21, 22, 23, 24, 25, 26].map(early);
    const partial = evaluateChallenges(p, seven.slice(0, 3), 60, new Date(2026, 9, 22, 12));
    expect(partial.challenges[0].metDays).toHaveLength(3);
    expect(partial.completed).toEqual([]);
    const done = evaluateChallenges(p, seven, 60, new Date(2026, 9, 27, 9));
    expect(done.completed).toEqual(['early-bird']);
    const missed = evaluateChallenges(p, [seven[0], seven[2]], 60, new Date(2026, 9, 23, 9));
    expect(missed.failed).toEqual(['early-bird']);
    const late = evaluateChallenges(
      p,
      [session(new Date(2026, 9, 20, 14), 25)],
      60,
      new Date(2026, 9, 20, 15),
    );
    expect(late.challenges[0].metDays).toEqual([]);
    expect(late.failed).toEqual([]);
  });
});

describe('seasonal and challenge species', () => {
  it('are plantable only in season or after the challenge', () => {
    const base = unlockContext([], DEFAULT_WALLET, 0, {
      season: 'winter',
      completedChallenges: [],
    });
    expect(plantableSpecies(base).map((s) => s.id)).toContain('frostlily');
    expect(plantableSpecies(base).map((s) => s.id)).not.toContain('tulip');
    expect(speciesStatus(getSpecies('tulip'), base)).toEqual({
      kind: 'seasonal',
      inSeason: false,
      season: 'spring',
    });
    expect(speciesStatus(getSpecies('dawnrose'), base).kind).toBe('locked');
    const won = unlockContext([], DEFAULT_WALLET, 0, {
      season: 'winter',
      completedChallenges: ['early-bird'],
    });
    expect(speciesStatus(getSpecies('dawnrose'), won).kind).toBe('locked');
    expect(
      speciesStatus(getSpecies('dawnrose'), {
        ...won,
        wallet: { ...DEFAULT_WALLET, ownedSpeciesIds: ['dawnrose'] },
      }).kind,
    ).toBe('owned');
  });
});

describe('companion level', () => {
  it('grows with lifetime minutes', () => {
    expect(companionLevel(0).title).toBe('Seedling');
    expect(companionLevel(8 * 60).level).toBe(3);
    expect(companionLevel(500 * 60).level).toBe(7);
  });
});
