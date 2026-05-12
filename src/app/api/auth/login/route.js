import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginSchema } from '@/validations/authSchemas';
import * as authService from '@/services/authService';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * POST /api/auth/login
 *
 * Verifies credentials, issues a JWT, and sets it as an HTTP-only cookie.
 *
 * Requirements: 2.1, 2.2
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
  const result = loginSchema.safeParse(body);
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

  const { email, password } = result.data;

  let user;
  try {
    user = await authService.verifyCredentials(email, password);
  } catch {
    // Generic message — does not reveal which field is wrong (Requirement 2.2)
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
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
    { status: 200 }
  );
}
