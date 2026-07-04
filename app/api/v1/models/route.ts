import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "18");
  const offset = (page - 1) * limit;
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { results } = await db.prepare(
      `SELECT * FROM models ORDER BY name ASC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM models").first();
    const total = (countResult as any).total;

    return NextResponse.json({
      models: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, slug, bio, thumbnail } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required." }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const modelId = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO models (id, name, slug, bio, thumbnail, videos_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `).bind(
      modelId,
      name,
      slug,
      bio || '',
      thumbnail || ''
    ).run();

    return NextResponse.json({
      success: true,
      id: modelId,
      name,
      slug
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e: any) {
    if (e.message && (e.message.includes("UNIQUE") || e.message.includes("constraint"))) {
      try {
        const body = await request.clone().json();
        const existing = await db.prepare("SELECT id FROM models WHERE slug = ?").bind(body.slug).first();
        if (existing) {
          return NextResponse.json({
            success: true,
            id: existing.id,
            slug: body.slug,
            message: "Model already exists"
          }, {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            }
          });
        }
      } catch (_) {}
    }
    return NextResponse.json({ error: e.message }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
