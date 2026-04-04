import { NextRequest } from 'next/server';
import { 
  databaseApi, 
  apiError, 
  apiSuccess, 
  parseSessionCookie 
} from '@/lib/server/insforge';

/**
 * PUT /api/user/openrouter-token
 * 
 * Updates the user's OpenRouter API token.
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { openrouter_token } = body;

    if (typeof openrouter_token !== 'string') {
      return apiError(400, 'openrouter_token is required');
    }

    // Basic validation - OpenRouter tokens start with 'sk-'
    if (!openrouter_token.startsWith('sk-') && openrouter_token !== '') {
      return apiError(400, 'Invalid OpenRouter token format');
    }

    // Update token in users table
    const { error } = await databaseApi.update(
      'users',
      { 
        openrouter_token: openrouter_token || null,
        updated_at: new Date().toISOString()
      },
      { id: session.userId },
      session.accessToken
    );

    if (error) {
      return apiError(400, error.message);
    }

    return Response.json(apiSuccess({ 
      success: true,
      message: 'OpenRouter token updated'
    }));
  } catch (error: unknown) {
    console.error('[User/OpenRouterToken/PUT]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
