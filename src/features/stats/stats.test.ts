import { describe, expect, it } from 'vitest';
import type { Session, StreakState } from '@/types';
import { dailySeries, groupByDay, minutesByHour, minutesByTag, summarize } from './aggregate';
import { evaluateStreak } from './streaks';
import { computeMetrics, evaluateAchievements } from './achievements';
import { DEFAULT_WALLET } from '@/data/defaults';

function session(start: Date, minutes: number, over: Partial<Session> = {}): Session {
  return {
    id: `${start.getTime()}-${Math.random()}`,
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
  };
}
const at = (y: number, m: number, d: number, h = 9, min = 0) => new Date(y, m - 1, d, h, min);

describe('aggregate', () => {
  const now = at(2026, 10, 14, 15); // Wednesday
  const sessions = [
    session(at(2026, 10, 14, 8), 25, { tagId: 'a' }),
    session(at(2026, 10, 13, 22, 40), 40, { tagId: 'b' }),
    session(at(2026, 10, 6), 60),
    session(at(2026, 9, 30), 90, { outcome: 'wilted', actualMinutes: 10 }),
    session(at(2026, 9, 1), 30, { outcome: 'cancelled', actualMinutes: 0 }),
  ];
  it('summarises periods and rates', () => {
    const s = summarize(sessions, now);
    expect(s.today).toBe(25);
    expect(s.week).toBe(65);
    expect(s.month).toBe(125);
    expect(s.all).toBe(125);
    expect(s.completedSessions).toBe(3);
    expect(s.wiltedSessions).toBe(1);
    expect(s.completionRate).toBeCloseTo(0.75);
    expect(s.averageMinutes).toBe(42);
    expect(s.longestMinutes).toBe(60);
  });
  it('builds a zero-filled daily series', () => {
    const series = dailySeries(sessions, 3, now);
    expect(series.map((x) => x.day)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
    expect(series.map((x) => x.minutes)).toEqual([0, 40, 25]);
  });
  it('splits minutes by tag and by hour', () => {
    const byTag = minutesByTag(sessions);
    expect(byTag.get('a')).toBe(25);
    expect(byTag.get(null)).toBe(60);
    const hours = minutesByHour([sessions[1]]);
    expect(hours[22]).toBe(20);
    expect(hours[23]).toBe(20);
  });
  it('groups the timeline by day, newest first', () => {
    const g = groupByDay(sessions);
    expect(g[0].day).toBe('2026-10-14');
    expect(g[g.length - 1].day).toBe('2026-09-01');
    expect(g.find((x) => x.day === '2026-09-30')?.minutes).toBe(0);
  });
});

describe('streaks', () => {
  const fresh: StreakState = { current: 0, best: 0, frozenDays: [], lastEvaluated: null };
  const goal = 30;
  it('counts consecutive goal days and includes today once met', () => {
    const sessions = [1, 2, 3].map((d) => session(at(2026, 10, d), 30));
    const r = evaluateStreak(sessions, goal, fresh, 0, at(2026, 10, 4, 12));
    expect(r.state.current).toBe(3);
    expect(r.display).toBe(3);
    expect(r.todayMet).toBe(false);
    const withToday = evaluateStreak(
      [...sessions, session(at(2026, 10, 4, 8), 45)],
      goal,
      fresh,
      0,
      at(2026, 10, 4, 12),
    );
    expect(withToday.display).toBe(4);
    expect(withToday.state.current).toBe(3);
  });
  it('does not count days below the goal', () => {
    const sessions = [
      session(at(2026, 10, 1), 30),
      session(at(2026, 10, 2), 20),
      session(at(2026, 10, 3), 30),
    ];
    const r = evaluateStreak(sessions, goal, fresh, 0, at(2026, 10, 4));
    expect(r.state.current).toBe(1);
    expect(r.state.best).toBe(1);
  });
  it('earns a freeze every 7 days and spends it on a missed day', () => {
    const sessions = Array.from({ length: 7 }, (_, i) => session(at(2026, 10, 1 + i), 30));
    const week = evaluateStreak(sessions, goal, fresh, 0, at(2026, 10, 8));
    expect(week.state.current).toBe(7);
    expect(week.freezes).toBe(1);
    expect(week.earned).toBe(1);
    // Day 8 missed, day 9 met, evaluated on day 10.
    const later = evaluateStreak(
      [...sessions, session(at(2026, 10, 9), 30)],
      goal,
      week.state,
      week.freezes,
      at(2026, 10, 10),
    );
    expect(later.frozen).toEqual(['2026-10-08']);
    expect(later.freezes).toBe(0);
    expect(later.state.current).toBe(8);
    // Two more misses with no freeze left reset the streak.
    const reset = evaluateStreak(
      [...sessions, session(at(2026, 10, 9), 30)],
      goal,
      later.state,
      later.freezes,
      at(2026, 10, 13),
    );
    expect(reset.state.current).toBe(0);
    expect(reset.state.best).toBe(8);
  });
  it('is incremental: re-evaluating the same day changes nothing', () => {
    const sessions = [1, 2].map((d) => session(at(2026, 10, d), 30));
    const a = evaluateStreak(sessions, goal, fresh, 0, at(2026, 10, 3));
    const b = evaluateStreak(sessions, goal, a.state, a.freezes, at(2026, 10, 3));
    expect(b.state).toEqual(a.state);
    expect(b.earned).toBe(0);
  });
  it('never freezes before a streak exists', () => {
    const r = evaluateStreak([session(at(2026, 10, 5), 20)], goal, fresh, 2, at(2026, 10, 8));
    expect(r.frozen).toEqual([]);
    expect(r.freezes).toBe(2);
    expect(r.state.current).toBe(0);
  });
});

describe('achievements', () => {
  it('computes metrics and unlocks once', () => {
    const sessions = [
      session(at(2026, 10, 1, 6), 130, { strictness: 'deep' }),
      session(at(2026, 10, 1, 23), 25, { mode: 'pomodoro', round: 1 }),
    ];
    const m = computeMetrics(sessions, [], DEFAULT_WALLET, [], 2);
    expect(m).toMatchObject({
      completedSessions: 2,
      totalMinutes: 155,
      longestSessionMinutes: 130,
      earlySessions: 1,
      lateSessions: 1,
      deepSessions: 1,
      pomodoroBlocks: 1,
      bestStreak: 2,
    });
    const first = evaluateAchievements(m, [], new Date('2026-10-02T00:00:00Z'));
    expect(first.unlocked.map((d) => d.id)).toEqual(['first-seed', 'long-haul']);
    const second = evaluateAchievements(m, first.list);
    expect(second.unlocked).toEqual([]);
    expect(second.list.find((p) => p.id === 'first-seed')?.unlockedAt).toBe(
      '2026-10-02T00:00:00.000Z',
    );
  });
});
