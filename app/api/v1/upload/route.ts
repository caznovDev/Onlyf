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
      thumbnail_url,
      duration = 0,
      resolution = '1080p',
      orientation = 'landscape'
    } = body;

    if (!title || !modelId || !video_url) {
      return NextResponse.json({ error: "Title, Creator, and Video URL are required." }, { status: 400 });
    }

    // 1. Resolve Creator
    const model = await db.prepare("SELECT id FROM models WHERE slug = ?").bind(modelId).first();
    if (!model) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const videoId = crypto.randomUUID();
    const baseSlug = slugify(title);
    const finalSlug = `${baseSlug}-${videoId.slice(0, 8)}`;

    // 2. Insert with expanded metadata
    await db.prepare(`
      INSERT INTO videos (
        id, title, slug, description, type, model_id, duration, 
        thumbnail, hover_preview_url, resolution, orientation, is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      videoId,
      title,
      finalSlug,
      description || '',
      type,
      model.id,
      parseInt(duration) || 0,
      thumbnail_url || '',
      video_url,
      resolution,
      orientation,
      1
    ).run();

    // 3. Update Creator Stats
    await db.prepare("UPDATE models SET videos_count = (SELECT COUNT(*) FROM videos WHERE model_id = ?) WHERE id = ?")
      .bind(model.id, model.id).run();

    // 4. Tagging Logic
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = slugify(tagName);
        let tag = await db.prepare("SELECT id FROM tags WHERE slug = ?").bind(tagSlug).first();
        
        if (!tag) {
          const newTagId = crypto.randomUUID();
          await db.prepare("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)")
            .bind(newTagId, tagName, tagSlug)
            .run();
          tag = { id: newTagId };
        }

        await db.prepare("INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)")
          .bind(videoId, tag.id)
          .run();
      }
    }

    return NextResponse.json({ 
      success: true, 
      slug: finalSlug,
      message: "Professional content registered to global edge."
    }, { status: 201 });

  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}