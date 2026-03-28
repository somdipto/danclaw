/**
 * @danclaw/api — DanClawClient
 *
 * Type-safe API client for the DanClaw backend (InsForge.dev).
 * Uses @insforge/sdk for native BaaS integration.
 *
 * IMPORTANT: The InsForge SDK manages auth internally via cookies/HttpOnly
 * tokens. All database operations go through RLS policies. Client-side
 * ownership verification is defense-in-depth only.
 */

import { createClient, type Realtime } from '@insforge/sdk';
import type {
  ApiResponse,
  User,
  Deployment,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  RefreshResponse,
  CreateDeploymentRequest,
  CreateDeploymentResponse,
  ListDeploymentsResponse,
  DeploymentActionResponse,
  UserProfileResponse,
  UsageResponse,
  SubscribeRequest,
  SubscribeResponse,
  CancelResponse,
  BillingPortalResponse,
} from '@danclaw/shared';
import type {
  Auth,
  Database,
  Storage,
} from '@insforge/sdk';

// Environment variable resolution for both Next.js (NEXT_PUBLIC_*) and Expo (EXPO_PUBLIC_*)
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

const INSFORGE_URL = getEnv('INSFORGE_URL');
const INSFORGE_ANON_KEY = getEnv('INSFORGE_ANON_KEY');

// ─────────────────────────────────────────────
// Lazy SDK initialization
// ─────────────────────────────────────────────

let _client: ReturnType<typeof createClient> | null = null;
let _initError: Error | null = null;

function getClient(): ReturnType<typeof createClient> {
  if (_initError) throw _initError;
  if (_client) return _client;

  if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    _initError = new Error(
      'Missing InsForge configuration. Set NEXT_PUBLIC_INSFORGE_URL and ' +
        'NEXT_PUBLIC_INSFORGE_ANON_KEY (or EXPO_PUBLIC_* variants).'
    );
    throw _initError;
  }

  _client = createClient({ baseUrl: INSFORGE_URL, anonKey: INSFORGE_ANON_KEY });
  return _client;
}

// Expose the SDK instance for use in auth context and websocket manager
export const insforge = {
  get auth(): Auth {
    return getClient().auth;
  },
  get database(): Database {
    return getClient().database;
  },
  get realtime(): Realtime {
    return getClient().realtime;
  },
  get storage(): Storage {
    return getClient().storage;
  },
};

// ─────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────

interface InsForgeError {
  message: string;
  statusCode?: number;
}

interface PostgrestError {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

/** Extract a numeric HTTP-like code from an InsForge error */
function errorCode(e: InsForgeError): number {
  return e.statusCode || 400;
}

/** Convert a PostgREST error to an HTTP-like numeric code */
function postgrestErrorCode(e: PostgrestError): number {
  if (e.code === 'PGRST116') return 404; // single row — not found
  if (e.code === 'PGRST204') return 404; // no rows
  if (e.code === '23505') return 409;    // unique violation
  if (e.code === '23503') return 400;    // foreign key violation
  if (e.code === '42501') return 403;    // RLS/permission denied
  if (e.code) return 400;
  return 500;
}

/** Build a typed ApiResponse error */
function err(code: number, message: string): { error: { code: number; message: string } } {
  return { error: { code, message } };
}

/** Cast InsForge database response rows */
type DbRow = Record<string, unknown>;

// ─────────────────────────────────────────────
// DanClawClient
// ─────────────────────────────────────────────

export class DanClawClient {
  // ─── Auth ─────────────────────────────────────────────────────────────

