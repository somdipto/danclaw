'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { insforge } from '@danclaw/api';
import { danclawClient } from '@danclaw/api';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchUser = useCallback(async () => {
    try {
      const result = await danclawClient.getProfile();
      if (result.error || !result.data?.user) {
        if (mountedRef.current) setUser(null);
        return;
      }
      const u = result.data.user;
      if (mountedRef.current) {
        setUser({
          id: u.id,
          email: u.email,
          name: u.name,
          avatar: u.avatar,
          tier: u.tier,
          created_at: u.created_at,
          updated_at: u.updated_at,
        });
      }
    } catch {
      if (mountedRef.current) setUser(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    mountedRef.current = true;
    fetchUser().finally(() => {
      if (mountedRef.current) setIsLoading(false);
    });

    const handleFocus = () => {
      if (mountedRef.current) fetchUser();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await danclawClient.login({ email, password });
    if (result.error) return { success: false, error: result.error.message };
    await fetchUser();
    return { success: true };
  }, [fetchUser]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await danclawClient.register({ email, password, name });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await danclawClient.signOut();
    if (mountedRef.current) setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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
