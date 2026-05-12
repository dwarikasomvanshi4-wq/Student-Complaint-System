'use client';

import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Empty state placeholder shown when a list or section has no content.
 *
 * Requirements: 13.6
 *
 * @param {React.ComponentType} [icon] - Lucide icon component to display; defaults to Inbox
 * @param {string} title - Primary message
 * @param {string} [description] - Secondary explanatory text
 * @param {React.ReactNode} [action] - Optional action button or link
 * @param {string} [className] - Additional CSS classes
 */
export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <Icon className="h-12 w-12 text-slate-400 mb-4" aria-hidden="true" />
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
