import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie 
} from '@/lib/server/insforge';
import type { Deployment } from '@danclaw/shared';

/**
 * GET /api/deployments/:id
 * 
 * Returns a single deployment by ID.
 */
export async function GET(
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

    const { data: deployment, error } = await databaseApi.selectOne<Deployment>(
      'deployments',
      { id },
      session.accessToken
    );

    if (error) {
      return apiError(400, error.message);
    }

    if (!deployment) {
      return apiError(404, 'Deployment not found');
    }

    // Verify ownership (defense-in-depth, RLS should handle this)
    if (deployment.user_id !== session.userId) {
      return apiError(403, 'Access denied');
    }

    return Response.json(apiSuccess(deployment));
  } catch (error: unknown) {
    console.error('[Deployments/:id/GET]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}

/**
 * DELETE /api/deployments/:id
 * 
 * Destroys a deployment.
 */
export async function DELETE(
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

    // Get deployment to verify ownership
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

    // Update status to destroying
    await databaseApi.update(
      'deployments',
      { status: 'destroying', updated_at: new Date().toISOString() },
      { id },
      session.accessToken
    );

    // Delete deployment
    const { error: deleteError } = await databaseApi.delete(
      'deployments',
      { id },
      session.accessToken
    );

    if (deleteError) {
      return apiError(400, deleteError.message);
    }

    // Log activity
    try {
      await databaseApi.insert('activity', {
        user_id: session.userId,
        action: 'deployment_destroyed',
        icon: '🗑️',
        timestamp: new Date().toISOString(),
      }, session.accessToken);
    } catch (actErr) {
      console.warn('[Deployments/:id/DELETE] Activity log:', actErr);
    }

    return Response.json(apiSuccess({ success: true }));
  } catch (error: unknown) {
    console.error('[Deployments/:id/DELETE]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
