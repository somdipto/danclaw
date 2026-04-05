import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  authApi,
  databaseApi,
  createSessionCookie,
  apiError,
} from '@/lib/server/insforge';
import { NextResponse } from 'next/server';
import type { RegisterResponse } from '@danclaw/shared';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(400, 'Invalid request body', parsed.error.message);
    }

    const { email, password, name } = parsed.data;

    // Sign up with InsForge Auth
    const result = await authApi.signUp(email, password, name);

    if (result.error || !result.data?.accessToken || !result.data?.user) {
      return apiError(
        result.error?.statusCode || 400,
        result.error?.message || 'Registration failed'
      );
    }

    const { accessToken, user } = result.data;

    // Create user profile in database
    const profileResult = await databaseApi.insert('users', {
      id: user.id,
      email: user.email,
      name: name,
      tier: 'free',
    });

    if (profileResult.error) {
      console.error('[Register] Failed to create profile:', profileResult.error);
      // Continue anyway - the auth user was created
    }

    // Create session
    const sessionData = JSON.stringify({
      accessToken,
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
    });

    // Need to use NextResponse to set cookie, pass raw data without double-wrapping
    const response = NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: name,
            avatar: '',
            tier: 'free',
            created_at: user.createdAt,
            updated_at: user.updatedAt,
          },
          token: accessToken,
        } as RegisterResponse,
      },
      { status: 201 }
    );

    response.headers.set('Set-Cookie', createSessionCookie(sessionData));

    return response;
  } catch (error) {
    console.error('[Register/POST]', error);
    return apiError(500, 'Internal server error');
  }
}
