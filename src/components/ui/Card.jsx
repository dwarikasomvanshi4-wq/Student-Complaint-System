'use client';

import { cn } from '@/lib/utils';

/**
 * White card container with rounded corners, shadow, and padding.
 *
 * Requirements: 13.3
 *
 * @param {React.ReactNode} children - Card content
 * @param {string} [className] - Additional CSS classes
 */
export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
