/**
 * Pure session engine. No React, no timers, no globals: every function takes `now` (ms since epoch)
 * so the same code is correct under fake timers, a throttled tab or a phone that slept for an hour.
 *
 * The engine models ONE focus block (a countdown, one Pomodoro focus block, or a stopwatch run).
 * Breaks and Pomodoro sequencing live in pomodoro.ts; persistence and side effects live in the store.
 */
import type {
  GrowthStage,
  PlantVariant,
  Session,
  SessionOutcome,
  Strictness,
  TimerMode,
} from '@/types';
import { RULES } from './rules';

export interface EngineConfig {
  mode: TimerMode;
  /** Minutes to focus. Ignored for stopwatch (use 0). */
  plannedMinutes: number;
  strictness: Strictness;
  speciesId: string;
  tagId: string | null;
  /** Pomodoro round number (1-based) or null. */
  round: number | null;
  /** Milliseconds per logical minute. 60_000 normally; 1_000 under the dev speed flag. */
  minuteMs: number;
}

export type EngineStatus = 'running' | 'paused' | 'away' | 'finished';

export interface EngineState {
  config: EngineConfig;
  status: EngineStatus;
  startedAt: number;
  /** Wall-clock end of the focus block, shifted by pauses. Null for stopwatch. */
  endsAt: number | null;
  pausedAt: number | null;
  pausesUsed: number;
  pausedTotalMs: number;
  /** When the user left (strict modes), while status is 'away'. */
  awaySince: number | null;
  graceEndsAt: number | null;
  /** Times the user left and came back in time (strict modes) or left at all (gentle). */
  leaveCount: number;
  /** Set when status is 'finished'. */
  finishedAt: number | null;
  /** The moment focus effectively stopped (for wilt: when the user left). */
  focusEndedAt: number | null;
  outcome: SessionOutcome | null;
}

export type EngineEvent =
  | { type: 'tick' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'hide' }
  | { type: 'show' }
  | { type: 'cancel' }
  | { type: 'giveUp' }
  | { type: 'stop' };

export function start(config: EngineConfig, now: number): EngineState {
  const plannedMs = config.mode === 'stopwatch' ? null : config.plannedMinutes * config.minuteMs;
  return {
    config,
    status: 'running',
    startedAt: now,
    endsAt: plannedMs === null ? null : now + plannedMs,
    pausedAt: null,
    pausesUsed: 0,
    pausedTotalMs: 0,
    awaySince: null,
    graceEndsAt: null,
    leaveCount: 0,
    finishedAt: null,
    focusEndedAt: null,
    outcome: null,
  };
}

function finish(
  state: EngineState,
  outcome: SessionOutcome,
  now: number,
  focusEndedAt: number,
): EngineState {
  return {
    ...state,
    status: 'finished',
    pausedAt: null,
    awaySince: null,
    graceEndsAt: null,
    finishedAt: now,
    focusEndedAt: Math.min(focusEndedAt, now),
    outcome,
  };
}

/** Focused milliseconds so far, excluding pauses and capped at the planned end. */
export function elapsedMs(state: EngineState, now: number): number {
  const end = state.focusEndedAt ?? now;
  let effectiveEnd = end;
  if (state.endsAt !== null) effectiveEnd = Math.min(effectiveEnd, state.endsAt);
  let pausedNow = 0;
  if (state.status === 'paused' && state.pausedAt !== null) {
    pausedNow = Math.min(now - state.pausedAt, maxPauseMs(state));
  }
  return Math.max(0, effectiveEnd - state.startedAt - state.pausedTotalMs - pausedNow);
}

/** Milliseconds left for countdown/pomodoro. Null for stopwatch. Never negative. */
export function remainingMs(state: EngineState, now: number): number | null {
  if (state.endsAt === null) return null;
  const planned = state.config.plannedMinutes * state.config.minuteMs;
  return Math.max(0, planned - elapsedMs(state, now));
}

