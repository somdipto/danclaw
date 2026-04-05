import { NextRequest } from 'next/server';
import {
  databaseApi,
  parseSessionCookie,
  apiError,
  apiSuccess,
  isValidStatusTransition,
  type DeploymentStatus,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError(401, 'Unauthorized');
    }

    const { id } = await params;

    // Get current deployment
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

    const deployment = existing.data;
    const currentStatus = deployment.status as DeploymentStatus;

    // Validate status transition
    if (!isValidStatusTransition(currentStatus, 'stopping')) {
      return apiError(400, `Cannot stop deployment from "${currentStatus}" state`);
    }

    // Update status to stopping
    const result = await databaseApi.update<Deployment>('deployments',
      { status: 'stopping' },
      { id, user_id: userId }
    );

    if (result.error) {
      return apiError(400, result.error.message);
    }

    return apiSuccess({
      success: true,
      message: 'Deployment stopping',
      deployment: result.data[0],
    });
  } catch (error) {
    console.error('[Deployments/[id]/stop/POST]', error);
    return apiError(500, 'Internal server error');
  }
}
