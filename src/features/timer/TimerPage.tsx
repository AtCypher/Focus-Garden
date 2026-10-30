import { useEffect, useState } from 'react';
import { useTimerStore, type PlantRequest } from './timerStore';
import { useAppStore } from '@/app/store/appStore';
import { SetupPanel } from './SetupPanel';
import { SessionView } from './SessionView';
import { BreakView } from './BreakView';
import { ResultView } from './ResultView';
import { DailyVisit } from '@/features/companion/DailyVisit';
import { RecapCard } from '@/features/stats/RecapCard';

export function TimerPage() {
  const engine = useTimerStore((s) => s.engine);
  const result = useTimerStore((s) => s.result);
  const breakState = useTimerStore((s) => s.breakState);
  const request = useTimerStore((s) => s.request);
  const plant = useTimerStore((s) => s.plant);
  const dismissResult = useTimerStore((s) => s.dismissResult);
  const lastSession = useAppStore((s) => s.sessions[s.sessions.length - 1]);
  const [suggested, setSuggested] = useState<number | undefined>(undefined);
  const [openedAt] = useState(() => Date.now());

  // ?plant=<preset id|preset name|minutes> starts a session straight away (Shortcuts, bookmarks).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const want = params.get('plant');
    if (!want) return;
    params.delete('plant');
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    const st = useTimerStore.getState();
    if (st.engine || st.breakState || st.result) return;
    const app = useAppStore.getState();
    const { settings, progress } = app;
    const preset = progress.presets.find(
      (p) => p.id === want || p.name.toLowerCase() === want.toLowerCase(),
    );
    const minutes = preset ? preset.minutes : Number(want);
    if (!preset && !(minutes >= 10 && minutes <= 180)) return;
    plant({
      mode: preset?.mode ?? 'countdown',
      minutes: Math.round(minutes / 5) * 5,
      strictness: preset?.strictness ?? settings.defaultStrictness,
      allowLeaving: preset?.allowLeaving ?? settings.allowLeaving,
      speciesId:
        preset && app.wallet.ownedSpeciesIds.includes(preset.speciesId)
          ? preset.speciesId
          : settings.defaultSpeciesId,
      tagId: preset?.tagId ?? settings.defaultTagId,
      pomodoro: settings.pomodoro,
      round: 1,
    });
  }, [plant]);

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

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-3 px-4 pt-4 sm:px-6">
        <DailyVisit />
        <RecapCard dismissible now={openedAt} />
      </div>
      <SetupPanel key={suggested ?? 'default'} onPlant={onPlant} suggestedMinutes={suggested} />
    </>
  );
}
