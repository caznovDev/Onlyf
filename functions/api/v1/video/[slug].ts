// Fix: Define missing Cloudflare D1 and Pages types to resolve compilation errors
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const slug = params.slug as string;

  try {
    const video = await env.DB.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail 
       FROM videos v 
       JOIN models m ON v.model_id = m.id 
       WHERE v.slug = ? AND v.is_published = 1`
    ).bind(slug).first();

    if (!video) {
      return new Response(JSON.stringify({ error: "Video not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(video), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};