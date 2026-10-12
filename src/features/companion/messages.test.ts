import { describe, expect, it } from 'vitest';
import { MESSAGES, messageCount, pickMessage } from './messages';

describe('companion messages', () => {
  it('has a bank of at least 20 lines', () => {
    expect(messageCount()).toBeGreaterThanOrEqual(20);
  });
  it('never shames the user', () => {
    const banned = /lazy|fail|shame|pathetic|disappoint|weak|wasted/i;
    for (const lines of Object.values(MESSAGES))
      for (const l of lines) expect(l).not.toMatch(banned);
  });
  it('fills placeholders deterministically', () => {
    expect(pickMessage('completion', 3, { minutes: 25 })).toBe('Done! 25 minutes, all yours.');
    expect(pickMessage('streak', 0, { days: 7 })).toBe('7 days in a row. The garden notices.');
    expect(pickMessage('start', 8)).toBe(pickMessage('start', 8));
  });
});
