/**
 * @danclaw/api — DanClawClient
 *
 * Type-safe API client for the DanClaw backend (InsForge.dev).
 * Uses @insforge/sdk for native BaaS integration.
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

// Environment variable resolution for both Next.js and Expo
const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.EXPO_PUBLIC_INSFORGE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl,
  anonKey
});

export class DanClawClient {
  // ─── Auth ───

  async login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const { data, error } = await insforge.auth.signInWithPassword({
      email: req.email,
      password: req.password,
    });
    
    if (error) return { error: { code: error.status || 400, message: error.message } };
    return { 
      data: { 
        token: data.session?.access_token || '', 
        user: { 
          id: data.user?.id || '', 
          email: data.user?.email || '', 
          tier: 'free', 
          name: '', 
          avatar: '' 
        } 
      } 
    };
  }

  async register(req: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const { data, error } = await insforge.auth.signUp({
      email: req.email,
      password: req.password,
    });
    
    if (error) return { error: { code: error.status || 400, message: error.message } };
    return { 
      data: { 
        token: data.session?.access_token || '', 
        user: { 
          id: data.user?.id || '', 
          email: data.user?.email || '', 
          tier: 'free', 
          name: '', 
          avatar: '' 
        } 
      } 
    };
  }

  async refresh(req: RefreshRequest): Promise<ApiResponse<RefreshResponse>> {
    const { data, error } = await insforge.auth.getSession();
    if (error) return { error: { code: error.status || 400, message: error.message } };
    return { 
      data: { 
        token: data.session?.access_token || '', 
        user: { 
          id: data.session?.user?.id || '', 
          email: data.session?.user?.email || '', 
          tier: 'free', 
          name: '', 
          avatar: '' 
        } 
      } 
    };
  }

  // ─── Deployments ───

  async createDeployment(req: CreateDeploymentRequest): Promise<ApiResponse<CreateDeploymentResponse>> {
    const { data: { session } } = await insforge.auth.getSession();
    
    const { data, error } = await insforge.database
      .from('deployments')
      .insert([{ ...req, user_id: session?.user?.id }])
      .select()
      .single();
      
    if (error) return { error: { code: Number(error.code) || 400, message: error.message } };
    return { data: { deployment: data as Deployment } };
  }

  async getDeployment(id: string): Promise<ApiResponse<Deployment>> {
    const { data, error } = await insforge.database
      .from('deployments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return { error: { code: Number(error.code) || 404, message: error.message } };
    return { data: data as Deployment };
  }

  async listDeployments(): Promise<ApiResponse<ListDeploymentsResponse>> {
    const { data: { session } } = await insforge.auth.getSession();
    if (!session?.user) return { data: { deployments: [] } }; // Not authenticated
    
    const { data, error } = await insforge.database
      .from('deployments')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) return { error: { code: Number(error.code) || 400, message: error.message } };
    return { data: { deployments: (data || []) as Deployment[] } };
  }

  async startDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insforge.database.from('deployments').update({ status: 'starting' }).eq('id', id);
    if (error) return { error: { code: Number(error.code) || 400, message: error.message } };
    return { data: { success: true } };
  }

  async stopDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insforge.database.from('deployments').update({ status: 'stopping' }).eq('id', id);
    if (error) return { error: { code: Number(error.code) || 400, message: error.message } };
    return { data: { success: true } };
  }

  async restartDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insforge.database.from('deployments').update({ status: 'starting' }).eq('id', id);
    if (error) return { error: { code: Number(error.code) || 400, message: error.message } };
    return { data: { success: true } };
  }

  async destroyDeployment(id: string): Promise<ApiResponse<DeploymentActionResponse>> {
    const { error } = await insforge.database.from('deployments').delete().eq('id', id);
    if (error) return { error: { code: Number(error.code) || 400, message: error.message } };
    return { data: { success: true } };
  }

  // ─── User ───

  async getProfile(): Promise<ApiResponse<UserProfileResponse>> {
    const { data: { session }, error: authError } = await insforge.auth.getSession();
    if (authError || !session?.user) return { error: { code: 401, message: 'Not authenticated' } };
    
    const { data, error } = await insforge.database
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      // If no profile exists yet, return default
      return { 
        data: { 
          user: { 
            id: session.user.id, 
            email: session.user.email || '', 
            tier: 'free', 
            name: '', 
            avatar: '' 
          } 
        } 
      };
    }
    return { data: { user: data as User } };
  }

  async getUsage(): Promise<ApiResponse<UsageResponse>> {
    return { data: { usage: { total_requests: 0, cost: 0, models: [] } } };
  }

  // ─── Billing ───

  async subscribe(req: SubscribeRequest): Promise<ApiResponse<SubscribeResponse>> {
    return { error: { code: 501, message: 'Not implemented' } };
  }

  async cancelSubscription(): Promise<ApiResponse<CancelResponse>> {
    return { error: { code: 501, message: 'Not implemented' } };
  }

  async getBillingPortal(): Promise<ApiResponse<BillingPortalResponse>> {
    return { error: { code: 501, message: 'Not implemented' } };
  }
}

export const danclawClient = new DanClawClient();
