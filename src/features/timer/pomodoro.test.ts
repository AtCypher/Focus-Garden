import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POMODORO,
  breakAfterRound,
  breakRemainingMs,
  isBreakOver,
  startBreak,
} from './pomodoro';

describe('pomodoro sequencing', () => {
  it('gives a long break every 4th round by default', () => {
    expect(breakAfterRound(DEFAULT_POMODORO, 1)).toBe('shortBreak');
    expect(breakAfterRound(DEFAULT_POMODORO, 3)).toBe('shortBreak');
    expect(breakAfterRound(DEFAULT_POMODORO, 4)).toBe('longBreak');
    expect(breakAfterRound(DEFAULT_POMODORO, 8)).toBe('longBreak');
  });

  it('respects a custom rounds setting', () => {
    const cfg = { ...DEFAULT_POMODORO, roundsBeforeLongBreak: 2 };
    expect(breakAfterRound(cfg, 2)).toBe('longBreak');
  });

  it('times breaks with wall-clock timestamps', () => {
    const now = 1_000_000;
    const b = startBreak(DEFAULT_POMODORO, 1, now, 60_000);
    expect(b.phase).toBe('shortBreak');
    expect(breakRemainingMs(b, now + 2 * 60_000)).toBe(3 * 60_000);
    expect(isBreakOver(b, now + 5 * 60_000)).toBe(true);
    expect(breakRemainingMs(b, now + 99 * 60_000)).toBe(0);
  });
});
