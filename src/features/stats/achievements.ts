import type { AchievementProgress, Decoration, Plant, Session, Wallet } from '@/types';
import { ACHIEVEMENTS, type AchievementDef, type AchievementMetrics } from '@/data/achievements';
import { getGardenLevel } from '@/data/gardenLevels';
import { dayKey } from '@/lib/dates';
import { totalFocusMinutes } from '@/features/garden/layout';

export function computeMetrics(
  sessions: Session[],
  plants: Plant[],
  wallet: Wallet,
  decorations: Decoration[],
  bestStreak: number,
): AchievementMetrics {
  const done = sessions.filter((s) => s.outcome === 'completed');
  const totalMinutes = totalFocusMinutes(sessions);
  const wiltDays = new Set(
    sessions.filter((s) => s.outcome === 'wilted').map((s) => dayKey(s.endedAt)),
  );
  const comebackDays = new Set(
    done.filter((s) => wiltDays.has(dayKey(s.endedAt))).map((s) => dayKey(s.endedAt)),
  );
  const alive = plants.filter((p) => !p.wilted);
  return {
    completedSessions: done.length,
    totalMinutes,
    longestSessionMinutes: done.reduce((m, s) => Math.max(m, s.actualMinutes), 0),
    bestStreak,
    speciesOwned: wallet.ownedSpeciesIds.length,
    plantsGrown: alive.length,
    maturePlants: alive.filter((p) => p.variant !== 'standard').length,
    ancientPlants: alive.filter((p) => p.variant === 'ancient').length,
    earlySessions: done.filter((s) => new Date(s.startedAt).getHours() < 8).length,
    lateSessions: done.filter((s) => new Date(s.startedAt).getHours() >= 22).length,
    deepSessions: done.filter((s) => s.strictness === 'deep').length,
    pomodoroBlocks: done.filter((s) => s.mode === 'pomodoro').length,
    stopwatchSessions: done.filter((s) => s.mode === 'stopwatch').length,
    gardenLevel: getGardenLevel(totalMinutes).level,
    decorationsPlaced: decorations.length,
    totalDew: wallet.totalEarned,
    tagsUsed: new Set(done.map((s) => s.tagId).filter(Boolean)).size,
    comebacks: comebackDays.size,
    biomesPlanted: new Set(alive.map((p) => p.biome)).size,
  };
}

export interface AchievementView {
  def: AchievementDef;
  value: number;
  progress: number;
  unlockedAt: string | null;
}

/** Merge metrics with stored progress; newly reached targets get an unlock timestamp. */
export function evaluateAchievements(
  metrics: AchievementMetrics,
  previous: AchievementProgress[],
  now: Date = new Date(),
): { list: AchievementProgress[]; unlocked: AchievementDef[] } {
  const prev = new Map(previous.map((p) => [p.id, p]));
  const unlocked: AchievementDef[] = [];
  const list = ACHIEVEMENTS.map((def) => {
    const value = metrics[def.metric];
    const old = prev.get(def.id);
    let unlockedAt = old?.unlockedAt ?? null;
    if (!unlockedAt && value >= def.target) {
      unlockedAt = now.toISOString();
      unlocked.push(def);
    }
    return { id: def.id, value, unlockedAt };
  });
  return { list, unlocked };
}

export function achievementViews(list: AchievementProgress[]): AchievementView[] {
  const map = new Map(list.map((p) => [p.id, p]));
  return ACHIEVEMENTS.map((def) => {
    const p = map.get(def.id);
    const value = p?.value ?? 0;
    return {
      def,
      value,
      progress: Math.min(1, value / def.target),
      unlockedAt: p?.unlockedAt ?? null,
    };
  });
}
