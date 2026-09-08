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
    // 1. Overall counts
    const totalVideosRes = await db.prepare("SELECT COUNT(*) as count FROM videos").first();
    const publishedVideosRes = await db.prepare("SELECT COUNT(*) as count FROM videos WHERE is_published = 1").first();
    const totalViewsRes = await db.prepare("SELECT SUM(views) as total_views FROM videos").first();
    const totalModelsRes = await db.prepare("SELECT COUNT(*) as count FROM models").first();
    const totalTagsRes = await db.prepare("SELECT COUNT(*) as count FROM tags").first();

    const totalVideos = Number(totalVideosRes?.count || 0);
    const publishedVideos = Number(publishedVideosRes?.count || 0);
    const unpublishedVideos = totalVideos - publishedVideos;
    const totalViews = Number(totalViewsRes?.total_views || 0);
    const totalModels = Number(totalModelsRes?.count || 0);
    const totalTags = Number(totalTagsRes?.count || 0);

    // 2. Breakdown stats
    const onlyfansCountRes = await db.prepare("SELECT COUNT(*) as count FROM videos WHERE type = 'onlyfans'").first();
    const portraitCountRes = await db.prepare("SELECT COUNT(*) as count FROM videos WHERE orientation = 'portrait'").first();
    const landscapeCountRes = await db.prepare("SELECT COUNT(*) as count FROM videos WHERE orientation = 'landscape'").first();

    // 3. Recent 10 videos
    const recentVideos = await db.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug 
      FROM videos v 
      LEFT JOIN models m ON v.model_id = m.id 
      ORDER BY v.created_at DESC 
      LIMIT 10
    `).all();

    // 4. Top 6 creators by video count
    const topCreators = await db.prepare(`
      SELECT * FROM models 
      ORDER BY videos_count DESC, name ASC 
      LIMIT 6
    `).all();

    return NextResponse.json({
      metrics: {
        totalVideos,
        publishedVideos,
        unpublishedVideos,
        totalViews,
        totalModels,
        totalTags,
        onlyfansVideos: Number(onlyfansCountRes?.count || 0),
        normalVideos: totalVideos - Number(onlyfansCountRes?.count || 0),
        portraitVideos: Number(portraitCountRes?.count || 0),
        landscapeVideos: Number(landscapeCountRes?.count || 0),
      },
      recentVideos: recentVideos.results || [],
      topCreators: topCreators.results || [],
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
