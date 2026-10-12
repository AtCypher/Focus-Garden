import { IconMinus, IconPlus } from '@/app/ui/icons';
import { RULES } from './rules';

interface Props {
  value: number;
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const PRESETS = [15, 25, 45, 60, 90];

export function DurationPicker({
  value,
  onChange,
  min = RULES.countdownMinMinutes,
  max = RULES.countdownMaxMinutes,
  step = RULES.countdownStepMinutes,
  label = 'Duration',
}: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step));
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  const text = hours ? `${hours}h${mins ? ` ${mins}m` : ''}` : `${mins} min`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-moss-100 text-moss-800 hover:bg-moss-200 disabled:opacity-40 dark:bg-moss-800 dark:text-moss-100"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Decrease by ${step} minutes`}
        >
          <IconMinus />
        </button>
        <output
          className="font-display min-w-24 text-center text-3xl font-semibold tabular-nums"
          aria-live="polite"
        >
          {text}
        </output>
        <button
          type="button"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-moss-100 text-moss-800 hover:bg-moss-200 disabled:opacity-40 dark:bg-moss-800 dark:text-moss-100"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Increase by ${step} minutes`}
        >
          <IconPlus />
        </button>
      </div>
      <input
        type="range"
        className="mt-3 w-full accent-moss-700 dark:accent-moss-400"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        aria-label={`${label} in minutes`}
      />
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Quick durations">
        {PRESETS.filter((p) => p >= min && p <= max).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={value === p}
            className={`focus-ring rounded-full px-3 py-1 text-sm transition-colors ${
              value === p
                ? 'bg-moss-700 text-white dark:bg-moss-400 dark:text-moss-950'
                : 'bg-moss-100 text-moss-800 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
