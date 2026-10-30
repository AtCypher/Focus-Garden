import type { Session } from '@/types';

/** Themed 7-day challenges. `metDay` judges one local day's sessions. */
export interface Challenge {
  id: string;
  name: string;
  blurb: string;
  rule: string;
  rewardSpeciesId: string;
  metDay: (sessions: Session[], goalMinutes: number) => boolean;
}

const done = (s: Session) => s.outcome === 'completed';

export const CHALLENGE_DAYS = 7;

export const CHALLENGES: Challenge[] = [
  {
    id: 'early-bird',
    name: 'Early Bird Week',
    blurb: 'Seven mornings in a row.',
    rule: 'Complete a session that starts before 9:00, every day for 7 days.',
    rewardSpeciesId: 'dawnrose',
    metDay: (sessions) => sessions.some((s) => done(s) && new Date(s.startedAt).getHours() < 9),
  },
  {
    id: 'no-pause',
    name: 'No-Pause Week',
    blurb: 'Standard or Deep focus only.',
    rule: 'Complete a Standard or Deep focus session every day for 7 days.',
    rewardSpeciesId: 'ironwood',
    metDay: (sessions) => sessions.some((s) => done(s) && s.strictness !== 'gentle'),
  },
  {
    id: 'deep-week',
    name: 'Deep Focus Week',
    blurb: 'The strictest mode, daily.',
    rule: 'Complete a Deep focus session every day for 7 days.',
    rewardSpeciesId: 'moonflower',
    metDay: (sessions) => sessions.some((s) => done(s) && s.strictness === 'deep'),
  },
  {
    id: 'steady',
    name: 'Steady Week',
    blurb: 'Hit your daily goal seven times.',
    rule: 'Reach your daily goal every day for 7 days.',
    rewardSpeciesId: 'holly',
    metDay: (sessions, goal) =>
      sessions.filter(done).reduce((n, s) => n + s.actualMinutes, 0) >= goal,
  },
];

export const CHALLENGE_BY_ID: Record<string, Challenge> = Object.fromEntries(
  CHALLENGES.map((c) => [c.id, c]),
);
