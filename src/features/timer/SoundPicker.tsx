import { useAppStore } from '@/app/store/appStore';
import { AMBIENT_OPTIONS, AmbientPlayer } from './audio';
import type { AmbientSound } from '@/types';

/** Compact ambient sound selector for the timer screen. */
export function SoundPicker({ className = '' }: { className?: string }) {
  const sound = useAppStore((s) => s.settings.ambientSound);
  const update = useAppStore((s) => s.updateSettings);
  if (!AmbientPlayer.supported()) return null;
  return (
    <label className={`text-muted inline-flex items-center gap-2 text-xs ${className}`}>
      <span>Sound</span>
      <select
        value={sound}
        onChange={(e) => update({ ambientSound: e.target.value as AmbientSound })}
        className="focus-ring rounded-full border border-moss-200 bg-white px-2 py-1 text-xs text-moss-900 dark:border-moss-700 dark:bg-moss-900 dark:text-moss-100"
        aria-label="Ambient sound"
      >
        {AMBIENT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
