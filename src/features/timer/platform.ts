/**
 * Thin wrappers over browser APIs with feature detection. Everything here is safe to call in
 * environments that lack the API (tests, old browsers): it just does nothing.
 */

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export interface NotifyOptions {
  body?: string;
  tag?: string;
  /** Keep the notification until the user dismisses it. */
  sticky?: boolean;
}

/**
 * Show a notification. Prefers the service worker (required on Android), falls back to the
 * Notification constructor (desktop), and silently does nothing without permission.
 */
export async function notify(title: string, opts: NotifyOptions = {}): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const options: NotificationOptions = {
    body: opts.body,
    tag: opts.tag,
    icon: `${import.meta.env.BASE_URL}icons/pwa-192x192.png`,
    badge: `${import.meta.env.BASE_URL}icons/pwa-64x64.png`,
    requireInteraction: opts.sticky ?? false,
    silent: false,
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    new Notification(title, options);
  } catch {
    /* some browsers throw for the constructor; nothing else to do */
  }
}

export async function closeNotifications(tag: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const list = await reg?.getNotifications({ tag });
    list?.forEach((n) => n.close());
  } catch {
    /* ignore */
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

type WakeLockSentinelLike = {
  release(): Promise<void>;
  addEventListener?: (t: string, cb: () => void) => void;
};

export class WakeLock {
  private sentinel: WakeLockSentinelLike | null = null;
  private wanted = false;

  static supported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  async acquire(): Promise<void> {
    this.wanted = true;
    if (!WakeLock.supported() || this.sentinel) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    try {
      const wl = (
        navigator as Navigator & {
          wakeLock: { request(type: 'screen'): Promise<WakeLockSentinelLike> };
        }
      ).wakeLock;
      const s = await wl.request('screen');
      this.sentinel = s;
      s.addEventListener?.('release', () => {
        this.sentinel = null;
      });
    } catch {
      this.sentinel = null;
    }
  }

  /** Call on visibilitychange: the OS drops the lock when the page hides; take it back on return. */
  async reacquireIfWanted(): Promise<void> {
    if (this.wanted && !this.sentinel) await this.acquire();
  }

  async release(): Promise<void> {
    this.wanted = false;
    const s = this.sentinel;
    this.sentinel = null;
    try {
      await s?.release();
    } catch {
      /* ignore */
    }
  }
}
