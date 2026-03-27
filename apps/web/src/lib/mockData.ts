/**
 * Re-export all mock data from @danclaw/shared.
 *
 * This file exists for backward compatibility so that existing
 * `import { ... } from '@/lib/mockData'` statements continue to work.
 * It also re-exports constants (AI_MODELS, CHANNELS, PRICING_TIERS)
 * which were previously defined inline here.
 */

export {
  mockUser,
  mockDeployments,
  mockMessages,
  mockActivity,
  mockUsage,
  AI_MODELS,
  CHANNELS,
  PRICING_TIERS,
} from '@danclaw/shared';

// Re-export with the old variable names used by web pages
export { AI_MODELS as aiModels } from '@danclaw/shared';
export { CHANNELS as channels } from '@danclaw/shared';
export { PRICING_TIERS as pricingTiers } from '@danclaw/shared';
