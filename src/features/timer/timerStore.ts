/**
 * Timer store: wraps the pure engine with a clock, Pomodoro breaks, and an in-progress snapshot in
 * localStorage so a reload does not lose the plant. Side effects (notifications, wake lock, haptics)
 * live in sessionController.ts; this store only manages state.
 */
import { create } from 'zustand';
import type { PomodoroConfig, Strictness, TimerMode } from '@/types';
import { reduce, start, type EngineConfig, type EngineEvent, type EngineState } from './engine';
import { startBreak, type BreakState } from './pomodoro';
import { resolveMinuteMs } from './speed';

const SNAPSHOT_KEY = 'grove.activeSession';

export interface PlantRequest {
  mode: TimerMode;
  minutes: number;
  strictness: Strictness;
  speciesId: string;
  tagId: string | null;
  pomodoro: PomodoroConfig;
  /** Pomodoro round to start (1-based). */
  round?: number;
}

interface Snapshot {
  engine: EngineState | null;
  breakState: BreakState | null;
  pomodoro: PomodoroConfig | null;
  request: PlantRequest | null;
  /** When the page was hidden/unloaded, so a reload can apply the right grace. */
  hiddenAt: number | null;
}

export type FinishListener = (state: EngineState) => void;
const finishListeners = new Set<FinishListener>();

export function onSessionFinished(listener: FinishListener): () => void {
  finishListeners.add(listener);
  return () => finishListeners.delete(listener);
}

function emitFinished(state: EngineState) {
  finishListeners.forEach((l) => {
    try {
      l(state);
    } catch (err) {
      console.error('[grove] finish listener failed', err);
    }
  });
}

function saveSnapshot(s: Snapshot) {
  try {
    if (!s.engine && !s.breakState) localStorage.removeItem(SNAPSHOT_KEY);
    else localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: a reload just loses the running session */
  }
}

function loadSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

export interface TimerState {
  engine: EngineState | null;
  /** Finished block waiting for the user to acknowledge the result screen. */
  result: EngineState | null;
  breakState: BreakState | null;
  /** The request that started the current Pomodoro set, for "next round". */
  request: PlantRequest | null;
  now: number;
  minuteMs: number;

  plant(req: PlantRequest): void;
  dispatch(event: EngineEvent): void;
  tick(): void;
  skipBreak(): void;
  endBreak(): void;
  dismissResult(): void;
  /** Called once at startup to restore a running session after a reload. */
  restore(now: number): void;
  markHidden(now: number): void;
}

export const useTimerStore = create<TimerState>()((set, get) => {
  const minuteMs = resolveMinuteMs();

  function commit(engine: EngineState | null, extra: Partial<TimerState> = {}) {
    const prev = get().engine;
    const finishedNow = engine && engine.status === 'finished' && prev?.status !== 'finished';
    if (finishedNow) {
      const req = get().request;
      let breakState: BreakState | null = null;
      if (engine.config.mode === 'pomodoro' && engine.outcome === 'completed' && req) {
        breakState = startBreak(
          req.pomodoro,
          engine.config.round ?? 1,
          engine.finishedAt ?? Date.now(),
          minuteMs,
        );
      }
      set({ engine: null, result: engine, breakState, request: breakState ? req : null, ...extra });
      saveSnapshot({
        engine: null,
        breakState,
        pomodoro: req?.pomodoro ?? null,
        request: breakState ? req : null,
        hiddenAt: null,
      });
      emitFinished(engine);
      return;
    }
    set({ engine, ...extra });
    saveSnapshot({
      engine,
      breakState: get().breakState,
      pomodoro: get().request?.pomodoro ?? null,
      request: get().request,
      hiddenAt: null,
    });
  }

  return {
    engine: null,
    result: null,
    breakState: null,
    request: null,
    now: Date.now(),
    minuteMs,

    plant(req) {
      const now = Date.now();
      const config: EngineConfig = {
        mode: req.mode,
        plannedMinutes:
          req.mode === 'stopwatch'
            ? 0
            : req.mode === 'pomodoro'
              ? req.pomodoro.focusMinutes
              : req.minutes,
        strictness: req.strictness,
        speciesId: req.speciesId,
        tagId: req.tagId,
        round: req.mode === 'pomodoro' ? (req.round ?? 1) : null,
        minuteMs,
      };
      set({ request: req, breakState: null, result: null, now });
      commit(start(config, now));
    },

    dispatch(event) {
      const engine = get().engine;
      if (!engine) return;
      const now = Date.now();
      const next = reduce(engine, event, now);
      if (next !== engine) commit(next, { now });
      else set({ now });
    },

    tick() {
      const now = Date.now();
      const { engine, breakState } = get();
      if (engine) {
        const next = reduce(engine, { type: 'tick' }, now);
        if (next !== engine) commit(next, { now });
        else set({ now });
      } else {
        set({ now });
      }
      if (breakState && now >= breakState.endsAt) {
        // Break is over; keep the state so the UI can offer "start next round".
        set({ now });
      }
    },

    skipBreak() {
      const b = get().breakState;
      if (!b) return;
      set({ breakState: { ...b, endsAt: Date.now() } });
    },

    endBreak() {
      set({ breakState: null, request: null });
      saveSnapshot({
        engine: null,
        breakState: null,
        pomodoro: null,
        request: null,
        hiddenAt: null,
      });
    },

    dismissResult() {
      set({ result: null });
    },

    restore(now) {
      const snap = loadSnapshot();
      if (!snap) return;
      let engine = snap.engine;
      if (engine && engine.status !== 'finished') {
        // Speed may differ between sessions; keep whatever the block was started with.
        if (snap.hiddenAt !== null && engine.status === 'running') {
          engine = reduce(engine, { type: 'hide' }, snap.hiddenAt);
        }
        engine = reduce(engine, { type: 'show' }, now);
        engine = reduce(engine, { type: 'tick' }, now);
      }
      set({ request: snap.request, breakState: snap.breakState, now });
      if (engine) commit(engine, { now });
      else saveSnapshot({ ...snap, engine: null, hiddenAt: null });
    },

    markHidden(now) {
      const { engine, breakState, request } = get();
      if (!engine && !breakState) return;
      saveSnapshot({
        engine,
        breakState,
        pomodoro: request?.pomodoro ?? null,
        request,
        hiddenAt: now,
      });
    },
  };
});
