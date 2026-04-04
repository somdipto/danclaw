/**
 * @danclaw/shared — Constants
 *
 * Application-wide constants. These values define the product catalog
 * (models, channels, pricing) and configuration defaults.
 */

// ============================================================
// DanClaw Constants - AI Models, Pricing, Regions, Channels
// ============================================================

// ─────────────────────────────────────────────
// AI Models (OpenRouter)
// ─────────────────────────────────────────────

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Best for coding, analysis, and reasoning',
    icon: 'brain',
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable model for complex tasks',
    icon: 'cpu',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Fast, intelligent, multi-modal',
    icon: 'message-square',
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Fast and capable for complex tasks',
    icon: 'zap',
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    description: 'Long context, strong reasoning',
    icon: 'gem',
  },
  {
    id: 'mistralai/mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    description: 'Fast, open, efficient mixture-of-experts',
    icon: 'layers',
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open source, strong performance',
    icon: 'github',
  },
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    description: 'RAG and tool use optimized',
    icon: 'book-open',
  },
];

// ─────────────────────────────────────────────
// Pricing Tiers
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
  tier: 'free' | 'pro' | 'elite';
  price: number;
  priceLabel: string;
  features: string[];
  limits: PricingTierLimits;
  popular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    tier: 'free',
    price: 0,
    priceLabel: '$0/mo',
    features: [
      '1 AI Agent',
      'Telegram Channel',
      '1GB RAM',
      '100 requests/day',
      'Community Support',
    ],
    limits: {
      ram: '1GB',
      vcpu: '0.5',
      storage: '5GB',
      uptime: '8hrs/day',
      models: 'Basic models only',
      agents: 1,
      team: 1,
    },
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: 29,
    priceLabel: '$29/mo',
    popular: true,
    features: [
      '5 AI Agents',
      'All Channels',
      '4GB RAM per agent',
      '10,000 requests/day',
      'All AI Models',
      'Priority Support',
      'Custom Branding',
    ],
    limits: {
      ram: '4GB',
      vcpu: '2',
      storage: '50GB',
      uptime: '24/7',
      models: 'All 500+ models',
      agents: 5,
      team: 3,
    },
  },
  {
    name: 'Elite',
    tier: 'elite',
    price: 99,
    priceLabel: '$99/mo',
    features: [
      'Unlimited AI Agents',
      'All Channels',
      '16GB RAM per agent',
      'Unlimited requests',
      'All AI Models',
      'Dedicated Support',
      'Custom Branding',
      'Advanced Analytics',
      'Webhook Integrations',
    ],
    limits: {
      ram: '16GB',
      vcpu: '8',
      storage: '200GB',
      uptime: '24/7',
      models: 'All 500+ models',
      agents: -1, // unlimited
      team: 10,
    },
  },
];

// ─────────────────────────────────────────────
// Deployment Status Colors
// ─────────────────────────────────────────────

export type DeploymentStatus = 
  | 'provisioning'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'restarting'
  | 'destroying'
  | 'error';

export const DEPLOYMENT_STATUS_COLORS: Record<DeploymentStatus, string> = {
  provisioning: '#FFB020', // amber
  starting: '#3B82F6',      // blue
  running: '#22C55E',       // green
  stopping: '#F97316',      // orange
  stopped: '#6B7280',      // gray
  restarting: '#3B82F6',    // blue
  destroying: '#EF4444',    // red
  error: '#EF4444',         // red
};

// ─────────────────────────────────────────────
// Regions
// ─────────────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  flag: string;
  available: boolean;
}

export const REGIONS: Region[] = [
  { id: 'us-central1', name: 'US Central', flag: '🇺🇸', available: true },
  { id: 'us-east1', name: 'US East', flag: '🇺🇸', available: true },
  { id: 'eu-west1', name: 'Europe West', flag: '🇪🇺', available: true },
  { id: 'eu-central1', name: 'Europe Central', flag: '🇪🇺', available: true },
  { id: 'asia-east1', name: 'Asia East', flag: '🇯🇵', available: true },
  { id: 'asia-south1', name: 'Asia South', flag: '🇮🇳', available: true },
  { id: 'australia-southeast1', name: 'Australia', flag: '🇦🇺', available: true },
];

// ─────────────────────────────────────────────
// Channels
// ─────────────────────────────────────────────

export interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

export const CHANNELS: Channel[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send',
    description: 'Deploy to Telegram bot with seamless messaging',
    available: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'message-circle',
    description: 'Add to your Discord server as a bot',
    available: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'phone',
    description: 'Connect via WhatsApp Business API',
    available: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'hash',
    description: 'Integrate with Slack workspace',
    available: true,
  },
  {
    id: 'web',
    name: 'Web Chat',
    icon: 'globe',
    description: 'Embeddable chat widget for your website',
    available: true,
  },
  {
    id: 'api',
    name: 'API',
    icon: 'code',
    description: 'REST API for custom integrations',
    available: true,
  },
  {
    id: 'whatsapp-cloud',
    name: 'WhatsApp Cloud',
    icon: 'cloud',
    description: 'Meta WhatsApp Cloud API (no business account needed)',
    available: true,
  },
];

// ─────────────────────────────────────────────
// Activity Icons
// ─────────────────────────────────────────────

export const ACTIVITY_ICONS = {
  deployment: 'rocket',
  upgrade: 'arrow-up-circle',
  chat: 'message-square',
  settings: 'settings',
  error: 'alert-circle',
  success: 'check-circle',
  payment: 'credit-card',
} as const;
