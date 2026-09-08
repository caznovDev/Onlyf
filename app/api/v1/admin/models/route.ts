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
    const { id, name, slug, bio, thumbnail } = body;

    if (!id) {
      return NextResponse.json({ error: "Creator ID is required." }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    const existing = await db.prepare("SELECT * FROM models WHERE id = ?").bind(id).first();
    if (!existing) {
      return NextResponse.json({ error: "Creator profile not found." }, { 
        status: 404,
        headers: getSecurityHeaders(request)
      });
    }

    const newName = name !== undefined ? name.trim() : existing.name;
    const newSlug = slug !== undefined ? slug.trim().toLowerCase() : existing.slug;
    const newBio = bio !== undefined ? bio.trim() : existing.bio;
    const newThumbnail = thumbnail !== undefined ? thumbnail.trim() : existing.thumbnail;

    await db.prepare(`
      UPDATE models 
      SET name = ?,
          slug = ?,
          bio = ?,
          thumbnail = ?
      WHERE id = ?
    `).bind(newName, newSlug, newBio, newThumbnail, id).run();

    return NextResponse.json({
      success: true,
      message: 'Creator profile updated successfully.',
      creator: { id, name: newName, slug: newSlug, bio: newBio, thumbnail: newThumbnail }
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
    const cascade = searchParams.get("cascade") === "true";

    if (!id) {
      return NextResponse.json({ error: "Model ID is required" }, { 
        status: 400,
        headers: getSecurityHeaders(request)
      });
    }

    // Check how many videos this model has
    const videoCountRes = await db.prepare("SELECT COUNT(*) as count FROM videos WHERE model_id = ?").bind(id).first();
    const videoCount = Number(videoCountRes?.count || 0);

    if (videoCount > 0 && !cascade) {
      return NextResponse.json({ 
        error: `Creator has ${videoCount} existing videos. Cascade deletion is required.`,
        videoCount,
        requiresCascade: true
      }, { 
        status: 409,
        headers: getSecurityHeaders(request)
      });
    }

    // If cascade is enabled, delete all associated videos and tags
    if (cascade && videoCount > 0) {
      // 1. Delete video_tags for all creator's videos
      try {
        await db.prepare(`
          DELETE FROM video_tags 
          WHERE video_id IN (SELECT id FROM videos WHERE model_id = ?)
        `).bind(id).run();
      } catch {}

      // 2. Delete all videos belonging to this creator
      await db.prepare("DELETE FROM videos WHERE model_id = ?").bind(id).run();
    }

    // Delete the creator
    await db.prepare("DELETE FROM models WHERE id = ?").bind(id).run();

    return NextResponse.json({
      success: true,
      message: cascade 
        ? `Creator and ${videoCount} associated video(s) permanently deleted.`
        : 'Creator deleted successfully.',
      deletedVideosCount: cascade ? videoCount : 0
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
