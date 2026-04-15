import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function GET(request: NextRequest) {
  const db: any = process.env.DB;
  if (!db || typeof db === 'string') return NextResponse.json({ error: "DB not found" }, { status: 500 });

  try {
    const { results } = await db.prepare("SELECT * FROM models ORDER BY name ASC").all();
    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const db: any = process.env.DB;
  if (!db || typeof db === 'string') return NextResponse.json({ error: "DB not found" }, { status: 500 });

  try {
    const body = await request.json();
    const { name, bio, thumbnail, slug: customSlug } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const id = crypto.randomUUID();
    const slug = customSlug || slugify(name);

    await db.prepare(`
      INSERT INTO models (id, name, slug, bio, thumbnail, videos_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `).bind(id, name, slug, bio || '', thumbnail || '').run();

    return NextResponse.json({ success: true, id, slug }, { status: 201 });
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) {
      return NextResponse.json({ error: "A creator with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const db: any = process.env.DB;
  if (!db || typeof db === 'string') return NextResponse.json({ error: "DB not found" }, { status: 500 });

  try {
    const body = await request.json();
    const { id, name, bio, thumbnail, slug } = body;

    if (!id) return NextResponse.json({ error: "Model ID is required" }, { status: 400 });

    await db.prepare(`
      UPDATE models 
      SET name = COALESCE(?, name), 
          bio = COALESCE(?, bio), 
          thumbnail = COALESCE(?, thumbnail), 
          slug = COALESCE(?, slug)
      WHERE id = ?
    `).bind(name, bio, thumbnail, slug, id).run();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}