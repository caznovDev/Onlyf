import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
  }

  if (q.length < 2) {
    return NextResponse.json({ videos: [], models: [] });
  }

  try {
    const videoResults = await db.prepare(
      "SELECT title, slug, thumbnail FROM videos WHERE title LIKE ? AND is_published = 1 LIMIT 5"
    ).bind(`%${q}%`).all();

    const modelResults = await db.prepare(
      "SELECT name, slug, thumbnail FROM models WHERE name LIKE ? LIMIT 3"
    ).bind(`%${q}%`).all();

    return NextResponse.json({
      videos: videoResults.results || [],
      models: modelResults.results || []
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}