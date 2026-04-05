/**
 * InsForge Server SDK Wrapper
 * 
 * Provides server-side utilities for InsForge Edge Functions.
 * Uses native fetch to call InsForge REST API directly.
 */

const INSFORGE_URL = process.env.NSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || '';
const INSFORGE_ANON_KEY = process.env.NSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';
const INSFORGE_SERVICE_KEY = process.env.NSFORGE_SERVICE_KEY || '';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface InsForgeUser {
  id: string;
  email: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InsForgeSession {
  accessToken: string;
  refreshToken: string;
  user: InsForgeUser;
  expiresAt: number;
}

export interface InsForgeError {
  message: string;
  statusCode?: number;
  code?: string;
}

// ─────────────────────────────────────────────
// Generic API caller with auth header injection
// ─────────────────────────────────────────────

async function insforgeFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const url = `${INSFORGE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': INSFORGE_ANON_KEY,
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (INSFORGE_SERVICE_KEY) {
    headers['Authorization'] = `Bearer ${INSFORGE_SERVICE_KEY}`;
  }

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
// Auth API
// ─────────────────────────────────────────────

export const authApi = {
  /**
   * Sign in with email/password
   */
  async signInWithPassword(email: string, password: string) {
    return insforgeFetch<{
      data?: { accessToken?: string; user?: InsForgeUser };
      error?: InsForgeError;
    }>('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Sign up with email/password
   */
  async signUp(email: string, password: string, name?: string) {
    return insforgeFetch<{
      data?: { accessToken?: string; user?: InsForgeUser };
      error?: InsForgeError;
    }>('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  /**
   * Get current user from access token
   */
  async getUser(accessToken: string) {
    return insforgeFetch<{
      data?: { user?: InsForgeUser };
      error?: InsForgeError;
    }>('/auth/v1/user', {
      method: 'GET',
    }, accessToken);
  },

  /**
   * Refresh session with refresh token
   */
  async refresh(refreshToken: string) {
    return insforgeFetch<{
      data?: { accessToken?: string; user?: InsForgeUser };
      error?: InsForgeError;
    }>('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /**
   * Sign out (invalidate session)
   */
  async signOut(accessToken: string) {
    return insforgeFetch<{ error?: InsForgeError }>('/auth/v1/logout', {
      method: 'POST',
    }, accessToken);
  },

  /**
   * Get profile for a user
   */
  async getProfile(userId: string, accessToken: string) {
    return insforgeFetch<{
      data?: { profile?: { name?: string; avatar_url?: string } };
      error?: InsForgeError;
    }>(`/auth/v1/profile/${userId}`, {
      method: 'GET',
    }, accessToken);
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: { name?: string; avatar_url?: string }, accessToken: string) {
    return insforgeFetch<{
      data?: { profile?: { name?: string; avatar_url?: string } };
      error?: InsForgeError;
    }>(`/auth/v1/profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, accessToken);
  },
};

// ─────────────────────────────────────────────
// Database API (PostgreSQL via PostgREST)
// ─────────────────────────────────────────────

