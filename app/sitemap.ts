import { MetadataRoute } from 'next';
import { DOMAIN } from '../constants';

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = `https://${DOMAIN}`;
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
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
  
  let videoRoutes: MetadataRoute.Sitemap = [];
  let modelRoutes: MetadataRoute.Sitemap = [];
  let tagRoutes: MetadataRoute.Sitemap = [];

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

  return [...staticRoutes, ...videoRoutes, ...modelRoutes, ...tagRoutes];
}
