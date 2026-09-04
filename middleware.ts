import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
