import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Fix: Cast process.env.DB to any to allow access to D1 methods like .prepare() and resolve type mismatch
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
  }

  try {
    const video = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail 
       FROM videos v 
       JOIN models m ON v.model_id = m.id 
       WHERE v.slug = ? AND v.is_published = 1`
    ).bind(slug).first();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video, {
      headers: { "Cache-Control": "public, max-age=3600" }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}