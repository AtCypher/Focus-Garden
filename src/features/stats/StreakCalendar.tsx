import { useMemo } from 'react';
import type { Session } from '@/types';
import { perfectWeeks, streakCalendar } from './recap';

const LEVEL_CLASS = [
  'bg-moss-100 dark:bg-moss-800',
  'bg-moss-200 dark:bg-moss-700',
  'bg-moss-400 dark:bg-moss-600',
  'bg-moss-600 dark:bg-moss-400',
  'bg-moss-800 dark:bg-moss-200',
];

/** Twelve weeks of days, GitHub-style, coloured against the daily goal. */
export function StreakCalendar({
  sessions,
  goalMinutes,
  now,
}: {
  sessions: Session[];
  goalMinutes: number;
  now: number;
}) {
  const columns = useMemo(
    () => streakCalendar(sessions, goalMinutes, 12, now),
    [sessions, goalMinutes, now],
  );
  const perfect = useMemo(
    () => perfectWeeks(sessions, goalMinutes, now),
    [sessions, goalMinutes, now],
  );
  return (
    <section className="card p-4" aria-label="Streak calendar">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">Last 12 weeks</h2>
        <p className="text-muted text-xs">
          {perfect} perfect week{perfect === 1 ? '' : 's'} (goal met all 7 days)
        </p>
      </div>
      <div
        className="mt-3 flex gap-1 overflow-x-auto"
        role="img"
        aria-label={`Calendar of the last 12 weeks, ${perfect} perfect weeks`}
      >
        <div className="text-muted mr-1 flex flex-col gap-1 text-[10px]" aria-hidden>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="h-3.5 leading-[14px]">
              {d}
            </span>
          ))}
        </div>
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-1">
            {col.map((cell) => (
              <span
                key={cell.day}
                title={`${cell.day}: ${cell.minutes} min`}
                className={`h-3.5 w-3.5 rounded-sm ${cell.future ? 'bg-transparent' : LEVEL_CLASS[cell.level]} ${cell.level >= 3 ? 'ring-1 ring-sun-400/60' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-muted mt-2 text-xs">
        Darker means more focus. A gold ring is a day the goal was met.
      </p>
    </section>
  );
}
