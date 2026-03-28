/**
 * @danclaw/shared — API Request/Response Types
 *
 * These types map to the @insforge/sdk API surface. They must match
 * the actual SDK signatures, not a hypothetical ideal API.
 */

import type { User, Tier, Deployment } from './index';

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

/** Email/password sign-in request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Response from a successful login */
export interface LoginResponse {
  user: User;
  token: string;
}

/** Email/password registration request */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

/** Response from a successful registration */
export interface RegisterResponse {
  user: User;
  token: string;
}

/** Session refresh — InsForge manages refresh tokens internally */
export interface RefreshRequest {
  /** Required by schema but managed by InsForge SDK; pass empty string */
  refresh_token: string;
}

/** Response from a session refresh */
export interface RefreshResponse {
  user: User;
  token: string;
}

// ─────────────────────────────────────────────
// Deployments
// ─────────────────────────────────────────────

/** Request body for creating a deployment */
export interface CreateDeploymentRequest {
  service_name: string;
  tier: Tier;
  region: string;
  model: string;
  channel: string;
  openrouter_token?: string;
}

/** Response from a deployment creation call */
export interface CreateDeploymentResponse {
  deployment: Deployment;
}

/** Response from listing user deployments */
export interface ListDeploymentsResponse {
  deployments: Deployment[];
  total: number;
}

/** Generic response for deployment action (start/stop/restart) */
export interface DeploymentActionResponse {
  success: boolean;
  message?: string;
}

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

/** Response from fetching the current user profile */
export interface UserProfileResponse {
  user: User;
}

/** Response from fetching usage stats */
export interface UsageResponse {
  usage: {
    total_requests: number;
    cost: number;
    models: string[];
  };
}

// ─────────────────────────────────────────────
// Billing
// ─────────────────────────────────────────────

export interface SubscribeRequest {
  plan: Tier;
  payment_method: string;
}

export interface SubscribeResponse {
  subscription_id: string;
  status: 'active' | 'cancelled' | 'past_due';
  plan: Tier;
  next_billing: string;
}

export interface CancelResponse {
  subscription_id: string;
  status: 'cancelled';
  end_date: string;
}

export interface BillingPortalResponse {
  url: string;
}

// ─────────────────────────────────────────────
// Webhooks
// ─────────────────────────────────────────────

export interface RevenueCatWebhookPayload {
  type: 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION';
  app_user_id: string;
  product_id: string;
}

export interface InsForgeWebhookPayload {
  type: 'CONTAINER_STATUS';
  deployment_id: string;
  status: string;
}

export type WebhookPayload = RevenueCatWebhookPayload | InsForgeWebhookPayload;
