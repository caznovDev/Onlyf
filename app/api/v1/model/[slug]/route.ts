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
    const model = await db.prepare(
      "SELECT * FROM models WHERE slug = ?"
    ).bind(slug).first();

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { 
        status: 404,
        headers: getSecurityHeaders(request)
      });
    }

    const { results: videos } = await db.prepare(
      "SELECT * FROM videos WHERE model_id = ? AND is_published = 1 ORDER BY created_at DESC"
    ).bind(model.id).all();

    return NextResponse.json({
      ...model,
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
