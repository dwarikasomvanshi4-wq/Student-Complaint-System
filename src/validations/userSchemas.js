import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  profileImage: z.url().optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['student', 'admin', 'staff']).optional(),
  department: z.string().min(1).max(100).optional(),
});
