'use client';

import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * Navbar — top navigation bar for authenticated dashboard pages.
 *
 * Displays the authenticated user's name and role on the right side.
 * Shows a hamburger menu button on mobile (md:hidden) that calls
 * `onMenuToggle` to open the mobile drawer. Provides a logout button
 * that calls `logout()` from the auth context.
 *
 * Props:
 *   onMenuToggle {Function} — called when the hamburger button is clicked
 *
 * Requirements: 13.1, 13.2
 */
export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Left: hamburger (mobile) + brand name */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="md:hidden text-sm font-semibold text-indigo-600">SCS</span>
      </div>

      {/* Spacer on desktop */}
      <div className="hidden md:block" />

      {/* Right: user info + logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800 leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 capitalize leading-tight">
              {user.role}
            </p>
          </div>
        )}

        <button
          onClick={logout}
          aria-label="Log out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
