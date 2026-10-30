import { describe, expect, it } from 'vitest';
import type { Session } from '@/types';
import {
  lastWeekStart,
  perfectWeeks,
  streakCalendar,
  weeklyRecap,
  weekMinutesByTag,
} from './recap';

const session = (start: Date, minutes: number, over: Partial<Session> = {}): Session => ({
  id: `${start.getTime()}-${minutes}`,
  startedAt: start.toISOString(),
  endedAt: new Date(start.getTime() + minutes * 60_000).toISOString(),
  plannedMinutes: minutes,
  actualMinutes: minutes,
  mode: 'countdown',
  strictness: 'standard',
  speciesId: 'daisy',
  tagId: 'a',
  outcome: 'completed',
  note: '',
  dewEarned: minutes,
  round: null,
  ...over,
});
const at = (d: number, h = 9) => new Date(2026, 9, d, h); // October 2026; the 12th is a Monday

describe('weekly recap', () => {
  it('summarises the week before now and compares with the one before it', () => {
    const sessions = [
      session(at(12), 60),
      session(at(13), 30, { tagId: 'b' }),
      session(at(13), 45),
      session(at(15), 20, { outcome: 'wilted', actualMinutes: 5 }),
      session(at(6), 40), // previous week
    ];
    const start = lastWeekStart(at(21));
    expect(start).toBe('2026-10-12');
    const r = weeklyRecap(sessions, [], start, 60);
    expect(r.minutes).toBe(135);
    expect(r.previousMinutes).toBe(40);
    expect(r.sessions).toBe(3);
    expect(r.wilted).toBe(1);
    expect(r.bestDay).toEqual({ day: '2026-10-13', minutes: 75 });
    expect(r.topTag).toEqual({ tagId: 'a', minutes: 105 });
    expect(r.goalDays).toBe(2);
  });
});

describe('streak calendar', () => {
  it('builds Monday-first columns with goal levels and marks future days', () => {
    const cal = streakCalendar(
      [session(at(12), 60), session(at(13), 20), session(at(14), 130)],
      60,
      2,
      at(14, 15),
    );
    expect(cal).toHaveLength(2);
    expect(cal[1][0]).toMatchObject({ day: '2026-10-12', level: 3 });
    expect(cal[1][1].level).toBe(1);
    expect(cal[1][2].level).toBe(4);
    expect(cal[1][3].future).toBe(true);
    expect(cal[0][0].day).toBe('2026-10-05');
  });
  it('counts perfect weeks only for fully past weeks', () => {
    const week = [12, 13, 14, 15, 16, 17, 18].map((d) => session(at(d), 60));
    expect(perfectWeeks(week, 60, at(25))).toBe(1);
    expect(perfectWeeks(week, 60, at(14))).toBe(0);
    expect(perfectWeeks(week.slice(1), 60, at(25))).toBe(0);
  });
  it('sums this week per tag', () => {
    const m = weekMinutesByTag(
      [session(at(12), 60), session(at(13), 30, { tagId: 'b' }), session(at(6), 40)],
      at(14),
    );
    expect(m.get('a')).toBe(60);
    expect(m.get('b')).toBe(30);
    expect(m.has(null)).toBe(false);
  });
});
