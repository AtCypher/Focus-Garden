import { useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { Button } from '@/app/ui/Button';
import { Companion } from '@/art/Companion';
import { companionLevel, dailyVisit } from '@/features/collection/rituals';
import { totalFocusMinutes } from '@/features/garden/layout';
import { evaluateStreak } from '@/features/stats/streaks';
import { dayKey } from '@/lib/dates';
import { eventStatus } from '@/features/collection/rituals';

/** First open of the day: Pip waters the garden and hands over a little dew. */
export function DailyVisit() {
  const progress = useAppStore((s) => s.progress);
  const sessions = useAppStore((s) => s.sessions);
  const settings = useAppStore((s) => s.settings);
  const streakState = useAppStore((s) => s.streak);
  const freezes = useAppStore((s) => s.wallet.streakFreezes);
  const addDew = useAppStore((s) => s.addDew);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const showToast = useUiStore((s) => s.showToast);
  const [now] = useState(() => Date.now());
  const today = dayKey(now);
  const streak = evaluateStreak(
    sessions,
    settings.dailyGoalMinutes,
    streakState,
    freezes,
    now,
  ).display;
  const visit = dailyVisit(progress, today, streak);
  const level = companionLevel(totalFocusMinutes(sessions)).level;
  const event = eventStatus(progress, new Date(now));
  if (!visit || !settings.onboardingDone) return null;
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <section
      className="card mx-auto flex w-full max-w-xl items-center gap-3 p-3"
      aria-label="Daily visit"
    >
      <Companion
        mood="watering"
        outfitId={settings.companionOutfitId}
        level={level}
        size={72}
        label={settings.companionName}
      />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">
          {greeting}.{' '}
          {streak >= 3
            ? `${streak} days running, the garden looks great.`
            : 'The garden is waiting.'}
        </p>
        <p className="text-muted text-xs">
          {event && !event.claimed
            ? `${event.event.name}: ${event.sessions}/${event.event.sessionsNeeded} sessions towards the reward.`
            : `Visit ${progress.visitDays + 1}. A little dew for showing up.`}
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => {
          addDew(visit.dew);
          updateProgress(visit.patch);
          showToast(`+${visit.dew} dew. Thanks for coming by.`);
        }}
      >
        Water (+{visit.dew})
      </Button>
    </section>
  );
}
