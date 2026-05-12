import { connectDB } from '../lib/db.js';
import Complaint from '../models/Complaint.js';
import { ROLES, } from '../constants/roles.js';
import { STATUSES, OPEN_STATUSES, STAFF_ALLOWED_STATUSES } from '../constants/statuses.js';

/**
 * Creates a new complaint for the given student.
 *
 * @param {string} studentId - The authenticated student's user ID.
 * @param {{ title: string, description: string, category: string, priority?: string, attachments?: Array }} payload
 * @returns {Promise<import('../models/Complaint.js').default>} The created complaint document.
 *
 * Requirements: 4.1, 4.4
 */
export async function createComplaint(studentId, payload) {
  await connectDB();

  const { title, description, category, priority, attachments } = payload;

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority: priority ?? 'Medium',
    attachments: attachments ?? [],
    studentId,
    status: STATUSES.PENDING,
  });

  return complaint;
}

/**
 * Returns complaints filtered by the caller's role.
 *
 * - Students: only their own complaints (studentId === userId)
 * - Staff:    only complaints assigned to them (assignedTo === userId)
 * - Admins:   all complaints
 *
 * Optional filters: { status, category, priority, search }
 * `search` performs a case-insensitive regex match on the title field.
 *
 * @param {string} userId
 * @param {string} role
 * @param {{ status?: string, category?: string, priority?: string, search?: string }} [filters]
 * @returns {Promise<Array>}
 *
 * Requirements: 5.1, 6.1, 7.1
 */
export async function getComplaintsByRole(userId, role, filters = {}) {
  await connectDB();

  const query = {};

  // Role-based scoping
  if (role === ROLES.STUDENT) {
    query.studentId = userId;
  } else if (role === ROLES.STAFF) {
    query.assignedTo = userId;
  }
  // Admins get no additional scoping — they see everything

  // Optional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.priority) {
    query.priority = filters.priority;
  }
  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }

  return Complaint.find(query).sort({ createdAt: -1 });
}

/**
 * Updates a complaint, enforcing role-based permissions.
 *
 * Admins can update any complaint (status, assignedTo, resolutionNote, priority).
 * Staff can only update complaints assigned to them, and only to statuses in
 * STAFF_ALLOWED_STATUSES.
 *
 * Special rules:
 * - When admin sets `assignedTo`, status is automatically set to 'Under Review'.
 * - When status is set to 'Resolved', a non-empty resolutionNote is required.
 *
 * @param {string} complaintId
 * @param {string} userId
 * @param {string} role
 * @param {{ status?: string, assignedTo?: string, resolutionNote?: string, priority?: string }} updates
 * @returns {Promise<import('../models/Complaint.js').default>}
 *
 * Requirements: 6.4, 6.5, 7.2, 7.3, 7.4, 7.5
 */
export async function updateComplaint(complaintId, userId, role, updates) {
  await connectDB();

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const err = new Error('Not found');
    err.statusCode = 404;
    throw err;
  }

  if (role === ROLES.STAFF) {
    // Staff can only update complaints assigned to them
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== userId.toString()) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    // Staff can only transition to allowed statuses
    if (updates.status !== undefined && !STAFF_ALLOWED_STATUSES.includes(updates.status)) {
      const err = new Error('Invalid status transition');
      err.statusCode = 400;
      throw err;
    }
  }

  // Resolution note is required when resolving
  const incomingStatus = updates.status;
  const incomingNote = updates.resolutionNote;
  const existingNote = complaint.resolutionNote;

  if (incomingStatus === STATUSES.RESOLVED) {
    const effectiveNote = incomingNote !== undefined ? incomingNote : existingNote;
    if (!effectiveNote || effectiveNote.trim() === '') {
      const err = new Error('Resolution note required');
      err.statusCode = 400;
      throw err;
    }
  }

  // Build the update object
  const allowedAdminFields = ['status', 'assignedTo', 'resolutionNote', 'priority'];
  const allowedStaffFields = ['status', 'resolutionNote'];
  const allowedFields = role === ROLES.ADMIN ? allowedAdminFields : allowedStaffFields;

  const updateData = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  // When admin assigns a complaint, automatically set status to 'Under Review'
  if (role === ROLES.ADMIN && updateData.assignedTo !== undefined) {
    updateData.status = STATUSES.UNDER_REVIEW;
  }

  const updated = await Complaint.findByIdAndUpdate(
    complaintId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updated;
}

/**
 * Permanently deletes a complaint by ID.
 *
 * @param {string} complaintId
 * @returns {Promise<void>}
 *
 * Requirements: 6.6
 */
export async function deleteComplaint(complaintId) {
  await connectDB();

  const result = await Complaint.findByIdAndDelete(complaintId);
  if (!result) {
    const err = new Error('Not found');
    err.statusCode = 404;
    throw err;
  }
}

/**
 * Computes complaint analytics using MongoDB aggregation pipelines.
 *
 * Returns:
 * - statusBreakdown:   [{ status, count }] for each status
 * - categoryBreakdown: [{ category, count }] for each category
 * - openCount:         count of complaints with status in OPEN_STATUSES
 * - totalCount:        total number of complaints
 *
 * @returns {Promise<{ statusBreakdown: Array, categoryBreakdown: Array, openCount: number, totalCount: number }>}
 *
 * Requirements: 10.1, 10.2, 10.4, 10.5
 */
export async function getAnalytics() {
  await connectDB();

  const [statusBreakdown, categoryBreakdown, openResult, totalResult] = await Promise.all([
    // Group by status
    Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { status: 1 } },
    ]),

    // Group by category
    Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { category: 1 } },
    ]),

    // Count open complaints
    Complaint.aggregate([
      { $match: { status: { $in: OPEN_STATUSES } } },
      { $count: 'openCount' },
    ]),

    // Total count
    Complaint.aggregate([
      { $count: 'totalCount' },
    ]),
  ]);

  return {
    statusBreakdown,
    categoryBreakdown,
    openCount: openResult.length > 0 ? openResult[0].openCount : 0,
    totalCount: totalResult.length > 0 ? totalResult[0].totalCount : 0,
  };
}
