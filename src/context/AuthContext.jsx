'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';

/**
 * AuthContext — provides authentication state and actions to the component tree.
 *
 * Value shape:
 *   user    {object|null}  — the authenticated user object, or null when logged out
 *   loading {boolean}      — true while the initial session check is in flight
 *   login   {Function}     — call with userData to set the user in state
 *   logout  {Function}     — clears the server session cookie and redirects to /login
 *
 * Requirements: 2.4
 */
export const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * On mount, calls GET /api/auth/me to rehydrate the session from the
 * HTTP-only JWT cookie. If the server returns 401 (no valid session) the
 * user is set to null. Any other error is treated the same way so the app
 * never gets stuck in a loading state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Rehydrate session on mount
  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      try {
        const { data } = await axiosClient.get('/api/auth/me');
        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } catch {
        // 401 (no session) or any other error — treat as logged out
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    rehydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * login — stores the user object returned by the login API in state.
   * The caller is responsible for having already set the JWT cookie via
   * POST /api/auth/login before calling this.
   *
   * @param {object} userData
   */
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  /**
   * logout — calls POST /api/auth/logout to clear the server-side cookie,
   * resets user state to null, then redirects to /login.
   */
  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/api/auth/logout');
    } catch (err) {
      // Log but don't block the client-side logout
      console.error('[AuthContext] logout error:', err);
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
