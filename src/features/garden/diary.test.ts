import { describe, expect, it } from 'vitest';
import type { Plant, Session } from '@/types';
import { buildDiary } from './diary';
import { speciesStats } from '@/features/collection/speciesStats';

const session = (
  day: number,
  minutes: number,
  speciesId = 'daisy',
  outcome: Session['outcome'] = 'completed',
): Session => {
  const start = new Date(2026, 9, day, 9);
  return {
    id: `s${day}-${minutes}-${speciesId}`,
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + minutes * 60000).toISOString(),
    plannedMinutes: minutes,
    actualMinutes: minutes,
    mode: 'countdown',
    strictness: 'standard',
    speciesId,
    tagId: null,
    outcome,
    note: minutes === 45 ? 'Essay draft' : '',
    dewEarned: minutes,
    round: null,
  };
};
const plantFor = (s: Session): Plant => ({
  id: `p-${s.id}`,
  sessionId: s.id,
  speciesId: s.speciesId,
  variant: 'standard',
  biome: 'meadow',
  wilted: s.outcome === 'wilted',
  grownAt: s.endedAt,
  tile: null,
});

describe('diary', () => {
  it('groups days newest first, marks first-time species and writes a line', () => {
    const sessions = [
      session(1, 25),
      session(2, 45, 'poppy'),
      session(2, 30, 'daisy', 'wilted'),
      session(3, 150),
    ];
    const d = buildDiary(sessions, sessions.map(plantFor), 60, 'Pip');
    expect(d.map((e) => e.day)).toEqual(['2026-10-03', '2026-10-02', '2026-10-01']);
    expect(d[2].firstTimes).toEqual(['daisy']);
    expect(d[1].firstTimes).toEqual(['poppy']);
    expect(d[1].wilted).toBe(1);
    expect(d[1].notes).toEqual(['Essay draft']);
    expect(d[1].line).toContain('Field Poppy');
    expect(d[0].line.length).toBeGreaterThan(10);
    expect(d[0].plants).toHaveLength(1);
  });
});

describe('species stats', () => {
  it('counts, dates and best sessions per species', () => {
    const st = speciesStats([
      session(1, 25),
      session(3, 90),
      session(2, 40, 'daisy', 'wilted'),
      session(5, 30, 'oak'),
    ]);
    expect(st.daisy).toMatchObject({ grown: 2, bestMinutes: 90, totalMinutes: 115 });
    expect(st.daisy.firstGrownAt?.startsWith('2026-10-01')).toBe(true);
    expect(st.oak.grown).toBe(1);
  });
});
