import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
  }

  try {
    const model = await db.prepare(
      "SELECT id, name, slug, thumbnail, videos_count FROM models WHERE slug = ?"
    ).bind(slug).first();

    if (!model) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ 
      exists: true,
      id: model.id,
      model 
    }, { 
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=10" }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}