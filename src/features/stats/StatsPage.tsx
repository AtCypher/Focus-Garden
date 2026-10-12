import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '@/app/store/appStore';
import { formatMinutes } from '@/lib/dates';
import {
  dailySeries,
  filterByTag,
  groupByDay,
  minutesByHour,
  minutesByTag,
  summarize,
} from './aggregate';
import { evaluateStreak } from './streaks';
import { achievementViews } from './achievements';
import { getSpecies } from '@/data/species';
import { PlantArt } from '@/art/PlantArt';
import { IconCheck } from '@/app/ui/icons';

const UNTAGGED = '#9aa39c';

export function StatsPage() {
  const sessions = useAppStore((s) => s.sessions);
  const tags = useAppStore((s) => s.tags);
  const settings = useAppStore((s) => s.settings);
  const streakState = useAppStore((s) => s.streak);
  const freezes = useAppStore((s) => s.wallet.streakFreezes);
  const achievements = useAppStore((s) => s.achievements);
  const [tagId, setTagId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => filterByTag(sessions, tagId), [sessions, tagId]);
  const summary = useMemo(() => summarize(filtered, now), [filtered, now]);
  const daily = useMemo(() => dailySeries(filtered, 14, now), [filtered, now]);
  const byTag = useMemo(() => minutesByTag(sessions), [sessions]);
  const byHour = useMemo(() => minutesByHour(filtered), [filtered]);
  const streak = useMemo(
    () => evaluateStreak(sessions, settings.dailyGoalMinutes, streakState, freezes, now),
    [sessions, settings.dailyGoalMinutes, streakState, freezes, now],
  );
  const groups = useMemo(() => groupByDay(filtered).slice(0, 30), [filtered]);
  const views = useMemo(() => achievementViews(achievements), [achievements]);
  const tagById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const pieData = [...byTag.entries()]
    .map(([id, minutes]) => ({
      id,
      name: id ? (tagById.get(id)?.name ?? 'Deleted tag') : 'Untagged',
      minutes,
      color: id ? (tagById.get(id)?.color ?? UNTAGGED) : UNTAGGED,
    }))
    .sort((a, b) => b.minutes - a.minutes);
  const hourData = byHour.map((minutes, hour) => ({ hour, label: `${hour}`, minutes }));
  const goalPct = Math.min(1, streak.todayMinutes / settings.dailyGoalMinutes);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="font-display text-3xl font-semibold">Stats</h1>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        <FilterChip active={tagId === null} onClick={() => setTagId(null)} label="All" />
        {tags.map((t) => (
          <FilterChip
            key={t.id}
            active={tagId === t.id}
            onClick={() => setTagId(t.id)}
            label={t.name}
            color={t.color}
          />
        ))}
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Totals">
        <Stat label="Today" value={formatMinutes(summary.today)} />
        <Stat label="This week" value={formatMinutes(summary.week)} />
        <Stat label="This month" value={formatMinutes(summary.month)} />
        <Stat label="All time" value={formatMinutes(summary.all)} />
        <Stat
          label="Current streak"
          value={`${streak.display} day${streak.display === 1 ? '' : 's'}`}
          hint={`best ${Math.max(streak.state.best, streak.display)}`}
        />
        <Stat label="Streak freezes" value={String(streak.freezes)} hint="1 per 7-day streak" />
        <Stat
          label="Average session"
          value={formatMinutes(summary.averageMinutes)}
          hint={`longest ${formatMinutes(summary.longestMinutes)}`}
        />
        <Stat
          label="Completion rate"
          value={`${Math.round(summary.completionRate * 100)}%`}
          hint={`${summary.completedSessions} grown · ${summary.wiltedSessions} wilted`}
        />
      </section>

      <section className="card p-4" aria-label="Daily goal">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Daily goal</span>
          <span className="text-muted">
            {streak.todayMinutes} / {settings.dailyGoalMinutes} min today
          </span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
          role="progressbar"
          aria-valuenow={Math.round(goalPct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily goal progress"
        >
          <div
            className={`h-full rounded-full ${goalPct >= 1 ? 'bg-sun-500' : 'bg-moss-600 dark:bg-moss-400'}`}
            style={{ width: `${goalPct * 100}%` }}
          />
        </div>
      </section>

      <section className="card p-4" aria-label="Focus minutes per day">
        <h2 className="text-sm font-medium">Last 14 days</h2>
        <div className="mt-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={daily.map((d) => ({ ...d, label: d.day.slice(5).replace('-', '/') }))}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v} min`, 'Focus']} />
              <Bar dataKey="minutes" fill="var(--color-moss-500)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-4" aria-label="Focus by tag">
          <h2 className="text-sm font-medium">By tag</h2>
          {pieData.length === 0 ? (
            <p className="text-muted mt-2 text-sm">No completed sessions yet.</p>
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="minutes"
                      nameKey="name"
                      innerRadius={38}
                      outerRadius={64}
                      paddingAngle={2}
                    >
                      {pieData.map((d) => (
                        <Cell key={String(d.id)} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} min`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {pieData.map((d) => (
                  <li key={String(d.id)} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: d.color }}
                      aria-hidden
                    />
                    <span>{d.name}</span>
                    <span className="text-muted">{formatMinutes(d.minutes)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card p-4" aria-label="Focus by hour of day">
          <h2 className="text-sm font-medium">By hour of day</h2>
          <div className="mt-2 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [`${v} min`, 'Focus']}
                  labelFormatter={(l) => `${l}:00`}
                />
                <Bar dataKey="minutes" fill="var(--color-dew-500)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card p-4" aria-labelledby="achievements-h">
        <h2 id="achievements-h" className="text-sm font-medium">
          Achievements{' '}
          <span className="text-muted font-normal">
            ({views.filter((v) => v.unlockedAt).length} of {views.length})
          </span>
        </h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {views.map(({ def, value, progress, unlockedAt }) => (
            <li
              key={def.id}
              className={`rounded-xl border p-3 ${unlockedAt ? 'border-sun-400/60 bg-sun-400/10' : 'border-moss-100 dark:border-moss-800'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{def.name}</span>
                {unlockedAt ? (
                  <IconCheck
                    width={18}
                    height={18}
                    className="text-sun-500"
                    aria-label="Unlocked"
                  />
                ) : (
                  <span className="text-muted text-xs">
                    {Math.min(value, def.target)}/{def.target}
                    {def.unit ? ` ${def.unit}` : ''}
                  </span>
                )}
              </div>
              <p className="text-muted text-xs">{def.description}</p>
              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${def.name} progress`}
              >
                <div
                  className={`h-full rounded-full ${unlockedAt ? 'bg-sun-500' : 'bg-moss-500'}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="timeline-h">
        <h2 id="timeline-h" className="text-sm font-medium">
          Timeline
        </h2>
        {groups.length === 0 && <p className="text-muted mt-2 text-sm">No sessions yet.</p>}
        <ol className="mt-2 flex flex-col gap-3">
          {groups.map((g) => (
            <li key={g.day}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">
                  {new Date(g.day + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </h3>
                <span className="text-muted text-xs">{formatMinutes(g.minutes)}</span>
              </div>
              <ul className="card mt-1 divide-y divide-moss-100 dark:divide-moss-800">
                {g.sessions.map((s) => {
                  const species = getSpecies(s.speciesId);
                  const tag = s.tagId ? tagById.get(s.tagId) : null;
                  return (
                    <li key={s.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <PlantArt
                        species={species}
                        growth={s.outcome === 'cancelled' ? 0.05 : 1}
                        wilted={s.outcome === 'wilted'}
                        size={36}
                        seed={0.4}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">
                          <span className="font-medium">{species.name}</span>
                          <span className="text-muted">
                            {' '}
                            ·{' '}
                            {new Date(s.startedAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {tag && (
                            <span
                              className="ml-2 rounded-full px-1.5 py-0.5 text-xs"
                              style={{ background: `${tag.color}33`, color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          )}
                        </p>
                        {s.note && <p className="text-muted truncate text-xs">{s.note}</p>}
                      </div>
                      <span className={`text-xs ${s.outcome === 'completed' ? '' : 'text-muted'}`}>
                        {s.outcome === 'completed'
                          ? formatMinutes(s.actualMinutes)
                          : s.outcome === 'wilted'
                            ? `wilted after ${formatMinutes(s.actualMinutes)}`
                            : 'cancelled'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-3">
      <p className="text-muted text-xs">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="text-muted text-xs">{hint}</p>}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors ${active ? 'bg-moss-700 text-white dark:bg-moss-400 dark:text-moss-950' : 'bg-moss-100 text-moss-800 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-100'}`}
    >
      {color && (
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
      )}
      {label}
    </button>
  );
}
