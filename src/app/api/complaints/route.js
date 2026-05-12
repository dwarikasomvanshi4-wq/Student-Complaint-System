import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/rbac';
import * as complaintService from '@/services/complaintService';
import { createComplaintSchema } from '@/validations/complaintSchemas';

/**
 * GET /api/complaints
 *
 * Returns complaints filtered by the caller's role.
 * Accepts optional query params: status, category, priority, search.
 *
 * Requirements: 5.1, 6.1, 7.1
 */
export const GET = withAuth(async (request, context, user) => {
  const { searchParams } = request.nextUrl;

  const filters = {
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    priority: searchParams.get('priority') || undefined,
    search: searchParams.get('search') || undefined,
  };

  try {
    const complaints = await complaintService.getComplaintsByRole(
      user.userId,
      user.role,
      filters
    );
    return NextResponse.json({ success: true, complaints }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/complaints]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, []);

/**
 * POST /api/complaints
 *
 * Creates a new complaint for the authenticated student.
 *
 * Requirements: 4.1, 4.2, 4.4
 */
export const POST = withAuth(async (request, context, user) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const result = createComplaintSchema.safeParse(body);
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
    const complaint = await complaintService.createComplaint(
      user.userId,
      result.data
    );
    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/complaints]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['student']);
