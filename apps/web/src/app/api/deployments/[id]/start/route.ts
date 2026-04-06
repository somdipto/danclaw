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
 * POST /api/deployments/:id/start
 *
 * Starts a stopped deployment.
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

    const targetStatus: DeploymentStatus = 'starting';
    
    if (!isValidStatusTransition(deployment.status, targetStatus)) {
      return apiError(
        400,
        `Cannot start deployment from status '${deployment.status}'`
      );
    }

    // Update status to starting
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

    // Log activity (auto-logged by DB trigger, but manual for explicit action)
    try {
      await databaseApi.insert('activity', {
        user_id: session.userId,
        action: `Started "${deployment.service_name}" agent`,
        icon: '▶️',
        timestamp: now,
      }, session.accessToken);
    } catch (actErr) {
      console.warn('[Deployments/:id/start] Activity log:', actErr);
    }

    return apiSuccess({ success: true, message: 'Deployment starting' });
  } catch (error: unknown) {
    console.error('[Deployments/:id/start]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
