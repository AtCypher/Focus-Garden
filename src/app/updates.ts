/**
 * Service worker registration and self-updating.
 *
 * Workbox serves the cached app shell on every launch, so without this a new deploy only shows up
 * on the *second* open. Here the new worker is applied as soon as it is ready, and the page reloads,
 * unless a focus session is running: then the reload waits until the session ends. A running
 * session survives a reload anyway (its snapshot is in localStorage), but reloading mid-session
 * would be unsettling.
 */
import { registerSW } from 'virtual:pwa-register';
import { useTimerStore } from '@/features/timer/timerStore';
import { useUiStore } from '@/app/store/uiStore';

type Apply = (reload?: boolean) => Promise<void>;
let pending: Apply | null = null;
let registration: ServiceWorkerRegistration | undefined;

function sessionActive(): boolean {
  const t = useTimerStore.getState();
  return Boolean(t.engine) || Boolean(t.breakState) || Boolean(t.result);
}

function tryApply(): void {
  if (!pending || sessionActive()) return;
  const apply = pending;
  pending = null;
  useUiStore.getState().showToast('Updating Grove…');
  setTimeout(() => void apply(true), 400);
}

export function startUpdates(): () => void {
  if (!('serviceWorker' in navigator)) return () => {};
  const update = registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registration = reg;
      // Installed apps can stay suspended for days: check again whenever they come back.
      document.addEventListener('visibilitychange', onVisible);
      setInterval(() => void reg?.update(), 60 * 60 * 1000);
    },
    onNeedRefresh() {
      pending = update;
      tryApply();
    },
  });
  const unsub = useTimerStore.subscribe(() => tryApply());
  return () => {
    unsub();
    document.removeEventListener('visibilitychange', onVisible);
  };
}

function onVisible() {
  if (document.visibilityState === 'visible') void registration?.update();
}

/** Manual check from Settings. Resolves to true when an update was found and applied. */
export async function checkForUpdates(): Promise<'updated' | 'latest' | 'unsupported'> {
  if (!registration) return 'unsupported';
  await registration.update();
  // Give the worker a moment to install; onNeedRefresh fires and tryApply reloads if possible.
  await new Promise((r) => setTimeout(r, 1500));
  return pending ? 'updated' : 'latest';
}
