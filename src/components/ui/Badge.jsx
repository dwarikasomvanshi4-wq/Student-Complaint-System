'use client';

import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

/**
 * Small pill-shaped badge for status and category labels.
 *
 * Requirements: 13.6
 *
 * @param {'default'|'success'|'warning'|'danger'|'info'} [variant='default'] - Color variant
 * @param {React.ReactNode} children - Badge content
 * @param {string} [className] - Additional CSS classes
 */
export default function Badge({ variant = 'default', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
    >
      {children}
    </span>
  );
}
