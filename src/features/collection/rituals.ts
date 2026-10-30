/**
 * Pure logic for the daily rituals and collections: the daily garden visit, Pip's finds, wildlife
 * visitors, seasonal events, 7-day challenges and the companion's growth.
 */
import type {
  Biome,
  ChallengeProgress,
  DayKey,
  ProgressState,
  Session,
  TilePosition,
} from '@/types';
import { FINDS } from '@/data/finds';
import { VISITORS, type Visitor } from '@/data/visitors';
import { CHALLENGE_BY_ID, CHALLENGE_DAYS } from '@/data/challenges';
import { activeEvent, eventKey, type SeasonEvent } from '@/data/events';
import type { GardenLevel } from '@/data/gardenLevels';
import { unlockedBiomes } from '@/data/gardenLevels';
import { biomeTiles } from '@/features/garden/layout';
import type { TimeOfDay } from '@/features/garden/daylight';
import { addDays, dayKey } from '@/lib/dates';

/** FNV-1a, mapped to 0..1. Deterministic so rolls never change on re-render or reload. */
export function hashUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  // Final avalanche (murmur3 fmix) so near-identical inputs spread across the whole range.
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ---------- Daily visit ----------

export const VISIT_DEW = 5;
export const VISIT_DEW_STREAK = 10;

export interface VisitResult {
  dew: number;
  patch: Partial<ProgressState>;
}

/** Null when today's visit was already collected. */
export function dailyVisit(
  progress: ProgressState,
  today: DayKey,
  streak: number,
): VisitResult | null {
  if (progress.lastVisitDay === today) return null;
  return {
    dew: streak >= 3 ? VISIT_DEW_STREAK : VISIT_DEW,
    patch: { lastVisitDay: today, visitDays: progress.visitDays + 1 },
  };
}

// ---------- Pip's finds ----------

export const FIND_CHANCE = 0.35;

/** Roll a find for a completed session. Deterministic per session id. */
export function rollFind(sessionId: string, ownedIds: string[]): string | null {
  if (hashUnit(`find:${sessionId}`) >= FIND_CHANCE) return null;
  const pool = FINDS.filter((f) => !ownedIds.includes(f.id));
  if (pool.length === 0) return null;
  const total = pool.reduce((n, f) => n + f.weight, 0);
  let r = hashUnit(`which:${sessionId}`) * total;
  for (const f of pool) {
    r -= f.weight;
    if (r <= 0) return f.id;
  }
  return pool[pool.length - 1].id;
}

// ---------- Visitors ----------

export interface Sighting {
  visitor: Visitor;
  tile: TilePosition;
}

/** Which visitors are in the garden today, and where. Same day, same answer. */
export function visitorsToday(
  day: DayKey,
  level: GardenLevel,
  restoration: Record<Biome, number>,
  time: TimeOfDay,
  occupied: Set<string>,
): Sighting[] {
  const biomes = unlockedBiomes(level.level);
  const out: Sighting[] = [];
  for (const v of VISITORS) {
    if (!biomes.includes(v.biome)) continue;
    if ((restoration[v.biome] ?? 0) < v.minRestoration) continue;
    if (v.times && !v.times.includes(time)) continue;
    if (hashUnit(`visit:${day}:${v.id}`) >= v.chance) continue;
    const tiles = biomeTiles(level, v.biome);
    const free = tiles.filter((t) => !occupied.has(`${t.col},${t.row}`));
    const pick = (free.length ? free : tiles)[
      Math.floor(hashUnit(`tile:${day}:${v.id}`) * (free.length || tiles.length))
    ];
    if (pick) out.push({ visitor: v, tile: pick });
  }
  return out;
}

/** Merge today's sightings into the progress record; returns the ids seen for the first time. */
export function recordSightings(
  progress: ProgressState,
  sightings: Sighting[],
  day: DayKey,
  nowIso: string,
): { patch: Partial<ProgressState>; firstSeen: string[] } | null {
  // Each sighting counts once per day; the day marker lives in `sightingDay`.
  if (progress.sightingDay === day || sightings.length === 0) return null;
  const visitors = progress.visitors.map((v) => ({ ...v }));
  const firstSeen: string[] = [];
  for (const s of sightings) {
    const existing = visitors.find((v) => v.id === s.visitor.id);
    if (existing) existing.sightings += 1;
    else {
      visitors.push({ id: s.visitor.id, firstSeenAt: nowIso, sightings: 1 });
      firstSeen.push(s.visitor.id);
    }
  }
  return { patch: { visitors, sightingDay: day }, firstSeen };
}

