import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie 
} from '@/lib/server/insforge';
import type { Activity } from '@danclaw/shared';

/**
 * GET /api/user/activity
 * 
 * Returns the user's activity feed.
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get activity log entries
    const { data: activities, error } = await databaseApi.select<{
      id: string;
      action: string;
      icon: string;
      timestamp: string;
    }>(
      'activity',
      {
        select: 'id, action, icon, timestamp',
        eq: { user_id: session.userId },
        order: { column: 'timestamp', ascending: false },
        limit,
        range: { start: offset, end: offset + limit - 1 },
      },
      session.accessToken
    );

    if (error) {
      return apiError(400, error.message);
    }

    const activityList: Activity[] = (activities || []).map(row => ({
      id: row.id,
      user_id: session.userId!,
      action: row.action,
      icon: row.icon,
      timestamp: row.timestamp,
    }));

    return apiSuccess({
      activities: activityList,
      total: activityList.length,
    });
  } catch (error: unknown) {
    console.error('[User/Activity/GET]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
