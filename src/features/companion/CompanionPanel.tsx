import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EngineState } from '@/features/timer/engine';
import { elapsedMs, progress } from '@/features/timer/engine';
import { useAppStore } from '@/app/store/appStore';
import { Companion, type CompanionMood } from '@/art/Companion';
import { getSpecies } from '@/data/species';
import { pickMessage, type MessageKind } from './messages';
import { useReducedMotion } from '@/app/useTheme';

interface Props {
  engine: EngineState;
  now: number;
  size?: number;
}

const MOOD_CYCLE: CompanionMood[] = ['watering', 'idle', 'humming', 'watering', 'dozing', 'idle'];
const BUBBLE_MS = 8000;

/** Companion that tends the plant during a session: mood by state, short messages at key moments. */
export function CompanionPanel({ engine, now, size = 110 }: Props) {
  const name = useAppStore((s) => s.settings.companionName);
  const outfit = useAppStore((s) => s.settings.companionOutfitId);
  const species = useMemo(() => getSpecies(engine.config.speciesId), [engine.config.speciesId]);
  const reduced = useReducedMotion();

  const elapsed = elapsedMs(engine, now);
  const p = progress(engine, now);
  const phase = Math.floor(elapsed / 25_000);

  const [bubble, setBubble] = useState<{ text: string; until: number } | null>(null);
  const shown = useRef<Set<string>>(new Set());
  const lastLeave = useRef(engine.leaveCount);
  const seed = engine.startedAt % 97;

  const say = (kind: MessageKind, key: string, at: number) => {
    if (shown.current.has(key)) return;
    shown.current.add(key);
    setBubble({
      text: pickMessage(kind, seed + shown.current.size, {
        name,
        plant: species.name.toLowerCase(),
      }),
      until: at + BUBBLE_MS,
    });
  };

  useEffect(() => {
    if (engine.status === 'away') {
      say('away', 'away', now);
      return;
    }
    if (engine.leaveCount !== lastLeave.current) {
      lastLeave.current = engine.leaveCount;
      shown.current.delete('away');
      say(
        engine.config.strictness === 'gentle' || engine.config.allowLeaving
          ? 'gentleLeave'
          : 'back',
        `back-${engine.leaveCount}`,
        now,
      );
      return;
    }
    if (elapsed < 2000) say('start', 'start', now);
    else if (p >= 0.9) say('nearEnd', 'nearEnd', now);
    else if (p >= 0.5) say('mid', 'mid', now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.status, engine.leaveCount, elapsed < 2000, p >= 0.5, p >= 0.9]);

  const mood: CompanionMood =
    engine.status === 'away'
      ? 'worried'
      : engine.status === 'paused'
        ? 'dozing'
        : MOOD_CYCLE[(phase + Math.floor(seed)) % MOOD_CYCLE.length];

  const visible = bubble && now < bubble.until;

  return (
    <div className="flex items-end gap-2">
      <Companion mood={mood} outfitId={outfit} size={size} label={`${name}, ${mood}`} />
      <div className="min-h-12 max-w-48">
        <AnimatePresence>
          {visible && (
            <motion.p
              key={bubble.text}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0 }}
              className="card rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-snug"
              role="status"
            >
              {bubble.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Companion for the result screen: cheerful on success, briefly sad then kind on a wilt. */
export function ResultCompanion({
  outcome,
  minutes,
  plant,
}: {
  outcome: 'completed' | 'wilted' | 'cancelled';
  minutes: number;
  plant: string;
}) {
  const name = useAppStore((s) => s.settings.companionName);
  const outfit = useAppStore((s) => s.settings.companionOutfitId);
  const [kind, setKind] = useState(outcome === 'wilted');
  useEffect(() => {
    if (outcome !== 'wilted') return;
    const t = setTimeout(() => setKind(false), 2500);
    return () => clearTimeout(t);
  }, [outcome]);
  const mood: CompanionMood =
    outcome === 'completed' ? 'happy' : outcome === 'wilted' && kind ? 'sad' : 'idle';
  const text = pickMessage(
    outcome === 'completed' ? 'completion' : outcome === 'wilted' ? 'wilt' : 'cancel',
    minutes + plant.length,
    { name, minutes, plant },
  );
  return (
    <div className="flex items-end gap-2">
      <Companion mood={mood} outfitId={outfit} size={100} label={`${name}, ${mood}`} />
      <p
        className="card max-w-52 rounded-2xl rounded-bl-sm px-3 py-2 text-left text-sm leading-snug"
        role="status"
      >
        {text}
      </p>
    </div>
  );
}
