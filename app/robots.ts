
import { MetadataRoute } from 'next';
import { API_BASE_URL } from '../lib/api';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/upload/'],
    },
    sitemap: `${API_BASE_URL}/sitemap.xml`,
  };
}
