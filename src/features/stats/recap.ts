/** Weekly recap numbers and the streak calendar, pure. */
import type { DayKey, Plant, Session } from '@/types';
import { addDays, dayKey, weekStart } from '@/lib/dates';
import { minutesByDay } from './aggregate';

export interface WeeklyRecap {
  weekStart: DayKey;
  weekEnd: DayKey;
  minutes: number;
  previousMinutes: number;
  sessions: number;
  wilted: number;
  bestDay: { day: DayKey; minutes: number } | null;
  topTag: { tagId: string | null; minutes: number } | null;
  plantsGrown: number;
  goalDays: number;
}

function inWeek(iso: string, start: DayKey): boolean {
  const k = dayKey(iso);
  return k >= start && k <= addDays(start, 6);
}

export function weeklyRecap(
  sessions: Session[],
  plants: Plant[],
  start: DayKey,
  goalMinutes: number,
): WeeklyRecap {
  const week = sessions.filter((s) => inWeek(s.endedAt, start));
  const prevStart = addDays(start, -7);
  const prev = sessions.filter((s) => inWeek(s.endedAt, prevStart) && s.outcome === 'completed');
  const done = week.filter((s) => s.outcome === 'completed');
  const perDay = minutesByDay(done);
  let bestDay: WeeklyRecap['bestDay'] = null;
  for (const [day, minutes] of perDay)
    if (!bestDay || minutes > bestDay.minutes) bestDay = { day, minutes };
  const byTag = new Map<string | null, number>();
  for (const s of done) byTag.set(s.tagId, (byTag.get(s.tagId) ?? 0) + s.actualMinutes);
  let topTag: WeeklyRecap['topTag'] = null;
  for (const [tagId, minutes] of byTag)
    if (!topTag || minutes > topTag.minutes) topTag = { tagId, minutes };
  return {
    weekStart: start,
    weekEnd: addDays(start, 6),
    minutes: done.reduce((n, s) => n + s.actualMinutes, 0),
    previousMinutes: prev.reduce((n, s) => n + s.actualMinutes, 0),
    sessions: done.length,
    wilted: week.filter((s) => s.outcome === 'wilted').length,
    bestDay,
    topTag,
    plantsGrown: plants.filter((p) => !p.wilted && inWeek(p.grownAt, start)).length,
    goalDays: [...perDay.values()].filter((m) => m >= goalMinutes).length,
  };
}

/** The most recent completed week (Monday to Sunday) before `now`. */
export function lastWeekStart(now: number | Date): DayKey {
  return addDays(weekStart(dayKey(now)), -7);
}

export interface CalendarCell {
  day: DayKey;
  minutes: number;
  /** 0 = none, 1 = some, 2 = half the goal, 3 = goal met, 4 = double the goal. */
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

/** `weeks` columns ending with the current week, Monday-first rows. */
export function streakCalendar(
  sessions: Session[],
  goalMinutes: number,
  weeks: number,
  now: number | Date,
): CalendarCell[][] {
  const perDay = minutesByDay(sessions);
  const today = dayKey(now);
  const start = addDays(weekStart(today), -7 * (weeks - 1));
  const columns: CalendarCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d);
      const minutes = perDay.get(day) ?? 0;
      const ratio = goalMinutes > 0 ? minutes / goalMinutes : 0;
      const level = minutes === 0 ? 0 : ratio >= 2 ? 4 : ratio >= 1 ? 3 : ratio >= 0.5 ? 2 : 1;
      col.push({ day, minutes, level, future: day > today });
    }
    columns.push(col);
  }
  return columns;
}

/** Weeks (Monday to Sunday, fully in the past) in which every day met the goal. */
export function perfectWeeks(sessions: Session[], goalMinutes: number, now: number | Date): number {
  const perDay = minutesByDay(sessions);
  const days = [...perDay.keys()].sort();
  if (days.length === 0) return 0;
  const thisWeek = weekStart(dayKey(now));
  let count = 0;
  for (let w = weekStart(days[0]); w < thisWeek; w = addDays(w, 7)) {
    let all = true;
    for (let d = 0; d < 7; d++) if ((perDay.get(addDays(w, d)) ?? 0) < goalMinutes) all = false;
    if (all) count++;
  }
  return count;
}

/** Minutes this week per tag id (Monday-start week containing `now`). */
export function weekMinutesByTag(
  sessions: Session[],
  now: number | Date,
): Map<string | null, number> {
  const start = weekStart(dayKey(now));
  const out = new Map<string | null, number>();
  for (const s of sessions) {
    if (s.outcome !== 'completed' || !inWeek(s.endedAt, start)) continue;
    out.set(s.tagId, (out.get(s.tagId) ?? 0) + s.actualMinutes);
  }
  return out;
}
