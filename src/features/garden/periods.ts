import type { DayKey } from '@/types';
import { dayKey, dayStart, monthStart, weekStart, yearStart } from '@/lib/dates';

export type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'all', label: 'All' },
];

/** Start of the period containing `now`, as a local day key. Null means no lower bound. */
export function periodStart(period: Period, now: number | Date): DayKey | null {
  const key = dayKey(now);
  switch (period) {
    case 'today':
      return key;
    case 'week':
      return weekStart(key);
    case 'month':
      return monthStart(key);
    case 'year':
      return yearStart(key);
    case 'all':
      return null;
  }
}

export function inPeriod(isoDate: string, period: Period, now: number | Date): boolean {
  const start = periodStart(period, now);
  if (start === null) return true;
  return new Date(isoDate).getTime() >= dayStart(start).getTime();
}
