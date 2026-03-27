/**
 * @danclaw/shared — Barrel Export
 *
 * Re-exports everything from all submodules.
 * Consumers can import from '@danclaw/shared' directly
 * or from subpaths like '@danclaw/shared/types'.
 */

// Types
export * from './types/index';
export * from './types/api';

// Constants
export {
  API_BASE_URL,
  WS_BASE_URL,
  AI_MODELS,
  CHANNELS,
  PRICING_TIERS,
  REGIONS,
  RATE_LIMITS,
  DEPLOYMENT_STATUS_META,
} from './constants/index';
export type { RegionId } from './constants/index';

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
