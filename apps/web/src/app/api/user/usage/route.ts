import { NextRequest } from 'next/server';
import {
  databaseApi,
  parseSessionCookie,
  apiError,
  apiSuccess,
} from '@/lib/server/insforge';
import type { Deployment, UsageResponse } from '@danclaw/shared';

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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError(401, 'Unauthorized');
    }

    // Get all user's deployments
    const result = await databaseApi.select<Deployment>('deployments', {
      eq: { user_id: userId },
    });

    if (result.error) {
      return apiError(400, result.error.message);
    }

    const deployments = result.data;

    // Aggregate usage
    const totalRequests = deployments.reduce((sum, d) => sum + (d.requests_today || 0), 0);
    const totalCost = deployments.reduce((sum, d) => sum + (d.cost_this_month || 0), 0);
    const models = Array.from(new Set(deployments.map(d => d.model).filter(Boolean)));

    const usage: UsageResponse['usage'] = {
      total_requests: totalRequests,
      cost: totalCost,
      models,
    };

    return apiSuccess({ usage });
  } catch (error) {
    console.error('[User/Usage/GET]', error);
    return apiError(500, 'Internal server error');
  }
}
