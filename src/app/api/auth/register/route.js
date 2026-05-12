import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { registerSchema } from '@/validations/authSchemas';
import * as authService from '@/services/authService';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * POST /api/auth/register
 *
 * Registers a new user, issues a JWT, and sets it as an HTTP-only cookie.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.6
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Validate with Zod
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return NextResponse.json(
      { success: false, message: 'Validation failed', errors },
      { status: 400 }
    );
  }

  const { name, email, password, department } = result.data;
  // Always force 'student' on public registration — role cannot be chosen by the user
  const role = 'student';

  let user;
  try {
    user = await authService.createUser(name, email, password, role, department);
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }
    console.error('[register] createUser error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }

  // Issue JWT
  const token = authService.issueToken(user._id.toString(), user.role);

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return NextResponse.json(
    { success: true, user },
    { status: 201 }
  );
}
