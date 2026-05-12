'use client';

import { useState } from 'react';
import { Eye, Pencil, Trash2, UserPlus, ChevronUp, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import EmptyState from '@/components/shared/EmptyState';
import Card from '@/components/ui/Card';
import { cn, formatDate, truncate } from '@/lib/utils';

/**
 * Responsive complaint display:
 * - Mobile (< md): card list view
 * - Desktop (≥ md): sortable table
 */
export default function ComplaintTable({
  complaints = [],
  onView,
  onEdit,
  onDelete,
  onAssign,
  showActions = true,
  className,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...complaints].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const hasActions = showActions && (onView || onEdit || onDelete || onAssign);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'createdAt', label: 'Date' },
  ];

  function SortIcon({ colKey }) {
    if (sortKey !== colKey)
      return <ChevronDown className="ml-1 inline h-3 w-3 text-slate-400" aria-hidden="true" />;
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline h-3 w-3 text-slate-600" aria-hidden="true" />
      : <ChevronDown className="ml-1 inline h-3 w-3 text-slate-600" aria-hidden="true" />;
  }

  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints found"
        description="There are no complaints to display."
        className={className}
      />
    );
  }

  const ActionButtons = ({ complaint }) => (
    <div className="flex items-center gap-1">
      {onView && (
        <button onClick={() => onView(complaint)} title="View"
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
          aria-label="View complaint">
          <Eye className="h-4 w-4" />
        </button>
      )}
      {onEdit && (
        <button onClick={() => onEdit(complaint)} title="Edit"
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
          aria-label="Edit complaint">
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {onAssign && (
        <button onClick={() => onAssign(complaint)} title="Assign"
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
          aria-label="Assign complaint">
          <UserPlus className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(complaint)} title="Delete"
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors"
          aria-label="Delete complaint">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {/* ── Mobile card list (hidden on md+) ── */}
      <div className="md:hidden space-y-3">
        {sorted.map((complaint) => (
          <Card key={complaint._id ?? complaint.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800 leading-snug flex-1 min-w-0 truncate">
                {complaint.title}
              </h3>
              {hasActions && <ActionButtons complaint={complaint} />}
            </div>
            <p className="text-xs text-slate-500">{complaint.category}</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            {complaint.description && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {truncate(complaint.description, 100)}
              </p>
            )}
            <p className="text-xs text-slate-400">
              {complaint.createdAt ? formatDate(complaint.createdAt) : '—'}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map(({ key, label }) => (
                <th key={key} scope="col" onClick={() => handleSort(key)}
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700">
                  {label}<SortIcon colKey={key} />
                </th>
              ))}
              {hasActions && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((complaint) => (
              <tr key={complaint._id ?? complaint.id} className="hover:bg-slate-50 transition-colors">
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-800">
                  {complaint.title}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{complaint.category}</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={complaint.status} /></td>
                <td className="whitespace-nowrap px-4 py-3"><PriorityBadge priority={complaint.priority} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {complaint.createdAt ? formatDate(complaint.createdAt) : '—'}
                </td>
                {hasActions && (
                  <td className="whitespace-nowrap px-4 py-3">
                    <ActionButtons complaint={complaint} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
