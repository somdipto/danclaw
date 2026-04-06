/**
 * @danclaw/api — TanStack Query Hooks
 *
 * Pre-built React hooks wrapping the DanClawClient.
 * Uses TanStack Query v5 conventions (queryKey arrays, mutation options).
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
  LoginResponse,
  CreateDeploymentRequest,
  CreateDeploymentResponse,
  ListDeploymentsResponse,
  DeploymentActionResponse,
  UserProfileResponse,
  UsageResponse,
  ListMessagesResponse,
} from '@danclaw/shared';
import { danclawClient } from './client';
import type { ApiResponse as SharedApiResponse } from '@danclaw/shared';

// ─────────────────────────────────────────────
// Query Key Factory
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
  messages: {
    all: (deploymentId: string) => ['messages', deploymentId] as const,
  },
} as const;

// ─────────────────────────────────────────────
// User Hooks
// ─────────────────────────────────────────────

export function useUserProfile(
  options?: Partial<UseQueryOptions<ApiResponse<UserProfileResponse>, Error, ApiResponse<UserProfileResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => danclawClient.getProfile() as unknown as ApiResponse<UserProfileResponse>,
    ...options,
  });
}

export function useUsage(
  options?: Partial<UseQueryOptions<ApiResponse<UsageResponse>, Error, ApiResponse<UsageResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.user.usage,
    queryFn: () => danclawClient.getUsage() as unknown as ApiResponse<UsageResponse>,
    ...options,
  });
}

// ─────────────────────────────────────────────
// Deployment Hooks
// ─────────────────────────────────────────────

export function useDeployments(
  options?: Partial<UseQueryOptions<ApiResponse<ListDeploymentsResponse>, Error, ApiResponse<ListDeploymentsResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.deployments.all,
    queryFn: () => danclawClient.listDeployments() as unknown as ApiResponse<ListDeploymentsResponse>,
    ...options,
  });
}

export function useDeployment(
  id: string,
  options?: Partial<UseQueryOptions<ApiResponse<Deployment>, Error, ApiResponse<Deployment>>>,
) {
  return useQuery({
    queryKey: queryKeys.deployments.detail(id),
    queryFn: () => danclawClient.getDeployment(id) as unknown as ApiResponse<Deployment>,
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
  return useMutation<
    ApiResponse<CreateDeploymentResponse>,
    Error,
    CreateDeploymentRequest
  >({
    mutationFn: (req) =>
      danclawClient.createDeployment(req) as unknown as Promise<ApiResponse<CreateDeploymentResponse>>,
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
  return useMutation<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >({
    mutationFn: (id) =>
      danclawClient.startDeployment(id) as unknown as Promise<ApiResponse<DeploymentActionResponse>>,
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
  return useMutation<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >({
    mutationFn: (id) =>
      danclawClient.stopDeployment(id) as unknown as Promise<ApiResponse<DeploymentActionResponse>>,
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
  return useMutation<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >({
    mutationFn: (id) =>
      danclawClient.restartDeployment(id) as unknown as Promise<ApiResponse<DeploymentActionResponse>>,
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
  return useMutation<
    ApiResponse<DeploymentActionResponse>,
    Error,
    string
  >({
    mutationFn: (id) =>
      danclawClient.destroyDeployment(id) as unknown as Promise<ApiResponse<DeploymentActionResponse>>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deployments.all });
    },
    ...options,
  });
}

// ─────────────────────────────────────────────
// Message Hooks
// ─────────────────────────────────────────────

export function useMessages(
  deploymentId: string,
  options?: Partial<UseQueryOptions<ApiResponse<ListMessagesResponse>, Error, ApiResponse<ListMessagesResponse>>>,
) {
  return useQuery({
    queryKey: queryKeys.messages.all(deploymentId),
    queryFn: () => danclawClient.getMessages(deploymentId) as unknown as ApiResponse<ListMessagesResponse>,
    enabled: !!deploymentId,
    ...options,
  });
}

// ─────────────────────────────────────────────
// Auth Hooks
// ─────────────────────────────────────────────

export function useLogin(
  options?: Partial<UseMutationOptions<ApiResponse<LoginResponse>, Error, { email: string; password: string }>>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: { email: string; password: string }) => {
      const result = await danclawClient.login(req.email, req.password);
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error('No data returned');
      return result as ApiResponse<LoginResponse>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    ...options,
  });
}
