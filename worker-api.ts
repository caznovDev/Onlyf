
/**
 * Cloudflare Worker API Example
 * 
 * Logic to be hosted on worker.provideo.com
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Cache responses for performance
    // Use type assertion for caches.default as it's a Cloudflare-specific extension not in standard DOM types
    const cache = (caches as any).default;
    let response = await cache.match(request);
    if (response) return response;

    // API Routes
    if (path.startsWith('/api/v1/video/')) {
      const slug = path.split('/').pop();
      const video = await env.DB.prepare(
        "SELECT v.*, m.name as model_name, m.slug as model_slug FROM videos v JOIN models m ON v.model_id = m.id WHERE v.slug = ? AND v.is_published = 1"
      ).bind(slug).first();

      if (!video) return new Response('Not Found', { status: 404 });

      // View Strategy: Record event in KV or Buffer Table, don't update DB immediately
      // This avoids write contention on D1
      const isBot = request.headers.get('User-Agent')?.toLowerCase().includes('bot');
      if (!isBot) {
        await env.DB.prepare("INSERT INTO view_events (video_id, bot_flag) VALUES (?, ?)")
          .bind(video.id, 0).run();
      }

      response = Response.json(video, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Access-Control-Allow-Origin': '*'
        }
      });
      await cache.put(request, response.clone());
      return response;
    }

    // Default 404
    return new Response('API Endpoint Not Found', { status: 404 });
  }
}
