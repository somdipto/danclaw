import { NextRequest } from 'next/server';
import { authApi, apiError, apiSuccess, clearSessionCookie, parseSessionCookie } from '@/lib/server/insforge';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * 
 * Invalidates the current session and clears the session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionData = parseSessionCookie(cookieHeader);

    if (sessionData) {
      try {
        const session = JSON.parse(Buffer.from(sessionData, 'base64').toString());
        if (session.accessToken) {
          await authApi.signOut(session.accessToken);
        }
      } catch {
        // Session invalid, proceed with cookie clearing
      }
    }

    const response = NextResponse.json(
      { success: true }
    );

    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  } catch (error: unknown) {
    console.error('[Auth/Logout]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError(500, message);
  }
}
