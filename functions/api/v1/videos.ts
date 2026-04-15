// Fix: Define missing Cloudflare D1 and Pages types to resolve compilation errors
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "8");
  const offset = (page - 1) * limit;
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT v.*, m.name as model_name, m.slug as model_slug 
       FROM videos v 
       JOIN models m ON v.model_id = m.id 
       WHERE v.is_published = 1 
       ORDER BY v.created_at DESC 
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const countResult = await env.DB.prepare("SELECT COUNT(*) as total FROM videos WHERE is_published = 1").first();
    const total = (countResult as any).total;

    return new Response(JSON.stringify({
      videos: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};