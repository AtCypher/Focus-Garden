/** Day/night and season tints derived from the local clock. Pure and testable. */
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function timeOfDay(d: Date): TimeOfDay {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5.5 && h < 7.5) return 'dawn';
  if (h >= 7.5 && h < 18) return 'day';
  if (h >= 18 && h < 20.5) return 'dusk';
  return 'night';
}

export function season(d: Date): Season {
  const m = d.getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

export interface Tint {
  /** Overlay colour and opacity drawn over the whole scene. */
  color: string;
  opacity: number;
  /** Sky gradient stops. */
  skyTop: string;
  skyBottom: string;
}

export const TIME_TINTS: Record<TimeOfDay, Tint> = {
  dawn: { color: '#f7b267', opacity: 0.12, skyTop: '#9fc4e8', skyBottom: '#ffd9a8' },
  day: { color: '#ffffff', opacity: 0, skyTop: '#bfe0f7', skyBottom: '#e8f4fb' },
  dusk: { color: '#d97b4f', opacity: 0.16, skyTop: '#6f6aa8', skyBottom: '#f3a06b' },
  night: { color: '#1b2a4a', opacity: 0.42, skyTop: '#0f1a33', skyBottom: '#2a3b63' },
};

export const SEASON_TINTS: Record<Season, { color: string; opacity: number }> = {
  spring: { color: '#d6f5c6', opacity: 0.06 },
  summer: { color: '#fff3b0', opacity: 0.05 },
  autumn: { color: '#e5a05a', opacity: 0.12 },
  winter: { color: '#dfe8f2', opacity: 0.22 },
};
