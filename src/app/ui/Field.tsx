import type { ReactNode } from 'react';

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
