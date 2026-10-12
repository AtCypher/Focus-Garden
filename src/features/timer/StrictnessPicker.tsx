import type { Strictness } from '@/types';
import { STRICTNESS_LABELS } from './rules';

interface Props {
  value: Strictness;
  onChange: (s: Strictness) => void;
  disabled?: boolean;
}

const ORDER: Strictness[] = ['gentle', 'standard', 'deep'];

export function StrictnessPicker({ value, onChange, disabled }: Props) {
  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="mb-2 text-sm font-medium">Strictness</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {ORDER.map((s) => {
          const checked = s === value;
          return (
            <label
              key={s}
              className={`focus-ring cursor-pointer rounded-2xl border p-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-dew-500 ${
                checked
                  ? 'border-moss-600 bg-moss-50 dark:border-moss-400 dark:bg-moss-800'
                  : 'border-moss-100 hover:border-moss-300 dark:border-moss-800 dark:hover:border-moss-600'
              }`}
            >
              <input
                type="radio"
                name="strictness"
                value={s}
                checked={checked}
                onChange={() => onChange(s)}
                className="sr-only"
              />
              <span className="block font-medium">{STRICTNESS_LABELS[s].name}</span>
              <span className="text-muted mt-0.5 block text-xs leading-snug">
                {STRICTNESS_LABELS[s].summary}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
