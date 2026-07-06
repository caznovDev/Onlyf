import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = (process.env as any).DB;
  const baseUrl = 'https://freeonlyfans.qzz.io';

  let models: any[] = [];
  let videos: any[] = [];
  let tags: any[] = [];

  if (db) {
    try {
      const modelsResult = await db.prepare("SELECT slug FROM models ORDER BY name ASC").all();
      models = modelsResult.results || [];

      const videosResult = await db.prepare("SELECT slug, created_at FROM videos WHERE is_published = 1 ORDER BY created_at DESC").all();
      videos = videosResult.results || [];

      const tagsResult = await db.prepare("SELECT slug FROM tags ORDER BY name ASC").all();
      tags = tagsResult.results || [];
    } catch (e) {
      console.error('Error fetching sitemap-v2 data:', e);
    }
  }

  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/models</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/tags</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/sitemap</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;

  // Add models
  for (const model of models) {
    xml += `
  <url>
    <loc>${baseUrl}/models/${model.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  // Add tags
  for (const tag of tags) {
    xml += `
  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  // Add videos
  for (const video of videos) {
    let lastModDate = currentDate;
    if (video.created_at) {
      try {
        const dateObj = new Date(video.created_at);
        if (!isNaN(dateObj.getTime())) {
          lastModDate = dateObj.toISOString().split('T')[0];
        }
      } catch (_) {}
    }
    xml += `
  <url>
    <loc>${baseUrl}/video/${video.slug}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
