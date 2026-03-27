// ─── User ───
export type Tier = 'free' | 'pro' | 'elite';

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

// ─── Deployment ───
export type DeploymentStatus =
  | 'provisioning'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'restarting'
  | 'destroying'
  | 'error';

export interface Deployment {
  id: string;
  user_id: string;
  service_name: string;
  status: DeploymentStatus;
  tier: Tier;
  region: string;
  model: string;
  channel: string;
  uptime?: number;
  memory_usage?: number;
  memory_limit?: number;
  requests_today?: number;
  cost_this_month?: number;
  created_at: string;
  updated_at: string;
}

// ─── Messages ───
export type MessageRole = 'user' | 'agent';
export type MessageType = 'message' | 'response' | 'status' | 'error';

export interface Message {
  id: string;
  deployment_id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  created_at: string;
}

// ─── Provisioning ───
export type ProvisioningStep =
  | 'auth'
  | 'container'
  | 'swarmclaw'
  | 'models'
  | 'healthcheck';

export interface ProvisioningState {
  currentStep: ProvisioningStep;
  completedSteps: ProvisioningStep[];
  progress: number;
  logs: ProvisioningLog[];
  estimatedRemaining: number;
}

export interface ProvisioningLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

// ─── Pricing ───
export interface PricingTier {
  name: string;
  tier: Tier;
  price: number;
  priceLabel: string;
  features: string[];
  limits: {
    ram: string;
    vcpu: string;
    storage: string;
    uptime: string;
    models: string;
    agents: number;
    team: number;
  };
  popular?: boolean;
}

// ─── AI Models ───
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
}

// ─── Channels ───
export interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

// ─── Usage ───
export interface Usage {
  current_month: {
    deployments: number;
    messages: number;
    cost: number;
  };
  history: {
    date: string;
    messages: number;
    cost: number;
  }[];
}

// ─── Activity ───
export interface Activity {
  id: string;
  action: string;
  timestamp: string;
  icon: string;
}

// ─── API Response ───
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
}
