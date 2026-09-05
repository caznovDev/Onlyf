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
    const tag = await db.prepare(
      "SELECT * FROM tags WHERE slug = ?"
    ).bind(slug).first();

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { 
        status: 404,
        headers: getSecurityHeaders(request)
      });
    }

    const { results: videos } = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug
       FROM videos v
       JOIN video_tags vt ON v.id = vt.video_id
       JOIN models m ON v.model_id = m.id
       WHERE vt.tag_id = ? AND v.is_published = 1
       ORDER BY v.created_at DESC`
    ).bind(tag.id).all();

    return NextResponse.json({
      ...tag,
      videos
    }, {
      headers: getSecurityHeaders(request)
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
