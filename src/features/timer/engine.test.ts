import { describe, expect, it } from 'vitest';
import {
  actualMinutes,
  calculateDew,
  elapsedMs,
  growthStage,
  isInCancelWindow,
  progress,
  reduce,
  remainingMs,
  start,
  toSession,
  variantForMinutes,
  type EngineConfig,
  type EngineState,
} from './engine';

const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 12, 9, 0, 0);

function config(over: Partial<EngineConfig> = {}): EngineConfig {
  return {
    mode: 'countdown',
    plannedMinutes: 25,
    strictness: 'standard',
    speciesId: 'daisy',
    tagId: null,
    round: null,
    minuteMs: MIN,
    ...over,
  };
}

function run(
  state: EngineState,
  steps: Array<[type: Parameters<typeof reduce>[1]['type'], at: number]>,
) {
  return steps.reduce((s, [type, at]) => reduce(s, { type }, T0 + at), state);
}

describe('countdown', () => {
  it('counts down from the planned length using wall-clock time', () => {
    const s = start(config(), T0);
    expect(remainingMs(s, T0)).toBe(25 * MIN);
    expect(remainingMs(s, T0 + 10 * MIN)).toBe(15 * MIN);
    expect(progress(s, T0 + 12.5 * MIN)).toBeCloseTo(0.5);
  });

  it('completes when the end time passes, even if ticks were missed (device slept)', () => {
    const s = start(config(), T0);
    // No ticks for 40 minutes, then one tick.
    const done = reduce(s, { type: 'tick' }, T0 + 40 * MIN);
    expect(done.status).toBe('finished');
    expect(done.outcome).toBe('completed');
    expect(actualMinutes(done, T0 + 40 * MIN)).toBe(25);
    expect(remainingMs(done, T0 + 40 * MIN)).toBe(0);
  });

  it('does not complete one tick early', () => {
    const s = start(config(), T0);
    const almost = reduce(s, { type: 'tick' }, T0 + 25 * MIN - 1);
    expect(almost.status).toBe('running');
    expect(reduce(almost, { type: 'tick' }, T0 + 25 * MIN).status).toBe('finished');
  });

  it('is unaffected by the number or spacing of ticks (throttled tab)', () => {
    const s = start(config({ plannedMinutes: 10 }), T0);
    const a = run(s, [
      ['tick', 1000],
      ['tick', 2000],
      ['tick', 3000],
    ]);
    const b = run(s, [['tick', 4 * MIN]]);
    expect(remainingMs(a, T0 + 4 * MIN)).toBe(remainingMs(b, T0 + 4 * MIN));
    expect(remainingMs(a, T0 + 4 * MIN)).toBe(6 * MIN);
  });
});

describe('cancel window', () => {
  it('allows a free cancel in the first 10 seconds', () => {
    const s = start(config(), T0);
    expect(isInCancelWindow(s, T0 + 9_999)).toBe(true);
    const c = reduce(s, { type: 'cancel' }, T0 + 5_000);
    expect(c.outcome).toBe('cancelled');
  });

  it('ignores cancel after the window; give up then wilts', () => {
    const s = start(config(), T0);
    expect(isInCancelWindow(s, T0 + 10_000)).toBe(false);
    const stillRunning = reduce(s, { type: 'cancel' }, T0 + 10_000);
    expect(stillRunning.status).toBe('running');
    const gaveUp = reduce(stillRunning, { type: 'giveUp' }, T0 + 5 * MIN);
    expect(gaveUp.outcome).toBe('wilted');
    expect(actualMinutes(gaveUp, T0 + 5 * MIN)).toBe(5);
  });

  it('treats give up inside the window as a free cancel', () => {
    const s = start(config({ strictness: 'deep' }), T0);
    expect(reduce(s, { type: 'giveUp' }, T0 + 3_000).outcome).toBe('cancelled');
  });
});

