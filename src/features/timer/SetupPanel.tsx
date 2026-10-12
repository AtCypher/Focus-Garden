import { useMemo, useState } from 'react';
import type { Strictness, TimerMode } from '@/types';
import { useAppStore } from '@/app/store/appStore';
import { Button } from '@/app/ui/Button';
import { SegmentedControl } from '@/app/ui/SegmentedControl';
import { DewPill } from '@/app/ui/DewPill';
import { plantableSpecies, unlockContext } from '@/features/collection/unlocks';
import { summarize } from '@/features/stats/aggregate';
import { PlantArt } from '@/art/PlantArt';
import { DurationPicker } from './DurationPicker';
import { StrictnessPicker } from './StrictnessPicker';
import { RULES } from './rules';
import type { PlantRequest } from './timerStore';

interface Props {
  onPlant: (req: PlantRequest) => void;
  /** Pre-select a shorter duration (after a wilt). */
  suggestedMinutes?: number;
}

const MODES: { value: TimerMode; label: string; description: string }[] = [
  {
    value: 'countdown',
    label: 'Countdown',
    description: 'Pick a length from 10 minutes to 3 hours.',
  },
  {
    value: 'pomodoro',
    label: 'Pomodoro',
    description: 'Focus blocks with breaks. Each block grows a plant.',
  },
  {
    value: 'stopwatch',
    label: 'Stopwatch',
    description: 'Count up. A plant grows once you pass 10 minutes.',
  },
];

export function SetupPanel({ onPlant, suggestedMinutes }: Props) {
  const settings = useAppStore((s) => s.settings);
  const wallet = useAppStore((s) => s.wallet);
  const tags = useAppStore((s) => s.tags);
  const sessions = useAppStore((s) => s.sessions);
  const bestStreak = useAppStore((s) => s.streak.best);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [mode, setMode] = useState<TimerMode>(settings.defaultMode);
  const [minutes, setMinutes] = useState(suggestedMinutes ?? settings.defaultMinutes);
  const [strictness, setStrictness] = useState<Strictness>(settings.defaultStrictness);
  const [needsOtherApps, setNeedsOtherApps] = useState(false);
  const [speciesId, setSpeciesId] = useState(
    wallet.ownedSpeciesIds.includes(settings.defaultSpeciesId)
      ? settings.defaultSpeciesId
      : wallet.ownedSpeciesIds[0],
  );
  const [tagId, setTagId] = useState<string | null>(settings.defaultTagId);

  const owned = useMemo(
    () => plantableSpecies(unlockContext(sessions, wallet, bestStreak)),
    [sessions, wallet, bestStreak],
  );
  const effectiveStrictness: Strictness = needsOtherApps ? 'gentle' : strictness;
  const selected = owned.find((s) => s.id === speciesId) ?? owned[0];

  const submit = () => {
    updateSettings({
      defaultMode: mode,
      defaultMinutes: minutes,
      defaultStrictness: strictness,
      defaultSpeciesId: selected.id,
      defaultTagId: tagId,
    });
    onPlant({
      mode,
      minutes,
      strictness: effectiveStrictness,
      speciesId: selected.id,
      tagId,
      pomodoro: settings.pomodoro,
      round: 1,
    });
  };

  return (
    <form
      className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold">Plant a seed</h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs">
          <DewPill />
          <span className="text-muted">
            Today {summarize(sessions).today} / {settings.dailyGoalMinutes} min
          </span>
        </div>
        <p className="text-muted mt-1 text-sm">Stay with it and it grows. Leave and it may wilt.</p>
      </header>

      <SegmentedControl label="Timer mode" options={MODES} value={mode} onChange={setMode} />

      <section aria-label="Species" className="card p-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-2xl bg-moss-50 p-1 dark:bg-moss-900">
            <PlantArt species={selected} growth={1} stage="full" size={96} />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="species" className="text-sm font-medium">
              Species
            </label>
            <select
              id="species"
              value={selected.id}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="focus-ring mt-1 w-full rounded-xl border border-moss-200 bg-white px-3 py-2 dark:border-moss-700 dark:bg-moss-900"
            >
              {owned.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-muted mt-1 truncate text-xs italic">{selected.flavour}</p>
          </div>
        </div>
      </section>

      {mode === 'countdown' && (
        <section aria-label="Duration" className="card p-4">
          <DurationPicker value={minutes} onChange={setMinutes} />
        </section>
      )}
      {mode === 'pomodoro' && (
        <section className="card p-4 text-sm">
          <p>
            <span className="font-medium">{settings.pomodoro.focusMinutes} min</span> focus,{' '}
            <span className="font-medium">{settings.pomodoro.shortBreakMinutes} min</span> break,
            long break of{' '}
            <span className="font-medium">{settings.pomodoro.longBreakMinutes} min</span> every{' '}
            {settings.pomodoro.roundsBeforeLongBreak} rounds.
          </p>
          <p className="text-muted mt-1 text-xs">
            Change these in Settings. Each focus block grows one plant.
          </p>
        </section>
      )}
      {mode === 'stopwatch' && (
        <section className="card p-4 text-sm">
          <p>
            Count up as long as you like (up to {RULES.stopwatchMaxMinutes / 60} hours). Stopping
            before {RULES.stopwatchMinMinutes} minutes simply cancels; after that your plant is
            fully grown.
          </p>
        </section>
      )}

      <section className="card flex flex-col gap-4 p-4">
        <StrictnessPicker value={strictness} onChange={setStrictness} disabled={needsOtherApps} />
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 accent-moss-700"
            checked={needsOtherApps}
            onChange={(e) => setNeedsOtherApps(e.target.checked)}
          />
          <span>
            <span className="font-medium">I need other apps or tabs for this session</span>
            <span className="text-muted block text-xs">
              Switches this session to Gentle so leaving never wilts the plant.
            </span>
          </span>
        </label>
      </section>

      <section className="card p-4">
        <label htmlFor="tag" className="text-sm font-medium">
          Tag <span className="text-muted font-normal">(optional)</span>
        </label>
        <select
          id="tag"
          value={tagId ?? ''}
          onChange={(e) => setTagId(e.target.value || null)}
          className="focus-ring mt-1 w-full rounded-xl border border-moss-200 bg-white px-3 py-2 dark:border-moss-700 dark:bg-moss-900"
        >
          <option value="">No tag</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </section>

      <Button type="submit" size="lg" className="w-full">
        Plant
      </Button>
    </form>
  );
}
