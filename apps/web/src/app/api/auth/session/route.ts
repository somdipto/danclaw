import { NextRequest } from 'next/server';
import { authApi, databaseApi, apiError, apiSuccess, parseSessionCookie } from '@/lib/server/insforge';
import type { LoginResponse } from '@danclaw/shared';

/**
 * GET /api/auth/session
 * 
 * Returns the current authenticated user based on session cookie.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionData = parseSessionCookie(cookieHeader);

    if (!sessionData) {
      return apiError(401, 'Not authenticated');
    }

    let session: { accessToken?: string; userId?: string; email?: string; expiresAt?: number };
    
    try {
      session = JSON.parse(Buffer.from(sessionData, 'base64').toString());
    } catch {
      return apiError(401, 'Invalid session');
    }

    if (!session.accessToken || !session.userId) {
      return apiError(401, 'Invalid session');
    }

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return apiError(401, 'Session expired');
    }

    // Verify token with InsForge
    const { data: userData, error } = await authApi.getUser(session.accessToken);

    if (error || !userData?.user) {
      return apiError(401, 'Session invalid or expired');
    }

    const { user } = userData;

    // Get extended profile from users table
    const { data: dbUser } = await databaseApi.selectOne<{
      name?: string;
      avatar?: string;
      tier?: string;
      created_at?: string;
      updated_at?: string;
    }>(
      'users',
      { id: user.id },
      session.accessToken
    );

    const responseData: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: dbUser?.name || user.profile?.name || '',
        avatar: dbUser?.avatar || user.profile?.avatar_url || '',
        tier: (dbUser?.tier as 'free' | 'pro' | 'elite') || 'free',
        created_at: dbUser?.created_at || user.createdAt || new Date().toISOString(),
        updated_at: dbUser?.updated_at || user.updatedAt || new Date().toISOString(),
      },
      token: session.accessToken,
    };

    return apiSuccess(responseData);
  } catch (error: unknown) {
    console.error('[Auth/Session]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
