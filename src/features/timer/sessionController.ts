/**
 * Connects the timer store to the browser: a tick loop, Page Visibility / blur handling,
 * notifications during the grace period, wake lock and haptics.
 * Call `startSessionController()` once when the app mounts; it returns a cleanup function.
 */
import { useTimerStore } from './timerStore';
import { useAppStore } from '@/app/store/appStore';
import { closeNotifications, notify, vibrate, WakeLock } from './platform';
import { RULES } from './rules';
import { getSpecies } from '@/data/species';

const GRACE_TAG = 'grove-grace';
const DONE_TAG = 'grove-done';

export function startSessionController(): () => void {
  const timer = useTimerStore;
  const wakeLock = new WakeLock();
  let interval: ReturnType<typeof setInterval> | null = null;
  let graceTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastStatus: string | null = null;

  const settings = () => useAppStore.getState().settings;

  function ensureLoop() {
    const { engine, breakState } = timer.getState();
    const active = Boolean(engine) || Boolean(breakState);
    if (active && interval === null) {
      interval = setInterval(() => timer.getState().tick(), 250);
    } else if (!active && interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function onHide() {
    const now = Date.now();
    const st = timer.getState();
    st.markHidden(now);
    if (!st.engine || st.engine.status !== 'running') return;
    st.dispatch({ type: 'hide' });
    const after = timer.getState().engine;
    if (after?.status === 'away' && after.graceEndsAt !== null) {
      const seconds = Math.round(RULES.graceMs[after.config.strictness] / 1000);
      const species = getSpecies(after.config.speciesId);
      if (settings().notifications) {
        void notify(`Your ${species.name.toLowerCase()} is waiting`, {
          body: `Come back within ${seconds} seconds to keep it growing.`,
          tag: GRACE_TAG,
          sticky: true,
        });
      }
      // Hidden tabs throttle timers, but a single timeout a few ms past the grace usually fires.
      if (graceTimeout) clearTimeout(graceTimeout);
      graceTimeout = setTimeout(() => timer.getState().tick(), after.graceEndsAt - now + 50);
    }
  }

  function onShow() {
    const st = timer.getState();
    if (graceTimeout) {
      clearTimeout(graceTimeout);
      graceTimeout = null;
    }
    void closeNotifications(GRACE_TAG);
    if (st.engine) st.dispatch({ type: 'show' });
    else st.tick();
    if (settings().wakeLock) void wakeLock.reacquireIfWanted();
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') onHide();
    else onShow();
  }
  function onBlur() {
    // Blur without a visibility change happens on desktop when another window takes focus.
    if (document.visibilityState === 'visible') onHide();
  }
  function onFocus() {
    if (document.visibilityState === 'visible') onShow();
  }
  function onPageHide() {
    timer.getState().markHidden(Date.now());
  }

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  window.addEventListener('pagehide', onPageHide);

  const unsub = timer.subscribe((state, prev) => {
    ensureLoop();
    const status = state.engine?.status ?? (state.breakState ? 'break' : 'idle');
    if (status !== lastStatus) {
      lastStatus = status;
      if (status === 'running' || status === 'paused' || status === 'away') {
        if (settings().wakeLock) void wakeLock.acquire();
      } else {
        void wakeLock.release();
      }
    }
    if (state.result && state.result !== prev.result) {
      const r = state.result;
      void closeNotifications(GRACE_TAG);
      if (settings().haptics) vibrate(r.outcome === 'completed' ? [60, 40, 60] : [200]);
      if (document.visibilityState === 'hidden' && settings().notifications) {
        const species = getSpecies(r.config.speciesId).name.toLowerCase();
        if (r.outcome === 'completed') {
          void notify('Fully grown', {
            body: `Your ${species} is ready for the garden.`,
            tag: DONE_TAG,
          });
        } else if (r.outcome === 'wilted') {
          void notify('Your plant wilted', {
            body: 'No worries. A shorter session is one tap away.',
            tag: DONE_TAG,
          });
        }
      }
    }
  });

  timer.getState().restore(Date.now());
  ensureLoop();

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('pagehide', onPageHide);
    unsub();
    if (interval) clearInterval(interval);
    if (graceTimeout) clearTimeout(graceTimeout);
    void wakeLock.release();
  };
}
