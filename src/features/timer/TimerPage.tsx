import { useState } from 'react';
import { useTimerStore, type PlantRequest } from './timerStore';
import { useAppStore } from '@/app/store/appStore';
import { SetupPanel } from './SetupPanel';
import { SessionView } from './SessionView';
import { BreakView } from './BreakView';
import { ResultView } from './ResultView';

export function TimerPage() {
  const engine = useTimerStore((s) => s.engine);
  const result = useTimerStore((s) => s.result);
  const breakState = useTimerStore((s) => s.breakState);
  const request = useTimerStore((s) => s.request);
  const plant = useTimerStore((s) => s.plant);
  const dismissResult = useTimerStore((s) => s.dismissResult);
  const lastSession = useAppStore((s) => s.sessions[s.sessions.length - 1]);
  const [suggested, setSuggested] = useState<number | undefined>(undefined);

  if (engine) return <SessionView engine={engine} />;

  if (result) {
    const dew =
      lastSession && new Date(lastSession.endedAt).getTime() === result.finishedAt
        ? lastSession.dewEarned
        : null;
    return (
      <ResultView
        result={result}
        dewEarned={dew}
        onDone={() => {
          dismissResult();
          setSuggested(undefined);
        }}
        onRetryShorter={(minutes) => {
          dismissResult();
          setSuggested(minutes);
        }}
      />
    );
  }

  if (breakState && request) {
    return (
      <BreakView
        breakState={breakState}
        onNextRound={() => plant({ ...request, round: breakState.afterRound + 1 })}
      />
    );
  }

  const onPlant = (req: PlantRequest) => {
    setSuggested(undefined);
    plant(req);
  };

  return <SetupPanel key={suggested ?? 'default'} onPlant={onPlant} suggestedMinutes={suggested} />;
}