// ---------- Events ----------

export interface EventStatus {
  event: SeasonEvent;
  key: string;
  sessions: number;
  claimed: boolean;
}

export function eventStatus(progress: ProgressState, date: Date): EventStatus | null {
  const event = activeEvent(date);
  if (!event) return null;
  const key = eventKey(event, date);
  return {
    event,
    key,
    sessions: progress.eventSessions[key] ?? 0,
    claimed: progress.eventsClaimed.includes(key),
  };
}

/** Count a completed session towards the running event. Returns the reward to grant, if earned now. */
export function countEventSession(
  progress: ProgressState,
  date: Date,
): { patch: Partial<ProgressState>; reward: SeasonEvent | null } | null {
  const st = eventStatus(progress, date);
  if (!st) return null;
  const sessions = st.sessions + 1;
  const eventSessions = { ...progress.eventSessions, [st.key]: sessions };
  if (!st.claimed && sessions >= st.event.sessionsNeeded) {
    return {
      patch: { eventSessions, eventsClaimed: [...progress.eventsClaimed, st.key] },
      reward: st.event,
    };
  }
  return { patch: { eventSessions }, reward: null };
}

// ---------- Challenges ----------

export interface ChallengeEvaluation {
  challenges: ChallengeProgress[];
  completed: string[];
  failed: string[];
}

/** Advance the active challenge from the sessions. Days before today must be met or it fails. */
export function evaluateChallenges(
  progress: ProgressState,
  sessions: Session[],
  goalMinutes: number,
  now: Date,
): ChallengeEvaluation {
  const today = dayKey(now);
  const completed: string[] = [];
  const failed: string[] = [];
  const byDay = new Map<DayKey, Session[]>();
  for (const s of sessions) {
    const k = dayKey(s.endedAt);
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  }
  const challenges = progress.challenges.map((c) => {
    if (c.completedAt || c.failedAt) return c;
    const def = CHALLENGE_BY_ID[c.id];
    if (!def) return c;
    const metDays = [...c.metDays];
    for (let d = c.startedDay, i = 0; i < CHALLENGE_DAYS; d = addDays(d, 1), i++) {
      if (metDays.includes(d)) continue;
      const met = def.metDay(byDay.get(d) ?? [], goalMinutes);
      if (met) metDays.push(d);
      else if (d < today) {
        failed.push(c.id);
        return { ...c, metDays, failedAt: now.toISOString() };
      } else break; // today not met yet; wait
    }
    if (metDays.length >= CHALLENGE_DAYS) {
      completed.push(c.id);
      return { ...c, metDays, completedAt: now.toISOString() };
    }
    return { ...c, metDays };
  });
  return { challenges, completed, failed };
}

export function activeChallenge(progress: ProgressState): ChallengeProgress | null {
  return progress.challenges.find((c) => !c.completedAt && !c.failedAt) ?? null;
}

export function completedChallengeIds(progress: ProgressState): string[] {
  return progress.challenges.filter((c) => c.completedAt).map((c) => c.id);
}

// ---------- Companion growth ----------

export interface CompanionLevel {
  level: number;
  title: string;
  minutes: number;
}

export const COMPANION_LEVELS: CompanionLevel[] = [
  { level: 1, title: 'Seedling', minutes: 0 },
  { level: 2, title: 'Sprout', minutes: 2 * 60 },
  { level: 3, title: 'Sapling', minutes: 8 * 60 },
  { level: 4, title: 'Keeper', minutes: 20 * 60 },
  { level: 5, title: 'Warden', minutes: 50 * 60 },
  { level: 6, title: 'Elder', minutes: 100 * 60 },
  { level: 7, title: 'Sage', minutes: 200 * 60 },
];

export function companionLevel(totalMinutes: number): CompanionLevel {
  let cur = COMPANION_LEVELS[0];
  for (const l of COMPANION_LEVELS) if (totalMinutes >= l.minutes) cur = l;
  return cur;
}