/** 0..1 growth progress. Stopwatch plants are fully grown at the minimum length. */
export function progress(state: EngineState, now: number): number {
  const target =
    state.endsAt === null
      ? RULES.stopwatchMinMinutes * state.config.minuteMs
      : state.config.plannedMinutes * state.config.minuteMs;
  if (target <= 0) return 1;
  return Math.min(1, elapsedMs(state, now) / target);
}

export function growthStage(p: number): GrowthStage {
  if (p < 0.1) return 'seed';
  if (p < 0.4) return 'sprout';
  if (p < 0.8) return 'sapling';
  return 'full';
}

export function stageIndex(stage: GrowthStage): number {
  return ['seed', 'sprout', 'sapling', 'full'].indexOf(stage);
}

export function isInCancelWindow(state: EngineState, now: number): boolean {
  return state.status !== 'finished' && now - state.startedAt < RULES.cancelWindowMs;
}

export function canPause(state: EngineState): boolean {
  return (
    state.status === 'running' &&
    state.config.strictness === 'gentle' &&
    state.pausesUsed < RULES.maxPauses
  );
}

export function pausesLeft(state: EngineState): number {
  if (state.config.strictness !== 'gentle') return 0;
  return Math.max(0, RULES.maxPauses - state.pausesUsed);
}

function maxPauseMs(state: EngineState): number {
  return RULES.maxPauseMinutes * state.config.minuteMs;
}

function graceMs(strictness: Strictness): number {
  return RULES.graceMs[strictness];
}

/** Resolve a pause that has been running too long: resume at the limit. */
function autoResume(state: EngineState): EngineState {
  if (state.status !== 'paused' || state.pausedAt === null) return state;
  const used = maxPauseMs(state);
  return {
    ...state,
    status: 'running',
    pausedAt: null,
    pausedTotalMs: state.pausedTotalMs + used,
    endsAt: state.endsAt === null ? null : state.endsAt + used,
  };
}

/** Did the block run its full planned length by `now`? */
function reachedEnd(state: EngineState, now: number): boolean {
  if (state.endsAt === null) {
    const cap = RULES.stopwatchMaxMinutes * state.config.minuteMs;
    return elapsedMs(state, now) >= cap;
  }
  return now >= state.endsAt;
}

/** Decide what happens when the grace period is over (or on return). */
function resolveAway(state: EngineState, now: number): EngineState {
  if (state.status !== 'away' || state.graceEndsAt === null || state.awaySince === null)
    return state;
  if (now < state.graceEndsAt) {
    return {
      ...state,
      status: 'running',
      awaySince: null,
      graceEndsAt: null,
      leaveCount: state.leaveCount + 1,
    };
  }
  // The plant finished growing before the grace ran out: that counts as completed.
  if (state.endsAt !== null && state.endsAt <= state.graceEndsAt && now >= state.endsAt) {
    return finish(state, 'completed', now, state.endsAt);
  }
  return finish(state, 'wilted', now, state.awaySince);
}