describe('strictness: standard grace', () => {
  it('wilts when the user does not return within 15 seconds', () => {
    const s = start(config(), T0);
    const away = reduce(s, { type: 'hide' }, T0 + 5 * MIN);
    expect(away.status).toBe('away');
    expect(away.graceEndsAt).toBe(T0 + 5 * MIN + 15_000);
    const back = reduce(away, { type: 'show' }, T0 + 5 * MIN + 16_000);
    expect(back.outcome).toBe('wilted');
    // Focus credit stops when the user left.
    expect(actualMinutes(back, T0 + 5 * MIN + 16_000)).toBe(5);
  });

  it('keeps the plant when the user returns in time', () => {
    const s = start(config(), T0);
    const back = run(s, [
      ['hide', 5 * MIN],
      ['show', 5 * MIN + 14_000],
    ]);
    expect(back.status).toBe('running');
    expect(back.leaveCount).toBe(1);
    expect(remainingMs(back, T0 + 6 * MIN)).toBe(19 * MIN);
  });

  it('wilts on a tick after the grace even without a show event', () => {
    const s = start(config(), T0);
    const gone = run(s, [
      ['hide', MIN],
      ['tick', MIN + 15_000],
    ]);
    expect(gone.outcome).toBe('wilted');
  });

  it('wilts when the phone slept past the grace period', () => {
    const s = start(config(), T0);
    const gone = run(s, [
      ['hide', MIN],
      ['show', 3 * 60 * MIN],
    ]);
    expect(gone.outcome).toBe('wilted');
  });

  it('completes instead of wilting if the plant finished growing during the grace period', () => {
    const s = start(config({ plannedMinutes: 10 }), T0);
    const done = run(s, [
      ['hide', 10 * MIN - 5_000],
      ['show', 10 * MIN + 20_000],
    ]);
    expect(done.outcome).toBe('completed');
    expect(actualMinutes(done, T0 + 10 * MIN + 20_000)).toBe(10);
  });

  it('completes on a tick while away if the end passed before the grace', () => {
    const s = start(config({ plannedMinutes: 10 }), T0);
    const done = run(s, [
      ['hide', 10 * MIN - 5_000],
      ['tick', 10 * MIN + 1],
    ]);
    expect(done.outcome).toBe('completed');
  });

  it('cannot pause in standard mode', () => {
    const s = start(config(), T0);
    expect(reduce(s, { type: 'pause' }, T0 + MIN).status).toBe('running');
  });
});

describe('strictness: deep focus', () => {
  it('uses a 5-second grace', () => {
    const s = start(config({ strictness: 'deep' }), T0);
    const away = reduce(s, { type: 'hide' }, T0 + MIN);
    expect(away.graceEndsAt).toBe(T0 + MIN + 5_000);
    expect(reduce(away, { type: 'show' }, T0 + MIN + 4_999).status).toBe('running');
    expect(reduce(away, { type: 'show' }, T0 + MIN + 5_000).outcome).toBe('wilted');
  });
});

describe('strictness: gentle', () => {
  it('never wilts on leaving, but counts the leave', () => {
    const s = start(config({ strictness: 'gentle' }), T0);
    const after = run(s, [
      ['hide', MIN],
      ['show', 10 * MIN],
    ]);
    expect(after.status).toBe('running');
    expect(after.leaveCount).toBe(1);
  });

  it('allows up to 3 pauses and shifts the end time by the paused duration', () => {
    const s = start(config({ strictness: 'gentle' }), T0);
    let st = run(s, [
      ['pause', 5 * MIN],
      ['resume', 7 * MIN],
    ]);
    expect(st.pausesUsed).toBe(1);
    expect(st.endsAt).toBe(T0 + 27 * MIN);
    expect(remainingMs(st, T0 + 7 * MIN)).toBe(20 * MIN);
    st = run(st, [
      ['pause', 8 * MIN],
      ['resume', 8 * MIN + 30_000],
    ]);
    st = run(st, [
      ['pause', 9 * MIN],
      ['resume', 9 * MIN + 30_000],
    ]);
    expect(st.pausesUsed).toBe(3);
    const fourth = reduce(st, { type: 'pause' }, T0 + 10 * MIN);
    expect(fourth.status).toBe('running');
  });

  it('caps a pause at 5 minutes and auto-resumes', () => {
    const s = start(config({ strictness: 'gentle' }), T0);
    const paused = reduce(s, { type: 'pause' }, T0 + 5 * MIN);
    // While paused, elapsed does not grow.
    expect(elapsedMs(paused, T0 + 7 * MIN)).toBe(5 * MIN);
    // 20 minutes later the pause has long expired: it counted as 5 minutes.
    const resumed = reduce(paused, { type: 'tick' }, T0 + 25 * MIN);
    expect(resumed.status).toBe('running');
    expect(resumed.pausedTotalMs).toBe(5 * MIN);
    expect(resumed.endsAt).toBe(T0 + 30 * MIN);
    expect(remainingMs(resumed, T0 + 25 * MIN)).toBe(5 * MIN);
  });

  it('completes on resume if the shifted end has already passed', () => {
    const s = start(config({ strictness: 'gentle', plannedMinutes: 10 }), T0);
    const paused = reduce(s, { type: 'pause' }, T0 + 9 * MIN);
    // Pause capped at 5 min -> end shifts to 15:00; resume at 20:00 is past it.
    const done = reduce(paused, { type: 'resume' }, T0 + 20 * MIN);
    expect(done.outcome).toBe('completed');
    expect(actualMinutes(done, T0 + 20 * MIN)).toBe(10);
  });
});

