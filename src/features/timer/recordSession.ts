/**
 * Turns a finished engine block into persisted records: the Session and, for completed or wilted
 * blocks, a Plant. Pure so it can be tested; the controller feeds it into the app store.
 */
import type { Plant, Session, TilePosition } from '@/types';
import { calculateDew, toSession, variantForMinutes, type EngineState } from './engine';
import { getSpecies } from '@/data/species';
import { dayKey } from '@/lib/dates';
import { newId } from '@/lib/id';

export interface RecordInput {
  state: EngineState;
  existingSessions: Session[];
  /** Where to put the plant; null leaves it unplaced (overflow). */
  chooseTile: (biome: Plant['biome']) => TilePosition | null;
}

export interface RecordOutput {
  session: Session;
  plant: Plant | null;
}

export function isFirstSessionOfDay(sessions: Session[], at: number): boolean {
  const key = dayKey(at);
  return !sessions.some((s) => s.outcome === 'completed' && dayKey(s.endedAt) === key);
}

export function buildRecords({ state, existingSessions, chooseTile }: RecordInput): RecordOutput {
  if (state.status !== 'finished' || state.finishedAt === null || state.outcome === null) {
    throw new Error('buildRecords needs a finished block');
  }
  const minutes = Math.floor(
    Math.max(0, (state.focusEndedAt ?? state.finishedAt) - state.startedAt - state.pausedTotalMs) /
      state.config.minuteMs,
  );
  const dewEarned = calculateDew({
    outcome: state.outcome,
    actualMinutes: Math.min(
      minutes,
      state.config.mode === 'stopwatch' ? minutes : state.config.plannedMinutes,
    ),
    strictness: state.config.strictness,
    firstSessionOfDay: isFirstSessionOfDay(existingSessions, state.finishedAt),
  });
  const session = toSession(state, { id: newId(), dewEarned });

  if (session.outcome === 'cancelled') return { session, plant: null };

  const species = getSpecies(session.speciesId);
  const plant: Plant = {
    id: newId(),
    sessionId: session.id,
    speciesId: species.id,
    variant:
      session.outcome === 'completed' ? variantForMinutes(session.actualMinutes) : 'standard',
    biome: species.biome,
    wilted: session.outcome === 'wilted',
    grownAt: session.endedAt,
    tile: chooseTile(species.biome),
  };
  return { session, plant };
}
