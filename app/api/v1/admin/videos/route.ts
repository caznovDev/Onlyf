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
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15")));
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search.trim()) {
      whereClauses.push("(v.title LIKE ? OR v.slug LIKE ? OR m.name LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (status === "published") {
      whereClauses.push("v.is_published = 1");
    } else if (status === "unpublished") {
      whereClauses.push("v.is_published = 0");
    }

    if (type !== "all") {
      whereClauses.push("v.type = ?");
      params.push(type);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*) as total 
      FROM videos v 
      LEFT JOIN models m ON v.model_id = m.id 
      ${whereSql}
    `;
    const countRes = await db.prepare(countSql).bind(...params).first();
    const total = Number(countRes?.total || 0);

    const querySql = `
      SELECT v.*, m.name as model_name, m.slug as model_slug 
      FROM videos v 
      LEFT JOIN models m ON v.model_id = m.id 
      ${whereSql}
      ORDER BY v.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limit, offset];
    const { results } = await db.prepare(querySql).bind(...queryParams).all();

    return NextResponse.json({
      videos: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
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

export async function PATCH(request: NextRequest) {
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
    const { 
      id, 
      is_published, 
      title, 
      description, 
      type, 
      resolution, 
      orientation, 
      thumbnail, 
      twitter_thumbnail, 
      hover_preview_url,
      duration 
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    // Check if video exists
    const existing = await db.prepare("SELECT * FROM videos WHERE id = ?").bind(id).first();
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { 
        status: 404,
        headers: getSecurityHeaders(request)
      });
    }

    // Toggle or update fields
    const newPublished = is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published;
    const newTitle = title !== undefined ? title : existing.title;
    const newDesc = description !== undefined ? description : existing.description;
    const newType = type !== undefined ? type : existing.type;
    const newResolution = resolution !== undefined ? resolution : existing.resolution;
    const newOrientation = orientation !== undefined ? orientation : existing.orientation;
    const newThumbnail = thumbnail !== undefined ? thumbnail : existing.thumbnail;
    const newTwitterThumb = twitter_thumbnail !== undefined ? twitter_thumbnail : (existing.twitter_thumbnail || existing.thumbnail);
    const newHover = hover_preview_url !== undefined ? hover_preview_url : existing.hover_preview_url;
    const newDuration = duration !== undefined ? parseInt(duration.toString()) : existing.duration;

    await db.prepare(`
      UPDATE videos 
      SET is_published = ?,
          title = ?,
          description = ?,
          type = ?,
          resolution = ?,
          orientation = ?,
          thumbnail = ?,
          twitter_thumbnail = ?,
          hover_preview_url = ?,
          duration = ?
      WHERE id = ?
    `).bind(
      newPublished,
      newTitle,
      newDesc,
      newType,
      newResolution,
      newOrientation,
      newThumbnail,
      newTwitterThumb,
      newHover,
      newDuration,
      id
    ).run();

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      id
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
      return NextResponse.json({ error: "Video ID is required" }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    const video = await db.prepare("SELECT model_id FROM videos WHERE id = ?").bind(id).first();
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { 
        status: 404,
        headers: getSecurityHeaders(request)
      });
    }

    const modelId = video.model_id;

    // Delete tag links
    try {
      await db.prepare("DELETE FROM video_tags WHERE video_id = ?").bind(id).run();
    } catch {}

    // Delete the video
    await db.prepare("DELETE FROM videos WHERE id = ?").bind(id).run();

    // Update creator stats
    if (modelId) {
      try {
        await db.prepare(`
          UPDATE models 
          SET videos_count = (SELECT COUNT(*) FROM videos WHERE model_id = ?) 
          WHERE id = ?
        `).bind(modelId, modelId).run();
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
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
