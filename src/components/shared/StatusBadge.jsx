'use client';

import Badge from '@/components/ui/Badge';

/**
 * Displays a complaint status as a colored badge.
 *
 * Requirements: 5.2, 13.6
 *
 * @param {string} status - The complaint status value
 * @param {string} [className] - Additional CSS classes
 */
export default function StatusBadge({ status, className }) {
  const variantMap = {
    Pending: 'warning',
    'Under Review': 'info',
    'In Progress': 'info',
    Resolved: 'success',
    Rejected: 'danger',
  };

  const variant = variantMap[status] ?? 'default';

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
