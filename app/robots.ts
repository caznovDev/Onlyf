import { MetadataRoute } from 'next';
import { DOMAIN } from '../constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/models/manage', '/upload'],
    },
    sitemap: [
      `https://${DOMAIN}/sitemap-test.xml`
    ],
  };
}
