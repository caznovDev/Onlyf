
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "18");
  const offset = (page - 1) * limit;
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM models 
       ORDER BY name ASC 
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const countResult = await env.DB.prepare("SELECT COUNT(*) as total FROM models").first();
    const total = (countResult as any).total;

    return new Response(JSON.stringify({
      models: results,
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
