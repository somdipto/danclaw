/**
 * @danclaw/shared — API Request/Response Types
 *
 * Derived from docs/API.md. Each type maps 1:1 to an endpoint.
 */

import type {
  User,
  Tier,
  Deployment,
  BillingSubscription,
  Usage,
  AuthProvider,
} from './index';

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface LoginRequest {
  provider: AuthProvider;
  token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  email: string;
  provider: AuthProvider;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  token: string;
}

// ─────────────────────────────────────────────
// Deployments
// ─────────────────────────────────────────────

export interface CreateDeploymentRequest {
  tier: Tier;
  region: string;
  config: {
    model: string;
    channel: string;
    openrouter_token?: string;
  };
}

export interface CreateDeploymentResponse {
  id: string;
  status: 'provisioning';
  service_name: string;
  created_at: string;
}

export interface ListDeploymentsResponse {
  deployments: Deployment[];
  total: number;
}

export interface DeploymentActionResponse {
  id: string;
  status: string;
  message: string;
}

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export interface UserProfileResponse {
  id: string;
  email: string;
  tier: Tier;
  created_at: string;
  usage: {
    deployments: number;
    messages_today: number;
    cost_today: number;
  };
}

export interface UsageResponse extends Usage {}

// ─────────────────────────────────────────────
// Billing
// ─────────────────────────────────────────────

export interface SubscribeRequest {
  plan: Tier;
  payment_method: string;
}

export interface SubscribeResponse extends BillingSubscription {}

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
