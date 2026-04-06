/**
 * @danclaw/shared — Zod Validators
 *
 * Zod schemas for runtime validation of API inputs and outputs.
 * These mirror the TypeScript types in ../types/index.ts and ../types/api.ts.
 *
 * Import individual schemas or the full object: import { userSchema, loginSchema } from './validators';
 */

import { z } from 'zod';

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const authProviderSchema = z.enum(['google', 'apple', 'github']);

// ─────────────────────────────────────────────
// Tier
// ─────────────────────────────────────────────

export const tierSchema = z.enum(['free', 'pro', 'elite']);

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  tier: tierSchema,
  openrouter_token: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UserInput = z.infer<typeof userSchema>;

// ─────────────────────────────────────────────
// Deployments
// ─────────────────────────────────────────────

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

export const deploymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  service_name: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  status: deploymentStatusSchema,
  tier: tierSchema,
  region: z.string().min(1),
  model: z.string().min(1),
  channel: z.string().min(1),
  uptime: z.number().int().nonnegative().optional(),
  memory_usage: z.number().nonnegative().optional(),
  memory_limit: z.number().positive().optional(),
  requests_today: z.number().int().nonnegative().optional(),
  cost_this_month: z.number().nonnegative().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const deployConfigSchema = z.object({
  model: z.string().min(1),
  channel: z.string().min(1),
  tier: tierSchema,
  region: z.string().min(1),
  openrouter_token: z.string().optional(),
});

export type DeployConfigInput = z.infer<typeof deployConfigSchema>;

// ─────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────

export const messageRoleSchema = z.enum(['user', 'agent']);
export const messageTypeSchema = z.enum(['message', 'response', 'status', 'error']);

export const messageSchema = z.object({
  id: z.string().uuid(),
  deployment_id: z.string().uuid(),
  role: messageRoleSchema,
  content: z.string().min(1),
  type: messageTypeSchema,
  created_at: z.string().datetime(),
});

export const webSocketMessageSchema = z.object({
  type: messageTypeSchema,
  content: z.string(),
  timestamp: z.string().datetime(),
  code: z.number().int().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});

// ─────────────────────────────────────────────
// Provisioning
// ─────────────────────────────────────────────

export const provisioningStepSchema = z.enum(['auth', 'container', 'swarmclaw', 'models', 'healthcheck']);

export const provisioningLogSchema = z.object({
  timestamp: z.string().datetime(),
  message: z.string(),
  level: z.enum(['info', 'success', 'warning', 'error']),
});

export const provisioningStateSchema = z.object({
  currentStep: provisioningStepSchema,
  completedSteps: z.array(provisioningStepSchema),
  progress: z.number().min(0).max(100),
  logs: z.array(provisioningLogSchema),
  estimatedRemaining: z.number().nonnegative(),
});

// ─────────────────────────────────────────────
// AI Models & Channels
// ─────────────────────────────────────────────

export const aiModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  description: z.string(),
  icon: z.string(),
});

export const channelSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
  available: z.boolean(),
});

// ─────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────

export const pricingTierLimitsSchema = z.object({
  ram: z.string(),
  vcpu: z.string(),
  storage: z.string(),
  uptime: z.string(),
  models: z.string(),
  agents: z.number().int().nonnegative(),
  team: z.number().int().nonnegative(),
});

export const pricingTierSchema = z.object({
  name: z.string(),
  tier: tierSchema,
  price: z.number().nonnegative(),
  priceLabel: z.string(),
  features: z.array(z.string()),
  limits: pricingTierLimitsSchema,
  popular: z.boolean().optional(),
});

// ─────────────────────────────────────────────
// Usage & Billing
// ─────────────────────────────────────────────

export const usageDaySchema = z.object({
  date: z.string(),
  messages: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
});

export const usageSchema = z.object({
  current_month: z.object({
    deployments: z.number().int().nonnegative(),
    messages: z.number().int().nonnegative(),
    cost: z.number().nonnegative(),
  }),
  history: z.array(usageDaySchema),
});

export const billingSubscriptionSchema = z.object({
  subscription_id: z.string(),
  status: z.enum(['active', 'cancelled', 'past_due', 'trialing']),
  plan: tierSchema,
  next_billing: z.string(),
  end_date: z.string().optional(),
});

// ─────────────────────────────────────────────
// Activity
// ─────────────────────────────────────────────

export const activitySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  timestamp: z.string().datetime(),
  icon: z.string().optional(),
});

// ─────────────────────────────────────────────
// API Request/Response
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const createDeploymentSchema = z.object({
  service_name: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/, 'Must be lowercase letters, numbers, and hyphens only'),
  tier: tierSchema,
  region: z.string().min(1),
  model: z.string().min(1),
  channel: z.string().min(1),
  openrouter_token: z.string().optional(),
});

export const subscribeSchema = z.object({
  plan: tierSchema,
  payment_method: z.string().min(1),
});

export const cancelSchema = z.object({
  subscription_id: z.string().min(1),
});

export const billingPortalSchema = z.object({
  return_url: z.string().url().optional(),
});

// ─────────────────────────────────────────────
// API Response envelope
// ─────────────────────────────────────────────

export const apiErrorSchema = z.object({
  code: z.number().int(),
  message: z.string(),
  details: z.string().optional(),
});

export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.union([
    z.object({ data: dataSchema, error: z.undefined() }),
    z.object({ data: z.undefined(), error: apiErrorSchema }),
  ]);
}
