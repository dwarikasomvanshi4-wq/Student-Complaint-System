'use client';

import Badge from '@/components/ui/Badge';

/**
 * Displays a complaint priority as a colored badge.
 *
 * Requirements: 13.6
 *
 * @param {string} priority - The priority value (High, Medium, Low)
 * @param {string} [className] - Additional CSS classes
 */
export default function PriorityBadge({ priority, className }) {
  const variantMap = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
  };

  const variant = variantMap[priority] ?? 'default';

  return (
    <Badge variant={variant} className={className}>
      {priority}
    </Badge>
  );
}
