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
