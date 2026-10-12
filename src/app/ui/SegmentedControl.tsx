import { useId } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface Props<T extends string> {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Radio group styled as a pill control. Keyboard: arrows move, Space selects. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className = '',
}: Props<T>) {
  const id = useId();
  return (
    <fieldset className={className}>
      <legend className="sr-only">{label}</legend>
      <div
        className="grid rounded-full bg-moss-100 p-1 dark:bg-moss-800"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((opt) => {
          const checked = opt.value === value;
          const inputId = `${id}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={`focus-ring relative cursor-pointer rounded-full px-3 py-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-dew-500 ${
                checked
                  ? 'bg-white text-moss-900 shadow-sm dark:bg-moss-600 dark:text-white'
                  : 'text-moss-700 hover:text-moss-900 dark:text-moss-200'
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={id}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
                aria-describedby={opt.description ? `${inputId}-desc` : undefined}
              />
              {opt.label}
              {opt.description && (
                <span id={`${inputId}-desc`} className="sr-only">
                  {opt.description}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
