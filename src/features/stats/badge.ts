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
    if (show) void nav.setAppBadge?.(1);
    else void nav.clearAppBadge?.();
  } catch {
    /* unsupported */
  }
}
