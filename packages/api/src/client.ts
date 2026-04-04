/**
 * @danclaw/api — DanClawClient (InsForge SDK v1)
 *
 * Uses real @insforge/sdk patterns per docs.insforge.dev
 */

import { createClient } from '@insforge/sdk';
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

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.EXPO_PUBLIC_INSFORGE_URL || '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || '';

let _client: ReturnType<typeof createClient> | null = null;
let _initError: Error | null = null;

function getClient() {
  if (_initError) throw _initError;
  if (_client) return _client;

  if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    _initError = new Error(
      'Missing InsForge config. Set NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.'
    );
    throw _initError;
  }

  _client = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
  });
  return _client;
}

export const insforge = {
  get auth() { return getClient().auth; },
  get database() { return getClient().database; },
  get realtime() { return getClient().realtime; },
  get storage() { return getClient().storage; },
  get ai() { return getClient().ai; },
  get functions() { return getClient().functions; },
};

function err(code: number, message: string) {
  return { error: { code, message } };
}

type DbRow = Record<string, unknown>;

export class DanClawClient {
  // ─── Auth ─────────────────────────────────────────────────────────────

  async login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
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
            name: (data?.user?.profile as { name?: string })?.name || '',
            avatar: (data?.user?.profile as { avatar_url?: string })?.avatar_url || '',
            tier: 'free',
            created_at: data?.user?.createdAt || new Date().toISOString(),
            updated_at: data?.user?.updatedAt || new Date().toISOString(),
          },
        },
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      return err(500, msg);
    }
  }

  async register(req: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const { data, error } = await insforge.auth.signUp({
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      return err(500, msg);
    }
  }

  async signOut(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const { error } = await insforge.auth.signOut();
      if (error) return err(error.statusCode || 400, error.message);
      return { data: { success: true } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign out failed';
      return err(500, msg);
    }
  }

  async getProfile(): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) return err(401, 'Not authenticated');

      const { data: dbUser } = await insforge.database
        .from('users')
        .select('id, email, name, avatar, tier, created_at, updated_at')
        .eq('id', data.user.id)
        .single();

      return {
        data: {
          user: {
            id: dbUser?.id || data.user.id,
            email: dbUser?.email || data.user.email,
            name: (dbUser as DbRow)?.name || (data.user.profile as { name?: string })?.name || '',
            avatar: (dbUser as DbRow)?.avatar as string || (data.user.profile as { avatar_url?: string })?.avatar_url || '',
            tier: ((dbUser as DbRow)?.tier as User['tier']) || 'free',
            created_at: (dbUser as DbRow)?.created_at || data.user.createdAt,
            updated_at: (dbUser as DbRow)?.updated_at || data.user.updatedAt,
          },
        },
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Get profile failed';
      return err(500, msg);
    }
  }

  async updateProfile(updates: { name?: string; avatar?: string; openrouter_token?: string }): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) return err(401, 'Not authenticated');

      if (updates.name || updates.avatar) {
        await insforge.auth.setProfile({
          name: updates.name,
          avatar_url: updates.avatar,
        });
      }

      if (updates.openrouter_token !== undefined) {
        await insforge.database
          .from('users')
          .update({ openrouter_token: updates.openrouter_token })
          .eq('id', data.user.id);
      }

      return { data: { ...updates as User, id: data.user.id } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update profile failed';
      return err(500, msg);
    }
  }

  async getUsage(): Promise<ApiResponse<UsageResponse>> {
    try {
      const { data: authData, error: authErr } = await insforge.auth.getCurrentUser();
      if (authErr || !authData?.user) return err(401, 'Not authenticated');

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: deploymentsData, error: dbErr } = await insforge.database
        .from('deployments')
        .select('requests_today, cost_this_month')
        .eq('user_id', authData.user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (dbErr) return err(500, dbErr.message);

      const deployments = (deploymentsData || []) as DbRow[];
      const totalRequests = deployments.reduce((sum, d) => sum + ((d.requests_today as number) || 0), 0);
      const totalCost = deployments.reduce((sum, d) => sum + ((d.cost_this_month as number) || 0), 0);

      return { data: { usage: { total_requests: totalRequests, cost: totalCost, models: [] } } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Get usage failed';
      return err(500, msg);
    }
  }

  // ─── Deployments ─────────────────────────────────────────────────────

  async createDeployment(req: CreateDeploymentRequest): Promise<ApiResponse<CreateDeploymentResponse>> {
    try {
      const { data: authData, error: authErr } = await insforge.auth.getCurrentUser();
      if (authErr || !authData?.user) return err(401, 'Not authenticated');

      const { data: deployment, error: dbErr } = await insforge.database
        .from('deployments')
        .insert([{ ...req, user_id: authData.user.id }])
        .select()
        .single();

      if (dbErr) return err(400, dbErr.message);
      return { data: { deployment: deployment as Deployment } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Create deployment failed';
      return err(500, msg);
    }
  }

  async getDeployment(id: string): Promise<ApiResponse<Deployment>> {
    try {
      const { data: authData, error: authErr } = await insforge.auth.getCurrentUser();
      if (authErr || !authData?.user) return err(401, 'Not authenticated');

      const { data: deployment, error: dbErr } = await insforge.database
        .from('deployments')
        .select('*')
        .eq('id', id)
        .single();

      if (dbErr) return err(404, dbErr.message);
      const row = deployment as Deployment;
      if (row.user_id !== authData.user.id) return err(403, 'Access denied');
      return { data: row };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Get deployment failed';
      return err(500, msg);
    }
  }

  async listDeployments(): Promise<ApiResponse<ListDeploymentsResponse>> {
    try {
      const { data: authData, error: authErr } = await insforge.auth.getCurrentUser();
      if (authErr || !authData?.user) return { data: { deployments: [], total: 0 } };

      const { data: deploymentsData, error: dbErr } = await insforge.database
        .from('deployments')
        .select('*', { count: 'exact' })
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });

      if (dbErr) return err(500, dbErr.message);

      const deployments = (deploymentsData || []) as Deployment[];
      return { data: { deployments, total: deployments.length } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'List deployments failed';
      return err(500, msg);
    }
  }

  private async updateStatus(id: string, status: Deployment['status']): Promise<ApiResponse<DeploymentActionResponse>> {
    try {
      const { error: dbErr } = await insforge.database
        .from('deployments')
        .update({ status })
        .eq('id', id);
      if (dbErr) return err(500, dbErr.message);
      return { data: { success: true } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update status failed';
      return err(500, msg);
    }
  }

  async startDeployment(id: string) { return this.updateStatus(id, 'starting'); }
  async stopDeployment(id: string) { return this.updateStatus(id, 'stopping'); }
  async restartDeployment(id: string) { return this.updateStatus(id, 'restarting'); }

  async destroyDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    try {
      const { error: dbErr } = await insforge.database
        .from('deployments')
        .delete()
        .eq('id', id);
      if (dbErr) return err(500, dbErr.message);
      return { data: { success: true } };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Destroy deployment failed';
      return err(500, msg);
    }
  }

  // ─── Billing (stub — requires Stripe) ────────────────────────────────
  async subscribe(_req: SubscribeRequest) { return err(501, 'Billing not configured'); }
  async cancelSubscription() { return err(501, 'Billing not configured'); }
  async getBillingPortal() { return err(501, 'Billing not configured'); }
}

export const danclawClient = new DanClawClient();
export { insforge };
