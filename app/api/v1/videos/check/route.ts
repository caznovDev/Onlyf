import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../../lib/api-security';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const auth = validateApiAccess(request);
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug parameter is required" }, { 
      status: 400,
      headers: getSecurityHeaders(request)
    });
  }

  try {
    const video = await db.prepare(
      "SELECT id, title, slug, thumbnail, views FROM videos WHERE slug = ?"
    ).bind(slug).first();

    if (!video) {
      return NextResponse.json({ exists: false }, { 
        status: 200,
        headers: getSecurityHeaders(request)
      });
    }

    return NextResponse.json({ 
      exists: true, 
      video 
    }, { 
      status: 200,
      headers: {
        ...getSecurityHeaders(request),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30"
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getSecurityHeaders(request),
  });
}