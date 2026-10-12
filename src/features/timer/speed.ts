/**
 * Dev-only time compression: 1 logical minute = 1 real second.
 * Only honoured when the build sets VITE_ALLOW_SPEED_FLAG=true (development and e2e modes).
 * Toggle with ?speed=fast / ?speed=normal; the choice is remembered in localStorage.
 */
const KEY = 'grove.speed';

export function speedFlagAllowed(): boolean {
  return import.meta.env.VITE_ALLOW_SPEED_FLAG === 'true';
}

export function resolveMinuteMs(): number {
  if (!speedFlagAllowed() || typeof window === 'undefined') return 60_000;
  try {
    const q = new URLSearchParams(window.location.search).get('speed');
    if (q === 'fast') window.localStorage.setItem(KEY, 'fast');
    if (q === 'normal') window.localStorage.removeItem(KEY);
    return window.localStorage.getItem(KEY) === 'fast' ? 1_000 : 60_000;
  } catch {
    return 60_000;
  }
}
