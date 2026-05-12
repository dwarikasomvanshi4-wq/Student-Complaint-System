import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/rbac';
import * as userService from '@/services/userService';

/**
 * GET /api/users
 *
 * Returns all registered users. Admin only.
 * Excludes password fields (enforced by userService.getAllUsers).
 *
 * Requirements: 8.1, 8.4
 */
export const GET = withAuth(async (request, context, user) => {
  try {
    const users = await userService.getAllUsers();
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['admin']);
