
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
    const model = await env.DB.prepare("SELECT * FROM models WHERE slug = ?").bind(slug).first();
    if (!model) {
      return new Response(JSON.stringify({ error: "Model not found" }), { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const { results: videos } = await env.DB.prepare(`
      SELECT v.* FROM videos v 
      WHERE v.model_id = ? AND v.is_published = 1
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(model.id, limit, offset).all();

    const countResult = await env.DB.prepare("SELECT COUNT(*) as total FROM videos WHERE model_id = ? AND is_published = 1").bind(model.id).first();
    const total = (countResult as any).total;

    return new Response(JSON.stringify({
      model,
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
