import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const model = await db.prepare(
      "SELECT * FROM models WHERE slug = ?"
    ).bind(slug).first();

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        } 
      });
    }

    const { results: videos } = await db.prepare(
      "SELECT * FROM videos WHERE model_id = ? AND is_published = 1 ORDER BY created_at DESC"
    ).bind(model.id).all();

    return NextResponse.json({
      ...model,
      videos
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
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
