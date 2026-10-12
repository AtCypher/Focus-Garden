import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-moss-700 text-white hover:bg-moss-800 dark:bg-moss-400 dark:text-moss-950 dark:hover:bg-moss-300 shadow-sm',
  secondary:
    'bg-moss-100 text-moss-900 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-100 dark:hover:bg-moss-700',
  ghost: 'bg-transparent text-moss-800 hover:bg-moss-100 dark:text-moss-100 dark:hover:bg-moss-800',
  danger:
    'bg-soil-100 text-soil-800 hover:bg-soil-200 dark:bg-soil-900 dark:text-soil-100 dark:hover:bg-soil-800',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-14 px-6 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
});
