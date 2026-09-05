import { NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../lib/api-security';

export const runtime = 'edge';

export async function GET(request: Request) {
  const auth = validateApiAccess(request);
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }

  if (q.length < 2) {
    return NextResponse.json({ videos: [], models: [] }, {
      headers: getSecurityHeaders(request)
    });
  }

  try {
    const videoResults = await db.prepare(
      "SELECT title, slug, thumbnail FROM videos WHERE title LIKE ? AND is_published = 1 LIMIT 5"
    ).bind(`%${q}%`).all();

    const modelResults = await db.prepare(
      "SELECT name, slug, thumbnail FROM models WHERE name LIKE ? LIMIT 3"
    ).bind(`%${q}%`).all();

    return NextResponse.json({
      videos: videoResults.results,
      models: modelResults.results
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
