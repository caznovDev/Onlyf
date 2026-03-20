import { MetadataRoute } from 'next';
import { DOMAIN } from '../constants';

export const runtime = 'edge';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://${DOMAIN}/`,
      lastModified: new Date('2026-03-20'),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
