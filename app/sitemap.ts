
import { MetadataRoute } from 'next';
import { API_BASE_URL } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = API_BASE_URL;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/sitemap`, { next: { revalidate: 3600 } });
    const { models, videos, tags } = await res.json();

    const modelUrls = models.map((m: any) => ({
      url: `${baseUrl}/models/${m.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const videoUrls = videos.map((v: any) => ({
      url: `${baseUrl}/video/${v.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    const tagUrls = tags.map((t: any) => ({
      url: `${baseUrl}/tags/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/models`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/tags`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/sitemap`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      ...modelUrls,
      ...videoUrls,
      ...tagUrls,
    ];
  } catch (e) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ];
  }
}
