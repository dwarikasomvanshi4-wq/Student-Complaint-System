import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/rbac';
import * as userService from '@/services/userService';

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile by reading the userId
 * from the verified JWT (injected by withAuth). Wrapped with withAuth([]) so
 * any authenticated user (student, staff, admin) can call it.
 *
 * Requirements: 2.4, 9.1
 */
async function handler(request, context, user) {
  try {
    const foundUser = await userService.getUserById(user.userId);
    return NextResponse.json(
      { success: true, user: foundUser },
      { status: 200 }
    );
  } catch (err) {
    if (err.statusCode === 404) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    console.error('[GET /api/auth/me] error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, []);
