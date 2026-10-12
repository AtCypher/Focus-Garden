import { useAppStore } from '@/app/store/appStore';
import { IconDew } from './icons';

export function DewPill({ className = '' }: { className?: string }) {
  const dew = useAppStore((s) => s.wallet.dew);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-dew-300/40 px-3 py-1 text-sm font-medium text-dew-600 dark:text-dew-300 ${className}`}
      aria-label={`${dew} dew`}
    >
      <IconDew width={16} height={16} /> {dew}
    </span>
  );
}
