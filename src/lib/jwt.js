import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

/**
 * Signs a JWT token with the given payload.
 * Token expires in 7 days.
 *
 * Requirements: 1.6, 2.1
 *
 * @param {object} payload - Data to encode in the token (e.g. { userId, role })
 * @returns {string} Signed JWT string
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies and decodes a JWT token.
 * Throws a JsonWebTokenError or TokenExpiredError on invalid/expired tokens.
 *
 * Requirements: 1.6, 2.1
 *
 * @param {string} token - JWT string to verify
 * @returns {object} Decoded payload
 * @throws {Error} If the token is invalid or expired
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
