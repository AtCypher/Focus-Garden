import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { TimerPage } from '@/features/timer/TimerPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { GardenPage } from '@/features/garden/GardenPage';
import { PlaceholderPage } from './PlaceholderPage';
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
        { path: 'seeds', element: <PlaceholderPage title="Seed Book" /> },
        { path: 'stats', element: <PlaceholderPage title="Stats" /> },
        { path: 'settings', element: <SettingsPage /> },
        ...(speedFlagAllowed() ? [{ path: 'gallery', element: <Gallery /> }] : []),
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
