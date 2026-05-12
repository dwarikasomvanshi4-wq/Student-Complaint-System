import { NextResponse } from 'next/server';
import * as authService from '@/services/authService';

/**
 * POST /api/auth/logout
 *
 * Clears the JWT cookie and returns a success response.
 *
 * Requirements: 2.3
 */
export async function POST() {
  try {
    await authService.clearSession();
  } catch (err) {
    console.error('[logout] clearSession error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );
}
