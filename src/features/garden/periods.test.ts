import { describe, expect, it } from 'vitest';
import { inPeriod, periodStart } from './periods';

describe('periods', () => {
  const now = new Date(2026, 9, 14, 15, 0); // Wednesday 14 Oct 2026
  it('computes local period starts', () => {
    expect(periodStart('today', now)).toBe('2026-10-14');
    expect(periodStart('week', now)).toBe('2026-10-12');
    expect(periodStart('month', now)).toBe('2026-10-01');
    expect(periodStart('year', now)).toBe('2026-01-01');
    expect(periodStart('all', now)).toBeNull();
  });
  it('filters timestamps', () => {
    const yesterday = new Date(2026, 9, 13, 23, 59).toISOString();
    const earlier = new Date(2026, 9, 14, 0, 1).toISOString();
    expect(inPeriod(earlier, 'today', now)).toBe(true);
    expect(inPeriod(yesterday, 'today', now)).toBe(false);
    expect(inPeriod(yesterday, 'week', now)).toBe(true);
    expect(inPeriod(new Date(2025, 11, 31).toISOString(), 'year', now)).toBe(false);
    expect(inPeriod(new Date(2020, 0, 1).toISOString(), 'all', now)).toBe(true);
  });
});
