'use client';

import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const variantClasses = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 border border-transparent',
  secondary:
    'bg-slate-600 text-white hover:bg-slate-700 focus-visible:ring-slate-500 border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border border-transparent',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 border border-slate-300',
};

/**
 * Reusable button component with variant styles, loading state, and disabled support.
 *
 * Requirements: 13.3, 13.6
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} [variant='primary'] - Visual style variant
 * @param {boolean} [loading=false] - Shows a spinner and disables the button when true
 * @param {boolean} [disabled] - Disables the button
 * @param {React.ReactNode} children - Button content
 * @param {string} [className] - Additional CSS classes
 */
export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className,
  ...props
}) {
  const isDisabled = loading || disabled;

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        // Disabled state
        isDisabled && 'cursor-not-allowed opacity-60',
        // Variant
        variantClasses[variant] ?? variantClasses.primary,
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
