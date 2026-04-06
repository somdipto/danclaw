'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserProfile } from '@danclaw/api';
import type { User } from '@danclaw/shared';

interface AuthUser extends Omit<User, 'openrouter_token'> {}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    tier: u.tier,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

const PROTECTED_PATHS = ['/dashboard'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, refetch, isLoading } = useUserProfile();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingCtx, setIsLoadingCtx] = useState(true);
  const mountedRef = useRef(true);

  // Sync user from profile data — do NOT depend on isLoading (it goes true on refetch)
  useEffect(() => {
    if (isLoading) return; // skip on loading/refetch to avoid flash of null user
    if (data?.data?.user) {
      if (mountedRef.current) setUser(toAuthUser(data.data.user));
    } else {
      if (mountedRef.current) setUser(null);
    }
    if (mountedRef.current) setIsLoadingCtx(false);
  }, [isLoading, data]);

  // Protect /dashboard routes
  useEffect(() => {
    if (!isLoadingCtx && !user && PROTECTED_PATHS.some(p => pathname?.startsWith(p))) {
      router.push('/');
    }
  }, [user, isLoadingCtx, pathname, router]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { danclawClient, saveToken } = await import('@danclaw/api');
    const result = await danclawClient.login(email, password);
    if (result.error) return { success: false, error: result.error.message };
    if (result.data?.token) {
      await saveToken(result.data.token);
    }
    await refetch();
    return { success: true };
  }, [refetch]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { danclawClient } = await import('@danclaw/api');
    const result = await danclawClient.register(email, password, name);
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    const { danclawClient, clearToken } = await import('@danclaw/api');
    await danclawClient.signOut();
    await clearToken();
    if (mountedRef.current) setUser(null);
    router.push('/');
  }, [router]);

  const refreshSession = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoadingCtx,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
