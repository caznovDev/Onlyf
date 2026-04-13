
import { MetadataRoute } from 'next';
import { DOMAIN } from '../constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/upload/', '/models/manage'],
    },
    sitemap: `https://${DOMAIN}/sitemap.xml`,
  };
}
