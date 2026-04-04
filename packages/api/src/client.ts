/**
 * @danclaw/api — DanClawClient (InsForge REST API)
 *
 * Uses direct REST API calls to InsForge backend.
 * Base URL: https://tq33kiup.ap-southeast.insforge.app
 * Auth: Bearer <ik_ac...> API key
 *
 * API Patterns:
 *   POST   {base}/api/auth/users          → register
 *   POST   {base}/api/auth/sessions       → login
 *   GET    {base}/api/auth/me             → get current user
 *   GET    {base}/api/database/records/{table}  → list
 *   POST   {base}/api/database/records/{table}  → create
 *   PATCH  {base}/api/database/records/{table}/{id} → update
 *   DELETE {base}/api/database/records/{table}/{id} → delete
 */

import type {
  ApiResponse,
  User,
  Deployment,
  Message,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateDeploymentRequest,
  CreateDeploymentResponse,
  ListDeploymentsResponse,
  DeploymentActionResponse,
  UserProfileResponse,
  UsageResponse,
} from '@danclaw/shared';

// ─────────────────────────────────────────────
// Environment
// ─────────────────────────────────────────────

function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env[`NEXT_PUBLIC_${key}`] ||
      process.env[`EXPO_PUBLIC_${key}`] ||
      ''
    );
  }
  return '';
}

const INSFORGE_BASE = getEnv('INSFORGE_URL') || 'https://tq33kiup.ap-southeast.insforge.app';
const INSFORGE_KEY = getEnv('INSFORGE_ANON_KEY') || 'ik_ac021317adcb7995b6f8e53075757fc1';

// ─────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────

interface InsForgeError {
  error?: string;
  message?: string;
  statusCode?: number;
  code?: string;
}

async function insfetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${INSFORGE_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${INSFORGE_KEY}`,
    ...(options.headers as Record<string, string>),
  };

  // If body is an object, stringify it
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let err: InsForgeError = { statusCode: response.status };
    try {
      const text = await response.text();
      err = { ...err, ...JSON.parse(text) };
    } catch { /* ignore */ }
    return {
      error: {
        code: err.statusCode || response.status,
        message: err.message || err.error || 'Request failed',
      },
    };
  }

  const text = await response.text();
  if (!text) return { data: {} as T };

  try {
    return { data: JSON.parse(text) as T };
  } catch {
    return { data: text as unknown as T };
  }
}

// ─────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await insfetch<{ id: string }>('/api/auth/me');
  if (error || !data?.id) return null;
  return data.id;
}

// ─────────────────────────────────────────────
// DanClawClient
// ─────────────────────────────────────────────

export class DanClawClient {
  // Auth
  async login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const { data, error } = await insfetch<{
      accessToken: string;
      user: { id: string; email: string };
    }>('/api/auth/sessions', {
      method: 'POST',
      body: { email: req.email, password: req.password },
    });

    if (error || !data?.accessToken) {
      return { error: { code: 401, message: error?.error?.message || 'Login failed' } };
    }

    return {
      data: {
        token: data.accessToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: '',
          tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    };
  }

  async register(req: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const { data, error } = await insfetch<{
      accessToken: string;
      user: { id: string; email: string };
    }>('/api/auth/users', {
      method: 'POST',
      body: { email: req.email, password: req.password, name: req.name },
    });

    if (error || !data?.accessToken) {
      return { error: { code: 400, message: error?.error?.message || 'Registration failed' } };
    }

    return {
      data: {
        token: data.accessToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: req.name || '',
          tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    };
  }

  async signOut(): Promise<ApiResponse<{ success: boolean }>> {
    return { data: { success: true } };
  }

  // User
  async getProfile(): Promise<ApiResponse<UserProfileResponse>> {
    const userId = await getCurrentUserId();
    if (!userId) return { error: { code: 401, message: 'Not authenticated' } };

    const { data, error } = await insfetch<User[]>('/api/database/records/users', {
      headers: { 'Authorization': `Bearer ${INSFORGE_KEY}`, 'Prefer': 'count=exact' },
    });

    const user = Array.isArray(data) ? data.find(u => (u as User).id === userId) : null;
    if (!user) return { error: { code: 404, message: 'User not found' } };

    return { data: { user: user as User } };
  }

  async getUsage(): Promise<ApiResponse<UsageResponse>> {
    const userId = await getCurrentUserId();
    if (!userId) return { error: { code: 401, message: 'Not authenticated' } };

    const { data } = await insfetch<Deployment[]>('/api/database/records/deployments');
    const deployments = Array.isArray(data) ? data : [];
    const totalRequests = deployments.reduce((sum, d) => sum + ((d as Deployment).requests_today || 0), 0);
    const totalCost = deployments.reduce((sum, d) => sum + ((d as Deployment).cost_this_month || 0), 0);

    return { data: { usage: { total_requests: totalRequests, cost: totalCost, models: [] } } };
  }

  // Deployments
  async createDeployment(req: CreateDeploymentRequest): Promise<ApiResponse<CreateDeploymentResponse>> {
    const userId = await getCurrentUserId();
    if (!userId) return { error: { code: 401, message: 'Not authenticated' } };

    const { data, error } = await insfetch<Deployment[]>('/api/database/records/deployments', {
      method: 'POST',
      body: { ...req, user_id: userId, status: 'provisioning', uptime: 0, memory_usage: 0, requests_today: 0, cost_this_month: 0 },
    });

    if (error) return { error };
    const deployment = Array.isArray(data) ? data[0] : null;
    if (!deployment) return { error: { code: 500, message: 'Failed to create deployment' } };

    return { data: { deployment } };
  }

  async getDeployment(id: string): Promise<ApiResponse<Deployment>> {
    const { data, error } = await insfetch<Deployment>(`/api/database/records/deployments/${id}`);
    if (error) return { error };
    if (!data) return { error: { code: 404, message: 'Deployment not found' } };
    return { data };
  }

  async listDeployments(): Promise<ApiResponse<ListDeploymentsResponse>> {
    const { data, error } = await insfetch<Deployment[]>('/api/database/records/deployments');
    if (error) return { error };
    const deployments = Array.isArray(data) ? data : [];
    return { data: { deployments, total: deployments.length } };
  }

  async startDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insfetch(`/api/database/records/deployments/${id}`, {
      method: 'PATCH',
      body: { status: 'starting' },
    });
    if (error) return { error };
    return { data: { success: true } };
  }

  async stopDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insfetch(`/api/database/records/deployments/${id}`, {
      method: 'PATCH',
      body: { status: 'stopping' },
    });
    if (error) return { error };
    return { data: { success: true } };
  }

  async restartDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insfetch(`/api/database/records/deployments/${id}`, {
      method: 'PATCH',
      body: { status: 'restarting' },
    });
    if (error) return { error };
    return { data: { success: true } };
  }

  async destroyDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insfetch(`/api/database/records/deployments/${id}`, {
      method: 'DELETE',
    });
    if (error) return { error };
    return { data: { success: true } };
  }
}

export const danclawClient = new DanClawClient();
export { INSFORGE_BASE as insforgeBase, INSFORGE_KEY as insforgeKey };
