'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * useAuth — convenience hook for consuming AuthContext.
 *
 * Returns { user, loading, login, logout } from the nearest AuthProvider.
 * Throws if called outside of an AuthProvider so misconfigured component
 * trees surface the problem immediately rather than silently returning null.
 *
 * Requirements: 2.4
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
