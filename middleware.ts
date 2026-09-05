import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from './lib/api-security';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Always serve robots.txt so search engines can read the Disallow rules
  if (pathname === '/robots.txt') {
    return NextResponse.next();
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Check for Google crawlers
  const isGoogleCrawler =
    userAgent.includes('googlebot') ||
    userAgent.includes('google-inspectiontool') ||
    userAgent.includes('mediapartners-google') ||
    userAgent.includes('adsbot-google') ||
    userAgent.includes('feedfetcher-google') ||
    userAgent.includes('google-read-aloud') ||
    userAgent.includes('duplicateremoval') ||
    userAgent.includes('google producer');

  if (isGoogleCrawler) {
    return new NextResponse('Access Denied: Google crawlers are blocked.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      },
    });
  }

  // API Call Gatekeeper: Ensure only allowed calls receive data
  if (pathname.startsWith('/api/')) {
    // Handle CORS preflight OPTIONS requests securely
    if (request.method === 'OPTIONS') {
      const secHeaders = getSecurityHeaders(request);
      return new Response(null, {
        status: 204,
        headers: secHeaders,
      });
    }

    // Mutating endpoints (e.g. upload, models creation) require write authorization
    const isMutatingEndpoint = 
      pathname.startsWith('/api/v1/upload') || 
      (pathname.startsWith('/api/v1/models') && ['POST', 'PATCH', 'DELETE'].includes(request.method));

    const authResult = validateApiAccess(request, { requireAdmin: isMutatingEndpoint });

    if (!authResult.allowed) {
      return createUnauthorizedResponse(authResult, request);
    }

    // Attach security headers to response
    const response = NextResponse.next();
    const secHeaders = getSecurityHeaders(request);
    Object.entries(secHeaders).forEach(([key, val]) => {
      response.headers.set(key, val);
    });

    return response;
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
