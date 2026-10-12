import { useMemo } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { getGardenLevel, getLevelByNumber } from '@/data/gardenLevels';
import { layoutGarden, restoration, totalFocusMinutes } from './layout';
import { inPeriod, type Period } from './periods';

/** Everything the garden page needs, derived from the store. */
export function useGarden(period: Period, now: number, levelOverride?: number) {
  const sessions = useAppStore((s) => s.sessions);
  const plants = useAppStore((s) => s.plants);
  const decorations = useAppStore((s) => s.decorations);

  const totalMinutes = useMemo(() => totalFocusMinutes(sessions), [sessions]);
  const level = levelOverride ? getLevelByNumber(levelOverride) : getGardenLevel(totalMinutes);
  const shown = useMemo(
    () => plants.filter((p) => inPeriod(p.grownAt, period, now)),
    [plants, period, now],
  );
  const layout = useMemo(
    () => layoutGarden(level, shown, decorations),
    [level, shown, decorations],
  );
  const rest = useMemo(() => restoration(level, plants), [level, plants]);

  return { level, totalMinutes, layout, restoration: rest, shown, plants, sessions };
}
