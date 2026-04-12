
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;
  const slug = params.slug;
  const { searchParams } = new URL(request.url);
  const recPage = parseInt(searchParams.get("rec_page") || "1");
  const recLimit = parseInt(searchParams.get("rec_limit") || "8");
  const recOffset = (recPage - 1) * recLimit;

  try {
    const video = await env.DB.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v 
      JOIN models m ON v.model_id = m.id 
      WHERE v.slug = ? AND v.is_published = 1
    `).bind(slug).first();

    if (!video) {
      return new Response(JSON.stringify({ error: "Video not found" }), { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const { results: tags } = await env.DB.prepare(`
      SELECT t.* FROM tags t
      JOIN video_tags vt ON t.id = vt.tag_id
      WHERE vt.video_id = ?
    `).bind(video.id).all();

    const { results: recommendations } = await env.DB.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v
      JOIN models m ON v.model_id = m.id
      WHERE v.id != ? AND v.is_published = 1
      ORDER BY RANDOM()
      LIMIT ? OFFSET ?
    `).bind(video.id, recLimit, recOffset).all();

    const countResult = await env.DB.prepare("SELECT COUNT(*) as total FROM videos WHERE id != ? AND is_published = 1").bind(video.id).first();
    const total = (countResult as any).total;

    return new Response(JSON.stringify({
      video: {
        ...video,
        tags
      },
      recommendations,
      pagination: {
        page: recPage,
        limit: recLimit,
        total,
        totalPages: Math.ceil(total / recLimit)
      }
    }), {
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
