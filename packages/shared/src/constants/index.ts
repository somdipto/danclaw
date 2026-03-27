/**
 * @danclaw/shared — Constants
 *
 * Application-wide constants. These values define the product catalog
 * (models, channels, pricing) and configuration defaults.
 */

import type {
  AIModel,
  Channel,
  PricingTier,
  DeploymentStatus,
  Tier,
} from '../types';

// ─────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────

/**
 * Base API URL. Override at the app level via environment variables
 * (NEXT_PUBLIC_API_URL or EXPO_PUBLIC_API_URL).
 */
export const API_BASE_URL = 'https://api.danglasses.ai';

/**
 * Base WebSocket URL. Override at the app level via environment variables
 * (NEXT_PUBLIC_WS_URL or EXPO_PUBLIC_WS_URL).
 */
export const WS_BASE_URL = 'wss://api.danglasses.ai';

// ─────────────────────────────────────────────
// AI Models (OpenRouter-compatible IDs)
// ─────────────────────────────────────────────

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-3-sonnet',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    description: 'Most capable model for complex tasks',
    icon: '🟣',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-5.2',
    provider: 'OpenAI',
    description: 'Fast and versatile general-purpose model',
    icon: '🟢',
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 3 Flash',
    provider: 'Google',
    description: 'Lightning fast with huge context window',
    icon: '🔵',
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open-source and highly customizable',
    icon: '🟠',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'European AI with strong multilingual support',
    icon: '🔴',
  },
  {
    id: 'qwen-2-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba',
    description: 'Excellent for code and mathematics',
    icon: '🟡',
  },
];

// ─────────────────────────────────────────────
// Channels
// ─────────────────────────────────────────────

export const CHANNELS: Channel[] = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', description: 'Bot API integration', available: true },
  { id: 'discord', name: 'Discord', icon: '🎮', description: 'Server bot integration', available: true },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', description: 'Business API', available: true },
  { id: 'slack', name: 'Slack', icon: '💼', description: 'Workspace integration', available: true },
  { id: 'web', name: 'Web Chat', icon: '🌐', description: 'Embedded widget', available: true },
  { id: 'imessage', name: 'iMessage', icon: '🍎', description: 'Coming soon', available: false },
];

// ─────────────────────────────────────────────
// Pricing Tiers
// ─────────────────────────────────────────────

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    tier: 'free',
    price: 0,
    priceLabel: '$0/mo',
    features: [
      '1 AI agent',
      '50 AI models',
      '12hrs/day uptime',
      '512MB RAM',
      '10GB storage',
      'Community support',
    ],
    limits: {
      ram: '512MB',
      vcpu: '0.25',
      storage: '10GB',
      uptime: '12hrs/day',
      models: '50',
      agents: 1,
      team: 1,
    },
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: 29.99,
    priceLabel: '$29.99/mo',
    popular: true,
    features: [
      '5 AI agents',
      '500+ AI models',
      '24/7 uptime',
      '4GB RAM',
      '100GB storage',
      'Priority support',
      'Custom domains',
      'Team (3 members)',
    ],
    limits: {
      ram: '4GB',
      vcpu: '2',
      storage: '100GB',
      uptime: '24/7',
      models: '500+',
      agents: 5,
      team: 3,
    },
  },
  {
    name: 'Elite',
    tier: 'elite',
    price: 99.99,
    priceLabel: '$99.99/mo',
    features: [
      '20 AI agents',
      'All models + custom',
      '24/7 uptime + SLA',
      '16GB RAM',
      '500GB storage',
      'Dedicated support',
      'Custom domains',
      'Team (10 members)',
      'Advanced analytics',
      'White-label',
    ],
    limits: {
      ram: '16GB',
      vcpu: '4',
      storage: '500GB',
      uptime: '24/7',
      models: 'All + Custom',
      agents: 20,
      team: 10,
    },
  },
];

// ─────────────────────────────────────────────
// Regions
// ─────────────────────────────────────────────

export const REGIONS = [
  { id: 'us-central1', name: 'US Central', flag: '🇺🇸' },
  { id: 'eu-west1', name: 'EU West', flag: '🇪🇺' },
  { id: 'ap-south1', name: 'Asia Pacific', flag: '🇮🇳' },
] as const;

export type RegionId = typeof REGIONS[number]['id'];

// ─────────────────────────────────────────────
// Rate Limits (per docs/API.md)
// ─────────────────────────────────────────────

export const RATE_LIMITS: Record<Tier, { requests_per_min: number; messages_per_min: number }> = {
  free: { requests_per_min: 100, messages_per_min: 10 },
  pro: { requests_per_min: 1000, messages_per_min: 100 },
  elite: { requests_per_min: 5000, messages_per_min: 500 },
};

// ─────────────────────────────────────────────
// Deployment Status Metadata
// ─────────────────────────────────────────────

export const DEPLOYMENT_STATUS_META: Record<DeploymentStatus, { label: string; color: string }> = {
  provisioning: { label: 'Provisioning', color: '#6366f1' },
  starting: { label: 'Starting', color: '#6366f1' },
  running: { label: 'Running', color: '#22c55e' },
  stopping: { label: 'Stopping', color: '#f59e0b' },
  stopped: { label: 'Stopped', color: '#6b7280' },
  restarting: { label: 'Restarting', color: '#f59e0b' },
  destroying: { label: 'Destroying', color: '#ef4444' },
  error: { label: 'Error', color: '#ef4444' },
};
