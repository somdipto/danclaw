import { NextRequest } from 'next/server';
import {
  databaseApi,
  parseSessionCookie,
  apiError,
  apiSuccess,
} from '@/lib/server/insforge';
import type { Deployment } from '@danclaw/shared';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError(401, 'Unauthorized');
    }

    const { id } = await params;
    const result = await databaseApi.selectOne<Deployment>('deployments', {
      id,
      user_id: userId,
    });

    if (result.error) {
      return apiError(400, result.error.message);
    }

    if (!result.data) {
      return apiError(404, 'Deployment not found');
    }

    return apiSuccess({ deployment: result.data });
  } catch (error) {
    console.error('[Deployments/[id]/GET]', error);
    return apiError(500, 'Internal server error');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError(401, 'Unauthorized');
    }

    const { id } = await params;

    // First verify the deployment belongs to this user
    const existing = await databaseApi.selectOne<Deployment>('deployments', {
      id,
      user_id: userId,
    });

    if (existing.error) {
      return apiError(400, existing.error.message);
    }

    if (!existing.data) {
      return apiError(404, 'Deployment not found');
    }

    // Delete the deployment
    const result = await databaseApi.delete('deployments', {
      id,
    });

    if (result.error) {
      return apiError(400, result.error.message);
    }

    return apiSuccess({ success: true });
  } catch (error) {
    console.error('[Deployments/[id]/DELETE]', error);
    return apiError(500, 'Internal server error');
  }
}
