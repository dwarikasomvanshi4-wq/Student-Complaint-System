'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { cn } from '@/lib/utils';

/**
 * Icon map — resolves icon name strings to Lucide components.
 */
const ICON_MAP = {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  Users,
  ClipboardList,
};

/**
 * Role-aware navigation link definitions (mirrors Sidebar).
 */
const NAV_LINKS = {
  [ROLES.STUDENT]: [
    { href: '/dashboard/student', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/student/complaints', label: 'My Complaints', icon: 'FileText' },
    { href: '/dashboard/student/complaints/new', label: 'New Complaint', icon: 'Plus' },
    { href: '/dashboard/student/profile', label: 'Profile', icon: 'User' },
  ],
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/admin/complaints', label: 'Complaints', icon: 'ClipboardList' },
    { href: '/dashboard/admin/users', label: 'Users', icon: 'Users' },
  ],
  [ROLES.STAFF]: [
    { href: '/dashboard/staff', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/staff/complaints', label: 'My Assignments', icon: 'ClipboardList' },
  ],
};

/**
 * MobileNav — fixed bottom navigation bar for mobile screens.
 *
 * Visible only on mobile (md:hidden). Renders role-aware links as icon +
 * label pairs. Highlights the active route using `usePathname()`.
 *
 * Requirements: 13.1, 13.2
 */
export default function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  const links = (user?.role && NAV_LINKS[user.role]) || [];

  if (links.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-16 px-2">
      {links.map(({ href, label, icon }) => {
        const IconComponent = ICON_MAP[icon];
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-md text-xs font-medium transition-colors',
              isActive
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            )}
            aria-label={label}
          >
            {IconComponent && (
              <IconComponent
                size={20}
                className={cn(
                  'flex-shrink-0',
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                )}
              />
            )}
            <span className="truncate max-w-[56px] text-center leading-tight">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
