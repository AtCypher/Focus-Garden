import { AnimatePresence, motion } from 'framer-motion';
import type { GrowthStage, Species } from '@/types';
import { PlantArt } from '@/art/PlantArt';
import { useReducedMotion } from '@/app/useTheme';

interface Props {
  species: Species;
  growth: number;
  stage: GrowthStage;
  wilted?: boolean;
  size?: number;
  sway?: boolean;
}

/**
 * The plant on the timer screen. Growth within a stage is continuous; a stage change cross-fades.
 * Under prefers-reduced-motion stages simply swap (no sway, no fade).
 */
export function GrowingPlant({ species, growth, stage, wilted, size = 260, sway = true }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={stage}
          className={`absolute inset-0 ${sway && !reduced && !wilted ? 'plant-sway' : ''}`}
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.5 }}
        >
          <PlantArt species={species} growth={growth} wilted={wilted} size={size} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
