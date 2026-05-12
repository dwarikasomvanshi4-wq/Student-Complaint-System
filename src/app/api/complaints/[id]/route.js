import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/rbac';
import * as complaintService from '@/services/complaintService';
import { updateComplaintSchema } from '@/validations/complaintSchemas';
import Complaint from '@/models/Complaint';
import { connectDB } from '@/lib/db';

/**
 * GET /api/complaints/[id]
 *
 * Returns a single complaint by ID. Any authenticated user may access this.
 *
 * Requirements: 5.3, 6.1
 */
export const GET = withAuth(async (request, context, user) => {
  const { id } = await context.params;

  try {
    await connectDB();
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, complaint }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/complaints/[id]]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, []);

/**
 * PUT /api/complaints/[id]
 *
 * Updates a complaint. Accessible by admin and staff only.
 *
 * Requirements: 6.4, 6.5, 7.2, 7.3, 7.4, 7.5
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

  const result = updateComplaintSchema.safeParse(body);
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
    const complaint = await complaintService.updateComplaint(
      id,
      user.userId,
      user.role,
      result.data
    );
    return NextResponse.json({ success: true, complaint }, { status: 200 });
  } catch (err) {
    const message = err.message || '';

    if (message === 'Not found') {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }
    if (message === 'Forbidden') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    if (message === 'Invalid status transition') {
      return NextResponse.json(
        { success: false, message: 'Invalid status transition' },
        { status: 400 }
      );
    }
    if (message === 'Resolution note required') {
      return NextResponse.json(
        { success: false, message: 'Resolution note required when resolving a complaint' },
        { status: 400 }
      );
    }

    console.error('[PUT /api/complaints/[id]]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['admin', 'staff']);

/**
 * DELETE /api/complaints/[id]
 *
 * Permanently deletes a complaint. Admin only.
 *
 * Requirements: 6.6, 6.7
 */
export const DELETE = withAuth(async (request, context, user) => {
  const { id } = await context.params;

  try {
    await complaintService.deleteComplaint(id);
    return NextResponse.json(
      { success: true, message: 'Complaint deleted' },
      { status: 200 }
    );
  } catch (err) {
    if (err.message === 'Not found') {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    console.error('[DELETE /api/complaints/[id]]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['admin']);
