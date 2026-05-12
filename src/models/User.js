import mongoose from 'mongoose';

/**
 * User schema for the Student Complaint System.
 * Supports three roles: student, admin, staff.
 *
 * Requirements: 12.3, 1.1, 1.4, 1.5
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'staff'],
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, strict: true }
);

// email uniqueness is already enforced by `unique: true` in the schema above,
// which causes Mongoose to create the index automatically.

/**
 * Guard against model re-registration during Next.js hot reload.
 * In development, Next.js HMR re-executes module code on every change,
 * which would otherwise throw "Cannot overwrite model once compiled".
 */
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
