'use client';

import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Dashboard statistics card showing a label, value, and icon.
 *
 * Requirements: 10.3, 13.3
 *
 * @param {string} label - Descriptive label for the stat
 * @param {string|number} value - The statistic value to display
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {'indigo'|'emerald'|'amber'|'red'} [color='indigo'] - Icon color theme
 * @param {string} [className] - Additional CSS classes
 */
export default function StatsCard({ label, value, icon: Icon, color = 'indigo', className }) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  const iconBg = colorClasses[color] ?? colorClasses.indigo;

  return (
    <Card className={cn('flex items-center justify-between p-4 sm:p-6', className)}>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">{label}</span>
        <span className="text-xl sm:text-2xl font-bold text-slate-800">{value}</span>
      </div>
      {Icon && (
        <div className={cn('flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full ml-2', iconBg)}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
      )}
    </Card>
  );
}
