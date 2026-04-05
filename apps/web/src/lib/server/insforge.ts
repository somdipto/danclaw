/**
 * InsForge Server API Wrapper
 * 
 * Direct REST API calls to InsForge backend.
 * Uses the /api/database/records/* pattern discovered from MCP.
 */

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://tq33kiup.ap-southeast.insforge.app';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_ac021317adcb7995b6f8e53075757fc1';

// ─────────────────────────────────────────────
// API Caller
// ─────────────────────────────────────────────

async function insfetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const url = `${INSFORGE_URL}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || INSFORGE_ANON_KEY}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const error: InsForgeError = {
      message: errorData.message || errorData.error || 'Request failed',
      statusCode: response.status,
      code: errorData.code,
    };
    throw error;
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface InsForgeError {
  message: string;
  statusCode?: number;
  code?: string;
}

export type DeploymentStatus =
  | 'provisioning' | 'starting' | 'running' | 'stopping'
  | 'stopped' | 'restarting' | 'destroying' | 'error';

export type Tier = 'free' | 'pro' | 'elite';

// ─────────────────────────────────────────────
// Database API
// ─────────────────────────────────────────────

export const databaseApi = {
  async select<T = Record<string, unknown>>(
    table: string,
    params: { limit?: number; offset?: number; eq?: Record<string, string>; order?: { column: string; asc?: boolean } } = {},
    accessToken?: string
  ): Promise<T[]> {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));
    if (params.eq) Object.entries(params.eq).forEach(([k, v]) => query.set(k, v));
    if (params.order) query.set('order', `${params.order.column}.${params.order.asc !== false ? 'asc' : 'desc'}`);
    return insfetch<T[]>(`/api/database/records/${table}?${query}`, {}, accessToken);
  },

  async insert<T = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown>,
    accessToken?: string
  ): Promise<T> {
    return insfetch<T>(`/api/database/records/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, accessToken);
  },

  async update<T = Record<string, unknown>>(
    table: string,
    id: string,
    data: Record<string, unknown>,
    accessToken?: string
  ): Promise<T> {
    return insfetch<T>(`/api/database/records/${table}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, accessToken);
  },

  async delete(
    table: string,
    id: string,
    accessToken?: string
  ): Promise<void> {
    return insfetch(`/api/database/records/${table}/${id}`, { method: 'DELETE' }, accessToken);
  },
};

// ─────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────

export const authApi = {
  async signUp(email: string, password: string, name?: string) {
    return insfetch<{ accessToken: string; user: { id: string; email: string; profile?: { name?: string } } }>(
      '/api/auth/users',
      { method: 'POST', body: JSON.stringify({ email, password, name }) }
    );
  },

  async signIn(email: string, password: string) {
    return insfetch<{ accessToken: string; user: { id: string; email: string; profile?: { name?: string } } }>(
      '/api/auth/sessions',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  },

  async getUser(accessToken: string) {
    return insfetch<{ id: string; email: string; profile?: { name?: string } }>(
      '/api/auth/user', {}, accessToken
    );
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export const SESSION_COOKIE_NAME = 'danclaw_session';
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=');
    acc[key.trim()] = valueParts.join('=');
    return acc;
  }, {} as Record<string, string>);
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function createSessionCookie(sessionData: string): string {
  const encoded = Buffer.from(sessionData).toString('base64');
  return `${SESSION_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_COOKIE_MAX_AGE}`;
}

export function apiError(code: number, message: string, details?: string) {
  return Response.json({ error: { code, message, details } }, { status: code });
}

export function apiSuccess<T>(data: T) {
  return Response.json({ data });
}

export const TIER_DEPLOYMENT_LIMITS: Record<Tier, { maxDeployments: number }> = {
  free: { maxDeployments: 1 },
  pro: { maxDeployments: 5 },
  elite: { maxDeployments: 20 },
};

export function canCreateDeployment(tier: Tier, currentCount: number): boolean {
  return currentCount < TIER_DEPLOYMENT_LIMITS[tier].maxDeployments;
}

export function isValidStatusTransition(current: DeploymentStatus, next: DeploymentStatus): boolean {
  const valid: Record<DeploymentStatus, DeploymentStatus[]> = {
    provisioning: ['starting', 'error'],
    starting: ['running', 'error'],
    running: ['stopping', 'restarting', 'error'],
    stopping: ['stopped', 'error'],
    stopped: ['starting', 'destroying', 'error'],
    restarting: ['running', 'error'],
    destroying: ['provisioning', 'error'],
    error: ['starting', 'destroying'],
  };
  return valid[current]?.includes(next) ?? false;
}
