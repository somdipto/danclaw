/**
 * @danclaw/shared — Canonical Type Definitions
 *
 * These types are the SINGLE SOURCE OF TRUTH for the entire DanClaw platform.
 * Both web (Next.js) and mobile (Expo) apps MUST import from here.
 *
 * Aligned with: docs/API.md, docs/ARCHITECTURE.md
 */

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

/** OAuth providers supported by InsForge Auth */
export type AuthProvider = 'google' | 'apple' | 'github';

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

/** Subscription tier — maps to pricing plans */
export type Tier = 'free' | 'pro' | 'elite';

/** User profile as stored in InsForge PostgreSQL */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: Tier;
  openrouter_token?: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Deployments
// ─────────────────────────────────────────────

/**
 * All possible deployment lifecycle states.
 * Matches the state machine in docs/ARCHITECTURE.md.
 */
export type DeploymentStatus =
  | 'provisioning'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'restarting'
  | 'destroying'
  | 'error';

/** A deployed AI agent instance */
export interface Deployment {
  id: string;
  user_id: string;
  service_name: string;
  status: DeploymentStatus;
  tier: Tier;
  region: string;
  model: string;
  channel: string;
  /** Uptime in seconds since last start */
  uptime?: number;
  /** Current memory usage in GB */
  memory_usage?: number;
  /** Memory limit in GB for this tier */
  memory_limit?: number;
  /** Number of API requests processed today */
  requests_today?: number;
  /** Accumulated cost this billing cycle in USD */
  cost_this_month?: number;
  created_at: string;
  updated_at: string;
}

/** Configuration submitted when creating a new deployment */
export interface DeployConfig {
  model: string;
  channel: string;
  tier: Tier;
  region: string;
  openrouter_token?: string;
}

// ─────────────────────────────────────────────
// Messages / Chat
// ─────────────────────────────────────────────

export type MessageRole = 'user' | 'agent';

/**
 * Message types for the WebSocket protocol.
 * - message: user-sent text
 * - response: agent reply
 * - status: agent thinking/processing indicator
 * - error: server-side error
 */
export type MessageType = 'message' | 'response' | 'status' | 'error';

/** A single chat message stored in InsForge PostgreSQL */
export interface Message {
  id: string;
  deployment_id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  created_at: string;
}

/**
 * WebSocket message envelope — what goes over the wire.
 * Matches docs/API.md WebSocket protocol.
 */
export interface WebSocketMessage {
  type: MessageType;
  content: string;
  timestamp: string;
  /** Only present on error messages */
  code?: number;
  /** Only present on status messages */
  status?: string;
  message?: string;
}

// ─────────────────────────────────────────────
// Provisioning
// ─────────────────────────────────────────────

export type ProvisioningStep =
  | 'auth'
  | 'container'
  | 'swarmclaw'
  | 'models'
  | 'healthcheck';

export interface ProvisioningLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface ProvisioningState {
  currentStep: ProvisioningStep;
  completedSteps: ProvisioningStep[];
  progress: number;
  logs: ProvisioningLog[];
  estimatedRemaining: number;
}

// ─────────────────────────────────────────────
// AI Models & Channels
// ─────────────────────────────────────────────

/** An AI model available through OpenRouter */
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
}

/** A deployment channel (Telegram, Discord, etc.) */
export interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

// ─────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────

export interface PricingTierLimits {
  ram: string;
  vcpu: string;
  storage: string;
  uptime: string;
  models: string;
  agents: number;
  team: number;
}

export interface PricingTier {
  name: string;
  tier: Tier;
  price: number;
  priceLabel: string;
  features: string[];
  limits: PricingTierLimits;
  popular?: boolean;
}

// ─────────────────────────────────────────────
// Usage & Billing
// ─────────────────────────────────────────────

export interface UsageDay {
  date: string;
  messages: number;
  cost: number;
}

export interface Usage {
  current_month: {
    deployments: number;
    messages: number;
    cost: number;
  };
  history: UsageDay[];
}

/** Wrapper matching what the API client returns */
export interface UsageResponse {
  usage: {
    total_requests: number;
    cost: number;
    models: string[];
  };
}

export interface BillingSubscription {
  subscription_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  plan: Tier;
  next_billing: string;
  end_date?: string;
}

/** Response envelope for listing messages */
export interface ListMessagesResponse {
  messages: Message[];
  total: number;
}

// ─────────────────────────────────────────────
// Activity Feed
// ─────────────────────────────────────────────

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  timestamp: string;
  icon?: string;
}

// ─────────────────────────────────────────────
// API Response Envelope
// ─────────────────────────────────────────────

export interface ApiError {
  code: number;
  message: string;
  details?: string;
}

/**
 * Standard API response wrapper.
 * Every endpoint returns either `data` or `error`, never both.
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// ─────────────────────────────────────────────
// API Request/Response Types
// ─────────────────────────────────────────────

export interface CreateDeploymentRequest {
  service_name: string;
  tier: Tier;
  region: string;
  model: string;
  channel: string;
  openrouter_token?: string;
}

export interface CreateDeploymentResponse {
  deployment: Deployment;
}

export interface ListDeploymentsResponse {
  deployments: Deployment[];
  total: number;
}

export interface DeploymentActionResponse {
  success: boolean;
  message?: string;
}

export interface UserProfileResponse {
  user: User;
}

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
  cancelled: boolean;
  end_date: string;
}
