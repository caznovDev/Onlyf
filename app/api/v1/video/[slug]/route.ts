import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const recLimit = parseInt(searchParams.get("rec_limit") || "8");

  // @ts-ignore
  const db = process.env.DB;

  if (!db) {
    return NextResponse.json({ error: "Database connection not found" }, { status: 500 });
  }

  try {
    // Get video details
    const video = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
       FROM videos v 
       LEFT JOIN models m ON v.model_id = m.id 
       WHERE v.slug = ? AND v.is_published = 1`
    ).bind(slug).first();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Get tags
    const { results: tags } = await db.prepare(
      `SELECT t.* FROM tags t
       JOIN video_tags vt ON t.id = vt.tag_id
       WHERE vt.video_id = ?`
    ).bind(video.id).all();

    // Get recommendations (excluding current video)
    const { results: recommendations } = await db.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
       FROM videos v 
       LEFT JOIN models m ON v.model_id = m.id 
       WHERE v.id != ? AND v.is_published = 1 
       ORDER BY RANDOM() 
       LIMIT ?`
    ).bind(video.id, recLimit).all();

    return NextResponse.json({
      video: { ...video, tags: tags || [] },
      recommendations: recommendations || [],
      pagination: { totalPages: 1 } // Simplified for recommendations
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
