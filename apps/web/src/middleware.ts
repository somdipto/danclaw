import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/settings', '/api/deployments'];
const AUTH_PATH = '/login';
const PUBLIC_PATHS = ['/', '/login', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith('/api/auth/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if path requires auth
  const requiresAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!requiresAuth) return NextResponse.next();

  // Read session cookie (InsForge stores session in a cookie)
  const sessionCookie = request.cookies.get('sb-access-token') || request.cookies.get('session');
  if (sessionCookie?.value) return NextResponse.next();

  // Also check Authorization header for API routes
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return NextResponse.next();

  // Redirect to login
  const loginUrl = new URL(AUTH_PATH, request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
