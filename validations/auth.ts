import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(5, 'Password must be at least 5 characters long'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(5, 'Password must be at least 5 characters long'),
    passwordCheck: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    surname: z.string().min(2, 'Surname must be at least 2 characters long'),
  }).refine((data) => data.password === data.passwordCheck, {
    message: "Passwords don't match",
    path: ["passwordCheck"],
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Admin validation schemas
export const adminCreateSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(5, 'Password must be at least 5 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    surname: z.string().min(2, 'Surname must be at least 2 characters long'),
    role: z.enum(['admin', 'staff']).optional(),
    enabled: z.boolean().optional(),
  }),
});

export const adminUpdateSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    surname: z.string().min(2, 'Surname must be at least 2 characters long').optional(),
    role: z.enum(['admin', 'staff']).optional(),
    enabled: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const adminPasswordUpdateSchema = z.object({
  body: z.object({
    password: z.string().min(5, 'Password must be at least 5 characters long'),
    passwordCheck: z.string(),
  }).refine((data) => data.password === data.passwordCheck, {
    message: "Passwords don't match",
    path: ["passwordCheck"],
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const adminIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});
