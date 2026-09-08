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
      ids,
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

    // Handle BATCH update if ids array is provided
    if (Array.isArray(ids) && ids.length > 0) {
      let updatedCount = 0;
      for (const vidId of ids) {
        const updateParts: string[] = [];
        const bindValues: any[] = [];

        if (is_published !== undefined) {
          updateParts.push("is_published = ?");
          bindValues.push(is_published ? 1 : 0);
        }
        if (type !== undefined) {
          updateParts.push("type = ?");
          bindValues.push(type);
        }
        if (resolution !== undefined) {
          updateParts.push("resolution = ?");
          bindValues.push(resolution);
        }
        if (orientation !== undefined) {
          updateParts.push("orientation = ?");
          bindValues.push(orientation);
        }

        if (updateParts.length > 0) {
          bindValues.push(vidId);
          await db.prepare(`
            UPDATE videos 
            SET ${updateParts.join(", ")}
            WHERE id = ?
          `).bind(...bindValues).run();
          updatedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${updatedCount} videos in batch.`,
        updatedCount
      }, {
        headers: getSecurityHeaders(request)
      });
    }

    // Handle SINGLE video update
    if (!id) {
      return NextResponse.json({ error: "Video ID or ids array is required" }, { 
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
    let targetIds: string[] = [];

    // Check query param single id
    const singleId = searchParams.get("id");
    if (singleId) {
      targetIds.push(singleId);
    }

    // Check query param comma-separated ids: ?ids=id1,id2,id3
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      idsParam.split(',').map(s => s.trim()).filter(Boolean).forEach(id => {
        if (!targetIds.includes(id)) targetIds.push(id);
      });
    }

    // Check JSON body if ids provided
    try {
      const body = await request.clone().json();
      if (Array.isArray(body.ids)) {
        body.ids.forEach((id: string) => {
          if (typeof id === 'string' && id.trim() && !targetIds.includes(id.trim())) {
            targetIds.push(id.trim());
          }
        });
      }
    } catch {
      // Body may not be JSON or empty
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ error: "At least one video ID is required for deletion." }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    const affectedModelIds = new Set<string>();
    let deletedCount = 0;

    for (const id of targetIds) {
      const video = await db.prepare("SELECT model_id FROM videos WHERE id = ?").bind(id).first();
      if (video) {
        if (video.model_id) affectedModelIds.add(video.model_id);

        // Delete associated tags
        try {
          await db.prepare("DELETE FROM video_tags WHERE video_id = ?").bind(id).run();
        } catch {}

        // Delete the video record
        await db.prepare("DELETE FROM videos WHERE id = ?").bind(id).run();
        deletedCount++;
      }
    }

    // Recalculate and update video counts for affected creators
    for (const modelId of affectedModelIds) {
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
      message: `Successfully deleted ${deletedCount} video${deletedCount === 1 ? '' : 's'}.`,
      deletedCount
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
