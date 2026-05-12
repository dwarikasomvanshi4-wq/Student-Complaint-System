import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Next.js Proxy (formerly middleware) for page-level authentication redirects.
 *
 * - Unauthenticated users hitting protected paths (/dashboard/*) are redirected to /login
 * - Authenticated users hitting auth paths (/login, /register) are redirected to their
 *   role-specific dashboard
 *
 * Requirements: 3.4, 3.5, 3.6, 3.7
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Read the JWT from the HTTP-only cookie
  const token = request.cookies.get('token')?.value;

  const isProtectedPath = pathname.startsWith('/dashboard');
  const isAuthPath = pathname === '/login' || pathname === '/register';

  // --- Unauthenticated user trying to access a protected page ---
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- Authenticated user: verify token and handle redirects ---
  if (token) {
    let decoded = null;

    try {
      decoded = verifyToken(token);
    } catch {
      // Token is invalid or expired — treat as unauthenticated
      if (isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // For auth paths with a bad token, just let them through
      return NextResponse.next();
    }

    const role = decoded?.role;

    // Map role to its dashboard path
    const roleDashboard = {
      student: '/dashboard/student',
      admin: '/dashboard/admin',
      staff: '/dashboard/staff',
    };

    const dashboardPath = roleDashboard[role] ?? '/dashboard/student';

    // Redirect authenticated users away from /login and /register
    if (isAuthPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy only on paths that need auth checks:
  //   /dashboard/* — protected, requires authentication
  //   /login       — redirect if already authenticated
  //   /register    — redirect if already authenticated
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
