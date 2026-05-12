'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { cn, formatDate, truncate } from '@/lib/utils';

/**
 * Mobile-friendly card for displaying a single complaint summary.
 *
 * Requirements: 13.3
 *
 * @param {Object} complaint - Complaint object to display
 * @param {Function} [onView] - Handler for view action; button shown only when provided
 * @param {Function} [onEdit] - Handler for edit action; button shown only when provided
 * @param {Function} [onDelete] - Handler for delete action; button shown only when provided
 * @param {string} [className] - Additional CSS classes
 */
export default function ComplaintCard({ complaint, onView, onEdit, onDelete, className }) {
  const hasActions = onView || onEdit || onDelete;

  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      {/* Header: title + badges */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug">
          {complaint.title}
        </h3>
        <span className="text-xs text-slate-500">{complaint.category}</span>
      </div>

      {/* Status + Priority */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>

      {/* Description */}
      {complaint.description && (
        <p className="text-xs text-slate-600 leading-relaxed">
          {truncate(complaint.description, 120)}
        </p>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400">
          {complaint.createdAt ? formatDate(complaint.createdAt) : '—'}
        </span>

        {hasActions && (
          <div className="flex items-center gap-1">
            {onView && (
              <button
                onClick={() => onView(complaint)}
                title="View"
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                aria-label="View complaint"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(complaint)}
                title="Edit"
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                aria-label="Edit complaint"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(complaint)}
                title="Delete"
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                aria-label="Delete complaint"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
