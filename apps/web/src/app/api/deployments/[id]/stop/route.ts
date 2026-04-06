import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie,
  isValidStatusTransition,
  type DeploymentStatus
} from '@/lib/server/insforge';
import type { Deployment } from '@danclaw/shared';

/**
 * POST /api/deployments/:id/stop
 *
 * Stops a running deployment.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);
    
    if (!sessionToken) {
      return apiError(401, 'Unauthorized');
    }
    
    let session: { accessToken?: string; userId?: string };
    try {
      session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    } catch {
      return apiError(401, 'Invalid session');
    }
    
    if (!session?.accessToken || !session?.userId) {
      return apiError(401, 'Unauthorized');
    }

    // Get current deployment
    const { data: deployment, error: fetchError } = await databaseApi.selectOne<Deployment>(
      'deployments',
      { id },
      session.accessToken
    );

    if (fetchError) {
      return apiError(400, fetchError.message);
    }

    if (!deployment) {
      return apiError(404, 'Deployment not found');
    }

    if (deployment.user_id !== session.userId) {
      return apiError(403, 'Access denied');
    }

    const targetStatus: DeploymentStatus = 'stopping';
    
    if (!isValidStatusTransition(deployment.status, targetStatus)) {
      return apiError(
        400,
        `Cannot stop deployment from status '${deployment.status}'`
      );
    }

    // Update status to stopping
    const now = new Date().toISOString();
    const { error: updateError } = await databaseApi.update(
      'deployments',
      { id },
      { status: targetStatus, updated_at: now },
      session.accessToken
    );

    if (updateError) {
      return apiError(400, updateError.message);
    }

    // Log activity
    try {
      await databaseApi.insert('activity', {
        user_id: session.userId,
        action: `Stopped "${deployment.service_name}" agent`,
        icon: '⏹️',
        timestamp: now,
      }, session.accessToken);
    } catch (actErr) {
      console.warn('[Deployments/:id/stop] Activity log:', actErr);
    }

    return apiSuccess({ success: true, message: 'Deployment stopping' });
  } catch (error: unknown) {
    console.error('[Deployments/:id/stop]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
