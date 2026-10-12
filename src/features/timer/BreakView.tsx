import { useTimerStore } from './timerStore';
import { breakRemainingMs, isBreakOver, type BreakState } from './pomodoro';
import { Button } from '@/app/ui/Button';
import { formatDuration } from '@/lib/dates';

interface Props {
  breakState: BreakState;
  onNextRound: () => void;
}

export function BreakView({ breakState, onNextRound }: Props) {
  const now = useTimerStore((s) => s.now);
  const skipBreak = useTimerStore((s) => s.skipBreak);
  const endBreak = useTimerStore((s) => s.endBreak);
  const over = isBreakOver(breakState, now);
  const label = breakState.phase === 'longBreak' ? 'Long break' : 'Short break';

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col items-center justify-center gap-6 p-6 text-center md:min-h-dvh">
      <p className="text-muted text-sm">Round {breakState.afterRound} done</p>
      <h1 className="font-display text-3xl font-semibold">{over ? 'Break over' : label}</h1>
      <output className="font-display text-6xl font-semibold tabular-nums" aria-live="off">
        {formatDuration(breakRemainingMs(breakState, now))}
      </output>
      <p className="text-muted max-w-xs text-sm">
        {over
          ? 'Ready when you are.'
          : 'Stretch, drink some water, look out of a window. Leaving the app is fine during breaks.'}
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button size="lg" onClick={onNextRound}>
          Start round {breakState.afterRound + 1}
        </Button>
        {!over && (
          <Button variant="ghost" onClick={skipBreak}>
            Skip break
          </Button>
        )}
        <Button variant="ghost" onClick={endBreak}>
          End Pomodoro set
        </Button>
      </div>
    </div>
  );
}
