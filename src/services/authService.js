import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import { signToken } from '../lib/jwt.js';

const SALT_ROUNDS = 10;
const COOKIE_NAME = 'token';

/**
 * Creates a new user with a hashed password.
 * Throws a duplicate-key error (code 11000) if the email already exists,
 * allowing the API route to return 409 Conflict.
 *
 * Requirements: 1.1, 1.4
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password - Plaintext password (min 8 chars)
 * @param {string} [role='student']
 * @param {string} [department]
 * @returns {Promise<object>} Created user document without the password field
 */
export async function createUser(name, email, password, role, department) {
  await connectDB();

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department,
    });

    // Return a plain object without the password field
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  } catch (err) {
    // Re-throw Mongoose duplicate key error so the API route can map it to 409
    if (err.code === 11000) {
      throw err;
    }
    throw err;
  }
}

/**
 * Verifies a user's credentials.
 * Returns the user (without password) on success.
 * Throws a generic error on failure — does not reveal which field is wrong
 * (satisfies Requirement 2.2).
 *
 * Requirements: 1.1, 2.1, 2.2
 *
 * @param {string} email
 * @param {string} password - Plaintext password to compare
 * @returns {Promise<object>} User document without the password field
 * @throws {Error} Generic "Invalid credentials" error on failure
 */
export async function verifyCredentials(email, password) {
  await connectDB();

  // Explicitly select the password field (it has select: false in the schema)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

/**
 * Issues a signed JWT token for the given user.
 *
 * Requirements: 2.1
 *
 * @param {string} userId
 * @param {string} role
 * @returns {string} Signed JWT token string
 */
export function issueToken(userId, role) {
  return signToken({ userId, role });
}

/**
 * Clears the JWT cookie from the response using the Next.js App Router
 * `cookies()` API from `next/headers`.
 *
 * Must be called from within a Route Handler or Server Function context.
 *
 * Requirements: 2.3
 *
 * @returns {Promise<void>}
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
