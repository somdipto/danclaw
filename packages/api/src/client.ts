// ─────────────────────────────────────────────────────────────────────────────
// DanClawClient — API Client (Web + Mobile)
//
// Web: calls the Next.js API routes which proxy to InsForge.
// Mobile: calls the web backend API routes directly.
// Token is stored in localStorage for both web and mobile (sync via app-specific code).
// For mobile's expo-secure-store, use the hook/useAuth from the mobile app.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ClientError {
  message: string;
  statusCode?: number;
  code?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ClientError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Management
// Web: uses localStorage (set by login response, sent via cookie)
// Mobile: can override via setToken/getToken if needed
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'danclaw_auth_token';
let customTokenGetter: (() => Promise<string | null>) | null = null;
let customTokenSetter: ((token: string) => Promise<void>) | null = null;
let customTokenClearer: (() => Promise<void>) | null = null;

export function configureTokenStorage(options: {
  getToken: () => Promise<string | null>;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}) {
  customTokenGetter = options.getToken;
  customTokenSetter = options.saveToken;
  customTokenClearer = options.clearToken;
}

export async function getToken(): Promise<string | null> {
  if (customTokenGetter) {
    return customTokenGetter();
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export async function saveToken(token: string): Promise<void> {
  if (customTokenSetter) {
    return customTokenSetter(token);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export async function clearToken(): Promise<void> {
  if (customTokenClearer) {
    return customTokenClearer();
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Client
// ─────────────────────────────────────────────────────────────────────────────

function getWebUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return (
    process.env.EXPO_PUBLIC_WEB_URL ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    'https://danclaw.app'
  );
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = path.startsWith('http') ? path : `${getWebUrl()}${path}`;
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: {
          message: json?.error?.message || json?.message || `HTTP ${response.status}`,
          statusCode: response.status,
          code: json?.error?.code,
        },
      };
    }

    return { data: json.data ?? json };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { error: { message } };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────────────────────

export class DanClawClient {
  // Auth
  async login(email: string, password: string): Promise<ApiResponse<import('@danclaw/shared').LoginResponse>> {
    return apiFetch<import('@danclaw/shared').LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string): Promise<ApiResponse<import('@danclaw/shared').RegisterResponse>> {
    return apiFetch<import('@danclaw/shared').RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async signOut(): Promise<void> {
    await clearToken(); // clearToken calls SecureStore.deleteItemAsync internally
  }

  // User
  async getProfile(): Promise<ApiResponse<import('@danclaw/shared').UserProfileResponse>> {
    return apiFetch<import('@danclaw/shared').UserProfileResponse>('/api/user/profile');
  }

  async updateProfile(updates: { name?: string; openrouter_token?: string }): Promise<ApiResponse<import('@danclaw/shared').UserProfileResponse>> {
    return apiFetch<import('@danclaw/shared').UserProfileResponse>('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getUsage(): Promise<ApiResponse<import('@danclaw/shared').UsageResponse>> {
    return apiFetch<import('@danclaw/shared').UsageResponse>('/api/user/usage');
  }

  // Deployments
  async listDeployments(): Promise<ApiResponse<import('@danclaw/shared').ListDeploymentsResponse>> {
    return apiFetch<import('@danclaw/shared').ListDeploymentsResponse>('/api/deployments');
  }

  async getDeployment(id: string): Promise<ApiResponse<import('@danclaw/shared').Deployment>> {
    return apiFetch<import('@danclaw/shared').Deployment>(`/api/deployments/${id}`);
  }

  async createDeployment(req: import('@danclaw/shared').CreateDeploymentRequest): Promise<ApiResponse<import('@danclaw/shared').CreateDeploymentResponse>> {
    return apiFetch<import('@danclaw/shared').CreateDeploymentResponse>('/api/deployments', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async startDeployment(id: string): Promise<ApiResponse<import('@danclaw/shared').DeploymentActionResponse>> {
    return apiFetch<import('@danclaw/shared').DeploymentActionResponse>(`/api/deployments/${id}/start`, { method: 'POST' });
  }

  async stopDeployment(id: string): Promise<ApiResponse<import('@danclaw/shared').DeploymentActionResponse>> {
    return apiFetch<import('@danclaw/shared').DeploymentActionResponse>(`/api/deployments/${id}/stop`, { method: 'POST' });
  }

  async restartDeployment(id: string): Promise<ApiResponse<import('@danclaw/shared').DeploymentActionResponse>> {
    return apiFetch<import('@danclaw/shared').DeploymentActionResponse>(`/api/deployments/${id}/restart`, { method: 'POST' });
  }

  async destroyDeployment(id: string): Promise<ApiResponse<import('@danclaw/shared').DeploymentActionResponse>> {
    return apiFetch<import('@danclaw/shared').DeploymentActionResponse>(`/api/deployments/${id}`, { method: 'DELETE' });
  }

  // Messages
  async getMessages(deploymentId: string): Promise<ApiResponse<import('@danclaw/shared').ListMessagesResponse>> {
    return apiFetch<import('@danclaw/shared').ListMessagesResponse>(`/api/deployments/${deploymentId}/messages`);
  }
}

export const danclawClient = new DanClawClient();
export default danclawClient;