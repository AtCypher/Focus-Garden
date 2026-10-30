import type { DecorationKind } from '@/types';

/** Seasonal events: a week each, a free decoration for finishing a few sessions during it. */
export interface SeasonEvent {
  id: string;
  name: string;
  blurb: string;
  /** Inclusive window, month 1-12. */
  start: { month: number; day: number };
  end: { month: number; day: number };
  reward: DecorationKind;
  sessionsNeeded: number;
}

export const EVENTS: SeasonEvent[] = [
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    blurb: 'The garden wakes up. Finish 3 sessions this week to raise a maypole.',
    start: { month: 3, day: 20 },
    end: { month: 3, day: 26 },
    reward: 'maypole',
    sessionsNeeded: 3,
  },
  {
    id: 'midsummer',
    name: 'Midsummer',
    blurb: 'The longest days. Finish 3 sessions this week to light a bonfire.',
    start: { month: 6, day: 20 },
    end: { month: 6, day: 26 },
    reward: 'bonfire',
    sessionsNeeded: 3,
  },
  {
    id: 'harvest-week',
    name: 'Harvest Week',
    blurb: 'Bring it in. Finish 3 sessions this week to grow a harvest pumpkin.',
    start: { month: 10, day: 1 },
    end: { month: 10, day: 7 },
    reward: 'pumpkin',
    sessionsNeeded: 3,
  },
  {
    id: 'winter-lights',
    name: 'Winter Lights',
    blurb: 'Short days, warm lights. Finish 3 sessions this week to build a snow friend.',
    start: { month: 12, day: 18 },
    end: { month: 12, day: 24 },
    reward: 'snowman',
    sessionsNeeded: 3,
  },
];

export function activeEvent(date: Date): SeasonEvent | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const n = m * 100 + d;
  return (
    EVENTS.find(
      (e) => n >= e.start.month * 100 + e.start.day && n <= e.end.month * 100 + e.end.day,
    ) ?? null
  );
}

export function eventKey(event: SeasonEvent, date: Date): string {
  return `${event.id}:${date.getFullYear()}`;
}