  async login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: req.email,
      password: req.password,
    });

    if (error) return err(error.statusCode || 400, error.message);

    return {
      data: {
        token: data?.accessToken || '',
        user: {
          id: data?.user?.id || '',
          email: data?.user?.email || '',
          name: data?.user?.profile?.name || '',
          avatar: data?.user?.profile?.avatar_url || '',
          tier: 'free',
          created_at: data?.user?.createdAt || new Date().toISOString(),
          updated_at: data?.user?.updatedAt || new Date().toISOString(),
        },
      },
    };
  }

  async register(req: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.signUp({
      email: req.email,
      password: req.password,
      name: req.name,
    });

    if (error) return err(error.statusCode || 400, error.message);

    return {
      data: {
        token: data?.accessToken || '',
        user: {
          id: data?.user?.id || '',
          email: data?.user?.email || '',
          name: req.name || '',
          avatar: '',
          tier: 'free',
          created_at: data?.user?.createdAt || new Date().toISOString(),
          updated_at: data?.user?.updatedAt || new Date().toISOString(),
        },
      },
    };
  }

  async refresh(_req: RefreshRequest): Promise<ApiResponse<RefreshResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.refreshSession({
      refreshToken: _req.refresh_token,
    });

    if (error) return err(error.statusCode || 400, error.message);

    return {
      data: {
        token: data?.accessToken || '',
        user: {
          id: data?.user?.id || '',
          email: data?.user?.email || '',
          name: data?.user?.profile?.name || '',
          avatar: data?.user?.profile?.avatar_url || '',
          tier: 'free',
          created_at: data?.user?.createdAt || new Date().toISOString(),
          updated_at: data?.user?.updatedAt || new Date().toISOString(),
        },
      },
    };
  }

  async signOut(): Promise<ApiResponse<{ success: boolean }>> {
    const { error } = await getClient().auth.signOut();
    if (error) return err(error.statusCode || 400, error.message);
    return { data: { success: true } };
  }

  // ─── User ─────────────────────────────────────────────────────────────

  async getProfile(): Promise<ApiResponse<UserProfileResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    const { data: profile } = await client.auth.getProfile(data.user.id);

    // Get custom fields (tier, etc.) from the users DB table
    const { data: dbUser, error: dbError } = await client.database
      .from('users')
      .select('id, email, name, avatar, tier, created_at, updated_at')
      .eq('id', data.user.id)
      .single();

    if (dbError && postgrestErrorCode(dbError) !== 404) {
      return err(errorCode(dbError), dbError.message);
    }

    return {
      data: {
        user: {
          id: dbUser?.id || data.user.id,
          email: dbUser?.email || data.user.email,
          name: dbUser?.name || profile?.profile?.name || '',
          avatar: dbUser?.avatar || profile?.profile?.avatar_url || '',
          tier: (dbUser?.tier as User['tier']) || 'free',
          created_at: dbUser?.created_at || data.user.createdAt,
          updated_at: dbUser?.updated_at || data.user.updatedAt,
        },
      },
    };
  }

  async updateProfile(updates: {
    name?: string;
    avatar?: string;
    openrouter_token?: string;
  }): Promise<ApiResponse<User>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    // Update auth profile (name, avatar_url)
    const { data: updated, error: updateError } =
      await client.auth.setProfile({ name: updates.name, avatar_url: updates.avatar });

    if (updateError) return err(errorCode(updateError), updateError.message);

    // Update custom fields in users DB table
    if (updates.openrouter_token !== undefined) {
      await client.database
        .from('users')
        .update({ openrouter_token: updates.openrouter_token })
        .eq('id', data.user.id);
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email,
        name: updated?.profile?.name || updates.name || '',
        avatar: updated?.profile?.avatar_url || updates.avatar || '',
        tier: 'free',
        created_at: data.user.createdAt,
        updated_at: data.user.updatedAt,
      },
    };
  }

  async getUsage(): Promise<ApiResponse<UsageResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: deploymentsData, error: dbError } = await client.database
      .from('deployments')
      .select('requests_today, cost_this_month')
      .eq('user_id', data.user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (dbError) return err(postgrestErrorCode(dbError), dbError.message);

    const deployments = (deploymentsData || []) as DbRow[];
    const totalRequests = deployments.reduce(
      (sum, d) => sum + ((d.requests_today as number) || 0),
      0
    );
    const totalCost = deployments.reduce(
      (sum, d) => sum + ((d.cost_this_month as number) || 0),
      0
    );

    return {
      data: { usage: { total_requests: totalRequests, cost: totalCost, models: [] } },
    };
  }

  // ─── Deployments ─────────────────────────────────────────────────────

  async createDeployment(
    req: CreateDeploymentRequest
  ): Promise<ApiResponse<CreateDeploymentResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    const { data: deployment, error: dbError } = await client.database
      .from('deployments')
      .insert([{ ...req, user_id: data.user.id }])
      .select()
      .single();

    if (dbError) return err(postgrestErrorCode(dbError), dbError.message);
    return { data: { deployment: deployment as Deployment } };
  }

  async getDeployment(id: string): Promise<ApiResponse<Deployment>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    const { data: deployment, error: dbError } = await client.database
      .from('deployments')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError) return err(postgrestErrorCode(dbError), dbError.message);

    // Defense-in-depth: RLS should handle this, but verify anyway
    const row = deployment as Deployment;
    if (row.user_id !== data.user.id) {
      return err(403, 'Access denied');
    }

    return { data: row };
  }

  async listDeployments(): Promise<ApiResponse<ListDeploymentsResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return { data: { deployments: [], total: 0 } };
    }

    const { data: deploymentsData, error: dbError } = await client.database
      .from('deployments')
      .select('*', { count: 'exact' })
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false });

    if (dbError) return err(postgrestErrorCode(dbError), dbError.message);

    const deployments = (deploymentsData || []) as Deployment[];
    return { data: { deployments, total: deployments.length } };
  }

  /**
   * Internal: update deployment status with ownership verification.
   * RLS enforces user ownership server-side; we verify client-side too.
   */
  private async updateDeploymentStatus(
    id: string,
    status: Deployment['status']
  ): Promise<ApiResponse<DeploymentActionResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await client.database
      .from('deployments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) return err(errorCode(fetchError), fetchError.message);

    if ((existing as DbRow).user_id !== data.user.id) {
      return err(403, 'Access denied');
    }

    const { error: updateError } = await client.database
      .from('deployments')
      .update({ status })
      .eq('id', id);

    if (updateError) return err(errorCode(updateError), updateError.message);

    return { data: { success: true } };
  }

  async startDeployment(id: string) {
    return this.updateDeploymentStatus(id, 'starting');
  }

  async stopDeployment(id: string) {
    return this.updateDeploymentStatus(id, 'stopping');
  }

  async restartDeployment(id: string) {
    return this.updateDeploymentStatus(id, 'restarting');
  }

  async destroyDeployment(
    id: string
  ): Promise<ApiResponse<DeploymentActionResponse>> {
    const client = getClient();
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return err(401, 'Not authenticated');
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await client.database
      .from('deployments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) return err(errorCode(fetchError), fetchError.message);

    if ((existing as DbRow).user_id !== data.user.id) {
      return err(403, 'Access denied');
    }

    const { error: deleteError } = await client.database
      .from('deployments')
      .delete()
      .eq('id', id);

    if (deleteError) return err(errorCode(deleteError), deleteError.message);
    return { data: { success: true } };
  }

  // ─── Billing ─────────────────────────────────────────────────────────
  // Billing requires Stripe integration via InsForge Edge Functions.
  // See docs/BILLING.md for setup instructions. Until configured, these
  // return 501 so the UI can display appropriate messaging.

  async subscribe(_req: SubscribeRequest): Promise<ApiResponse<SubscribeResponse>> {
    return err(
      501,
      'Billing is not yet configured. Please contact support to upgrade your account.'
    );
  }

  async cancelSubscription(): Promise<ApiResponse<CancelResponse>> {
    return err(
      501,
      'Billing is not yet configured. Please contact support to manage your subscription.'
    );
  }

  async getBillingPortal(): Promise<ApiResponse<BillingPortalResponse>> {
    return err(
      501,
      'Billing is not yet configured. Please contact support for billing inquiries.'
    );
  }
}

// Singleton instance — lazy-initialized, safe to import anywhere
export const danclawClient = new DanClawClient();
