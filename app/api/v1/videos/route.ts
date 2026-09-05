import { NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../lib/api-security';

export const runtime = 'edge';

export async function GET(request: Request) {
  const auth = validateApiAccess(request);
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "8");
  const offset = (page - 1) * limit;
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }

  try {
    const { results } = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug 
       FROM videos v 
       JOIN models m ON v.model_id = m.id 
       WHERE v.is_published = 1 
       ORDER BY v.created_at DESC 
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM videos WHERE is_published = 1").first();
    const total = (countResult as any).total;

    return NextResponse.json({
      videos: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
