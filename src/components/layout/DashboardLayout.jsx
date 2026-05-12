'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
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
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { cn } from '@/lib/utils';

/**
 * Icon map for the mobile drawer overlay sidebar.
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
 * Role-aware navigation link definitions (mirrors Sidebar / MobileNav).
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
 * DashboardLayout — full-height flex layout for authenticated dashboard pages.
 *
 * Composes:
 *   - <Sidebar /> on the left (desktop only)
 *   - A main column containing <Navbar /> on top and {children} below
 *   - <MobileNav /> fixed at the bottom (mobile only)
 *   - A slide-in overlay drawer on mobile, toggled by the Navbar hamburger
 *
 * Props:
 *   children {ReactNode} — page content
 *
 * Requirements: 13.1, 13.2
 */
export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const links = (user?.role && NAV_LINKS[user.role]) || [];

  const handleMenuToggle = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative z-10 flex flex-col w-64 bg-white h-full shadow-xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
              <span className="text-indigo-600 font-semibold text-sm">SCS</span>
              <button
                onClick={closeMobile}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {links.map(({ href, label, icon }) => {
                const IconComponent = ICON_MAP[icon];
                const isActive = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {IconComponent && (
                      <IconComponent size={18} className="flex-shrink-0" />
                    )}
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={handleMenuToggle} />

        {/* Page content — add bottom padding on mobile to clear the fixed MobileNav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
