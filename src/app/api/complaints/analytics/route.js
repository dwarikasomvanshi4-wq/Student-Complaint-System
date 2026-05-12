import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/rbac';
import * as complaintService from '@/services/complaintService';

/**
 * GET /api/complaints/analytics
 *
 * Returns complaint analytics (status breakdown, category breakdown,
 * open count, total count). Admin only.
 *
 * Requirements: 10.1, 10.2, 10.4, 10.5
 */
export const GET = withAuth(async (request, context, user) => {
  try {
    const analytics = await complaintService.getAnalytics();
    return NextResponse.json({ success: true, analytics }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/complaints/analytics]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['admin']);
