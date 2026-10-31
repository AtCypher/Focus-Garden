import { useAppStore } from '@/app/store/appStore';
import { AMBIENT_OPTIONS, AmbientPlayer } from './audio';
import type { AmbientSound } from '@/types';

/** Compact two-layer ambient mixer for the timer screen. Volumes live in Settings. */
export function SoundPicker({ className = '' }: { className?: string }) {
  const sound = useAppStore((s) => s.settings.ambientSound);
  const sound2 = useAppStore((s) => s.settings.ambientSound2);
  const volume = useAppStore((s) => s.settings.ambientVolume);
  const volume2 = useAppStore((s) => s.settings.ambientVolume2);
  const update = useAppStore((s) => s.updateSettings);
  if (!AmbientPlayer.supported()) return null;
  const select = (value: AmbientSound, onChange: (v: AmbientSound) => void, label: string) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AmbientSound)}
      className="focus-ring rounded-full border border-moss-200 bg-white px-2 py-1 text-xs text-moss-900 dark:border-moss-700 dark:bg-moss-900 dark:text-moss-100"
      aria-label={label}
    >
      {AMBIENT_OPTIONS.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
  return (
    <div
      className={`text-muted inline-flex flex-wrap items-center justify-center gap-2 text-xs ${className}`}
    >
      <span>Sound</span>
      {select(sound, (v) => update({ ambientSound: v }), 'Ambient sound')}
      <span>+</span>
      {select(sound2, (v) => update({ ambientSound2: v }), 'Second ambient sound')}
      {(sound !== 'none' || sound2 !== 'none') && (
        <span className="flex w-full items-center justify-center gap-2">
          {sound !== 'none' && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => update({ ambientVolume: Number(e.target.value) })}
              aria-label="Volume of the first sound"
              className="w-24 accent-moss-700 dark:accent-moss-400"
            />
          )}
          {sound2 !== 'none' && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume2}
              onChange={(e) => update({ ambientVolume2: Number(e.target.value) })}
              aria-label="Volume of the second sound"
              className="w-24 accent-moss-700 dark:accent-moss-400"
            />
          )}
        </span>
      )}
    </div>
  );
}
