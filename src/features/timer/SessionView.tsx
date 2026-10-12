import { useEffect, useMemo, useRef, useState } from 'react';
import type { EngineState } from './engine';
import {
  canPause,
  growthStage,
  isInCancelWindow,
  pausesLeft,
  progress,
  remainingMs,
  elapsedMs,
} from './engine';
import { useTimerStore } from './timerStore';
import { Button } from '@/app/ui/Button';
import { HoldButton } from './HoldButton';
import { GrowingPlant } from './GrowingPlant';
import { CompanionPanel } from '@/features/companion/CompanionPanel';
import { getSpecies } from '@/data/species';
import { formatDuration } from '@/lib/dates';
import { STRICTNESS_LABELS } from './rules';
import { IconPause, IconPlay } from '@/app/ui/icons';
import { SoundPicker } from './SoundPicker';

interface Props {
  engine: EngineState;
}

export function SessionView({ engine }: Props) {
  const now = useTimerStore((s) => s.now);
  const dispatch = useTimerStore((s) => s.dispatch);
  const species = useMemo(() => getSpecies(engine.config.speciesId), [engine.config.speciesId]);

  const remaining = remainingMs(engine, now);
  const elapsed = elapsedMs(engine, now);
  const p = progress(engine, now);
  const stage = growthStage(p);
  const inCancel = isInCancelWindow(engine, now);
  const cancelLeft = Math.max(0, Math.ceil((engine.startedAt + 10_000 - now) / 1000));
  const isStopwatch = engine.config.mode === 'stopwatch';
  const timeText = isStopwatch ? formatDuration(elapsed) : formatDuration(remaining ?? 0);

  // aria-live announcement: once a minute (and on state changes), not every second.
  const [announce, setAnnounce] = useState('');
  const lastMinute = useRef(-1);
  useEffect(() => {
    const minute = Math.floor((isStopwatch ? elapsed : (remaining ?? 0)) / engine.config.minuteMs);
    if (minute !== lastMinute.current) {
      lastMinute.current = minute;
      setAnnounce(
        isStopwatch
          ? `${minute} minutes focused`
          : `${minute} minute${minute === 1 ? '' : 's'} remaining`,
      );
    }
  }, [elapsed, remaining, isStopwatch, engine.config.minuteMs]);

  const statusLine = (() => {
    if (engine.status === 'paused')
      return `Paused. ${pausesLeft(engine)} pause${pausesLeft(engine) === 1 ? '' : 's'} left after this.`;
    if (engine.status === 'away') return 'Come back! Your plant is waiting.';
    if (inCancel) return `Cancel for free for ${cancelLeft}s`;
    const label = STRICTNESS_LABELS[engine.config.strictness].name;
    if (engine.config.mode === 'pomodoro') return `Round ${engine.config.round} · ${label}`;
    return label;
  })();

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col items-center justify-between gap-6 p-6 md:min-h-dvh">
      <header className="text-center">
        <p className="text-muted text-sm">{species.name}</p>
        <p className="text-muted mt-0.5 text-xs" aria-live="polite">
          {statusLine}
        </p>
        <SoundPicker className="mt-2" />
      </header>

      <div className="flex flex-col items-center">
        <GrowingPlant species={species} growth={p} stage={stage} size={240} />
        <output
          className={`font-display mt-2 text-6xl font-semibold tabular-nums ${engine.status === 'paused' ? 'opacity-60' : ''}`}
          aria-hidden
        >
          {timeText}
        </output>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
        {!isStopwatch && (
          <div
            className="mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-moss-600 transition-[width] duration-500 dark:bg-moss-400"
              style={{ width: `${p * 100}%` }}
            />
          </div>
        )}
      </div>

      <CompanionPanel engine={engine} now={now} />

      <div className="flex w-full flex-col items-center gap-3">
        {inCancel ? (
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => dispatch({ type: 'cancel' })}
          >
            Cancel ({cancelLeft}s, no penalty)
          </Button>
        ) : (
          <div className="flex w-full items-center justify-center gap-3">
            {engine.config.strictness === 'gentle' &&
              engine.status !== 'away' &&
              (engine.status === 'paused' ? (
                <Button size="lg" onClick={() => dispatch({ type: 'resume' })} className="flex-1">
                  <IconPlay /> Resume
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => dispatch({ type: 'pause' })}
                  disabled={!canPause(engine)}
                  className="flex-1"
                >
                  <IconPause /> Pause{pausesLeft(engine) < 3 ? ` (${pausesLeft(engine)} left)` : ''}
                </Button>
              ))}
            {isStopwatch && (
              <Button size="lg" onClick={() => dispatch({ type: 'stop' })} className="flex-1">
                {p >= 1 ? 'Finish' : 'Stop'}
              </Button>
            )}
            {engine.config.strictness === 'deep' ? (
              <HoldButton
                variant="ghost"
                size="lg"
                onConfirm={() => dispatch({ type: 'giveUp' })}
                className="flex-1"
              >
                Hold to give up
              </HoldButton>
            ) : (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => dispatch({ type: 'giveUp' })}
                className="flex-1"
              >
                Give up
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
