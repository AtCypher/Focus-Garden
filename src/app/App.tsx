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

function useBoot() {
  useTheme();
  useEffect(() => {
    setPersistence(idbPersistence);
    loadAll()
      .then((data) => useAppStore.getState().hydrate(data))
      .catch((err) => {
        console.error('[grove] could not load data', err);
        useAppStore.getState().hydrate({});
      });
    const stopController = startSessionController();
    const offFinish = onSessionFinished((state) => {
      const app = useAppStore.getState();
      const before = getGardenLevel(totalFocusMinutes(app.sessions)).level;
      const { session, plant } = buildRecords({
        state,
        existingSessions: app.sessions,
        chooseTile: (biome) => chooseTileForNewPlant(before, biome, app.plants, app.decorations),
      });
      app.recordSession(session, plant);
      const after = getGardenLevel(totalFocusMinutes(useAppStore.getState().sessions)).level;
      if (after > before) useUiStore.getState().setLevelUp({ from: before, to: after });
      grantEarnedSpecies();
    });
    return () => {
      offFinish();
      stopController();
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
