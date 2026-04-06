import { NextRequest } from 'next/server';
import {
  databaseApi,
  parseSessionCookie,
  apiError,
  apiSuccess,
} from '@/lib/server/insforge';
import type { User } from '@danclaw/shared';

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = parseSessionCookie(cookieHeader);
  if (!sessionToken) return null;

  try {
    const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    return session.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError(401, 'Unauthorized');
    }

    const result = await databaseApi.selectOne<User>('users', { id: userId });

    if (result.error) {
      return apiError(400, result.error.message);
    }

    if (!result.data) {
      return apiError(404, 'User not found');
    }

    return apiSuccess({ user: result.data });
  } catch (error) {
    console.error('[User/Profile/GET]', error);
    return apiError(500, 'Internal server error');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { name, avatar, openrouter_token } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (openrouter_token !== undefined) updates.openrouter_token = openrouter_token;

    if (Object.keys(updates).length === 0) {
      return apiError(400, 'No updates provided');
    }

    const result = await databaseApi.update<User>('users', { id: userId }, updates);

    if (result.error) {
      return apiError(400, result.error.message);
    }

    return apiSuccess({ user: result.data[0] });
  } catch (error) {
    console.error('[User/Profile/PATCH]', error);
    return apiError(500, 'Internal server error');
  }
}
