/**
 * Auth Validation Schemas
 * Zod schemas for authentication endpoints
 */

const { z } = require('zod');

// Register schema
const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin', 'viewer']).optional(),
  }),
});

// Login schema
const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
