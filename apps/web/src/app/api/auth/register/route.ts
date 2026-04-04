import { NextRequest } from 'next/server';
import { authApi, databaseApi, apiError, apiSuccess, createSessionCookie } from '@/lib/server/insforge';
import { NextResponse } from 'next/server';
import type { RegisterResponse } from '@danclaw/shared';

/**
 * POST /api/auth/register
 * 
 * Creates a new user account via InsForge Auth.
 * Automatically creates a users table entry and sets session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return apiError(400, 'Email and password are required');
    }

    if (password.length < 8) {
      return apiError(400, 'Password must be at least 8 characters');
    }

    // Call InsForge Auth
    const result = await authApi.signUp(email, password, name);

    if (result.error || !result.data?.accessToken || !result.data?.user) {
      return apiError(
        result.error?.statusCode || 400,
        result.error?.message || 'Registration failed'
      );
    }

    const { accessToken, user } = result.data;

    // Create users table entry
    try {
      await databaseApi.insert(
        'users',
        {
          id: user.id,
          email: user.email,
          name: name || email.split('@')[0],
          tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        accessToken
      );
    } catch (dbError) {
      // User row might already exist, ignore duplicate key error
      console.warn('[Auth/Register] Users table insert:', dbError);
    }

    // Create session data
    const sessionData = JSON.stringify({
      accessToken,
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
    });

    // Set HttpOnly cookie
    const response = NextResponse.json(
      apiSuccess<RegisterResponse>({
        user: {
          id: user.id,
          email: user.email,
          name: name || email.split('@')[0],
          avatar: '',
          tier: 'free',
          created_at: user.createdAt || new Date().toISOString(),
          updated_at: user.updatedAt || new Date().toISOString(),
        },
        token: accessToken,
      })
    );

    response.headers.set('Set-Cookie', createSessionCookie(sessionData));

    return response;
  } catch (error: unknown) {
    console.error('[Auth/Register]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
