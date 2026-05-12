import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import { ROLES } from '../constants/roles.js';

/**
 * Returns a single user by ID, excluding the password field.
 *
 * @param {string} userId
 * @returns {Promise<import('../models/User.js').default>}
 * @throws {Error} 404 if the user does not exist
 *
 * Requirements: 8.1, 8.4, 9.1
 */
export async function getUserById(userId) {
  await connectDB();

  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('Not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

/**
 * Returns all registered users, excluding the password field.
 * Returned fields: name, email, role, department, profileImage, createdAt, updatedAt.
 *
 * @returns {Promise<Array>}
 *
 * Requirements: 8.1, 8.4
 */
export async function getAllUsers() {
  await connectDB();

  return User.find({}).select('-password').sort({ createdAt: -1 });
}

/**
 * Updates a user's profile, enforcing role-based field restrictions.
 *
 * - Students: may update name, department, profileImage — the `role` field is
 *   silently stripped from the update payload (Requirement 9.4).
 * - Admins: may update role, department, name, and profileImage for any user.
 *
 * @param {string} userId        - ID of the user being updated
 * @param {string} requesterId   - ID of the user making the request
 * @param {string} requesterRole - Role of the user making the request
 * @param {object} updates       - Raw update payload from the request body
 * @returns {Promise<import('../models/User.js').default>} Updated user without password
 * @throws {Error} 404 if the target user does not exist
 *
 * Requirements: 8.2, 8.3, 8.4, 9.2, 9.4
 */
export async function updateUser(userId, requesterId, requesterRole, updates) {
  await connectDB();

  // Verify the target user exists before attempting an update
  const existing = await User.findById(userId);
  if (!existing) {
    const err = new Error('Not found');
    err.statusCode = 404;
    throw err;
  }

  let allowedFields;

  if (requesterRole === ROLES.ADMIN) {
    // Admins can update role, department, name, and profileImage
    allowedFields = ['name', 'department', 'profileImage', 'role'];
  } else {
    // Students (and staff updating their own profile) cannot change role
    allowedFields = ['name', 'department', 'profileImage'];
  }

  // Build a sanitised update object containing only permitted fields
  const sanitisedUpdates = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitisedUpdates[field] = updates[field];
    }
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: sanitisedUpdates },
    { new: true, runValidators: true }
  ).select('-password');

  return updated;
}
