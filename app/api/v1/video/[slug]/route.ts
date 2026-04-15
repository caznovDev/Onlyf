import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      type, 
      thumbnail, 
      resolution, 
      orientation, 
      is_published,
      duration 
    } = body;

    const result = await db.prepare(`
      UPDATE videos 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        thumbnail = COALESCE(?, thumbnail),
        resolution = COALESCE(?, resolution),
        orientation = COALESCE(?, orientation),
        is_published = COALESCE(?, is_published),
        duration = COALESCE(?, duration)
      WHERE slug = ?
    `).bind(
      title, 
      description, 
      type, 
      thumbnail, 
      resolution, 
      orientation, 
      is_published,
      duration,
      slug
    ).run();

    if (result.meta.changes === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Metadata synced to edge." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}