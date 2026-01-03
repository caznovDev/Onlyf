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
      thumbnail_url 
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

    // 2. Insert into D1 using direct links
    // Note: We use preview_url for hover_preview_url and thumbnail_url for thumbnail.
    // If you have a separate video_url column, ensure your schema supports it.
    // Here we use hover_preview_url for the player as established in the current UI.
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
      0, // Placeholder for duration
      thumbnail_url || 'https://picsum.photos/1280/720',
      video_url, // Using main video URL for the content
      1
    ).run();

    // 3. Update Model Video Count
    await db.prepare("UPDATE models SET videos_count = videos_count + 1 WHERE id = ?").bind(model.id).run();

    // 4. Handle Tags
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        try {
          // Resolve tag by slug if ID isn't a UUID
          const tag = await db.prepare("SELECT id FROM tags WHERE slug = ? OR id = ?").bind(tagId, tagId).first();
          if (tag) {
            await db.prepare("INSERT INTO video_tags (video_id, tag_id) VALUES (?, ?)").bind(videoId, tag.id).run();
          }
        } catch (tagErr) {
          console.warn(`Could not link tag ${tagId}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      slug: finalSlug,
      videoId,
      message: "Video registered with direct links."
    }, { status: 201 });

  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}