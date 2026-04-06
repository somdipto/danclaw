/**
 * InsForge Server API Wrapper
 *
 * Direct REST API calls to InsForge backend.
 * Uses the /api/database/records/* pattern.
 */

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || '';
const INSFORGE_ANON_KEY = process.env.INSFORGE_ANON_KEY || '';

// ─────────────────────────────────────────────
// API Caller
// ─────────────────────────────────────────────

export async function insforgeFetch<T = unknown>(
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
    params: {
      limit?: number;
      offset?: number;
      eq?: Record<string, string>;
      order?: { column: string; ascending?: boolean };
    } = {},
    accessToken?: string
  ): Promise<{ data: T[]; error: InsForgeError | null }> {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.set('limit', String(params.limit));
      if (params.offset) query.set('offset', String(params.offset));
      if (params.order) query.set('order', `${params.order.column}.${params.order.ascending !== false ? 'asc' : 'desc'}`);
      if (params.eq) {
        Object.entries(params.eq).forEach(([k, v]) => query.set(`filter[${k}]`, v));
      }

      const data = await insforgeFetch<T[]>(`/api/database/records/${table}?${query}`, {}, accessToken);
      return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: [], error };
    }
  },

  async selectOne<T = Record<string, unknown>>(
    table: string,
    params: Record<string, string>,
    accessToken?: string
  ): Promise<{ data: T | null; error: InsForgeError | null }> {
    try {
      const { id, ...filters } = params;
      // If id is provided, use it in the URL path
      const basePath = `/api/database/records/${table}${id ? `/${id}` : ''}`;
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => query.set(`filter[${k}]`, v));

      const path = query.toString() ? `${basePath}?${query}` : basePath;
      const data = await insforgeFetch<T[]>(path, {}, accessToken);
      const arr = Array.isArray(data) ? data : [];
      return { data: arr[0] || null, error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: null, error };
    }
  },

  async insert<T = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown>,
    accessToken?: string
  ): Promise<{ data: T[]; error: InsForgeError | null }> {
    try {
      const result = await insforgeFetch<T[]>(`/api/database/records/${table}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, accessToken);
      return { data: Array.isArray(result) ? result : [result as T], error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: [], error };
    }
  },

  async update<T = Record<string, unknown>>(
    table: string,
    params: Record<string, string>,
    data: Record<string, unknown>,
    accessToken?: string
  ): Promise<{ data: T[]; error: InsForgeError | null }> {
    try {
      const { id, ...filters } = params;
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => query.set(`filter[${k}]`, v));

      const result = await insforgeFetch<T[]>(`/api/database/records/${table}/${id}?${query}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, accessToken);
      return { data: Array.isArray(result) ? result : [result as T], error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: [], error };
    }
  },

  async delete(
    table: string,
    params: Record<string, string>,
    accessToken?: string
  ): Promise<{ data: boolean; error: InsForgeError | null }> {
    try {
      const { id } = params;

      await insforgeFetch<void>(`/api/database/records/${table}/${id}`, {
        method: 'DELETE',
      }, accessToken);
      return { data: true, error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: false, error };
    }
  },
};

// ─────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────

export const authApi = {
  async signUp(email: string, password: string, name?: string) {
    try {
      const data = await insforgeFetch<{ accessToken: string; user: { id: string; email: string; createdAt?: string; updatedAt?: string; profile?: { name?: string; avatar_url?: string } } }>(
        '/api/auth/users',
        { method: 'POST', body: JSON.stringify({ email, password, name }) }
      );
      return { data, error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const data = await insforgeFetch<{ accessToken: string; user: { id: string; email: string; createdAt?: string; updatedAt?: string; profile?: { name?: string; avatar_url?: string } } }>(
        '/api/auth/sessions',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      return { data, error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: null, error };
    }
  },

  async getUser(accessToken: string) {
    try {
      const data = await insforgeFetch<{ user: { id: string; email: string; createdAt?: string; updatedAt?: string; profile?: { name?: string; avatar_url?: string } } }>(
        '/api/auth/user', {}, accessToken
      );
      return { data, error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { data: null, error };
    }
  },

  async signOut(accessToken: string) {
    try {
      await insforgeFetch<void>('/api/auth/sessions', { method: 'DELETE' }, accessToken);
      return { error: null };
    } catch (err) {
      const error = err as InsForgeError;
      return { error };
    }
  },
};

// ─────────────────────────────────────────────
// Session Cookie Helpers
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

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
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

export interface ActivityEntry {
  action: string;
  icon: string;
  timestamp: string;
}

export function buildActivityEntry(action: string, icon: string): ActivityEntry {
  return {
    action,
    icon,
    timestamp: new Date().toISOString(),
  };
}
