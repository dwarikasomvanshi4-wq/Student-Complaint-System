import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/middleware/rbac';
import * as authService from '@/services/authService';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'staff']),
  department: z.string().min(1).max(100),
});

/**
 * POST /api/users/create
 * Admin-only: create a new admin or staff account directly.
 */
async function handler(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return NextResponse.json({ success: false, message: 'Validation failed', errors }, { status: 400 });
  }

  const { name, email, password, role, department } = result.data;

  try {
    const user = await authService.createUser(name, email, password, role, department);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }
    console.error('[POST /api/users/create]', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(handler, ['admin']);
