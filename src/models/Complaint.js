import mongoose from 'mongoose';
import { CATEGORIES } from '../constants/categories.js';
import { STATUSES } from '../constants/statuses.js';

/**
 * Complaint schema for the Student Complaint System.
 * Tracks the full lifecycle of a student complaint from submission to resolution.
 *
 * Requirements: 12.3, 4.1, 4.3
 */
const ComplaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.PENDING,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, strict: true }
);

// Indexes for common query patterns
ComplaintSchema.index({ studentId: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ category: 1 });

/**
 * Guard against model re-registration during Next.js hot reload.
 * In development, Next.js HMR re-executes module code on every change,
 * which would otherwise throw "Cannot overwrite model once compiled".
 */
const Complaint =
  mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

export default Complaint;
