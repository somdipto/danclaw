import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie,
  isValidStatusTransition,
  type DeploymentStatus
} from '@/lib/server/insforge';
import type { Deployment, DeploymentActionResponse } from '@danclaw/shared';

/**
 * POST /api/deployments/:id/restart
 * 
 * Restarts a running deployment.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const targetStatus: DeploymentStatus = 'restarting';
    
    if (!isValidStatusTransition(deployment.status, targetStatus)) {
      return apiError(
        400,
        `Cannot restart deployment from status '${deployment.status}'`
      );
    }

    // Update status
    const now = new Date().toISOString();
    const { error: updateError } = await databaseApi.update(
      'deployments',
      { status: targetStatus, updated_at: now },
      { id },
      session.accessToken
    );

    if (updateError) {
      return apiError(400, updateError.message);
    }

    // Log activity
    try {
      await databaseApi.insert('activity', {
        user_id: session.userId,
        action: 'deployment_restarted',
        icon: '🔄',
        timestamp: now,
      }, session.accessToken);
    } catch (actErr) {
      console.warn('[Deployments/:id/restart] Activity log:', actErr);
    }

    return apiSuccess<DeploymentActionResponse>({
      success: true,
      message: 'Deployment restarting',
    });
  } catch (error: unknown) {
    console.error('[Deployments/:id/restart]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
