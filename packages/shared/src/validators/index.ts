/**
 * @danclaw/shared — Zod Validation Schemas
 *
 * Runtime validation for API boundaries. Use these to validate
 * incoming requests before processing and outgoing data before sending.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export const tierSchema = z.enum(['free', 'pro', 'elite']);

export const authProviderSchema = z.enum(['google', 'apple', 'github']);

export const deploymentStatusSchema = z.enum([
  'provisioning',
  'starting',
  'running',
  'stopping',
  'stopped',
  'restarting',
  'destroying',
  'error',
]);

export const messageRoleSchema = z.enum(['user', 'agent']);

export const messageTypeSchema = z.enum(['message', 'response', 'status', 'error']);

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  provider: authProviderSchema,
  token: z.string().min(1, 'Token is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  provider: authProviderSchema,
  token: z.string().min(1, 'Token is required'),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// ─────────────────────────────────────────────
// Deployments
// ─────────────────────────────────────────────

export const createDeploymentSchema = z.object({
  tier: tierSchema,
  region: z.string().min(1, 'Region is required'),
  config: z.object({
    model: z.string().min(1, 'Model is required'),
    channel: z.string().min(1, 'Channel is required'),
    openrouter_token: z.string().optional(),
  }),
});

// ─────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────

export const messageSchema = z.object({
  id: z.string(),
  deployment_id: z.string(),
  role: messageRoleSchema,
  content: z.string().min(1, 'Message content cannot be empty'),
  type: messageTypeSchema,
  created_at: z.string(),
});

export const webSocketMessageSchema = z.object({
  type: messageTypeSchema,
  content: z.string(),
  timestamp: z.string(),
  code: z.number().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});

// ─────────────────────────────────────────────
// Billing
// ─────────────────────────────────────────────

export const subscribeSchema = z.object({
  plan: tierSchema,
  payment_method: z.string().min(1, 'Payment method is required'),
});

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  tier: tierSchema,
  openrouter_token: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
