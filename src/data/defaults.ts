import type { Settings, StreakState, Tag, Wallet } from '@/types';
import { DEFAULT_POMODORO } from '@/features/timer/pomodoro';
import { STARTER_SPECIES_IDS } from './species';

export const DEFAULT_SETTINGS: Settings = {
  companionName: 'Pip',
  companionOutfitId: 'none',
  defaultStrictness: 'standard',
  allowLeaving: false,
  defaultMode: 'countdown',
  defaultMinutes: 25,
  defaultSpeciesId: 'daisy',
  defaultTagId: null,
  pomodoro: DEFAULT_POMODORO,
  dailyGoalMinutes: 60,
  theme: 'system',
  seasons: true,
  ambientSound: 'none',
  ambientVolume: 0.5,
  chime: true,
  haptics: true,
  wakeLock: true,
  notifications: true,
  onboardingDone: false,
};

export const DEFAULT_WALLET: Wallet = {
  dew: 0,
  totalEarned: 0,
  ownedSpeciesIds: [...STARTER_SPECIES_IDS],
  ownedDecorations: {},
  ownedOutfitIds: ['none'],
  streakFreezes: 0,
};

export const DEFAULT_STREAK: StreakState = {
  current: 0,
  best: 0,
  frozenDays: [],
  lastEvaluated: null,
};

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-study', name: 'Study', color: '#3ea6cd', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-work', name: 'Work', color: '#5b8c48', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-reading', name: 'Reading', color: '#e4779f', createdAt: '2026-01-01T00:00:00.000Z' },
];
