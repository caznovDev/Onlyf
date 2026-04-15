import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "18");
  const offset = (page - 1) * limit;

  let db: any;
  try {
    db = getRequestContext().env.DB;
  } catch (e) {
    db = (process.env as any).DB;
  }

  if (!db) {
    return NextResponse.json({ error: "Database connection not found" }, { status: 500 });
  }

  try {
    const { results } = await db.prepare(
      `SELECT * FROM models 
       ORDER BY name ASC 
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM models").first();
    const total = countResult ? (countResult as any).total : 0;

    return NextResponse.json({
      models: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
