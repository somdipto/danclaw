import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie 
} from '@/lib/server/insforge';
import type { UsageResponse } from '@danclaw/shared';

/**
 * GET /api/user/usage
 * 
 * Returns usage statistics for the current billing cycle.
 */
export async function GET(request: NextRequest) {
  try {
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

    // Calculate start of current billing cycle (monthly)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get all deployments with usage stats for current month
    const { data: deployments, error } = await databaseApi.select<{
      id: string;
      requests_today: number;
      cost_this_month: number;
      model: string;
    }>(
      'deployments',
      {
        select: 'id, requests_today, cost_this_month, model',
        eq: { user_id: session.userId },
      },
      session.accessToken
    );

    if (error) {
      return apiError(400, error.message);
    }

    const deploymentList = deployments || [];

    // Aggregate stats
    let totalRequests = 0;
    let totalCost = 0;
    const modelSet = new Set<string>();

    for (const d of deploymentList) {
      totalRequests += d.requests_today || 0;
      totalCost += d.cost_this_month || 0;
      if (d.model) modelSet.add(d.model);
    }

    const usage: UsageResponse['usage'] = {
      total_requests: totalRequests,
      cost: totalCost,
      models: Array.from(modelSet),
    };

    return Response.json(apiSuccess({ usage }));
  } catch (error: unknown) {
    console.error('[User/Usage/GET]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
