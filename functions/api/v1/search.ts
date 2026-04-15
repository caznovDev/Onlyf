// Fix: Define missing Cloudflare D1 and Pages types to resolve compilation errors
type D1Database = any;
type PagesFunction<T> = (context: any) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const q = searchParams.get("q") || "";
  const { env } = context;

  if (q.length < 2) {
    return new Response(JSON.stringify({ videos: [], models: [] }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const videoResults = await env.DB.prepare(
      "SELECT title, slug, thumbnail FROM videos WHERE title LIKE ? AND is_published = 1 LIMIT 5"
    ).bind(`%${q}%`).all();

    const modelResults = await env.DB.prepare(
      "SELECT name, slug, thumbnail FROM models WHERE name LIKE ? LIMIT 3"
    ).bind(`%${q}%`).all();

    return new Response(JSON.stringify({
      videos: videoResults.results,
      models: modelResults.results
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};