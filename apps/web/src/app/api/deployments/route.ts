import { NextRequest } from 'next/server';
import {
  databaseApi,
  parseSessionCookie,
  canCreateDeployment,
  apiError,
  apiSuccess,
  type Tier,
} from '@/lib/server/insforge';
import type { Deployment } from '@danclaw/shared';
import { createDeploymentSchema } from '@danclaw/shared';

interface SessionData {
  accessToken?: string;
  userId?: string;
  email?: string;
  expiresAt?: number;
}

async function getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = parseSessionCookie(cookieHeader);
  if (!sessionToken) return null;

  try {
    return JSON.parse(Buffer.from(sessionToken, 'base64').toString()) as SessionData;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const parsed = createDeploymentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, 'Invalid request body', parsed.error.message);
    }

    const { service_name, tier, region, model, channel } = parsed.data;

    // Check tier limits
    const existingResult = await databaseApi.select<Deployment>(
      'deployments',
      { eq: { user_id: session.userId } },
      session.accessToken
    );

    if (existingResult.error) {
      return apiError(500, 'Failed to check deployment limits');
    }

    if (!canCreateDeployment(tier as Tier, existingResult.data.length)) {
      return apiError(403, `Deployment limit reached for ${tier} tier`);
    }

    // Insert deployment
    const insertData: Record<string, unknown> = {
      user_id: session.userId,
      service_name,
      tier,
      region,
      model,
      channel,
      status: 'provisioning',
    };

    const result = await databaseApi.insert<Deployment>(
      'deployments',
      insertData,
      session.accessToken
    );

    if (result.error) {
      return apiError(400, result.error.message);
    }

    const deployment = result.data[0];

    // Activity auto-logged by DB trigger `trigger_log_deployment_activity`
    // No manual activity insert needed — eliminates double-logging

    return apiSuccess({ deployment });
  } catch (error) {
    console.error('[Deployments/POST]', error);
    return apiError(500, 'Internal server error');
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return apiError(401, 'Unauthorized');
    }

    const result = await databaseApi.select<Deployment>(
      'deployments',
      {
        eq: { user_id: session.userId },
        order: { column: 'created_at', ascending: false },
      },
      session.accessToken
    );

    if (result.error) {
      return apiError(400, result.error.message);
    }

    return apiSuccess({
      deployments: result.data,
      total: result.data.length,
    });
  } catch (error) {
    console.error('[Deployments/GET]', error);
    return apiError(500, 'Internal server error');
  }
}
