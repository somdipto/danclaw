import { NextRequest } from 'next/server';
import {
  databaseApi,
  parseSessionCookie,
  canCreateDeployment,
  buildActivityEntry,
  apiError,
  apiSuccess,
} from '@/lib/server/insforge';
import { createDeploymentSchema } from '@danclaw/shared/validators';
import type { Deployment } from '@danclaw/shared';

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
    const existingDeployments = await databaseApi.select<Deployment>(
      'deployments',
      { eq: { user_id: session.userId } },
      session.accessToken
    );

    if (existingDeployments.error) {
      return apiError(500, 'Failed to check deployment limits');
    }

    if (!canCreateDeployment(tier, existingDeployments.data.length)) {
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

    // Log activity
    const activityEntry = buildActivityEntry(
      `Deployed "${service_name}" agent`,
      'rocket'
    );

    await databaseApi.insert(
      'activity',
      {
        user_id: session.userId,
        action: activityEntry.action,
        icon: activityEntry.icon,
        timestamp: activityEntry.timestamp,
      },
      session.accessToken
    );

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
