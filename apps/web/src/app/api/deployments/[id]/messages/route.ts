import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie 
} from '@/lib/server/insforge';
import type { Message, Deployment } from '@danclaw/shared';

/**
 * GET /api/deployments/:id/messages
 * 
 * Returns messages for a deployment.
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

    // Verify deployment ownership
    const { data: deployment, error: deployError } = await databaseApi.selectOne<Deployment>(
      'deployments',
      { id },
      session.accessToken
    );

    if (deployError) {
      return apiError(400, deployError.message);
    }

    if (!deployment) {
      return apiError(404, 'Deployment not found');
    }

    if (deployment.user_id !== session.userId) {
      return apiError(403, 'Access denied');
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get messages
    const { data: messages, error: msgError } = await databaseApi.select<Message>(
      'messages',
      {
        select: '*',
        eq: { deployment_id: id },
        order: { column: 'created_at', ascending: true },
        limit,
        range: { start: offset, end: offset + limit - 1 },
      },
      session.accessToken
    );

    if (msgError) {
      return apiError(400, msgError.message);
    }

    return Response.json(apiSuccess({
      messages: messages || [],
      total: messages?.length || 0,
    }));
  } catch (error: unknown) {
    console.error('[Deployments/:id/messages/GET]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}

/**
 * POST /api/deployments/:id/messages
 * 
 * Sends a message to a deployment (creates user message, triggers agent response).
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

    // Verify deployment ownership
    const { data: deployment, error: deployError } = await databaseApi.selectOne<Deployment>(
      'deployments',
      { id },
      session.accessToken
    );

    if (deployError) {
      return apiError(400, deployError.message);
    }

    if (!deployment) {
      return apiError(404, 'Deployment not found');
    }

    if (deployment.user_id !== session.userId) {
      return apiError(403, 'Access denied');
    }

    // Parse message body
    const body = await request.json();
    const { content, type = 'message' } = body;

    if (!content || typeof content !== 'string') {
      return apiError(400, 'Message content is required');
    }

    const now = new Date().toISOString();

    // Create user message
    const { data: userMessage, error: msgError } = await databaseApi.insert<Message>(
      'messages',
      {
        deployment_id: id,
        role: 'user',
        content,
        type,
        created_at: now,
      },
      session.accessToken
    );

    if (msgError) {
      return apiError(400, msgError.message);
    }

    // Log activity
    try {
      await databaseApi.insert('activity', {
        user_id: session.userId,
        action: 'message_sent',
        icon: '💬',
        timestamp: now,
      }, session.accessToken);
    } catch (actErr) {
      console.warn('[Deployments/:id/messages/POST] Activity log:', actErr);
    }

    // Note: The actual agent response would be handled via WebSocket/Realtime
    // This endpoint creates the user message and triggers the agent response pipeline.
    // The agent response will come through the WebSocket connection.

    return Response.json(apiSuccess({
      message: userMessage?.[0],
      agentResponsePending: true,
    }), { status: 201 });
  } catch (error: unknown) {
    console.error('[Deployments/:id/messages/POST]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
