import { describe, expect, it } from 'vitest';
import { addDays, dayKey, daysBetween, formatDuration, formatMinutes, weekStart } from './dates';

describe('dates', () => {
  it('builds local day keys', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(daysBetween('2026-01-30', '2026-02-02')).toBe(3);
  });
  it('finds Monday as week start', () => {
    expect(weekStart('2026-10-12')).toBe('2026-10-12'); // a Monday
    expect(weekStart('2026-10-18')).toBe('2026-10-12'); // the Sunday after
  });
  it('formats durations', () => {
    expect(formatDuration(25 * 60_000)).toBe('25:00');
    expect(formatDuration(3_599_000)).toBe('59:59');
    expect(formatDuration(3_600_000)).toBe('1:00:00');
    expect(formatMinutes(85)).toBe('1h 25m');
    expect(formatMinutes(45)).toBe('45m');
  });
});
