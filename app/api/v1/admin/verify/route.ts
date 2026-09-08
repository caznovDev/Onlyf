import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../../lib/api-security';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  let keyFromRequest: string | null = null;
  try {
    const body = await request.json();
    keyFromRequest = body.key || body.apiKey || null;
  } catch {
    // Body might be empty
  }

  // If key was provided in body, simulate header for validateApiAccess if header wasn't already set
  let authRequest: Request = request;
  if (keyFromRequest && !request.headers.get('x-api-key') && !request.headers.get('authorization')) {
    const headers = new Headers(request.headers);
    headers.set('x-api-key', keyFromRequest);
    authRequest = new Request(request.url, {
      method: request.method,
      headers,
    });
  }

  const auth = validateApiAccess(authRequest, { requireAdmin: true });
  if (!auth.allowed) {
    return NextResponse.json({
      valid: false,
      error: 'Invalid or unauthorized Admin API Key.',
      status: auth.status
    }, {
      status: auth.status,
      headers: getSecurityHeaders(request)
    });
  }

  return NextResponse.json({
    valid: true,
    isAdmin: auth.isAdmin,
    message: 'Admin access verified successfully.'
  }, {
    headers: getSecurityHeaders(request)
  });
}

export async function GET(request: NextRequest) {
  const auth = validateApiAccess(request, { requireAdmin: true });
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  return NextResponse.json({
    valid: true,
    isAdmin: auth.isAdmin,
    message: 'Admin access verified successfully.'
  }, {
    headers: getSecurityHeaders(request)
  });
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getSecurityHeaders(request),
  });
}
