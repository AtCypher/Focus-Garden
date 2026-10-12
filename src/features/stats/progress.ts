/** Re-evaluates streaks and achievements from the current store and persists the results. */
import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { evaluateStreak } from './streaks';
import { computeMetrics, evaluateAchievements } from './achievements';
import { pickMessage } from '@/features/companion/messages';

export function updateProgress(now: Date = new Date(), announce = true): void {
  const app = useAppStore.getState();
  const streak = evaluateStreak(
    app.sessions,
    app.settings.dailyGoalMinutes,
    app.streak,
    app.wallet.streakFreezes,
    now,
  );
  if (JSON.stringify(streak.state) !== JSON.stringify(app.streak)) app.setStreak(streak.state);
  if (streak.freezes !== app.wallet.streakFreezes)
    app.addStreakFreeze(streak.freezes - app.wallet.streakFreezes);

  const fresh = useAppStore.getState();
  const metrics = computeMetrics(
    fresh.sessions,
    fresh.plants,
    fresh.wallet,
    fresh.decorations,
    Math.max(fresh.streak.best, streak.display),
  );
  const result = evaluateAchievements(metrics, fresh.achievements, now);
  const changed =
    result.unlocked.length > 0 ||
    result.list.some(
      (p, i) => fresh.achievements[i]?.value !== p.value || fresh.achievements[i]?.id !== p.id,
    );
  if (changed) fresh.setAchievements(result.list);

  if (!announce) return;
  const toast = useUiStore.getState().showToast;
  if (result.unlocked.length === 1) toast(`Achievement: ${result.unlocked[0].name}.`);
  else if (result.unlocked.length > 1) toast(`${result.unlocked.length} achievements unlocked.`);
  else if (streak.earned > 0) toast(pickMessage('streak', 2, { days: streak.display }));
  else if (streak.todayMet && streak.display > 0 && streak.display % 7 === 0)
    toast(pickMessage('streak', streak.display, { days: streak.display }));
}
