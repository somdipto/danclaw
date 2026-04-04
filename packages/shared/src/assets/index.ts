/**
 * @danclaw/shared — Assets (Icons, Logo, Illustrations)
 *
 * Re-exports icon components from Lucide React (web) and provides
 * platform-appropriate icon wrappers. Mobile uses SF Symbols / emoji fallbacks.
 *
 * Usage:
 *   Web:  import { Bot, Zap, Server } from '@danclaw/shared/assets';
 *   Mobile: const icons = require('@danclaw/shared/assets'); // returns emoji map
 */

// ─────────────────────────────────────────────
// Icon Map (platform-agnostic, emoji-based for mobile compatibility)
// ─────────────────────────────────────────────

export const ICON_MAP = {
  // Navigation
  home: '🏠',
  settings: '⚙️',
  user: '👤',
  users: '👥',
  bell: '🔔',
  search: '🔍',
  menu: '☰',
  close: '✕',
  back: '←',
  forward: '→',
  chevronDown: '▼',
  chevronUp: '▲',
  chevronRight: '▶',
  chevronLeft: '◀',
  externalLink: '🔗',
  copy: '📋',
  check: '✓',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  info: 'ℹ️',
  loading: '⏳',

  // AI & Agents
  bot: '🤖',
  agent: '🦾',
  brain: '🧠',
  zap: '⚡',
  sparkles: '✨',
  cpu: '💻',
  gpu: '🎮',
  memory: '🧮',
  server: '🖥️',
  database: '🗄️',
  network: '🌐',
  api: '🔌',

  // Deployment & Status
  play: '▶️',
  pause: '⏸️',
  stop: '⏹️',
  restart: '🔄',
  power: '🔌',
  rocket: '🚀',
  deploy: '📦',
  build: '🔨',
  monitor: '📊',
  activity: '📈',
  clock: '🕐',
  uptime: '⌛',

  // Communication
  chat: '💬',
  message: '💭',
  email: '📧',
  send: '📤',
  telegram: '✈️',
  discord: '🎮',
  slack: '💼',
  whatsapp: '💬',
  globe: '🌍',

  // Files & Data
  file: '📄',
  folder: '📁',
  image: '🖼️',
  video: '🎬',
  code: '💻',
  terminal: '🖥️',
  download: '⬇️',
  upload: '⬆️',

  // Billing & Pricing
  credit: '💳',
  dollar: '💵',
  card: '💳',
  receipt: '🧾',
  trending: '📈',
  chart: '📊',

  // Actions
  plus: '➕',
  minus: '➖',
  edit: '✏️',
  trash: '🗑️',
  refresh: '🔃',
  filter: '🔽',
  sort: '🔽',
  star: '⭐',
  flag: '🚩',

  // Tiers
  free: '🆓',
  pro: '💎',
  elite: '👑',

  // Misc
  world: '🌍',
  flagIndia: '🇮🇳',
  flagUs: '🇺🇸',
  flagEu: '🇪🇺',
  link: '🔗',
  lock: '🔒',
  unlock: '🔓',
  eye: '👁️',
  eyeOff: '🙈',
  key: '🔑',
  shield: '🛡️',
  tool: '🔧',
  puzzle: '🧩',
  lightbulb: '💡',
  fire: '🔥',
  worldMap: '🗺️',
} as const;

export type IconName = keyof typeof ICON_MAP;

// ─────────────────────────────────────────────
// SVG Logo Component (inline, no external dependency)
// ─────────────────────────────────────────────

export const DANCLAW_LOGO_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
  <path d="M16 6L8 10.5V21.5L16 26L24 21.5V10.5L16 6Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M16 6V26" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
  <path d="M8 10.5L24 21.5" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
  <path d="M24 10.5L8 21.5" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
  <circle cx="16" cy="16" r="3" fill="white"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6366F1"/>
      <stop offset="1" stop-color="#4F46E5"/>
    </linearGradient>
  </defs>
</svg>`.trim();

export const DANCLAW_LOGO_TEXT_SVG = `<svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="url(#gradient2)"/>
  <path d="M16 6L8 10.5V21.5L16 26L24 21.5V10.5L16 6Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M16 6V26" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
  <path d="M8 10.5L24 21.5" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
  <path d="M24 10.5L8 21.5" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
  <circle cx="16" cy="16" r="3" fill="white"/>
  <text x="40" y="22" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="16" fill="white">DanClaw</text>
  <defs>
    <linearGradient id="gradient2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6366F1"/>
      <stop offset="1" stop-color="#4F46E5"/>
    </linearGradient>
  </defs>
</svg>`.trim();

// ─────────────────────────────────────────────
// Empty State Illustrations (SVG strings)
// ─────────────────────────────────────────────

export const EMPTY_DEPLOYMENTS_SVG = `<svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="40" width="60" height="50" rx="8" stroke="#374151" stroke-width="2" stroke-dasharray="4 4"/>
  <rect x="50" y="60" width="60" height="50" rx="8" stroke="#374151" stroke-width="2" stroke-dasharray="4 4"/>
  <rect x="70" y="80" width="60" height="50" rx="8" stroke="#6366F1" stroke-width="2"/>
  <circle cx="100" cy="105" r="8" fill="#6366F1" fill-opacity="0.3"/>
  <path d="M96 105L99 108L104 102" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 30V20M100 130V120M30 70H20M160 70H150" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 6"/>
</svg>`.trim();

export const EMPTY_MESSAGES_SVG = `<svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 100C30 66 66 40 100 40C134 40 170 66 170 100" stroke="#374151" stroke-width="2" stroke-dasharray="6 4"/>
  <rect x="40" y="55" width="50" height="35" rx="8" stroke="#374151" stroke-width="2"/>
  <rect x="110" y="65" width="50" height="35" rx="8" stroke="#6366F1" stroke-width="2"/>
  <circle cx="65" cy="72" r="3" fill="#374151"/>
  <circle cx="75" cy="72" r="3" fill="#374151"/>
  <circle cx="85" cy="72" r="3" fill="#374151"/>
  <circle cx="135" cy="82" r="3" fill="#6366F1"/>
  <circle cx="145" cy="82" r="3" fill="#6366F1"/>
  <circle cx="155" cy="82" r="3" fill="#6366F1"/>
</svg>`.trim();

export const EMPTY_ACTIVITY_SVG = `<svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="60" y1="30" x2="60" y2="130" stroke="#374151" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="60" cy="50" r="8" stroke="#6366F1" stroke-width="2"/>
  <circle cx="60" cy="80" r="8" stroke="#374151" stroke-width="2"/>
  <circle cx="60" cy="110" r="8" stroke="#374151" stroke-width="2"/>
  <rect x="80" y="42" width="80" height="16" rx="4" fill="#1F2937"/>
  <rect x="80" y="72" width="60" height="16" rx="4" fill="#1F2937"/>
  <rect x="80" y="102" width="70" height="16" rx="4" fill="#1F2937"/>
</svg>`.trim();

export const ERROR_STATE_SVG = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="50" stroke="#EF4444" stroke-width="2" stroke-opacity="0.3"/>
  <circle cx="60" cy="60" r="35" stroke="#EF4444" stroke-width="2" stroke-opacity="0.5"/>
  <path d="M45 45L75 75M75 45L45 75" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
</svg>`.trim();

export const LOADING_STATE_SVG = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="45" stroke="#374151" stroke-width="2" stroke-dasharray="8 4"/>
  <path d="M60 15A45 45 0 0 1 105 60" stroke="#6366F1" stroke-width="3" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="1s" repeatCount="indefinite"/>
  </path>
</svg>`.trim();
