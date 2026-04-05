import { NextRequest } from 'next/server';
import { authApi, createSessionCookie, apiError } from '@/lib/server/insforge';
import { NextResponse } from 'next/server';
import { loginSchema } from '@danclaw/shared/validators';
import type { LoginResponse } from '@danclaw/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(400, 'Invalid request body', parsed.error.message);
    }

    const { email, password } = parsed.data;

    // Call InsForge Auth
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

    // Map InsForgeUser to DanClaw User type
    const danclawUser = {
      id: user.id,
      email: user.email,
      name: user.profile?.name || '',
      avatar: user.profile?.avatar_url || '',
      tier: 'free',
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    // Need to use NextResponse to set cookie, but pass raw data (not apiSuccess which double-wraps)
    const response = NextResponse.json(
      { data: { user: danclawUser, token: accessToken } as LoginResponse },
      { status: 200 }
    );

    response.headers.set('Set-Cookie', createSessionCookie(sessionData));

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Login/POST]', error);
    return apiError(500, message);
  }
}
