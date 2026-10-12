/** Pure aggregations over sessions for the dashboard, charts and timeline. */
import type { DayKey, Session } from '@/types';
import { addDays, dayKey, monthStart, weekStart } from '@/lib/dates';

export const completed = (s: Session) => s.outcome === 'completed';

export function filterByTag(sessions: Session[], tagId: string | null): Session[] {
  return tagId === null ? sessions : sessions.filter((s) => s.tagId === tagId);
}

export function minutesByDay(sessions: Session[]): Map<DayKey, number> {
  const map = new Map<DayKey, number>();
  for (const s of sessions) {
    if (!completed(s)) continue;
    const k = dayKey(s.endedAt);
    map.set(k, (map.get(k) ?? 0) + s.actualMinutes);
  }
  return map;
}

export interface Summary {
  today: number;
  week: number;
  month: number;
  all: number;
  sessions: number;
  completedSessions: number;
  wiltedSessions: number;
  /** 0..1 over completed + wilted (cancels are not counted). */
  completionRate: number;
  averageMinutes: number;
  longestMinutes: number;
}

export function summarize(sessions: Session[], now: number | Date = Date.now()): Summary {
  const today = dayKey(now);
  const wk = weekStart(today);
  const mo = monthStart(today);
  let t = 0;
  let w = 0;
  let m = 0;
  let all = 0;
  let done = 0;
  let wilted = 0;
  let longest = 0;
  for (const s of sessions) {
    if (s.outcome === 'wilted') wilted++;
    if (!completed(s)) continue;
    done++;
    all += s.actualMinutes;
    longest = Math.max(longest, s.actualMinutes);
    const k = dayKey(s.endedAt);
    if (k === today) t += s.actualMinutes;
    if (k >= wk) w += s.actualMinutes;
    if (k >= mo) m += s.actualMinutes;
  }
  const judged = done + wilted;
  return {
    today: t,
    week: w,
    month: m,
    all,
    sessions: sessions.length,
    completedSessions: done,
    wiltedSessions: wilted,
    completionRate: judged === 0 ? 1 : done / judged,
    averageMinutes: done === 0 ? 0 : Math.round(all / done),
    longestMinutes: longest,
  };
}

/** Minutes per day for the last `days` days, oldest first, zero-filled. */
export function dailySeries(
  sessions: Session[],
  days: number,
  now: number | Date = Date.now(),
): { day: DayKey; minutes: number }[] {
  const map = minutesByDay(sessions);
  const today = dayKey(now);
  const out: { day: DayKey; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    out.push({ day: d, minutes: map.get(d) ?? 0 });
  }
  return out;
}

export function minutesByTag(sessions: Session[]): Map<string | null, number> {
  const map = new Map<string | null, number>();
  for (const s of sessions) {
    if (!completed(s)) continue;
    map.set(s.tagId, (map.get(s.tagId) ?? 0) + s.actualMinutes);
  }
  return map;
}

/** Minutes of focus that fell in each hour of the day (0..23), splitting sessions across hours. */
export function minutesByHour(sessions: Session[]): number[] {
  const hours = new Array<number>(24).fill(0);
  for (const s of sessions) {
    if (!completed(s) || s.actualMinutes <= 0) continue;
    const start = new Date(s.startedAt);
    let remaining = s.actualMinutes;
    let cursor = new Date(start);
    while (remaining > 0) {
      const h = cursor.getHours();
      const untilNextHour = 60 - cursor.getMinutes();
      const chunk = Math.min(remaining, untilNextHour);
      hours[h] += chunk;
      remaining -= chunk;
      cursor = new Date(cursor.getTime() + chunk * 60_000);
    }
  }
  return hours;
}

export interface DayGroup {
  day: DayKey;
  minutes: number;
  sessions: Session[];
}

/** Sessions grouped by local day, newest day first, newest session first within a day. */
export function groupByDay(sessions: Session[]): DayGroup[] {
  const groups = new Map<DayKey, DayGroup>();
  for (const s of sessions) {
    const k = dayKey(s.endedAt);
    let g = groups.get(k);
    if (!g) {
      g = { day: k, minutes: 0, sessions: [] };
      groups.set(k, g);
    }
    g.sessions.push(s);
    if (completed(s)) g.minutes += s.actualMinutes;
  }
  const out = [...groups.values()].sort((a, b) => b.day.localeCompare(a.day));
  for (const g of out) g.sessions.sort((a, b) => b.endedAt.localeCompare(a.endedAt));
  return out;
}
