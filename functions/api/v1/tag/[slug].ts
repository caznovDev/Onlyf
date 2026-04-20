type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const slug = params.slug as string;

  try {
    const tag = await env.DB.prepare(
      "SELECT * FROM tags WHERE slug = ?"
    ).bind(slug).first();

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch videos associated with this tag
    const { results: videos } = await env.DB.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug
       FROM videos v
       JOIN video_tags vt ON v.id = vt.video_id
       JOIN models m ON v.model_id = m.id
       WHERE vt.tag_id = ? AND v.is_published = 1
       ORDER BY v.created_at DESC`
    ).bind(tag.id).all();

    return new Response(JSON.stringify({
      ...tag,
      videos
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
