import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const db = (process.env as any).DB;

  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { results } = await db.prepare(
      "SELECT * FROM tags ORDER BY name ASC"
    ).all();

    return NextResponse.json({
      tags: results
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
