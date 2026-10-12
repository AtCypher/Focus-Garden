import { NavLink, Outlet } from 'react-router-dom';
import { IconBook, IconChart, IconGarden, IconSettings, IconTimer } from './ui/icons';
import { LevelUpDialog } from '@/features/garden/LevelUpDialog';
import { Toast } from './ui/Toast';

const links = [
  { to: '/', label: 'Timer', Icon: IconTimer, end: true },
  { to: '/garden', label: 'Garden', Icon: IconGarden },
  { to: '/seeds', label: 'Seed Book', Icon: IconBook },
  { to: '/stats', label: 'Stats', Icon: IconChart },
  { to: '/settings', label: 'Settings', Icon: IconSettings },
];

export function AppLayout() {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-moss-700 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-moss-100 bg-white/95 backdrop-blur-sm dark:border-moss-800 dark:bg-moss-950/95 md:static md:w-56 md:shrink-0 md:border-t-0 md:border-r md:bg-transparent md:p-4 md:dark:bg-transparent"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="hidden items-center gap-2 px-2 pt-2 pb-6 md:flex">
          <img
            src={`${import.meta.env.BASE_URL}icons/icon.svg`}
            alt=""
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-display text-xl font-semibold text-moss-800 dark:text-moss-200">
            Grove
          </span>
        </div>
        <ul className="mx-auto flex max-w-lg justify-around md:flex-col md:gap-1">
          {links.map(({ to, label, Icon, end }) => (
            <li key={to} className="flex-1 md:flex-none">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `focus-ring flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
                    isActive
                      ? 'text-moss-700 dark:text-moss-300 md:bg-moss-100 md:dark:bg-moss-800'
                      : 'text-muted hover:text-moss-800 dark:hover:text-moss-100'
                  }`
                }
              >
                <Icon width={22} height={22} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main" className="flex-1 pb-24 md:pb-0" tabIndex={-1}>
        <Outlet />
      </main>
      <LevelUpDialog />
      <Toast />
    </div>
  );
}
