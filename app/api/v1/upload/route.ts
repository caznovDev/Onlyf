import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function POST(request: NextRequest) {
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      modelId, 
      type = 'normal', 
      tags = [], 
      video_url, 
      preview_url, 
      thumbnail_url,
      duration = 0 // New field: duration in seconds
    } = body;

    if (!title || !modelId || !video_url) {
      return NextResponse.json({ error: "Missing required fields: title, modelId, and video_url are mandatory." }, { status: 400 });
    }

    // 1. Resolve Creator ID
    const model = await db.prepare("SELECT id FROM models WHERE slug = ?").bind(modelId).first();
    if (!model) {
      return NextResponse.json({ error: "Selected creator does not exist" }, { status: 404 });
    }

    const videoId = crypto.randomUUID();
    const baseSlug = slugify(title);
    const finalSlug = `${baseSlug}-${videoId.slice(0, 8)}`;

    // 2. Insert into D1
    await db.prepare(`
      INSERT INTO videos (id, title, slug, description, type, model_id, duration, thumbnail, hover_preview_url, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      videoId,
      title,
      finalSlug,
      description || '',
      type,
      model.id,
      parseInt(duration) || 0,
      thumbnail_url || 'https://picsum.photos/1280/720',
      video_url, 
      1
    ).run();

    // 3. Update Model Video Count
    await db.prepare("UPDATE models SET videos_count = (SELECT COUNT(*) FROM videos WHERE model_id = ?) WHERE id = ?")
      .bind(model.id, model.id).run();

    // 4. Handle Tags with Auto-Creation
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = slugify(tagName);
        
        // Find or Create Tag
        let tag = await db.prepare("SELECT id FROM tags WHERE slug = ?").bind(tagSlug).first();
        
        if (!tag) {
          const newTagId = crypto.randomUUID();
          await db.prepare("INSERT INTO tags (id, name, slug, description) VALUES (?, ?, ?, ?)")
            .bind(newTagId, tagName, tagSlug, `Videos related to ${tagName}`)
            .run();
          tag = { id: newTagId };
        }

        // Link Tag to Video
        await db.prepare("INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)")
          .bind(videoId, tag.id)
          .run();
      }
    }

    return NextResponse.json({ 
      success: true, 
      slug: finalSlug,
      videoId,
      message: "Video registered and tags synchronized."
    }, { status: 201 });

  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}