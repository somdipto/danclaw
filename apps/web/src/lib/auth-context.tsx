'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from '@danclaw/api';
import type { User } from '@danclaw/shared';

interface AuthUser extends Omit<User, 'openrouter_token'> {
  // Exclude plain-text token from client-side user object
}

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

  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) {
        setUser(null);
        return;
      }

      // Get profile (name, avatar) from auth service
      const { data: profile } = await insforge.auth.getProfile(data.user.id);

      // Get custom user fields (tier, etc.) from the users DB table
      const { data: dbUser, error: dbError } = await insforge.database
        .from('users')
        .select('id, email, name, avatar, tier, created_at, updated_at')
        .eq('id', data.user.id)
        .single();

      if (dbError && dbError.code !== 'PGRST116' && dbError.code !== 'PGRST204') {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: profile?.profile?.name || '',
          avatar: profile?.profile?.avatar_url || '',
          tier: 'free',
          created_at: data.user.createdAt,
          updated_at: data.user.updatedAt,
        });
        return;
      }

      setUser({
        id: dbUser?.id || data.user.id,
        email: dbUser?.email || data.user.email,
        name: dbUser?.name || profile?.profile?.name || '',
        avatar: dbUser?.avatar || profile?.profile?.avatar_url || '',
        tier: (dbUser?.tier as User['tier']) || 'free',
        created_at: dbUser?.created_at || data.user.createdAt,
        updated_at: dbUser?.updated_at || data.user.updatedAt,
      });
    } catch {
      setUser(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchUser().finally(() => setIsLoading(false));

    // Re-check auth state on window focus (e.g., after OAuth redirect)
    const handleFocus = () => {
      if (!user) {
        fetchUser();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    await fetchUser();
    return { success: true };
  }, [fetchUser]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await insforge.auth.signUp({ email, password, name });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await insforge.auth.signOut();
    setUser(null);
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
