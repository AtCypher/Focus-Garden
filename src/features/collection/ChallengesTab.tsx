import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { Button } from '@/app/ui/Button';
import { CHALLENGES, CHALLENGE_DAYS } from '@/data/challenges';
import { getSpecies } from '@/data/species';
import { PlantArt } from '@/art/PlantArt';
import { dayKey } from '@/lib/dates';
import { activeChallenge } from './rituals';

/** Opt-in 7-day challenges, one at a time, each with a species reward. */
export function ChallengesTab() {
  const progress = useAppStore((s) => s.progress);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const showToast = useUiStore((s) => s.showToast);
  const active = activeChallenge(progress);

  const start = (id: string) => {
    updateProgress((p) => ({
      challenges: [
        ...p.challenges,
        { id, startedDay: dayKey(Date.now()), completedAt: null, metDays: [], failedAt: null },
      ],
    }));
    showToast('Challenge started. Day 1 is today.');
  };
  const giveUp = () => {
    if (!active) return;
    updateProgress((p) => ({
      challenges: p.challenges.map((c) =>
        c === active ? { ...c, failedAt: new Date().toISOString() } : c,
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-sm">
        Seven days in a row, one rule. Finish one and its species is yours for good. One challenge
        at a time; a missed day ends it, and you can start again any time.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {CHALLENGES.map((c) => {
          const reward = getSpecies(c.rewardSpeciesId);
          const mine = progress.challenges.filter((x) => x.id === c.id);
          const won = mine.some((x) => x.completedAt);
          const running = active?.id === c.id ? active : null;
          const attempts = mine.filter((x) => x.failedAt).length;
          return (
            <li key={c.id} className={`card flex gap-3 p-3 ${running ? 'border-moss-500' : ''}`}>
              <PlantArt
                species={reward}
                growth={1}
                size={72}
                seed={0.4}
                title={reward.name}
                className={won || running ? '' : 'grayscale opacity-70'}
              />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="text-muted text-xs">{c.rule}</p>
                <p className="text-muted mt-1 text-xs">Reward: {reward.name}</p>
                {running && (
                  <div className="mt-2">
                    <div
                      className="flex gap-1"
                      aria-label={`${running.metDays.length} of ${CHALLENGE_DAYS} days done`}
                    >
                      {Array.from({ length: CHALLENGE_DAYS }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 w-2.5 rounded-full ${i < running.metDays.length ? 'bg-moss-600 dark:bg-moss-400' : 'bg-moss-100 dark:bg-moss-800'}`}
                        />
                      ))}
                    </div>
                    <p className="text-muted mt-1 text-xs">
                      Day {Math.min(CHALLENGE_DAYS, running.metDays.length + 1)} of {CHALLENGE_DAYS}
                      . Started {running.startedDay}.
                    </p>
                    <Button size="sm" variant="ghost" className="mt-1" onClick={giveUp}>
                      Stop this challenge
                    </Button>
                  </div>
                )}
                {!running && won && (
                  <p className="mt-2 text-xs font-medium text-moss-700 dark:text-moss-300">
                    Completed. Species unlocked.
                  </p>
                )}
                {!running && !won && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => start(c.id)}
                    disabled={active !== null}
                  >
                    {active
                      ? 'Finish the running challenge first'
                      : attempts > 0
                        ? `Try again (attempt ${attempts + 1})`
                        : 'Start'}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
