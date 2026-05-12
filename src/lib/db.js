import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global cache to preserve the Mongoose connection across hot reloads in
 * Next.js development. Without this, every HMR cycle would open a new
 * connection and exhaust the MongoDB Atlas connection pool.
 *
 * Requirements: 12.1, 12.2
 */
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

/**
 * Returns a cached Mongoose connection, creating one if none exists.
 *
 * @returns {Promise<mongoose.Connection>}
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance.connection)
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
