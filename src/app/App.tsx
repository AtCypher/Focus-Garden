import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useTheme } from './useTheme';
import { startSessionController } from '@/features/timer/sessionController';
import { onSessionFinished } from '@/features/timer/timerStore';
import { buildRecords } from '@/features/timer/recordSession';
import { useAppStore } from './store/appStore';

function useBoot() {
  useTheme();
  useEffect(() => {
    const stopController = startSessionController();
    const offFinish = onSessionFinished((state) => {
      const app = useAppStore.getState();
      const { session, plant } = buildRecords({
        state,
        existingSessions: app.sessions,
        chooseTile: () => null,
      });
      app.recordSession(session, plant);
    });
    return () => {
      offFinish();
      stopController();
    };
  }, []);
}

export function App() {
  useBoot();
  return <RouterProvider router={router} />;
}
