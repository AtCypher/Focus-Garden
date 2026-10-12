import type { PomodoroConfig } from '@/types';

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export const DEFAULT_POMODORO: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  roundsBeforeLongBreak: 4,
};

/** Which break follows the focus block with this 1-based round number. */
export type BreakPhase = Exclude<PomodoroPhase, 'focus'>;

export function breakAfterRound(config: PomodoroConfig, round: number): BreakPhase {
  return round % config.roundsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
}

export function phaseMinutes(config: PomodoroConfig, phase: PomodoroPhase): number {
  switch (phase) {
    case 'focus':
      return config.focusMinutes;
    case 'shortBreak':
      return config.shortBreakMinutes;
    case 'longBreak':
      return config.longBreakMinutes;
  }
}

export interface BreakState {
  phase: BreakPhase;
  startedAt: number;
  endsAt: number;
  /** Round that was just completed. */
  afterRound: number;
}

export function startBreak(
  config: PomodoroConfig,
  afterRound: number,
  now: number,
  minuteMs: number,
): BreakState {
  const phase = breakAfterRound(config, afterRound);
  return {
    phase,
    startedAt: now,
    endsAt: now + phaseMinutes(config, phase) * minuteMs,
    afterRound,
  };
}

export function breakRemainingMs(b: BreakState, now: number): number {
  return Math.max(0, b.endsAt - now);
}

export function isBreakOver(b: BreakState, now: number): boolean {
  return now >= b.endsAt;
}
