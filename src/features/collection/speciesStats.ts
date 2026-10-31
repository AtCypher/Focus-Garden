import type { Session } from '@/types';

export interface SpeciesStat {
  grown: number;
  firstGrownAt: string | null;
  bestMinutes: number;
  totalMinutes: number;
}

/** Per-species history from completed sessions: how often, since when, and the longest session. */
export function speciesStats(sessions: Session[]): Record<string, SpeciesStat> {
  const out: Record<string, SpeciesStat> = {};
  for (const s of sessions) {
    if (s.outcome !== 'completed') continue;
    const st = (out[s.speciesId] ??= {
      grown: 0,
      firstGrownAt: null,
      bestMinutes: 0,
      totalMinutes: 0,
    });
    st.grown += 1;
    st.totalMinutes += s.actualMinutes;
    st.bestMinutes = Math.max(st.bestMinutes, s.actualMinutes);
    if (!st.firstGrownAt || s.endedAt < st.firstGrownAt) st.firstGrownAt = s.endedAt;
  }
  return out;
}
