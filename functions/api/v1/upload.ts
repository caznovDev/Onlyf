
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

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
      return new Response(JSON.stringify({ error: "Title, Creator (modelId), and Video URL are required." }), { 
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // Polymorphic lookup: Try ID first, then Slug
    let model = await env.DB.prepare("SELECT id FROM models WHERE id = ? OR slug = ?").bind(modelId, modelId).first();
    
    if (!model) {
      return new Response(JSON.stringify({ error: `Creator '${modelId}' not found.` }), { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const videoId = crypto.randomUUID();
    const baseSlug = slugify(title);
    const finalSlug = `${baseSlug}-${videoId.slice(0, 8)}`;

    await env.DB.prepare(`
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
      parseInt(duration.toString()) || 0,
      thumbnail_url || '',
      video_url,
      resolution,
      orientation,
      1
    ).run();

    // Update Creator Stats
    await env.DB.prepare("UPDATE models SET videos_count = (SELECT COUNT(*) FROM videos WHERE model_id = ?) WHERE id = ?")
      .bind(model.id, model.id).run();

    // Tagging
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = slugify(tagName);
        let tag = await env.DB.prepare("SELECT id FROM tags WHERE slug = ?").bind(tagSlug).first();
        
        if (!tag) {
          const newTagId = crypto.randomUUID();
          await env.DB.prepare("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)")
            .bind(newTagId, tagName, tagSlug)
            .run();
          tag = { id: newTagId };
        }

        await env.DB.prepare("INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)")
          .bind(videoId, tag.id)
          .run();
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      slug: finalSlug,
      id: videoId
    }), { 
      status: 201,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
};
