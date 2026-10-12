import { describe, expect, it } from 'vitest';
import { DEFAULT_WALLET } from '@/data/defaults';
import { getSpecies } from '@/data/species';
import {
  newlyEarnedSpecies,
  plantableSpecies,
  speciesStatus,
  unlockContext,
  type UnlockContext,
} from './unlocks';
import type { Session } from '@/types';

const base: UnlockContext = {
  wallet: { ...DEFAULT_WALLET, dew: 100 },
  totalMinutes: 0,
  level: 1,
  bestStreak: 0,
  longestSessionMinutes: 0,
  completedSessions: 0,
};

describe('species status', () => {
  it('starters are owned, dew species are buyable when affordable', () => {
    expect(speciesStatus(getSpecies('daisy'), base)).toEqual({ kind: 'owned' });
    expect(speciesStatus(getSpecies('poppy'), base)).toEqual({
      kind: 'buyable',
      cost: 40,
      affordable: true,
    });
    expect(speciesStatus(getSpecies('lavender'), base)).toEqual({
      kind: 'buyable',
      cost: 120,
      affordable: false,
    });
  });
  it('locks species in biomes the garden has not reached', () => {
    const s = speciesStatus(getSpecies('oak'), base);
    expect(s.kind).toBe('biomeLocked');
    expect(speciesStatus(getSpecies('oak'), { ...base, level: 3 }).kind).toBe('buyable');
  });
  it('reports milestone progress', () => {
    const s = speciesStatus(getSpecies('sunflower'), { ...base, longestSessionMinutes: 30 });
    expect(s).toEqual({
      kind: 'locked',
      hint: 'Finish a single session of 1 hour.',
      progress: 0.5,
    });
    expect(speciesStatus(getSpecies('pear'), { ...base, completedSessions: 100 }).kind).toBe(
      'locked',
    );
  });
  it('lists milestone species that are earned but not yet owned', () => {
    expect(newlyEarnedSpecies(base)).toEqual([]);
    const earned = newlyEarnedSpecies({
      ...base,
      longestSessionMinutes: 120,
      bestStreak: 7,
      level: 7,
      totalMinutes: 25 * 60,
    });
    expect(earned.map((s) => s.id).sort()).toEqual([
      'elderoak',
      'lotus',
      'pine',
      'prickly',
      'sunflower',
    ]);
    const owned = {
      ...base,
      wallet: { ...base.wallet, ownedSpeciesIds: [...base.wallet.ownedSpeciesIds, 'sunflower'] },
      longestSessionMinutes: 60,
    };
    expect(newlyEarnedSpecies(owned)).toEqual([]);
  });
  it('only lists plantable species in unlocked biomes', () => {
    const ctx = { ...base, wallet: { ...base.wallet, ownedSpeciesIds: ['daisy', 'oak'] } };
    expect(plantableSpecies(ctx).map((s) => s.id)).toEqual(['daisy']);
    expect(plantableSpecies({ ...ctx, level: 3 }).map((s) => s.id)).toEqual(['daisy', 'oak']);
  });
  it('builds a context from sessions', () => {
    const s = (minutes: number, outcome: Session['outcome']): Session => ({
      id: String(Math.random()),
      startedAt: '',
      endedAt: '',
      plannedMinutes: minutes,
      actualMinutes: minutes,
      mode: 'countdown',
      strictness: 'standard',
      speciesId: 'daisy',
      tagId: null,
      outcome,
      note: '',
      dewEarned: 0,
      round: null,
    });
    const ctx = unlockContext(
      [s(90, 'completed'), s(30, 'completed'), s(120, 'wilted')],
      DEFAULT_WALLET,
      3,
    );
    expect(ctx).toMatchObject({
      totalMinutes: 120,
      level: 1,
      bestStreak: 3,
      longestSessionMinutes: 90,
      completedSessions: 2,
    });
  });
});
