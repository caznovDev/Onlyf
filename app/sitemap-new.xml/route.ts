import { NextResponse } from 'next/server';
import { DOMAIN } from '../../constants';

export const runtime = 'edge';

export async function GET() {
  const baseUrl = `https://${DOMAIN}`;
  
  // Static routes
  const staticRoutes = [
    '',
    '/models',
    '/tags',
    '/docs/api',
    '/upload',
    '/models/manage',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes from DB
  const db = (process.env as any).DB;
  
  let videoRoutes: any[] = [];
  let modelRoutes: any[] = [];
  let tagRoutes: any[] = [];

  if (db) {
    try {
      // Fetch videos
      const { results: videos } = await db.prepare("SELECT slug, created_at FROM videos WHERE is_published = 1").all();
      videoRoutes = (videos || []).map((v: any) => ({
        url: `${baseUrl}/video/${v.slug}`,
        lastModified: v.created_at ? new Date(v.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

      // Fetch models
      const { results: models } = await db.prepare("SELECT slug FROM models").all();
      modelRoutes = (models || []).map((m: any) => ({
        url: `${baseUrl}/models/${m.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

      // Fetch tags
      const { results: tags } = await db.prepare("SELECT slug FROM tags").all();
      tagRoutes = (tags || []).map((t: any) => ({
        url: `${baseUrl}/tags/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      }));
    } catch (e) {
      console.error('Sitemap generation error:', e);
    }
  }

  const allRoutes = [...staticRoutes, ...videoRoutes, ...modelRoutes, ...tagRoutes];

  const urlset = allRoutes.map(item => {
    const date = item.lastModified instanceof Date ? item.lastModified : new Date(item.lastModified || Date.now());
    const lastmod = `<lastmod>${date.toISOString().split('T')[0]}</lastmod>`;
    const changefreq = item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : '';
    const priority = item.priority !== undefined ? `<priority>${item.priority.toFixed(1)}</priority>` : '';
    const encodedUrl = encodeURI(item.url);
    const loc = encodedUrl.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
    return `<url><loc>${loc}</loc>${lastmod}${changefreq}${priority}</url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
