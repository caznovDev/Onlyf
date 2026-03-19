import { NextResponse } from 'next/server';
import sitemap from '../sitemap';

export const runtime = 'edge';

export async function GET() {
  try {
    const sitemapData = await sitemap();
    
    if (!sitemapData || sitemapData.length === 0) {
      return new NextResponse('Sitemap is empty', { status: 404 });
    }

    const urlset = sitemapData.map(item => {
      const lastmod = item.lastModified 
        ? `<lastmod>${(item.lastModified instanceof Date ? item.lastModified : new Date(item.lastModified)).toISOString()}</lastmod>`
        : '';
      const changefreq = item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : '';
      const priority = item.priority !== undefined ? `<priority>${item.priority.toFixed(1)}</priority>` : '';
      
      // Ensure URL is properly encoded for XML
      const loc = encodeURI(item.url).replace(/&/g, '&amp;');
      
      return `<url><loc>${loc}</loc>${lastmod}${changefreq}${priority}</url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap_v2.xml:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
