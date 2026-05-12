'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable input component with optional label, error message, and left icon.
 *
 * Requirements: 13.3
 *
 * @param {string} [label] - Label text displayed above the input
 * @param {string} [error] - Error message displayed below the input in red
 * @param {React.ReactNode} [icon] - Icon node rendered inside the input on the left
 * @param {string} [id] - HTML id for the input (links label)
 * @param {string} [className] - Additional CSS classes for the input element
 */
const Input = forwardRef(function Input(
  { label, error, icon, id, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
            'placeholder:text-slate-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            // Shift text right when icon is present
            icon && 'pl-10',
            // Error state border
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300',
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
