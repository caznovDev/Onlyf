
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
    const total = countResult ? (countResult as any).total : 0;

    return new Response(JSON.stringify({
      models: results || [],
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


export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = await request.json();
    const { name, slug, bio, thumbnail } = body;
    
    if (!name) return new Response(JSON.stringify({ error: "Name is required" }), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const id = crypto.randomUUID();

    await env.DB.prepare("INSERT INTO models (id, name, slug, bio, thumbnail) VALUES (?, ?, ?, ?, ?)")
      .bind(id, name, finalSlug, bio || '', thumbnail || '').run();

    return new Response(JSON.stringify({ success: true, id }), { 
      status: 201, 
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = await request.json();
    const { id, name, slug, bio, thumbnail } = body;
    
    if (!id) return new Response(JSON.stringify({ error: "ID is required" }), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

    await env.DB.prepare("UPDATE models SET name = ?, slug = ?, bio = ?, thumbnail = ? WHERE id = ?")
      .bind(name, slug, bio, thumbnail, id).run();

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
};
