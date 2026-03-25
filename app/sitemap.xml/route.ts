import { NextResponse } from 'next/server';
import { DOMAIN } from '../../constants';

export const runtime = 'edge';

export async function GET() {
  const baseUrl = `https://${DOMAIN}`;
  const currentDate = new Date().toISOString().split('T')[0];

  // Start with static URLs as a safe fallback
  let urls = [
    { loc: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/models`, lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/tags`, lastmod: currentDate, changefreq: 'weekly', priority: '0.5' },
    { loc: `${baseUrl}/docs/api`, lastmod: currentDate, changefreq: 'monthly', priority: '0.3' },
  ];

  try {
    // Try to get the database binding from process.env or global scope (Edge runtime)
    const db: any = process.env.DB || (globalThis as any).DB;

    if (db && typeof db !== 'string') {
      // Fetch models
      const { results: models } = await db.prepare("SELECT slug FROM models").all();
      if (models) {
        models.forEach((m: any) => {
          urls.push({
            loc: `${baseUrl}/models/${m.slug}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.7'
          });
        });
      }

      // Fetch videos
      const { results: videos } = await db.prepare("SELECT slug FROM videos WHERE is_published = 1").all();
      if (videos) {
        videos.forEach((v: any) => {
          urls.push({
            loc: `${baseUrl}/video/${v.slug}`,
            lastmod: currentDate,
            changefreq: 'monthly',
            priority: '0.6'
          });
        });
      }

      // Fetch tags
      const { results: tags } = await db.prepare("SELECT slug FROM tags").all();
      if (tags) {
        tags.forEach((t: any) => {
          urls.push({
            loc: `${baseUrl}/tags/${t.slug}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.4'
          });
        });
      }
    }
  } catch (e) {
    console.error('Sitemap dynamic generation error:', e);
    // We continue with the static URLs already in the array
  }

  // Build the XML string
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`.trim();

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
