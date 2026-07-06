import type { MetadataRoute } from 'next';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      console.error('Error fetching sitemap data:', e);
    }
  }

  const currentDate = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
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
      url: `${baseUrl}/sitemap`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // Add models
  for (const model of models) {
    routes.push({
      url: `${baseUrl}/models/${model.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Add tags
  for (const tag of tags) {
    routes.push({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  // Add videos
  for (const video of videos) {
    let lastModDate = currentDate;
    if (video.created_at) {
      try {
        const dateObj = new Date(video.created_at);
        if (!isNaN(dateObj.getTime())) {
          lastModDate = dateObj;
        }
      } catch (_) {}
    }
    routes.push({
      url: `${baseUrl}/video/${video.slug}`,
      lastModified: lastModDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return routes;
}
