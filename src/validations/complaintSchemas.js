import { z } from 'zod';
import { CATEGORIES } from '../constants/categories.js';
import { STATUSES } from '../constants/statuses.js';

export const createComplaintSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  category: z.enum(CATEGORIES),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  attachments: z
    .array(z.object({ filename: z.string(), url: z.string() }))
    .optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(Object.values(STATUSES)).optional(),
  assignedTo: z.string().optional(),
  resolutionNote: z.string().max(2000).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});
