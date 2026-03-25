import { MetadataRoute } from 'next';
import { DOMAIN } from '../constants';

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = `https://${DOMAIN}`;
  const currentDate = new Date();

  // Base static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/api`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Try to get the database binding from process.env or global scope (Edge runtime)
    const db: any = process.env.DB || (globalThis as any).DB;

    if (!db || typeof db === 'string') {
      return staticUrls;
    }

    // Fetch dynamic data
    const [modelsResult, videosResult, tagsResult] = await Promise.all([
      db.prepare("SELECT slug FROM models").all(),
      db.prepare("SELECT slug FROM videos WHERE is_published = 1").all(),
      db.prepare("SELECT slug FROM tags").all()
    ]);

    const dynamicUrls: MetadataRoute.Sitemap = [];

    // Add models
    if (modelsResult?.results) {
      modelsResult.results.forEach((m: any) => {
        dynamicUrls.push({
          url: `${baseUrl}/models/${m.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    // Add videos
    if (videosResult?.results) {
      videosResult.results.forEach((v: any) => {
        dynamicUrls.push({
          url: `${baseUrl}/video/${v.slug}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    }

    // Add tags
    if (tagsResult?.results) {
      tagsResult.results.forEach((t: any) => {
        dynamicUrls.push({
          url: `${baseUrl}/tags/${t.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.4,
        });
      });
    }

    return [...staticUrls, ...dynamicUrls];
  } catch (e) {
    console.error('Sitemap dynamic generation error:', e);
    return staticUrls;
  }
}