export const databaseApi = {
  /**
   * Generic SELECT query
   * 
   * PostgREST filter syntax:
   * - Equality: ?column=eq.value
   * - Order: ?order=column.asc or column.desc
   * - Range: ?offset=0&limit=10
   */
  async select<T = Record<string, unknown>>(
    table: string,
    params: {
      select?: string;
      eq?: Record<string, string | number | boolean>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      range?: { start: number; end: number };
    } = {},
    accessToken?: string
  ): Promise<{ data: T[]; error?: InsForgeError; count?: number }> {
    const queryParams = new URLSearchParams();
    
    if (params.select) queryParams.set('select', params.select);
    if (params.order) queryParams.set('order', `${params.order.column}.${params.order.ascending === false ? 'desc' : 'asc'}`);
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.range) {
      queryParams.set('offset', String(params.range.start));
      queryParams.set('limit', String(params.range.end - params.range.start + 1));
    }

    // Build equality filters with proper PostgREST =eq. operator syntax
    if (params.eq) {
      for (const [key, value] of Object.entries(params.eq)) {
        queryParams.set(key, `eq.${String(value)}`);
      }
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await insforgeFetch<{ data: T[]; error?: InsForgeError } | T[]>(
      `/rest/v1/${table}${queryString}`,
      { method: 'GET' },
      accessToken
    );

    if (Array.isArray(response)) {
      return { data: response as T[] };
    }
    return response as { data: T[]; error?: InsForgeError; count?: number };
  },

  /**
   * SELECT a single row - properly uses =eq. syntax
   */
  async selectOne<T = Record<string, unknown>>(
    table: string,
    filters: Record<string, string | number | boolean>,
    accessToken?: string
  ): Promise<{ data: T | null; error?: InsForgeError }> {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      // PostgREST requires =eq. prefix for equality filters
      queryParams.set(key, `eq.${String(value)}`);
    }
    queryParams.set('limit', '1');

    const response = await insforgeFetch<{ data: T[]; error?: InsForgeError } | T[]>(
      `/rest/v1/${table}?${queryParams.toString()}`,
      { method: 'GET' },
      accessToken
    );

    if (Array.isArray(response)) {
      return { data: (response as T[])[0] || null };
    }
    
    const result = response as { data?: T[]; error?: InsForgeError };
    return { data: result.data?.[0] || null, error: result.error };
  },

  /**
   * INSERT rows
   */
  async insert<T = Record<string, unknown>>(
    table: string,
    rows: Record<string, unknown> | Record<string, unknown>[],
    accessToken?: string,
    returning: string = '*'
  ): Promise<{ data: T[]; error?: InsForgeError }> {
    const payload = Array.isArray(rows) ? rows : [rows];
    
    return insforgeFetch<{ data: T[]; error?: InsForgeError }>(
      `/rest/v1/${table}?select=${returning}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      accessToken
    );
  },

  /**
   * UPDATE rows
   */
  async update<T = Record<string, unknown>>(
    table: string,
    updates: Record<string, unknown>,
    filters: Record<string, string | number | boolean>,
    accessToken?: string,
    returning: string = '*'
  ): Promise<{ data: T[]; error?: InsForgeError }> {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      // PostgREST requires =eq. prefix for equality filters
      queryParams.set(key, `eq.${String(value)}`);
    }

    return insforgeFetch<{ data: T[]; error?: InsForgeError }>(
      `/rest/v1/${table}?${queryParams.toString()}&select=${returning}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      },
      accessToken
    );
  },

  /**
   * DELETE rows
   */
  async delete(
    table: string,
    filters: Record<string, string | number | boolean>,
    accessToken?: string
  ): Promise<{ error?: InsForgeError }> {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      // PostgREST requires =eq. prefix for equality filters
      queryParams.set(key, `eq.${String(value)}`);
    }

    return insforgeFetch<{ error?: InsForgeError }>(
      `/rest/v1/${table}?${queryParams.toString()}`,
      { method: 'DELETE' },
      accessToken
    );
  },

  /**
   * RPC call (stored procedure)
   */
  async rpc<T = unknown>(
    functionName: string,
    params: Record<string, unknown> = {},
    accessToken?: string
  ): Promise<{ data: T; error?: InsForgeError }> {
    return insforgeFetch<{ data: T; error?: InsForgeError }>(
      `/rest/v1/rpc/${functionName}`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      accessToken
    );
  },
};

// ─────────────────────────────────────────────
// Cookie helpers for session management
// ─────────────────────────────────────────────

export const SESSION_COOKIE_NAME = 'danclaw_session';
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

// ─────────────────────────────────────────────
// Error response helpers
// ─────────────────────────────────────────────

export function apiError(code: number, message: string, details?: string) {
  return Response.json(
    { error: { code, message, details } },
    { status: code }
  );
}

export function apiSuccess<T>(data: T) {
  return Response.json({ data });
}

// ─────────────────────────────────────────────
// Deployment status helpers
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

export function isValidStatusTransition(
  current: DeploymentStatus,
  next: DeploymentStatus
): boolean {
  const validTransitions: Record<DeploymentStatus, DeploymentStatus[]> = {
    provisioning: ['starting', 'error'],
    starting: ['running', 'error'],
    running: ['stopping', 'restarting', 'error'],
    stopping: ['stopped', 'error'],
    stopped: ['starting', 'destroying', 'error'],
    restarting: ['running', 'error'],
    destroying: ['provisioning', 'error'],
    error: ['starting', 'destroying'],
  };

  return validTransitions[current]?.includes(next) ?? false;
}

// ─────────────────────────────────────────────
// Activity feed builder
// ─────────────────────────────────────────────

export function buildActivityEntry(
  action: string,
  icon: string,
  metadata?: Record<string, string>
): { id: string; action: string; timestamp: string; icon: string; metadata?: Record<string, string> } {
  return {
    id: crypto.randomUUID(),
    action,
    timestamp: new Date().toISOString(),
    icon,
    ...(metadata && { metadata }),
  };
}

// ─────────────────────────────────────────────
// Tier limits enforcement
// ─────────────────────────────────────────────

export type Tier = 'free' | 'pro' | 'elite';

export const TIER_DEPLOYMENT_LIMITS: Record<Tier, { maxDeployments: number; maxAgents: number }> = {
  free: { maxDeployments: 1, maxAgents: 1 },
  pro: { maxDeployments: 5, maxAgents: 5 },
  elite: { maxDeployments: 20, maxAgents: 20 },
};

export function canCreateDeployment(
  tier: Tier,
  currentDeploymentCount: number
): boolean {
  return currentDeploymentCount < TIER_DEPLOYMENT_LIMITS[tier].maxDeployments;
}
