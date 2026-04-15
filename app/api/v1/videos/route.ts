import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "8");
  const offset = (page - 1) * limit;
  
  // Fix: Cast process.env.DB to any to allow access to D1 methods like .prepare() and resolve type mismatch
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
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
    const total = countResult?.total || 0;

    return NextResponse.json({
      videos: results,
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