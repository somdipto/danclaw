/**
 * @danclaw/api — TanStack Query Hooks
 *
 * Pre-built React hooks wrapping the DanClawClient.
 * Uses TanStack Query v5 conventions (queryKey arrays, mutation options).
 *
 * These hooks work identically on Next.js and React Native as long as
 * a QueryClientProvider is mounted above the component tree.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type {
  Deployment,
  ApiResponse,
} from '@danclaw/shared';
import type {
  LoginRequest,
  LoginResponse,
  CreateDeploymentRequest,
  CreateDeploymentResponse,
  ListDeploymentsResponse,
  DeploymentActionResponse,
  UserProfileResponse,
  UsageResponse,
  SubscribeRequest,
  SubscribeResponse,
  CancelResponse,
} from '@danclaw/shared';
import { danclawClient } from './client';

// ─────────────────────────────────────────────
// Query Key Factory
// Centralized key definitions prevent cache collisions.
// ─────────────────────────────────────────────

export const queryKeys = {
  user: {
    profile: ['user', 'profile'] as const,
    usage: ['user', 'usage'] as const,
  },
  deployments: {
    all: ['deployments'] as const,
    detail: (id: string) => ['deployments', id] as const,
  },
} as const;

// ─────────────────────────────────────────────
// User Hooks
// ─────────────────────────────────────────────

export function useUserProfile(
  options?: Partial<UseQueryOptions<ApiResponse<UserProfileResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => danclawClient.getProfile(),
    ...options,
  });
}

export function useUsage(
  options?: Partial<UseQueryOptions<ApiResponse<UsageResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.user.usage,
    queryFn: () => danclawClient.getUsage(),
    ...options,
  });
}

// ─────────────────────────────────────────────
// Deployment Hooks
// ─────────────────────────────────────────────

export function useDeployments(
  options?: Partial<UseQueryOptions<ApiResponse<ListDeploymentsResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.deployments.all,
    queryFn: () => danclawClient.listDeployments(),
    ...options,
  });
}

export function useDeployment(
  id: string,
  options?: Partial<UseQueryOptions<ApiResponse<Deployment>>>,
) {
  return useQuery({
    queryKey: queryKeys.deployments.detail(id),
    queryFn: () => danclawClient.getDeployment(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateDeployment(
  options?: Partial<UseMutationOptions<
    ApiResponse<CreateDeploymentResponse>,
    Error,
    CreateDeploymentRequest
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateDeploymentRequest) => danclawClient.createDeployment(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.all });
    },
    ...options,
  });
}

export function useStartDeployment(
  options?: Partial<UseMutationOptions<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => danclawClient.startDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.all });
    },
    ...options,
  });
}

export function useStopDeployment(
  options?: Partial<UseMutationOptions<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => danclawClient.stopDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.all });
    },
    ...options,
  });
}

export function useRestartDeployment(
  options?: Partial<UseMutationOptions<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => danclawClient.restartDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.all });
    },
    ...options,
  });
}

export function useDestroyDeployment(
  options?: Partial<UseMutationOptions<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => danclawClient.destroyDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.all });
    },
    ...options,
  });
}

// ─────────────────────────────────────────────
// Auth Hooks
// ─────────────────────────────────────────────

export function useLogin(
  options?: Partial<UseMutationOptions<
    ApiResponse<LoginResponse>,
    Error,
    LoginRequest
  >>,
) {
  return useMutation({
    mutationFn: (req: LoginRequest) => danclawClient.login(req),
    onSuccess: (result: ApiResponse<LoginResponse>) => {
      if (result.data?.token) {
        danclawClient.setAuthToken(result.data.token);
      }
    },
    ...options,
  });
}

// ─────────────────────────────────────────────
// Billing Hooks
// ─────────────────────────────────────────────

export function useSubscribe(
  options?: Partial<UseMutationOptions<
    ApiResponse<SubscribeResponse>,
    Error,
    SubscribeRequest
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SubscribeRequest) => danclawClient.subscribe(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    ...options,
  });
}

export function useCancelSubscription(
  options?: Partial<UseMutationOptions<
    ApiResponse<CancelResponse>,
    Error,
    void
  >>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => danclawClient.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    ...options,
  });
}
