/**
 * @danclaw/shared — Barrel Export
 *
 * Re-exports everything from all submodules.
 * Consumers can import from '@danclaw/shared' directly
 * or from subpaths like '@danclaw/shared/types'.
 */

// Types
export * from './types/index';
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  RefreshResponse,
  CreateDeploymentRequest,
  CreateDeploymentResponse,
  ListDeploymentsResponse,
  DeploymentActionResponse,
  UserProfileResponse,
  UsageResponse,
  ListMessagesResponse,
  SubscribeRequest,
  SubscribeResponse,
  CancelResponse,
  BillingPortalResponse,
  RevenueCatWebhookPayload,
  InsForgeWebhookPayload,
  WebhookPayload,
} from './types/api';

// Constants
export {
  AI_MODELS,
  CHANNELS,
  PRICING_TIERS,
  REGIONS,
  ACTIVITY_ICONS,
  DEPLOYMENT_STATUS_COLORS,
} from './constants/index';
export type {
  AIModel,
  PricingTierLimits,
  PricingTier,
  DeploymentStatus,
  Region,
  Channel,
} from './constants/index';

// Validators
export {
  tierSchema,
  authProviderSchema,
  deploymentStatusSchema,
  messageRoleSchema,
  messageTypeSchema,
  loginSchema,
  registerSchema,
  refreshSchema,
  createDeploymentSchema,
  messageSchema,
  webSocketMessageSchema,
  subscribeSchema,
  userSchema,
  activitySchema,
  deployConfigSchema,
} from './validators/index';

// Mock Data
export {
  mockUser,
  mockDeployments,
  mockMessages,
  mockActivity,
  mockUsage,
} from './mock/index';

// Utils
export {
  formatUptime,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  formatRelativeTime,
  formatTime,
  truncate,
} from './utils/index';
