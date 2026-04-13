
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const models = await env.DB.prepare("SELECT name, slug FROM models ORDER BY name ASC").all();
    const videos = await env.DB.prepare("SELECT title, slug FROM videos WHERE is_published = 1 ORDER BY created_at DESC").all();
    const tags = await env.DB.prepare("SELECT name, slug FROM tags ORDER BY name ASC").all();

    return new Response(JSON.stringify({
      models: models.results || [],
      videos: videos.results || [],
      tags: tags.results || []
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
