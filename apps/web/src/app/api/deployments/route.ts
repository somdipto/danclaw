import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie, 
  canCreateDeployment,
  TIER_DEPLOYMENT_LIMITS,
  type Tier
} from '@/lib/server/insforge';
import { createDeploymentSchema } from '@danclaw/shared/validators';
import type { 
  CreateDeploymentRequest, 
  CreateDeploymentResponse,
  ListDeploymentsResponse,
  Deployment
} from '@danclaw/shared';

/**
 * Helper: Extract and validate session from request
 */
async function getSessionFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const sessionData = parseSessionCookie(cookieHeader);
  
  if (!sessionData) return null;
  
  try {
    const session = JSON.parse(Buffer.from(sessionData, 'base64').toString());
    return session;
  } catch {
    return null;
  }
}

/**
 * POST /api/deployments
 * 
 * Creates a new deployment for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.accessToken || !session?.userId) {
      return apiError(401, 'Not authenticated');
    }

    const body = await request.json();

    // Zod validation
    const parsed = createDeploymentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, parsed.error.errors[0]?.message || 'Invalid request body');
    }

    const { service_name, tier, region, model, channel, openrouter_token } = parsed.data;

    // Check deployment limits based on tier
    const { data: existingDeployments } = await databaseApi.select<{ id: string }>(
      'deployments',
      { 
        select: 'id',
        eq: { user_id: session.userId }
      },
      session.accessToken
    );

    const currentCount = existingDeployments?.length || 0;
    
    if (!canCreateDeployment(tier as Tier, currentCount)) {
      return apiError(403, `Deployment limit reached for ${tier} tier. Max ${TIER_DEPLOYMENT_LIMITS[tier as Tier].maxDeployments} deployments.`);
    }

    // Create deployment
    const now = new Date().toISOString();
    const { data: deployments, error } = await databaseApi.insert<Deployment>(
      'deployments',
      {
        user_id: session.userId,
        service_name,
        tier,
        region,
        model,
        channel,
        status: 'provisioning',
        openrouter_token: openrouter_token || null,
        created_at: now,
        updated_at: now,
      },
      session.accessToken
    );

    if (error) {
      return apiError(400, error.message);
    }

    if (!deployments || deployments.length === 0) {
      return apiError(500, 'Failed to create deployment');
    }

    // Log activity
    try {
      await databaseApi.insert('activity', {
        user_id: session.userId,
        action: 'deployment_created',
        icon: '🚀',
        timestamp: now,
      }, session.accessToken);
    } catch (actErr) {
      console.warn('[Deployments/POST] Activity log:', actErr);
    }

    // Return 201 with the created deployment
    return new Response(
      JSON.stringify({ data: { deployment: deployments[0] } } as CreateDeploymentResponse),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[Deployments/POST]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}

/**
 * GET /api/deployments
 * 
 * Lists all deployments for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.accessToken || !session?.userId) {
      return apiError(401, 'Not authenticated');
    }

    // Check for query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { data: deployments, error } = await databaseApi.select<Deployment>(
      'deployments',
      {
        select: '*',
        eq: { user_id: session.userId },
        order: { column: 'created_at', ascending: false },
        range: { start: offset, end: offset + limit - 1 },
      },
      session.accessToken
    );

    if (error) {
      return apiError(400, error.message);
    }

    const deploymentList = deployments || [];

    return apiSuccess<ListDeploymentsResponse>({
      deployments: deploymentList,
      total: deploymentList.length,
    });
  } catch (error: unknown) {
    console.error('[Deployments/GET]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
