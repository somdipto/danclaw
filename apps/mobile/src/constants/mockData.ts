/**
 * Mock data for DanClaw mobile app — mirrors the web app data
 */

export interface Deployment {
  id: string;
  service_name: string;
  model: string;
  channel: string;
  status: 'running' | 'stopped' | 'error' | 'provisioning';
  region: string;
  requests_today: number;
  cost_this_month: number;
  memory_usage: number;
  memory_limit: number;
  uptime: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export const mockDeployments: Deployment[] = [
  {
    id: 'dep_1',
    service_name: 'Support Bot Alpha',
    model: 'Claude 3.5 Sonnet',
    channel: 'Telegram',
    status: 'running',
    region: 'US Central',
    requests_today: 1247,
    cost_this_month: 12.5,
    memory_usage: 1.2,
    memory_limit: 4,
    uptime: '14d 6h',
  },
  {
    id: 'dep_2',
    service_name: 'Research Assistant',
    model: 'GPT-5.2',
    channel: 'Discord',
    status: 'running',
    region: 'EU West',
    requests_today: 832,
    cost_this_month: 18.75,
    memory_usage: 2.1,
    memory_limit: 4,
    uptime: '7d 12h',
  },
  {
    id: 'dep_3',
    service_name: 'Code Reviewer',
    model: 'Gemini 3 Flash',
    channel: 'Web Widget',
    status: 'stopped',
    region: 'US Central',
    requests_today: 0,
    cost_this_month: 4.2,
    memory_usage: 0,
    memory_limit: 4,
    uptime: '0d',
  },
];

export const aiModels: AIModel[] = [
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best for conversations', icon: '🟣' },
  { id: 'gpt-5', name: 'GPT-5.2', provider: 'OpenAI', description: 'Most capable', icon: '🟢' },
  { id: 'gemini-flash', name: 'Gemini 3 Flash', provider: 'Google', description: 'Fastest response', icon: '🔵' },
  { id: 'llama-4', name: 'Llama 4 Scout', provider: 'Meta', description: 'Open source', icon: '🟠' },
  { id: 'qwen-3', name: 'Qwen 3', provider: 'Alibaba', description: 'Multilingual', icon: '🔴' },
  { id: 'deepseek-r2', name: 'DeepSeek R2', provider: 'DeepSeek', description: 'Reasoning', icon: '⚪' },
];

export const channels: Channel[] = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', description: 'Bot API integration', available: true },
  { id: 'discord', name: 'Discord', icon: '🎮', description: 'Discord bot', available: true },
  { id: 'web', name: 'Web Widget', icon: '🌐', description: 'Embeddable chat', available: true },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱', description: 'Business API', available: false },
  { id: 'slack', name: 'Slack', icon: '💼', description: 'Workspace bot', available: false },
];

export const mockMessages: ChatMessage[] = [
  { id: '1', role: 'agent', content: "👋 Hello! I'm your AI assistant powered by Claude 3.5 Sonnet. How can I help you today?", timestamp: '10:30 AM' },
  { id: '2', role: 'user', content: 'Can you check my email inbox for important messages?', timestamp: '10:31 AM' },
  { id: '3', role: 'agent', content: "I've scanned your inbox. You have 3 important emails:\n\n1. Team standup — Rescheduled to 4 PM\n2. Client proposal — Needs review by tomorrow\n3. Deploy notification — Agent gamma deployed ✅\n\nWant me to draft a reply?", timestamp: '10:31 AM' },
  { id: '4', role: 'user', content: 'Draft a reply to the client proposal one', timestamp: '10:32 AM' },
  { id: '5', role: 'agent', content: "Here's a draft reply:\n\n\"Thank you for the proposal. I've reviewed the key points and have a few suggestions I'd like to discuss. Could we schedule a 30-minute call tomorrow afternoon?\"\n\nShall I send it?", timestamp: '10:33 AM' },
];
