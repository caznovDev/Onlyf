
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;
  const slug = params.slug;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  try {
    const tag = await env.DB.prepare("SELECT * FROM tags WHERE slug = ?").bind(slug).first();
    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const { results: videos } = await env.DB.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v
      JOIN models m ON v.model_id = m.id
      JOIN video_tags vt ON v.id = vt.video_id
      WHERE vt.tag_id = ? AND v.is_published = 1
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(tag.id, limit, offset).all();

    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM videos v
      JOIN video_tags vt ON v.id = vt.video_id
      WHERE vt.tag_id = ? AND v.is_published = 1
    `).bind(tag.id).first();
    const total = countResult ? (countResult as any).total : 0;

    return new Response(JSON.stringify({
      tag,
      videos: videos || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
};
