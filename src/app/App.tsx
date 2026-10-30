import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useTheme } from './useTheme';
import { startSessionController } from '@/features/timer/sessionController';
import { onSessionFinished } from '@/features/timer/timerStore';
import { buildRecords } from '@/features/timer/recordSession';
import { setPersistence, useAppStore } from './store/appStore';
import { idbPersistence, loadAll } from '@/storage';
import { chooseTileForNewPlant, totalFocusMinutes } from '@/features/garden/layout';
import { getGardenLevel } from '@/data/gardenLevels';
import { useUiStore } from './store/uiStore';
import { grantEarnedSpecies } from '@/features/collection/grant';
import { countEventSession, rollFind } from '@/features/collection/rituals';
import { DECORATION_INFO } from '@/data/decorations';
import { updateProgress } from '@/features/stats/progress';
import { startUpdates } from './updates';

function useBoot() {
  useTheme();
  useEffect(() => {
    setPersistence(idbPersistence);
    loadAll()
      .then((data) => {
        useAppStore.getState().hydrate(data);
        updateProgress(new Date(), false);
      })
      .catch((err) => {
        console.error('[grove] could not load data', err);
        useAppStore.getState().hydrate({});
      });
    const stopController = startSessionController();
    const stopUpdates = startUpdates();
    const offFinish = onSessionFinished((state) => {
      const app = useAppStore.getState();
      const before = getGardenLevel(totalFocusMinutes(app.sessions)).level;
      const { session, plant } = buildRecords({
        state,
        existingSessions: app.sessions,
        chooseTile: (biome) => chooseTileForNewPlant(before, biome, app.plants, app.decorations),
      });
      app.recordSession(session, plant);
      const ui = useUiStore.getState();
      ui.setLastFind(null);
      if (session.outcome === 'completed') {
        const store = useAppStore.getState();
        const find = rollFind(
          session.id,
          store.progress.finds.map((f) => f.id),
        );
        if (find) {
          store.updateProgress((p) => ({
            finds: [...p.finds, { id: find, foundAt: session.endedAt }],
          }));
          ui.setLastFind(find);
        }
        const ev = countEventSession(useAppStore.getState().progress, new Date(session.endedAt));
        if (ev) {
          useAppStore.getState().updateProgress(ev.patch);
          if (ev.reward) {
            useAppStore.getState().buyDecoration(ev.reward.reward, 0);
            ui.showToast(
              `${ev.reward.name}: you earned a ${DECORATION_INFO[ev.reward.reward].name.toLowerCase()}. Place it in the garden.`,
            );
          }
        }
      }
      const after = getGardenLevel(totalFocusMinutes(useAppStore.getState().sessions)).level;
      if (after > before) useUiStore.getState().setLevelUp({ from: before, to: after });
      updateProgress();
      grantEarnedSpecies();
    });
    return () => {
      offFinish();
      stopController();
      stopUpdates();
    };
  }, []);
}

export function App() {
  useBoot();
  const hydrated = useAppStore((s) => s.hydrated);
  if (!hydrated) {
    return (
      <div className="flex min-h-full items-center justify-center" aria-busy="true">
        <p className="text-muted text-sm">Loading your garden…</p>
      </div>
    );
  }
  return <RouterProvider router={router} />;
}
