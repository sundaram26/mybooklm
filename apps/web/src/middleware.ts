import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow dashboard to be visible to all
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // Example: if we wanted to enforce auth strictly, we'd check for a session token cookie.
  // Better-auth uses specific cookies, but since we support guest access, 
  // we just need to make sure the app works. We can let the client handle strict auth walls.
  // This middleware is a placeholder for future strict server-side auth enforcement.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