export function reduce(state: EngineState, event: EngineEvent, now: number): EngineState {
  if (state.status === 'finished') return state;

  switch (event.type) {
    case 'tick': {
      let next = state;
      if (
        next.status === 'paused' &&
        next.pausedAt !== null &&
        now - next.pausedAt >= maxPauseMs(next)
      ) {
        next = autoResume(next);
      }
      if (next.status === 'away' && next.graceEndsAt !== null && now >= next.graceEndsAt) {
        next = resolveAway(next, now);
        if (next.status === 'finished') return next;
      }
      if (next.status === 'running' && reachedEnd(next, now)) {
        const focusEnd = next.endsAt ?? now;
        return finish(next, 'completed', now, focusEnd);
      }
      // Being away must not let the clock run past the end silently: if the block ended while
      // away but grace is still open, completion wins.
      if (next.status === 'away' && next.endsAt !== null && now >= next.endsAt) {
        return finish(next, 'completed', now, next.endsAt);
      }
      return next;
    }

    case 'pause': {
      if (!canPause(state)) return state;
      return { ...state, status: 'paused', pausedAt: now, pausesUsed: state.pausesUsed + 1 };
    }

    case 'resume': {
      if (state.status !== 'paused' || state.pausedAt === null) return state;
      const used = Math.min(now - state.pausedAt, maxPauseMs(state));
      const next: EngineState = {
        ...state,
        status: 'running',
        pausedAt: null,
        pausedTotalMs: state.pausedTotalMs + used,
        endsAt: state.endsAt === null ? null : state.endsAt + used,
      };
      return reachedEnd(next, now) ? finish(next, 'completed', now, next.endsAt ?? now) : next;
    }

    case 'hide': {
      if (state.status !== 'running') return state;
      if (state.config.strictness === 'gentle') {
        // Leaving is allowed. Count it for the reminder, keep growing.
        return { ...state, leaveCount: state.leaveCount + 1 };
      }
      // If the clock already ran out, finish instead of starting a grace period.
      if (reachedEnd(state, now)) return finish(state, 'completed', now, state.endsAt ?? now);
      return {
        ...state,
        status: 'away',
        awaySince: now,
        graceEndsAt: now + graceMs(state.config.strictness),
      };
    }

    case 'show': {
      if (state.status !== 'away') return state;
      const next = resolveAway(state, now);
      if (next.status === 'running' && reachedEnd(next, now)) {
        return finish(next, 'completed', now, next.endsAt ?? now);
      }
      return next;
    }

    case 'cancel': {
      if (!isInCancelWindow(state, now)) return state;
      return finish(state, 'cancelled', now, now);
    }

    case 'giveUp': {
      // Giving up inside the cancel window is still just a cancel: no penalty.
      if (isInCancelWindow(state, now)) return finish(state, 'cancelled', now, now);
      const focusEnd = state.status === 'away' && state.awaySince !== null ? state.awaySince : now;
      return finish(state, 'wilted', now, focusEnd);
    }

    case 'stop': {
      if (state.config.mode !== 'stopwatch') return state;
      const elapsed = elapsedMs(state, now);
      const min = RULES.stopwatchMinMinutes * state.config.minuteMs;
      return finish(state, elapsed >= min ? 'completed' : 'cancelled', now, now);
    }
  }
}

/** Whole focused minutes for a finished (or in-progress) block. */
export function actualMinutes(state: EngineState, now: number): number {
  return Math.floor(elapsedMs(state, now) / state.config.minuteMs);
}

export function variantForMinutes(minutes: number): PlantVariant {
  if (minutes >= RULES.ancientMinutes) return 'ancient';
  if (minutes >= RULES.matureMinutes) return 'mature';
  return 'standard';
}

export interface DewInput {
  outcome: SessionOutcome;
  actualMinutes: number;
  strictness: Strictness;
  firstSessionOfDay: boolean;
}

/** 1 dew per completed minute, times the strictness multiplier, plus the first-of-day bonus. */
export function calculateDew(input: DewInput): number {
  if (input.outcome !== 'completed') return 0;
  const base = input.actualMinutes * RULES.dewPerMinute * RULES.dewMultiplier[input.strictness];
  const bonus = input.firstSessionOfDay ? RULES.firstSessionOfDayBonus : 0;
  return Math.round(base) + bonus;
}

/** Build the persisted Session record from a finished engine state. */
export function toSession(
  state: EngineState,
  opts: { id: string; dewEarned: number; note?: string },
): Session {
  if (state.status !== 'finished' || state.outcome === null || state.finishedAt === null) {
    throw new Error('toSession called on an unfinished block');
  }
  return {
    id: opts.id,
    startedAt: new Date(state.startedAt).toISOString(),
    endedAt: new Date(state.finishedAt).toISOString(),
    plannedMinutes: state.config.mode === 'stopwatch' ? 0 : state.config.plannedMinutes,
    actualMinutes: actualMinutes(state, state.finishedAt),
    mode: state.config.mode,
    strictness: state.config.strictness,
    speciesId: state.config.speciesId,
    tagId: state.config.tagId,
    outcome: state.outcome,
    note: opts.note ?? '',
    dewEarned: opts.dewEarned,
    round: state.config.round,
  };
}
