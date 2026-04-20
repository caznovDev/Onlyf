type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const slug = params.slug as string;

  try {
    const model = await env.DB.prepare(
      "SELECT * FROM models WHERE slug = ?"
    ).bind(slug).first();

    if (!model) {
      return new Response(JSON.stringify({ error: "Model not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Also fetch videos for this model
    const { results: videos } = await env.DB.prepare(
      "SELECT * FROM videos WHERE model_id = ? AND is_published = 1 ORDER BY created_at DESC"
    ).bind(model.id).all();

    return new Response(JSON.stringify({
      ...model,
      videos
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
