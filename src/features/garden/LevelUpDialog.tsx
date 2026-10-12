import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUiStore } from '@/app/store/uiStore';
import { useAppStore } from '@/app/store/appStore';
import { getLevelByNumber } from '@/data/gardenLevels';
import { Button } from '@/app/ui/Button';
import { GardenScene } from './GardenScene';
import { layoutGarden, restoration } from './layout';
import { useReducedMotion } from '@/app/useTheme';

/** Celebration with a before/after view when lifetime focus crosses a garden level threshold. */
export function LevelUpDialog() {
  const event = useUiStore((s) => s.levelUp);
  const clear = useUiStore((s) => s.setLevelUp);
  const plants = useAppStore((s) => s.plants);
  const decorations = useAppStore((s) => s.decorations);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (event) closeRef.current?.focus();
  }, [event]);

  if (!event) return null;
  const from = getLevelByNumber(event.from);
  const to = getLevelByNumber(event.to);
  const views = [from, to].map((level) => ({
    level,
    layout: layoutGarden(level, plants, decorations),
    restoration: restoration(level, plants),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
        className="card w-full max-w-lg p-5 text-center shadow-xl"
        initial={reduced ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="text-muted text-sm">Your garden grew</p>
        <h2 id="levelup-title" className="font-display mt-1 text-3xl font-semibold">
          {from.name} → {to.name}
        </h2>
        <p className="text-muted mt-2 text-sm">{to.blurb}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {views.map(({ level, layout, restoration: r }, i) => (
            <figure key={level.level}>
              <div className="overflow-hidden rounded-2xl bg-moss-50 dark:bg-moss-900">
                <GardenScene
                  level={level}
                  layout={layout}
                  restoration={r}
                  interactive={false}
                  width={220}
                  height={150}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="text-muted mt-1 text-xs">
                {i === 0 ? 'Before' : 'After'}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <Button ref={closeRef} variant="ghost" onClick={() => clear(null)}>
            Close
          </Button>
          <Button
            onClick={() => {
              clear(null);
              navigate('/garden');
            }}
          >
            See the garden
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
