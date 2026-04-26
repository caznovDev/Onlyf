import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  if (q.length < 2) {
    return NextResponse.json({ videos: [], models: [] }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
