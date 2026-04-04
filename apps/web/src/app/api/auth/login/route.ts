import { NextRequest } from 'next/server';
import { authApi, createSessionCookie, clearSessionCookie, apiError, apiSuccess } from '@/lib/server/insforge';
import { NextResponse } from 'next/server';
import type { LoginResponse } from '@danclaw/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError(400, 'Email and password required');
    }

    // Call InsForge Auth directly for proper token handling
    const result = await authApi.signInWithPassword(email, password);

    if (result.error || !result.data?.accessToken || !result.data?.user) {
      return apiError(
        result.error?.statusCode || 401,
        result.error?.message || 'Invalid credentials'
      );
    }

    const { accessToken, user } = result.data;

    // Create session data
    const sessionData = JSON.stringify({
      accessToken,
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.json(
      apiSuccess<LoginResponse>({
        user: {
          id: user.id,
          email: user.email,
          name: user.profile?.name || '',
          avatar: user.profile?.avatar_url || '',
          tier: 'free',
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        token: accessToken,
      })
    );

    response.headers.set('Set-Cookie', createSessionCookie(sessionData));

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
