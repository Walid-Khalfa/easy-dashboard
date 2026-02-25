import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Application environment'),

  PORT: z.coerce.number().default(8000).describe('Server port'),

  DATABASE: z
    .string()
    .min(1)
    .describe('MongoDB connection string (e.g., mongodb://localhost:27017/easy-dashboard)'),

  SECRET: z.string().min(32).describe('Session secret (minimum 32 characters)'),

  KEY: z.string().min(32).describe('Session key name (minimum 32 characters)'),

  JWT_SECRET: z
    .string()
    .min(32)
    .describe('JWT access token signing secret (minimum 32 characters)'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .describe('JWT refresh token signing secret (minimum 32 characters)'),

  JWT_TOKEN_EXPIRATION: z.coerce
    .number()
    .default(18000000)
    .describe('JWT access token expiration in milliseconds (default: 15 minutes = 18000000ms)'),

  JWT_SCHEME: z.string().default('jwt').describe('JWT authorization scheme'),

  JWT_TOKEN_PREFIX: z
    .string()
    .default('Bearer')
    .describe('JWT token prefix in Authorization header'),

  JWT_TOKEN_HASH_ALGO: z.string().default('SHA-256').describe('JWT token hashing algorithm'),

  REDIS_URL: z
    .string()
    .optional()
    .describe(
      'Redis connection URL for token blocklist (optional - falls back to in-memory if not provided)'
    ),

  FRONTEND_URL: z.string().describe('Frontend URL for CORS configuration'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (env: Record<string, unknown>): EnvConfig => {
  return envSchema.parse(env);
};

export const envDescriptions: Record<keyof EnvConfig, string> = {
  NODE_ENV: 'Application environment: development, production, or test',
  PORT: 'TCP port for the Express server',
  DATABASE: 'MongoDB connection string',
  SECRET: 'Express session secret (min 32 chars)',
  KEY: 'Session cookie key (min 32 chars)',
  JWT_SECRET: 'JWT access token secret (min 32 chars) - CRITICAL for security',
  JWT_REFRESH_SECRET: 'JWT refresh token secret (min 32 chars) - CRITICAL for security',
  JWT_TOKEN_EXPIRATION: 'Access token lifetime in milliseconds (default: 15 min)',
  JWT_SCHEME: 'Authorization header scheme (default: jwt)',
  JWT_TOKEN_PREFIX: 'Token prefix in header (default: Bearer)',
  JWT_TOKEN_HASH_ALGO: 'JWT hashing algorithm (default: SHA-256)',
  REDIS_URL: 'Redis URL for production token blocklist',
  FRONTEND_URL: 'Allowed CORS origin',
};
