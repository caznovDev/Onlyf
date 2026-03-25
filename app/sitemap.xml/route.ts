import { NextResponse } from 'next/server';
import { DOMAIN } from '../../constants';

export const runtime = 'edge';

export async function GET() {
  const db: any = process.env.DB;

  if (!db || typeof db === 'string') {
    return new NextResponse('Database binding not found', { status: 500 });
  }

  try {
    // Fetch all models
    const { results: models } = await db.prepare(
      "SELECT slug FROM models"
    ).all();

    // Fetch all videos
    const { results: videos } = await db.prepare(
      "SELECT slug FROM videos WHERE is_published = 1"
    ).all();

    // Fetch all tags
    const { results: tags } = await db.prepare(
      "SELECT slug FROM tags"
    ).all();

    const baseUrl = `https://${DOMAIN}`;
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
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
    <loc>${baseUrl}/docs/api</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;

    // Add models
    models.forEach((model: any) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/models/${model.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add videos
    videos.forEach((video: any) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/video/${video.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add tags
    tags.forEach((tag: any) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (e: any) {
    return new NextResponse(`Error generating sitemap: ${e.message}`, { status: 500 });
  }
}
