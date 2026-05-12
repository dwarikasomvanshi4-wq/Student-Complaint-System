import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TokenExpiredError } from 'jsonwebtoken';
import { verifyToken } from '@/lib/jwt';

const COOKIE_NAME = 'token';

/**
 * RBAC middleware for Next.js App Router Route Handlers.
 *
 * Reads the JWT from the HTTP-only 'token' cookie, verifies it, and checks
 * that the decoded role is in the allowedRoles list (if non-empty).
 *
 * Requirements: 3.1, 3.2, 3.3
 *
 * @param {Function} handler - async (request, context, user) => NextResponse
 * @param {string[]} allowedRoles - e.g. ['admin'] or ['admin', 'staff'] or [] for any authenticated user
 * @returns {Function} - async (request, context) => NextResponse
 */
export function withAuth(handler, allowedRoles = []) {
  return async function (request, context) {
    // Read the JWT from the HTTP-only cookie (cookies() is async in Next.js 15+)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);

    if (!tokenCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let user;
    try {
      const decoded = verifyToken(tokenCookie.value);
      user = { userId: decoded.userId, role: decoded.role };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        );
      }
      // Invalid token (JsonWebTokenError, NotBeforeError, etc.)
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Role check — skip if allowedRoles is empty (any authenticated user is permitted)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return handler(request, context, user);
  };
}
