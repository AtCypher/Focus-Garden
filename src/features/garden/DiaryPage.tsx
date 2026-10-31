import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/app/store/appStore';
import { Button } from '@/app/ui/Button';
import { Companion } from '@/art/Companion';
import { PlantArt } from '@/art/PlantArt';
import { getSpecies } from '@/data/species';
import { formatMinutes } from '@/lib/dates';
import { companionLevel } from '@/features/collection/rituals';
import { totalFocusMinutes } from './layout';
import { buildDiary } from './diary';

const PAGE = 14;

/** A day-by-day diary: Pip's line, the plants grown, and any notes. */
export function DiaryPage() {
  const sessions = useAppStore((s) => s.sessions);
  const plants = useAppStore((s) => s.plants);
  const goal = useAppStore((s) => s.settings.dailyGoalMinutes);
  const name = useAppStore((s) => s.settings.companionName);
  const outfit = useAppStore((s) => s.settings.companionOutfitId);
  const level = companionLevel(totalFocusMinutes(sessions)).level;
  const [shown, setShown] = useState(PAGE);
  const entries = useMemo(
    () => buildDiary(sessions, plants, goal, name),
    [sessions, plants, goal, name],
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <Companion mood="humming" outfitId={outfit} level={level} size={64} label={name} />
        <div>
          <h1 className="font-display text-3xl font-semibold">Garden diary</h1>
          <p className="text-muted text-sm">
            {entries.length} day{entries.length === 1 ? '' : 's'} with something in the ground.{' '}
            <Link to="/garden" className="font-medium text-moss-700 underline dark:text-moss-300">
              Back to the garden
            </Link>
          </p>
        </div>
      </header>
      {entries.length === 0 && (
        <p className="text-muted text-sm">Nothing yet. Plant a seed and come back.</p>
      )}
      <ol className="flex flex-col gap-3">
        {entries.slice(0, shown).map((e) => (
          <li key={e.day} className="card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {new Date(`${e.day}T12:00:00`).toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              <span className="text-muted text-xs">
                {formatMinutes(e.minutes)}
                {e.wilted > 0 ? ` · ${e.wilted} wilted` : ''}
              </span>
            </div>
            <p className="mt-1 text-sm italic">
              {name}: “{e.line}”
            </p>
            {e.plants.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1" aria-label="Plants of the day">
                {e.plants.map((p) => (
                  <li key={p.id} title={getSpecies(p.speciesId).name}>
                    <PlantArt
                      species={getSpecies(p.speciesId)}
                      growth={1}
                      wilted={p.wilted}
                      variant={p.variant}
                      size={44}
                      seed={0.4}
                    />
                  </li>
                ))}
              </ul>
            )}
            {e.notes.length > 0 && (
              <ul className="text-muted mt-1 text-xs">
                {e.notes.map((n, i) => (
                  <li key={i}>· {n}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      {shown < entries.length && (
        <Button variant="secondary" onClick={() => setShown((n) => n + PAGE)}>
          Show earlier days
        </Button>
      )}
    </div>
  );
}
