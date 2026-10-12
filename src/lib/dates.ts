import type { DayKey } from '@/types';

/** Local calendar day key "YYYY-MM-DD" for a timestamp (ms) or Date. */
export function dayKey(input: number | Date | string): DayKey {
  const d = input instanceof Date ? input : new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Midnight (local) of the given day key, as a Date. */
export function dayStart(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function addDays(key: DayKey, delta: number): DayKey {
  const d = dayStart(key);
  d.setDate(d.getDate() + delta);
  return dayKey(d);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: DayKey, b: DayKey): number {
  const ms = dayStart(b).getTime() - dayStart(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Monday-start week key: the day key of the Monday of that week. */
export function weekStart(key: DayKey): DayKey {
  const d = dayStart(key);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return dayKey(d);
}

export function monthStart(key: DayKey): DayKey {
  return `${key.slice(0, 7)}-01`;
}

export function yearStart(key: DayKey): DayKey {
  return `${key.slice(0, 4)}-01-01`;
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "1h 25m", "45m". */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatHours(minutes: number): string {
  const h = minutes / 60;
  if (h >= 100) return `${Math.round(h)}h`;
  if (h >= 10) return `${h.toFixed(1).replace(/\.0$/, '')}h`;
  return `${h.toFixed(1).replace(/\.0$/, '')}h`;
}
