import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  authApi,
  apiError, 
  apiSuccess, 
  parseSessionCookie 
} from '@/lib/server/insforge';
import type { User, UserProfileResponse } from '@danclaw/shared';

/**
 * GET /api/user/profile
 * 
 * Returns the current user's profile.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionData = parseSessionCookie(cookieHeader);
    
    if (!sessionData) {
      return apiError(401, 'Not authenticated');
    }
    
    let session: { accessToken?: string; userId?: string };
    try {
      session = JSON.parse(Buffer.from(sessionData, 'base64').toString());
    } catch {
      return apiError(401, 'Invalid session');
    }
    
    if (!session?.accessToken || !session?.userId) {
      return apiError(401, 'Not authenticated');
    }

    // Get auth user
    const { data: authData, error: authError } = await authApi.getUser(session.accessToken);
    
    if (authError || !authData?.user) {
      return apiError(401, 'Invalid or expired session');
    }

    const { user: authUser } = authData;

    // Get extended profile from users table
    const { data: dbUser, error: dbError } = await databaseApi.selectOne<User & { openrouter_token?: string }>(
      'users',
      { id: session.userId },
      session.accessToken
    );

    if (dbError && dbError.statusCode !== 404) {
      console.warn('[User/Profile/GET] DB error:', dbError);
    }

    const user: User = {
      id: authUser.id,
      email: authUser.email,
      name: dbUser?.name || authUser.profile?.name || '',
      avatar: dbUser?.avatar || authUser.profile?.avatar_url || '',
      tier: dbUser?.tier || 'free',
      openrouter_token: dbUser?.openrouter_token,
      created_at: dbUser?.created_at || authUser.createdAt,
      updated_at: dbUser?.updated_at || authUser.updatedAt,
    };

    return Response.json(apiSuccess<UserProfileResponse>({ user }));
  } catch (error: unknown) {
    console.error('[User/Profile/GET]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}

/**
 * PUT /api/user/profile
 * 
 * Updates the current user's profile.
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionData = parseSessionCookie(cookieHeader);
    
    if (!sessionData) {
      return apiError(401, 'Not authenticated');
    }
    
    let session: { accessToken?: string; userId?: string };
    try {
      session = JSON.parse(Buffer.from(sessionData, 'base64').toString());
    } catch {
      return apiError(401, 'Invalid session');
    }
    
    if (!session?.accessToken || !session?.userId) {
      return apiError(401, 'Not authenticated');
    }

    const body = await request.json();
    const { name, avatar, openrouter_token } = body;

    // Update auth profile
    if (name !== undefined || avatar !== undefined) {
      await authApi.updateProfile(
        session.userId,
        { 
          name, 
          avatar_url: avatar 
        },
        session.accessToken
      );
    }

    // Update users table fields
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (openrouter_token !== undefined) updates.openrouter_token = openrouter_token;

    if (Object.keys(updates).length > 1) {
      await databaseApi.update(
        'users',
        updates,
        { id: session.userId },
        session.accessToken
      );
    }

    // Get updated user
    const { data: updatedDbUser } = await databaseApi.selectOne<User>(
      'users',
      { id: session.userId },
      session.accessToken
    );

    const { data: authData } = await authApi.getUser(session.accessToken);
    const authUser = authData?.user;

    const user: User = {
      id: session.userId,
      email: updatedDbUser?.email || authUser?.email || '',
      name: updatedDbUser?.name || name || '',
      avatar: updatedDbUser?.avatar || avatar || '',
      tier: updatedDbUser?.tier || 'free',
      openrouter_token: updatedDbUser?.openrouter_token || openrouter_token,
      created_at: updatedDbUser?.created_at || authUser?.createdAt || '',
      updated_at: new Date().toISOString(),
    };

    return Response.json(apiSuccess<User>(user));
  } catch (error: unknown) {
    console.error('[User/Profile/PUT]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
