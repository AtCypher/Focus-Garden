/**
 * Which species are available, buyable or locked, and which milestone unlocks have been earned.
 * Pure functions over plain data so the Seed Book, the shop and the post-session grant share one
 * source of truth.
 */
import type { Plant, Session, Species, Wallet } from '@/types';
import { SPECIES } from '@/data/species';
import { BIOME_BY_ID } from '@/data/biomes';
import { getGardenLevel } from '@/data/gardenLevels';
import { totalFocusMinutes } from '@/features/garden/layout';

export interface UnlockContext {
  wallet: Wallet;
  totalMinutes: number;
  level: number;
  bestStreak: number;
  longestSessionMinutes: number;
  completedSessions: number;
}

export function unlockContext(
  sessions: Session[],
  wallet: Wallet,
  bestStreak: number,
): UnlockContext {
  const completed = sessions.filter((s) => s.outcome === 'completed');
  const totalMinutes = totalFocusMinutes(sessions);
  return {
    wallet,
    totalMinutes,
    level: getGardenLevel(totalMinutes).level,
    bestStreak,
    longestSessionMinutes: completed.reduce((m, s) => Math.max(m, s.actualMinutes), 0),
    completedSessions: completed.length,
  };
}

export type SpeciesStatus =
  | { kind: 'owned' }
  | { kind: 'buyable'; cost: number; affordable: boolean }
  | { kind: 'biomeLocked'; level: number; hint: string }
  | { kind: 'locked'; hint: string; progress: number };

export function biomeUnlocked(species: Species, level: number): boolean {
  return BIOME_BY_ID[species.biome].unlockLevel <= level;
}

/** Has the milestone for this species been reached? Starters and dew purchases return false. */
export function milestoneReached(species: Species, ctx: UnlockContext): boolean {
  const u = species.unlock;
  switch (u.kind) {
    case 'totalHours':
      return ctx.totalMinutes >= u.hours * 60;
    case 'streak':
      return ctx.bestStreak >= u.days;
    case 'sessionMinutes':
      return ctx.longestSessionMinutes >= u.minutes;
    case 'sessions':
      return ctx.completedSessions >= u.count;
    case 'gardenLevel':
      return ctx.level >= u.level;
    default:
      return false;
  }
}

export function unlockHint(species: Species): string {
  const u = species.unlock;
  switch (u.kind) {
    case 'starter':
      return 'Yours from the start.';
    case 'dew':
      return `${u.cost} dew.`;
    case 'totalHours':
      return `Reach ${u.hours} hours of focus.`;
    case 'streak':
      return `Keep a ${u.days}-day streak.`;
    case 'sessionMinutes':
      return `Finish a single session of ${u.minutes >= 60 ? `${u.minutes / 60} hour${u.minutes > 60 ? 's' : ''}` : `${u.minutes} minutes`}.`;
    case 'sessions':
      return `Complete ${u.count} sessions.`;
    case 'gardenLevel':
      return `Grow the garden to level ${u.level}.`;
  }
}

function milestoneProgress(species: Species, ctx: UnlockContext): number {
  const u = species.unlock;
  const ratio = (a: number, b: number) => Math.min(1, b === 0 ? 1 : a / b);
  switch (u.kind) {
    case 'totalHours':
      return ratio(ctx.totalMinutes, u.hours * 60);
    case 'streak':
      return ratio(ctx.bestStreak, u.days);
    case 'sessionMinutes':
      return ratio(ctx.longestSessionMinutes, u.minutes);
    case 'sessions':
      return ratio(ctx.completedSessions, u.count);
    case 'gardenLevel':
      return ratio(ctx.level, u.level);
    default:
      return 0;
  }
}

export function speciesStatus(species: Species, ctx: UnlockContext): SpeciesStatus {
  if (ctx.wallet.ownedSpeciesIds.includes(species.id)) return { kind: 'owned' };
  if (!biomeUnlocked(species, ctx.level)) {
    const lvl = BIOME_BY_ID[species.biome].unlockLevel;
    return {
      kind: 'biomeLocked',
      level: lvl,
      hint: `${BIOME_BY_ID[species.biome].name} opens at garden level ${lvl}.`,
    };
  }
  if (species.unlock.kind === 'dew') {
    return {
      kind: 'buyable',
      cost: species.unlock.cost,
      affordable: ctx.wallet.dew >= species.unlock.cost,
    };
  }
  if (species.unlock.kind === 'starter') return { kind: 'owned' };
  return { kind: 'locked', hint: unlockHint(species), progress: milestoneProgress(species, ctx) };
}

/** Species whose milestone is reached (and biome unlocked) but which are not yet owned. */
export function newlyEarnedSpecies(ctx: UnlockContext): Species[] {
  return SPECIES.filter(
    (s) =>
      !ctx.wallet.ownedSpeciesIds.includes(s.id) &&
      biomeUnlocked(s, ctx.level) &&
      milestoneReached(s, ctx),
  );
}

export function grownCounts(plants: Plant[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of plants) if (!p.wilted) out[p.speciesId] = (out[p.speciesId] ?? 0) + 1;
  return out;
}

/** Species the user can plant right now: owned and in an unlocked biome. */
export function plantableSpecies(ctx: UnlockContext): Species[] {
  return SPECIES.filter(
    (s) => ctx.wallet.ownedSpeciesIds.includes(s.id) && biomeUnlocked(s, ctx.level),
  );
}
