import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../../lib/api-security';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const auth = validateApiAccess(request, { requireAdmin: true });
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  const db = (process.env as any).DB;
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }

  try {
    const { results } = await db.prepare(`
      SELECT m.*, 
             (SELECT COUNT(*) FROM videos v WHERE v.model_id = m.id) as actual_videos_count,
             (SELECT SUM(views) FROM videos v WHERE v.model_id = m.id) as total_creator_views
      FROM models m
      ORDER BY actual_videos_count DESC, name ASC
    `).all();

    return NextResponse.json({
      models: results || []
    }, {
      headers: getSecurityHeaders(request)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = validateApiAccess(request, { requireAdmin: true });
  if (!auth.allowed) {
    return createUnauthorizedResponse(auth, request);
  }

  const db = (process.env as any).DB;
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Model ID is required" }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    // Check how many videos this model has
    const videoCount = await db.prepare("SELECT COUNT(*) as count FROM videos WHERE model_id = ?").bind(id).first();
    if (Number(videoCount?.count || 0) > 0) {
      return NextResponse.json({ 
        error: `Cannot delete creator with ${videoCount.count} existing videos. Please delete or reassign their videos first.` 
      }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    await db.prepare("DELETE FROM models WHERE id = ?").bind(id).run();

    return NextResponse.json({
      success: true,
      message: 'Creator deleted successfully'
    }, {
      headers: getSecurityHeaders(request)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { 
      status: 500,
      headers: getSecurityHeaders(request)
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getSecurityHeaders(request),
  });
}
