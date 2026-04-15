import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  let db: any;
  try {
    db = (getRequestContext().env as any).DB;
  } catch (e) {
    // Fallback for local development or environments without getRequestContext
    db = (process.env as any).DB;
  }

  if (!db) {
    return NextResponse.json({ 
      error: "Database connection not found. Ensure D1 is bound to 'DB' in Cloudflare settings.",
      videos: [],
      pagination: { total: 0, totalPages: 0 }
    }, { status: 500 });
  }

  try {
    const { results } = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
       FROM videos v 
       LEFT JOIN models m ON v.model_id = m.id 
       WHERE v.is_published = 1 
       ORDER BY v.created_at DESC 
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM videos WHERE is_published = 1").first();
    const total = countResult ? (countResult as any).total : 0;

    return NextResponse.json({
      videos: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
