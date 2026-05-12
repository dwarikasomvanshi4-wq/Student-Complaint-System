import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/rbac';
import * as userService from '@/services/userService';
import { updateProfileSchema, adminUpdateUserSchema } from '@/validations/userSchemas';

/**
 * GET /api/users/[id]
 *
 * Returns a single user by ID. Any authenticated user may access this.
 * Password field is excluded (enforced by userService.getUserById).
 *
 * Requirements: 8.1, 8.4, 9.1
 */
export const GET = withAuth(async (request, context, user) => {
  const { id } = await context.params;

  try {
    const foundUser = await userService.getUserById(id);
    return NextResponse.json({ success: true, user: foundUser }, { status: 200 });
  } catch (err) {
    if (err.message === 'Not found') {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.error('[GET /api/users/[id]]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, []);

/**
 * PUT /api/users/[id]
 *
 * Updates a user's profile. Any authenticated user may call this endpoint,
 * but the service layer enforces field-level restrictions:
 *   - Admins: validated with adminUpdateUserSchema (role, department)
 *   - Others: validated with updateProfileSchema (name, department, profileImage)
 *
 * Requirements: 8.2, 8.3, 9.2, 9.3, 9.4
 */
export const PUT = withAuth(async (request, context, user) => {
  const { id } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Choose schema based on the requester's role
  const schema = user.role === 'admin' ? adminUpdateUserSchema : updateProfileSchema;

  const result = schema.safeParse(body);
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

  try {
    const updatedUser = await userService.updateUser(
      id,
      user.userId,
      user.role,
      result.data
    );
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (err) {
    if (err.message === 'Not found') {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.error('[PUT /api/users/[id]]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, []);
