/**
 * Re-export mock data and constants from @danclaw/shared.
 *
 * Mobile screens import from this file for convenience.
 * All types come from @danclaw/shared directly.
 */

// Re-export types used by mobile screens
export type { Deployment, AIModel, Channel, Message } from '@danclaw/shared';

// Re-export as ChatMessage for backward compatibility with mobile screens
export type { Message as ChatMessage } from '@danclaw/shared';

// Re-export mock data
export { mockDeployments, mockMessages, AI_MODELS as aiModels, CHANNELS as channels } from '@danclaw/shared';

// Re-export utilities used by mobile screens
export { formatUptime, formatCurrency, getStatusColor, getStatusLabel, formatTime } from '@danclaw/shared';
