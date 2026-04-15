import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ videos: [] });
  }

  let db: any;
  try {
    db = (getRequestContext().env as any).DB;
  } catch (e) {
    db = (process.env as any).DB;
  }

  if (!db) {
    return NextResponse.json({ error: "Database connection not found" }, { status: 500 });
  }

  try {
    const { results } = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug
       FROM videos v 
       LEFT JOIN models m ON v.model_id = m.id 
       WHERE v.is_published = 1 AND (v.title LIKE ? OR v.description LIKE ?)
       ORDER BY v.created_at DESC 
       LIMIT 10`
    ).bind(`%${q}%`, `%${q}%`).all();

    return NextResponse.json({
      videos: results || []
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
