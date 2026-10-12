/* eslint-disable react-refresh/only-export-components -- route table, not a component module */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { TimerPage } from '@/features/timer/TimerPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { GardenPage } from '@/features/garden/GardenPage';
import { SeedBookPage } from '@/features/collection/SeedBookPage';

const StatsPage = lazy(() =>
  import('@/features/stats/StatsPage').then((m) => ({ default: m.StatsPage })),
);

function Loading() {
  return (
    <p className="text-muted p-6 text-sm" aria-busy="true">
      Loading…
    </p>
  );
}
import { Gallery } from '@/art/Gallery';
import { speedFlagAllowed } from '@/features/timer/speed';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <TimerPage /> },
        { path: 'garden', element: <GardenPage /> },
        { path: 'seeds', element: <SeedBookPage /> },
        {
          path: 'stats',
          element: (
            <Suspense fallback={<Loading />}>
              <StatsPage />
            </Suspense>
          ),
        },
        { path: 'settings', element: <SettingsPage /> },
        ...(speedFlagAllowed() ? [{ path: 'gallery', element: <Gallery /> }] : []),
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
