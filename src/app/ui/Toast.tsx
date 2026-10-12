import { AnimatePresence, motion } from 'framer-motion';
import { useUiStore } from '@/app/store/uiStore';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:bottom-6"
      aria-live="polite"
    >
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto rounded-full bg-moss-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-moss-100 dark:text-moss-950"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
