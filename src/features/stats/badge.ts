/**
 * App icon badge for a streak at risk: shown in the evening when today's goal is not yet met and a
 * streak is running. Installed PWAs on iOS 16.4+ and Android support `setAppBadge`.
 */
export interface BadgeInput {
  enabled: boolean;
  hour: number;
  todayMet: boolean;
  streak: number;
}

export const BADGE_FROM_HOUR = 18;

export function shouldShowBadge({ enabled, hour, todayMet, streak }: BadgeInput): boolean {
  return enabled && hour >= BADGE_FROM_HOUR && !todayMet && streak > 0;
}

export function applyAppBadge(show: boolean): void {
  const nav = navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  try {
    const p = show ? nav.setAppBadge?.(1) : nav.clearAppBadge?.();
    p?.catch(() => {});
  } catch {
    /* unsupported */
  }
}
