import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8),
  // Public registration only allows 'student'. Admin/staff accounts
  // are created by an admin via the user management page.
  role: z.literal('student').optional().default('student'),
  department: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
