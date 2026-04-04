/**
 * @danclaw/shared — Mock Data
 *
 * Unified mock dataset conforming to canonical types.
 * Used by both web and mobile apps during development.
 * Will be replaced by real InsForge.dev API calls in Phase 4.
 */

import type {
  User,
  Deployment,
  Message,
  Activity,
  Usage,
} from '../types';

// ─────────────────────────────────────────────
// Mock User
// ─────────────────────────────────────────────

export const mockUser: User = {
  id: 'usr_01HZ4X2K3YN',
  email: 'dan@danglasses.ai',
  name: 'Dan',
  avatar: undefined,
  tier: 'pro',
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-27T12:00:00Z',
};

// ─────────────────────────────────────────────
// Mock Deployments
// ─────────────────────────────────────────────

export const mockDeployments: Deployment[] = [
  {
    id: 'dep_01',
    user_id: mockUser.id,
    service_name: 'agent-alpha-7k3',
    status: 'running',
    tier: 'pro',
    region: 'us-central1',
    model: 'claude-3-sonnet',
    channel: 'telegram',
    uptime: 234832,
    memory_usage: 2.1,
    memory_limit: 4,
    requests_today: 1247,
    cost_this_month: 12.5,
    created_at: '2026-03-20T08:00:00Z',
    updated_at: '2026-03-27T12:00:00Z',
  },
  {
    id: 'dep_02',
    user_id: mockUser.id,
    service_name: 'agent-beta-9m1',
    status: 'running',
    tier: 'pro',
    region: 'eu-west1',
    model: 'gpt-4o',
    channel: 'discord',
    uptime: 172800,
    memory_usage: 1.8,
    memory_limit: 4,
    requests_today: 832,
    cost_this_month: 8.75,
    created_at: '2026-03-22T14:00:00Z',
    updated_at: '2026-03-27T12:00:00Z',
  },
  {
    id: 'dep_03',
    user_id: mockUser.id,
    service_name: 'agent-gamma-2x5',
    status: 'stopped',
    tier: 'free',
    region: 'us-central1',
    model: 'gemini-2-flash',
    channel: 'whatsapp',
    uptime: 0,
    memory_usage: 0,
    memory_limit: 0.5,
    requests_today: 0,
    cost_this_month: 0,
    created_at: '2026-03-15T09:00:00Z',
    updated_at: '2026-03-25T18:00:00Z',
  },
];

// ─────────────────────────────────────────────
// Mock Messages
// ─────────────────────────────────────────────

export const mockMessages: Message[] = [
  {
    id: 'msg_01',
    deployment_id: 'dep_01',
    role: 'user',
    content: 'Can you summarize my emails from today?',
    type: 'message',
    created_at: '2026-03-27T10:00:00Z',
  },
  {
    id: 'msg_02',
    deployment_id: 'dep_01',
    role: 'agent',
    content:
      "Here's a summary of your 12 emails today:\n\n**Priority:**\n- 🔴 Client review deadline moved to Friday\n- 🟡 Team standup rescheduled to 3 PM\n\n**Updates:**\n- New PR merged for auth module\n- Design feedback on dashboard mockups\n- Q1 report draft ready for review\n\n**FYI:**\n- 5 newsletter/promotional emails archived\n\nWould you like me to draft a reply to any of these?",
    type: 'response',
    created_at: '2026-03-27T10:00:03Z',
  },
  {
    id: 'msg_03',
    deployment_id: 'dep_01',
    role: 'user',
    content: 'Draft a reply to the client about the review deadline',
    type: 'message',
    created_at: '2026-03-27T10:01:00Z',
  },
  {
    id: 'msg_04',
    deployment_id: 'dep_01',
    role: 'agent',
    content:
      "Here's a draft reply:\n\n---\n\n**Subject:** Re: Review Deadline Update\n\nHi Sarah,\n\nThank you for the heads up on the revised timeline. Friday works well for our team — we'll have the final deliverables ready by EOD Thursday to give you time to review.\n\nPlease let me know if you need anything else in the meantime.\n\nBest regards,\nDan\n\n---\n\nShall I send this, or would you like to make changes?",
    type: 'response',
    created_at: '2026-03-27T10:01:05Z',
  },
];

// ─────────────────────────────────────────────
// Mock Activity
// ─────────────────────────────────────────────

export const mockActivity: Activity[] = [
  { id: 'act_01', user_id: mockUser.id, action: 'Email triaged and summarized', timestamp: '2026-03-27T09:55:00Z', icon: '📧' },
  { id: 'act_02', user_id: mockUser.id, action: 'Pull request reviewed', timestamp: '2026-03-27T09:48:00Z', icon: '🔀' },
  { id: 'act_03', user_id: mockUser.id, action: 'Quarterly report drafted', timestamp: '2026-03-27T09:00:00Z', icon: '📝' },
  { id: 'act_04', user_id: mockUser.id, action: 'Meeting scheduled with client', timestamp: '2026-03-27T08:00:00Z', icon: '📅' },
  { id: 'act_05', user_id: mockUser.id, action: 'Slack messages answered', timestamp: '2026-03-27T07:00:00Z', icon: '💬' },
  { id: 'act_06', user_id: mockUser.id, action: 'Database backup completed', timestamp: '2026-03-27T05:00:00Z', icon: '💾' },
];

// ─────────────────────────────────────────────
// Mock Usage
// ─────────────────────────────────────────────

export const mockUsage: Usage = {
  current_month: {
    deployments: 3,
    messages: 15247,
    cost: 21.25,
  },
  history: [
    { date: '2026-03-26', messages: 1247, cost: 4.23 },
    { date: '2026-03-25', messages: 982, cost: 3.15 },
    { date: '2026-03-24', messages: 1431, cost: 4.87 },
    { date: '2026-03-23', messages: 876, cost: 2.98 },
    { date: '2026-03-22', messages: 1102, cost: 3.74 },
    { date: '2026-03-21', messages: 1350, cost: 4.59 },
    { date: '2026-03-20', messages: 1089, cost: 3.71 },
  ],
};
