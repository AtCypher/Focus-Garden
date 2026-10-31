import { useState, type ReactNode } from 'react';

export function Section({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="card p-4"
      aria-labelledby={`sec-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <h2
        id={`sec-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="text-base font-semibold"
      >
        {title}
      </h2>
      {description && <p className="text-muted mt-0.5 text-sm">{description}</p>}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export const inputClass =
  'focus-ring w-full rounded-xl border border-moss-200 bg-white px-3 py-2 text-base dark:border-moss-700 dark:bg-moss-900';

export function Row({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {hint && <span className="text-muted block text-xs font-normal">{hint}</span>}
      </label>
      <div className="sm:w-56">{children}</div>
    </div>
  );
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`focus-ring relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-moss-600 dark:bg-moss-400' : 'bg-moss-200 dark:bg-moss-700'}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

interface NumberFieldProps {
  id: string;
  value: number;
  onCommit: (value: number) => void;
  min: number;
  max: number;
  /** Used when the field is left empty. */
  fallback: number;
  step?: number;
  className?: string;
  'aria-label'?: string;
  title?: string;
}

/**
 * A number input that lets you type freely (including clearing it) and only normalises when you
 * leave the field or press Enter: empty becomes `fallback`, anything else is clamped to the range.
 */
export function NumberField({
  id,
  value,
  onCommit,
  min,
  max,
  fallback,
  step,
  className = '',
  title,
  ...rest
}: NumberFieldProps) {
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);
  const shown = editing ? text : String(value);
  const commit = () => {
    const n = text.trim() === '' ? fallback : Math.round(Number(text));
    const next = Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
    setEditing(false);
    if (next !== value) onCommit(next);
  };
  return (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={step}
      value={shown}
      title={title}
      aria-label={rest['aria-label']}
      className={`${inputClass} ${className}`}
      onFocus={() => {
        setText(String(value));
        setEditing(true);
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
    />
  );
}
