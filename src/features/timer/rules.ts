import type { Strictness } from '@/types';

/**
 * Tunable constants for sessions. Durations are in milliseconds unless the name says otherwise.
 * "Minutes" here are logical minutes: the engine multiplies them by `minuteMs` from the config, so a
 * dev speed flag can compress time without touching these rules.
 */
export const RULES = {
  /** First N ms of a session can be cancelled with no penalty. Real time, never compressed. */
  cancelWindowMs: 10_000,
  /** Grace period after leaving before the plant wilts. Real time. Gentle never wilts. */
  graceMs: {
    gentle: Number.POSITIVE_INFINITY,
    standard: 15_000,
    deep: 5_000,
  } satisfies Record<Strictness, number>,
  /** Gentle mode pause limits. */
  maxPauses: 3,
  maxPauseMinutes: 5,
  /** Countdown range and step. */
  countdownMinMinutes: 10,
  countdownMaxMinutes: 180,
  countdownStepMinutes: 5,
  /** Stopwatch: below the minimum the session counts as cancelled, at the cap it auto-completes. */
  stopwatchMinMinutes: 10,
  stopwatchMaxMinutes: 180,
  /** Plant variants by completed length. */
  matureMinutes: 60,
  ancientMinutes: 120,
  /** Dew. */
  dewPerMinute: 1,
  dewMultiplier: { gentle: 1, standard: 1.1, deep: 1.25 } satisfies Record<Strictness, number>,
  firstSessionOfDayBonus: 5,
} as const;

export const STRICTNESS_LABELS: Record<Strictness, { name: string; summary: string }> = {
  gentle: {
    name: 'Gentle',
    summary: 'Pause up to 3 times (5 min each). Leaving only shows a reminder. Plants never die.',
  },
  standard: {
    name: 'Standard',
    summary: 'No pausing. Leaving gives you 15 seconds to come back before the plant wilts.',
  },
  deep: {
    name: 'Deep focus',
    summary: 'No pausing, 5-second grace, and giving up needs a long press.',
  },
};
