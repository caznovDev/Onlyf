import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { 
      title, description, modelId, type, video_url, 
      thumbnail_url, duration, resolution, orientation, tags 
    } = body;

    if (!title || !video_url || !modelId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    const videoId = crypto.randomUUID();

    // 1. Get model internal ID from slug
    const model = await db.prepare("SELECT id FROM models WHERE slug = ?").bind(modelId).first();
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // 2. Insert video
    await db.prepare(
      `INSERT INTO videos (
        id, title, slug, description, type, model_id, 
        duration, views, thumbnail, hover_preview_url, 
        resolution, orientation, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).bind(
      videoId, title, slug, description || '', type || 'normal', model.id,
      duration || 0, 0, thumbnail_url || '', video_url,
      resolution || '1080p', orientation || 'landscape'
    ).run();

    // 3. Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const tagId = crypto.randomUUID();
        
        // Insert tag if not exists
        await db.prepare("INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)")
          .bind(tagId, tagName, tagSlug).run();
        
        // Get tag ID (either new or existing)
        const tag = await db.prepare("SELECT id FROM tags WHERE slug = ?").bind(tagSlug).first();
        
        if (tag) {
          await db.prepare("INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)")
            .bind(videoId, tag.id).run();
        }
      }
    }

    // 4. Update model video count
    await db.prepare("UPDATE models SET videos_count = videos_count + 1 WHERE id = ?").bind(model.id).run();

    return NextResponse.json({ success: true, slug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
