import { useMemo } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { formatMinutes } from '@/lib/dates';
import { weekMinutesByTag } from './recap';

/** Weekly minute goals per tag, as progress rings. Goals are set in Settings → Tags. */
export function TagGoals({ now }: { now: number }) {
  const sessions = useAppStore((s) => s.sessions);
  const tags = useAppStore((s) => s.tags);
  const goals = useAppStore((s) => s.progress.tagGoals);
  const minutes = useMemo(() => weekMinutesByTag(sessions, now), [sessions, now]);
  const withGoals = tags.filter((t) => (goals[t.id] ?? 0) > 0);
  if (withGoals.length === 0) {
    return (
      <section className="card p-4" aria-label="Weekly goals by tag">
        <h2 className="text-sm font-medium">Weekly goals by tag</h2>
        <p className="text-muted mt-1 text-xs">
          Set a minutes-per-week target for a tag in Settings → Tags and it shows up here.
        </p>
      </section>
    );
  }
  return (
    <section className="card p-4" aria-label="Weekly goals by tag">
      <h2 className="text-sm font-medium">This week by tag</h2>
      <ul className="mt-3 flex flex-wrap gap-4">
        {withGoals.map((t) => {
          const done = minutes.get(t.id) ?? 0;
          const goal = goals[t.id];
          const pct = Math.min(1, done / goal);
          const r = 22;
          const c = 2 * Math.PI * r;
          return (
            <li key={t.id} className="flex items-center gap-2">
              <svg
                viewBox="0 0 56 56"
                width="56"
                height="56"
                role="img"
                aria-label={`${t.name}: ${formatMinutes(done)} of ${formatMinutes(goal)} this week`}
              >
                <circle
                  cx="28"
                  cy="28"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-moss-100 dark:text-moss-800"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={r}
                  fill="none"
                  stroke={t.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${c * pct} ${c}`}
                  transform="rotate(-90 28 28)"
                />
                <text
                  x="28"
                  y="32"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="currentColor"
                >
                  {Math.round(pct * 100)}%
                </text>
              </svg>
              <div className="text-sm">
                <p className="font-medium">{t.name}</p>
                <p className="text-muted text-xs">
                  {formatMinutes(done)} of {formatMinutes(goal)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
