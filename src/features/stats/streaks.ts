/**
 * Streaks with freezes. A day counts when completed focus reaches the daily goal. Days are
 * finalised the day after; a missed day consumes a streak freeze if one is available, otherwise
 * the streak resets. One freeze is earned each time the streak reaches a multiple of 7.
 */
import type { DayKey, Session, StreakState } from '@/types';
import { addDays, dayKey } from '@/lib/dates';
import { minutesByDay } from './aggregate';

export const FREEZE_EVERY_DAYS = 7;
export const MAX_FREEZES = 3;

export interface StreakEvaluation {
  state: StreakState;
  freezes: number;
  /** Freezes earned during this evaluation. */
  earned: number;
  /** Day keys that were frozen during this evaluation. */
  frozen: DayKey[];
  /** Current streak including today if today's goal is already met. */
  display: number;
  todayMet: boolean;
  todayMinutes: number;
}

export function evaluateStreak(
  sessions: Session[],
  goalMinutes: number,
  state: StreakState,
  freezes: number,
  now: number | Date = Date.now(),
): StreakEvaluation {
  const perDay = minutesByDay(sessions);
  const today = dayKey(now);
  const yesterday = addDays(today, -1);
  const met = (d: DayKey) => (perDay.get(d) ?? 0) >= goalMinutes;

  let current = state.current;
  let best = state.best;
  let available = freezes;
  let earned = 0;
  const frozen: DayKey[] = [];
  const frozenDays = [...state.frozenDays];

  // Where to start: the day after the last finalised day, or the first day with any focus.
  let start: DayKey | null = state.lastEvaluated ? addDays(state.lastEvaluated, 1) : null;
  if (!start) {
    const days = [...perDay.keys()].sort();
    start = days[0] ?? null;
  }
  let lastEvaluated = state.lastEvaluated;
  if (start && start <= yesterday) {
    for (let d = start; d <= yesterday; d = addDays(d, 1)) {
      if (met(d)) {
        current++;
        if (current % FREEZE_EVERY_DAYS === 0 && available < MAX_FREEZES) {
          available++;
          earned++;
        }
      } else if (frozenDays.includes(d)) {
        // already frozen in an earlier evaluation
      } else if (current > 0 && available > 0) {
        available--;
        frozenDays.push(d);
        frozen.push(d);
      } else {
        current = 0;
      }
      best = Math.max(best, current);
      lastEvaluated = d;
    }
  }
  const todayMet = met(today);
  const display = todayMet ? current + 1 : current;
  best = Math.max(best, display);
  return {
    state: { current, best, frozenDays, lastEvaluated },
    freezes: available,
    earned,
    frozen,
    display,
    todayMet,
    todayMinutes: perDay.get(today) ?? 0,
  };
}
