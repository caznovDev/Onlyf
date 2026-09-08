import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, createUnauthorizedResponse, getSecurityHeaders } from '../../../../../lib/api-security';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const action = body.action;

    if (action === 'sync_counts') {
      // Recalculate and synchronize video counts for all creators
      const models = await db.prepare("SELECT id FROM models").all();
      let updatedCount = 0;
      for (const m of (models.results || [])) {
        await db.prepare(`
          UPDATE models 
          SET videos_count = (SELECT COUNT(*) FROM videos WHERE model_id = ?) 
          WHERE id = ?
        `).bind(m.id, m.id).run();
        updatedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully recalculated and synchronized video counts across ${updatedCount} creator profiles.`,
        updatedCount
      }, {
        headers: getSecurityHeaders(request)
      });
    }

    if (action === 'clean_orphaned') {
      // Clean up orphaned tags
      const tagResult = await db.prepare(`
        DELETE FROM video_tags 
        WHERE video_id NOT IN (SELECT id FROM videos) 
           OR tag_id NOT IN (SELECT id FROM tags)
      `).run();

      return NextResponse.json({
        success: true,
        message: `Orphaned relationship records cleaned successfully.`,
        details: tagResult
      }, {
        headers: getSecurityHeaders(request)
      });
    }

    if (action === 'export_catalog') {
      const videos = await db.prepare(`
        SELECT v.*, m.name as model_name, m.slug as model_slug 
        FROM videos v 
        LEFT JOIN models m ON v.model_id = m.id
        ORDER BY v.created_at DESC
      `).all();

      const creators = await db.prepare(`SELECT * FROM models ORDER BY name ASC`).all();
      const tags = await db.prepare(`SELECT * FROM tags ORDER BY name ASC`).all();

      return NextResponse.json({
        success: true,
        exportedAt: new Date().toISOString(),
        totalVideos: (videos.results || []).length,
        totalCreators: (creators.results || []).length,
        totalTags: (tags.results || []).length,
        data: {
          videos: videos.results || [],
          creators: creators.results || [],
          tags: tags.results || [],
        }
      }, {
        headers: getSecurityHeaders(request)
      });
    }

    return NextResponse.json({ error: `Unknown maintenance action: ${action}` }, {
      status: 400,
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