describe('stopwatch', () => {
  it('has no end time and grows fully by 10 minutes', () => {
    const s = start(config({ mode: 'stopwatch', plannedMinutes: 0 }), T0);
    expect(remainingMs(s, T0)).toBeNull();
    expect(progress(s, T0 + 5 * MIN)).toBeCloseTo(0.5);
    expect(progress(s, T0 + 30 * MIN)).toBe(1);
  });

  it('stopping before 10 minutes is a cancel, not a wilt', () => {
    const s = start(config({ mode: 'stopwatch', plannedMinutes: 0 }), T0);
    expect(reduce(s, { type: 'stop' }, T0 + 9 * MIN + 59_000).outcome).toBe('cancelled');
  });

  it('stopping after 10 minutes completes with the elapsed minutes', () => {
    const s = start(config({ mode: 'stopwatch', plannedMinutes: 0 }), T0);
    const done = reduce(s, { type: 'stop' }, T0 + 47 * MIN + 30_000);
    expect(done.outcome).toBe('completed');
    expect(actualMinutes(done, T0 + 48 * MIN)).toBe(47);
  });

  it('auto-completes at the 180 minute cap', () => {
    const s = start(config({ mode: 'stopwatch', plannedMinutes: 0 }), T0);
    expect(reduce(s, { type: 'tick' }, T0 + 179 * MIN).status).toBe('running');
    const done = reduce(s, { type: 'tick' }, T0 + 181 * MIN);
    expect(done.outcome).toBe('completed');
    expect(actualMinutes(done, T0 + 181 * MIN)).toBe(181);
  });

  it('still wilts in strict mode when the user leaves', () => {
    const s = start(config({ mode: 'stopwatch', plannedMinutes: 0 }), T0);
    const gone = run(s, [
      ['hide', 20 * MIN],
      ['show', 21 * MIN],
    ]);
    expect(gone.outcome).toBe('wilted');
    expect(actualMinutes(gone, T0 + 21 * MIN)).toBe(20);
  });
});

describe('speed flag', () => {
  it('compresses logical minutes but keeps the cancel window and grace in real seconds', () => {
    const s = start(config({ minuteMs: 1000, plannedMinutes: 10 }), T0);
    expect(remainingMs(s, T0)).toBe(10_000);
    expect(isInCancelWindow(s, T0 + 9_000)).toBe(true);
    expect(reduce(s, { type: 'tick' }, T0 + 10_000).outcome).toBe('completed');
    const away = reduce(s, { type: 'hide' }, T0 + 2000);
    expect(away.graceEndsAt).toBe(T0 + 2000 + 15_000);
  });
});

describe('growth stages and variants', () => {
  it('maps progress to stages', () => {
    expect(growthStage(0)).toBe('seed');
    expect(growthStage(0.2)).toBe('sprout');
    expect(growthStage(0.6)).toBe('sapling');
    expect(growthStage(1)).toBe('full');
  });

  it('picks variants by length', () => {
    expect(variantForMinutes(25)).toBe('standard');
    expect(variantForMinutes(60)).toBe('mature');
    expect(variantForMinutes(119)).toBe('mature');
    expect(variantForMinutes(120)).toBe('ancient');
  });
});

describe('dew', () => {
  it('pays 1 per minute with strictness multipliers and the first-of-day bonus', () => {
    expect(
      calculateDew({
        outcome: 'completed',
        actualMinutes: 25,
        strictness: 'gentle',
        firstSessionOfDay: false,
      }),
    ).toBe(25);
    expect(
      calculateDew({
        outcome: 'completed',
        actualMinutes: 25,
        strictness: 'standard',
        firstSessionOfDay: false,
      }),
    ).toBe(28);
    expect(
      calculateDew({
        outcome: 'completed',
        actualMinutes: 25,
        strictness: 'deep',
        firstSessionOfDay: false,
      }),
    ).toBe(31);
    expect(
      calculateDew({
        outcome: 'completed',
        actualMinutes: 25,
        strictness: 'gentle',
        firstSessionOfDay: true,
      }),
    ).toBe(30);
  });

  it('pays nothing for wilted or cancelled sessions', () => {
    expect(
      calculateDew({
        outcome: 'wilted',
        actualMinutes: 25,
        strictness: 'deep',
        firstSessionOfDay: true,
      }),
    ).toBe(0);
    expect(
      calculateDew({
        outcome: 'cancelled',
        actualMinutes: 0,
        strictness: 'deep',
        firstSessionOfDay: true,
      }),
    ).toBe(0);
  });
});

describe('toSession', () => {
  it('builds a session record from a finished block', () => {
    const s = start(config({ tagId: 'study' }), T0);
    const done = reduce(s, { type: 'tick' }, T0 + 25 * MIN + 2000);
    const session = toSession(done, { id: 'abc', dewEarned: 28 });
    expect(session).toMatchObject({
      id: 'abc',
      plannedMinutes: 25,
      actualMinutes: 25,
      mode: 'countdown',
      strictness: 'standard',
      speciesId: 'daisy',
      tagId: 'study',
      outcome: 'completed',
      dewEarned: 28,
      note: '',
      round: null,
    });
    expect(session.startedAt).toBe(new Date(T0).toISOString());
  });

  it('throws for an unfinished block', () => {
    expect(() => toSession(start(config(), T0), { id: 'x', dewEarned: 0 })).toThrow();
  });
});
