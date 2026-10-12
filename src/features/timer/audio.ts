/**
 * Ambient sounds and the completion chime, synthesised with the Web Audio API. No audio files.
 * Everything is generated from noise and oscillators, so there is nothing to license or download.
 */
import type { AmbientSound } from '@/types';

export const AMBIENT_OPTIONS: { id: AmbientSound; name: string }[] = [
  { id: 'none', name: 'Silence' },
  { id: 'rain', name: 'Rain' },
  { id: 'forest', name: 'Forest' },
  { id: 'cafe', name: 'Café' },
  { id: 'stream', name: 'Stream' },
  { id: 'brown', name: 'Brown noise' },
];

type Ctx = AudioContext;

function noiseBuffer(
  ctx: Ctx,
  seconds = 4,
  kind: 'white' | 'pink' | 'brown' = 'white',
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0,
    last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === 'white') data[i] = white;
    else if (kind === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  return buffer;
}

function loopNoise(ctx: Ctx, kind: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 4, kind);
  src.loop = true;
  return src;
}

interface Voice {
  stop(): void;
}

function makeRain(ctx: Ctx, out: GainNode): Voice {
  const src = loopNoise(ctx, 'pink');
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 900;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 6000;
  src.connect(hp).connect(lp).connect(out);
  src.start();
  // Drops: short filtered bursts at random intervals.
  let timer: ReturnType<typeof setTimeout> | null = null;
  const drop = () => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, 0.1, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2500 + Math.random() * 3000;
    bp.Q.value = 4;
    n.connect(bp).connect(g).connect(out);
    n.start();
    timer = setTimeout(drop, 40 + Math.random() * 180);
  };
  drop();
  return {
    stop() {
      if (timer) clearTimeout(timer);
      src.stop();
    },
  };
}

function makeStream(ctx: Ctx, out: GainNode): Voice {
  const src = loopNoise(ctx, 'white');
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1200;
  bp.Q.value = 0.7;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 500;
  lfo.connect(lfoGain).connect(bp.frequency);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 4000;
  src.connect(bp).connect(lp).connect(out);
  src.start();
  lfo.start();
  return {
    stop() {
      src.stop();
      lfo.stop();
    },
  };
}

function makeBrown(ctx: Ctx, out: GainNode): Voice {
  const src = loopNoise(ctx, 'brown');
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 500;
  src.connect(lp).connect(out);
  src.start();
  return { stop: () => src.stop() };
}

function makeForest(ctx: Ctx, out: GainNode): Voice {
  // Wind: slow-modulated low noise. Birds: short chirps from a sine with a pitch sweep.
  const wind = loopNoise(ctx, 'pink');
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 700;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.3;
  lfo.connect(lfoGain).connect(windGain.gain);
  wind.connect(lp).connect(windGain).connect(out);
  wind.start();
  lfo.start();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const chirp = () => {
    const notes = 2 + Math.floor(Math.random() * 4);
    const base = 2200 + Math.random() * 1800;
    for (let i = 0; i < notes; i++) {
      const t = ctx.currentTime + i * 0.13;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * (1 + (Math.random() - 0.3) * 0.5), t + 0.1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 0.12);
    }
    timer = setTimeout(chirp, 2500 + Math.random() * 7000);
  };
  timer = setTimeout(chirp, 1500);
  return {
    stop() {
      if (timer) clearTimeout(timer);
      wind.stop();
      lfo.stop();
    },
  };
}

function makeCafe(ctx: Ctx, out: GainNode): Voice {
  // Murmur: band-limited brown noise with slow amplitude wobble, plus occasional cup clinks.
  const murmur = loopNoise(ctx, 'brown');
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 350;
  bp.Q.value = 0.5;
  const g = ctx.createGain();
  g.gain.value = 0.9;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.21;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.35;
  lfo.connect(lfoGain).connect(g.gain);
  murmur.connect(bp).connect(g).connect(out);
  murmur.start();
  lfo.start();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const clink = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 1800 + Math.random() * 1500;
    const eg = ctx.createGain();
    eg.gain.setValueAtTime(0.0001, t);
    eg.gain.exponentialRampToValueAtTime(0.08, t + 0.004);
    eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(eg).connect(out);
    osc.start(t);
    osc.stop(t + 0.3);
    timer = setTimeout(clink, 4000 + Math.random() * 12_000);
  };
  timer = setTimeout(clink, 3000);
  return {
    stop() {
      if (timer) clearTimeout(timer);
      murmur.stop();
      lfo.stop();
    },
  };
}

const VOICES: Record<Exclude<AmbientSound, 'none'>, (ctx: Ctx, out: GainNode) => Voice> = {
  rain: makeRain,
  stream: makeStream,
  brown: makeBrown,
  forest: makeForest,
  cafe: makeCafe,
};

export class AmbientPlayer {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private voice: Voice | null = null;
  private current: AmbientSound = 'none';

  static supported(): boolean {
    return (
      typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window)
    );
  }

  private ensure(): Ctx | null {
    if (!AmbientPlayer.supported()) return null;
    if (!this.ctx) {
      const AC = (window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext) as typeof AudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  get playing(): AmbientSound {
    return this.current;
  }

  /** Start (or switch to) a sound. Must be called from a user gesture the first time. */
  play(sound: AmbientSound, volume: number): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (ctx.state === 'suspended') void ctx.resume();
    this.setVolume(volume);
    if (sound === this.current) return;
    this.stopVoice();
    this.current = sound;
    if (sound === 'none') return;
    this.voice = VOICES[sound](ctx, this.master);
  }

  setVolume(volume: number): void {
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)) * 0.6,
        this.ctx.currentTime,
        0.1,
      );
  }

  private stopVoice(): void {
    try {
      this.voice?.stop();
    } catch {
      /* already stopped */
    }
    this.voice = null;
  }

  stop(): void {
    this.stopVoice();
    this.current = 'none';
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  /** Gentle three-note chime. */
  chime(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(ctx.destination);
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const t = ctx.currentTime + i * 0.18;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }
}

export const ambient = new AmbientPlayer();
