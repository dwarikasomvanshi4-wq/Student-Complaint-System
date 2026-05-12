'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  Users,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
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
 * Role-aware navigation link definitions.
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
 * Sidebar — collapsible desktop navigation sidebar.
 *
 * Hidden on mobile (md:flex). Shows role-aware nav links derived from the
 * authenticated user's role. Highlights the active route with an indigo-600
 * background. Supports collapsed (icons only, w-16) and expanded (icons +
 * labels, w-64) states.
 *
 * Requirements: 13.1, 13.2
 */
export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = (user?.role && NAV_LINKS[user.role]) || [];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / brand area */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-slate-200',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <span className="text-indigo-600 font-semibold text-sm truncate">
            SCS
          </span>
        )}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {links.map(({ href, label, icon }) => {
          const IconComponent = ICON_MAP[icon];
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? label : undefined}
            >
              {IconComponent && (
                <IconComponent size={18} className="flex-shrink-0" />
              )}
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
