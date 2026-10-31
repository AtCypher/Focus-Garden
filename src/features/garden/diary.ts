/** The garden diary: one entry per day with a line from Pip, derived from that day's sessions. */
import type { DayKey, Plant, Session } from '@/types';
import { dayKey } from '@/lib/dates';
import { getSpecies } from '@/data/species';

export interface DiaryEntry {
  day: DayKey;
  minutes: number;
  completed: number;
  wilted: number;
  plants: Plant[];
  notes: string[];
  /** Species grown for the very first time on this day. */
  firstTimes: string[];
  line: string;
}

const LINES = {
  quiet: ['A quiet day. The garden did not mind.', 'Nothing planted today. Even gardens rest.'],
  first: [
    'A new face in the garden: {species}. I will remember this one.',
    'First {species} ever. It looks pleased with itself.',
  ],
  big: [
    '{minutes} minutes today. The whole bed is leaning towards you.',
    'A long day of focus. I had to refill the watering can twice.',
  ],
  goal: [
    'Goal reached. The {plant} is standing a little taller.',
    'That is the daily goal done. I hummed the whole time.',
  ],
  wilt: [
    'One wilted, {completed} grew. That is still a garden.',
    'A wilt and a comeback on the same day. Gardeners know this rhythm.',
  ],
  wiltOnly: [
    'Only a wilt today. Tomorrow has fresh soil.',
    'It wilted. I kept the spot ready for next time.',
  ],
  normal: [
    '{completed} plant{s} today. Steady as rain.',
    'A {plant} joined the garden. Good company.',
    'Short and sweet. The {plant} will not complain.',
  ],
};

function pick(bank: string[], seed: number): string {
  return bank[Math.abs(seed) % bank.length];
}

export function diaryLine(
  entry: Omit<DiaryEntry, 'line'>,
  goalMinutes: number,
  name: string,
): string {
  const seed = entry.day.split('-').reduce((n, p) => n + Number(p), 0);
  const plant = entry.plants.find((p) => !p.wilted);
  const ctx = {
    '{species}': entry.firstTimes[0] ? getSpecies(entry.firstTimes[0]).name : 'something new',
    '{plant}': plant ? getSpecies(plant.speciesId).name.toLowerCase() : 'garden',
    '{minutes}': String(entry.minutes),
    '{completed}': String(entry.completed),
    '{s}': entry.completed === 1 ? '' : 's',
    '{name}': name,
  };
  let line: string;
  if (entry.completed === 0 && entry.wilted === 0) line = pick(LINES.quiet, seed);
  else if (entry.completed === 0) line = pick(LINES.wiltOnly, seed);
  else if (entry.firstTimes.length > 0) line = pick(LINES.first, seed);
  else if (entry.wilted > 0) line = pick(LINES.wilt, seed);
  else if (entry.minutes >= goalMinutes * 2.5) line = pick(LINES.big, seed);
  else if (entry.minutes >= goalMinutes) line = pick(LINES.goal, seed);
  else line = pick(LINES.normal, seed);
  for (const [k, v] of Object.entries(ctx)) line = line.split(k).join(v);
  return line;
}

/** Entries for every day with at least one session, newest first. */
export function buildDiary(
  sessions: Session[],
  plants: Plant[],
  goalMinutes: number,
  name: string,
): DiaryEntry[] {
  const byDay = new Map<DayKey, Session[]>();
  for (const s of sessions) {
    const k = dayKey(s.endedAt);
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  }
  const plantsBySession = new Map(plants.map((p) => [p.sessionId, p]));
  const seen = new Set<string>();
  const days = [...byDay.keys()].sort();
  const entries: DiaryEntry[] = [];
  for (const day of days) {
    const list = byDay.get(day)!;
    const completed = list.filter((s) => s.outcome === 'completed');
    const firstTimes: string[] = [];
    for (const s of completed) {
      if (!seen.has(s.speciesId)) {
        seen.add(s.speciesId);
        firstTimes.push(s.speciesId);
      }
    }
    const base = {
      day,
      minutes: completed.reduce((n, s) => n + s.actualMinutes, 0),
      completed: completed.length,
      wilted: list.filter((s) => s.outcome === 'wilted').length,
      plants: list.map((s) => plantsBySession.get(s.id)).filter((p): p is Plant => Boolean(p)),
      notes: list.map((s) => s.note).filter(Boolean),
      firstTimes,
    };
    entries.push({ ...base, line: diaryLine(base, goalMinutes, name) });
  }
  return entries.reverse();
}
