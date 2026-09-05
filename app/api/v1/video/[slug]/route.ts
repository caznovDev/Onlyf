import { NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../../lib/api-security';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = validateApiAccess(request);
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  const { slug } = await params;
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }

  try {
    // Increment views
    await db.prepare("UPDATE videos SET views = views + 1 WHERE slug = ? AND is_published = 1").bind(slug).run();

    const video = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail 
       FROM videos v 
       JOIN models m ON v.model_id = m.id 
       WHERE v.slug = ? AND v.is_published = 1`
    ).bind(slug).first();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { 
        status: 404,
        headers: getSecurityHeaders(request)
      });
    }

    return NextResponse.json(video, {
      headers: { 
        ...getSecurityHeaders(request),
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getSecurityHeaders(request),
  });
}
