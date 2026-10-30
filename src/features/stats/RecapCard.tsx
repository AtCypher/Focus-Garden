import { useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { Button } from '@/app/ui/Button';
import { renderGardenPng, shareOrDownload } from '@/features/garden/shareImage';
import { pickMessage } from '@/features/companion/messages';
import { formatMinutes } from '@/lib/dates';
import { lastWeekStart, weeklyRecap } from './recap';
import { IconClose } from '@/app/ui/icons';

interface Props {
  /** Show a close button and remember the dismissal. */
  dismissible?: boolean;
  now: number;
}

/** Last week in one card, with a shareable image. */
export function RecapCard({ dismissible = false, now }: Props) {
  const sessions = useAppStore((s) => s.sessions);
  const plants = useAppStore((s) => s.plants);
  const tags = useAppStore((s) => s.tags);
  const goal = useAppStore((s) => s.settings.dailyGoalMinutes);
  const name = useAppStore((s) => s.settings.companionName);
  const recapsSeen = useAppStore((s) => s.progress.recapsSeen);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const showToast = useUiStore((s) => s.showToast);
  const svgRef = useRef<SVGSVGElement>(null);
  const [sharing, setSharing] = useState(false);
  const start = lastWeekStart(now);
  const recap = useMemo(
    () => weeklyRecap(sessions, plants, start, goal),
    [sessions, plants, start, goal],
  );

  if (dismissible && (recapsSeen.includes(start) || recap.sessions === 0)) return null;

  const tag = recap.topTag ? tags.find((t) => t.id === recap.topTag?.tagId) : null;
  const delta = recap.minutes - recap.previousMinutes;
  const line = pickMessage(recap.minutes >= goal * 5 ? 'completion' : 'mid', recap.minutes, {
    name,
    minutes: recap.minutes,
  });
  const fmtDay = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const bestDay = recap.bestDay
    ? new Date(`${recap.bestDay.day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' })
    : null;

  const share = async () => {
    if (!svgRef.current) return;
    setSharing(true);
    try {
      const blob = await renderGardenPng({
        svg: svgRef.current,
        caption: `My week in Grove`,
        subcaption: `${fmtDay(recap.weekStart)} to ${fmtDay(recap.weekEnd)}`,
        width: 900,
      });
      const r = await shareOrDownload(
        blob,
        `grove-week-${recap.weekStart}.png`,
        'My week in Grove',
      );
      showToast(r === 'shared' ? 'Shared.' : 'Image downloaded.');
    } catch {
      showToast('Could not create the image.');
    } finally {
      setSharing(false);
    }
  };

  const stat = (x: number, label: string, value: string) => (
    <g transform={`translate(${x} 0)`}>
      <text y="0" fontSize="26" fontWeight="700" fill="#1f2a22" fontFamily="Georgia, serif">
        {value}
      </text>
      <text y="22" fontSize="12" fill="#5b6b5e" fontFamily="system-ui, sans-serif">
        {label}
      </text>
    </g>
  );

  return (
    <section className="card relative p-4" aria-label="Weekly recap">
      {dismissible && (
        <button
          type="button"
          onClick={() =>
            updateProgress((p) => ({ recapsSeen: [...p.recapsSeen, start].slice(-20) }))
          }
          aria-label="Dismiss recap"
          className="focus-ring absolute top-3 right-3 rounded-full p-1 hover:bg-moss-100 dark:hover:bg-moss-800"
        >
          <IconClose width={18} height={18} />
        </button>
      )}
      <h2 className="text-sm font-medium">
        Last week{' '}
        <span className="text-muted font-normal">
          ({fmtDay(recap.weekStart)} to {fmtDay(recap.weekEnd)})
        </span>
      </h2>
      <div className="mt-2 overflow-hidden rounded-2xl">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 220"
          className="h-auto w-full"
          role="img"
          aria-label={`Last week: ${formatMinutes(recap.minutes)} of focus, ${recap.sessions} sessions, ${recap.plantsGrown} plants`}
        >
          <rect width="600" height="220" fill="#e4ecdc" />
          <rect x="0" y="0" width="600" height="6" fill="#2f6b4f" />
          <text
            x="28"
            y="48"
            fontSize="16"
            fill="#2f6b4f"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
          >
            GROVE · WEEK OF {fmtDay(recap.weekStart).toUpperCase()}
          </text>
          <g transform="translate(28 100)">
            {stat(0, 'of focus', formatMinutes(recap.minutes))}
            {stat(150, 'sessions', String(recap.sessions))}
            {stat(290, 'plants grown', String(recap.plantsGrown))}
            {stat(440, 'goal days', `${recap.goalDays}/7`)}
          </g>
          <text x="28" y="160" fontSize="14" fill="#1f2a22" fontFamily="system-ui, sans-serif">
            {bestDay
              ? `Best day: ${bestDay} (${formatMinutes(recap.bestDay!.minutes)})`
              : 'No completed sessions'}
            {tag ? ` · Top tag: ${tag.name}` : ''}
            {recap.previousMinutes > 0
              ? ` · ${delta >= 0 ? '+' : ''}${formatMinutes(Math.abs(delta)).replace(/^/, delta < 0 ? '-' : '')} vs the week before`
              : ''}
          </text>
          <text
            x="28"
            y="192"
            fontSize="13"
            fill="#5b6b5e"
            fontFamily="system-ui, sans-serif"
            fontStyle="italic"
          >
            {name}: “{line}”
          </text>
        </svg>
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => void share()} disabled={sharing}>
          {sharing ? 'Rendering…' : 'Share recap'}
        </Button>
      </div>
    </section>
  );
}
