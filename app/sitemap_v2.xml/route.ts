import { NextResponse } from 'next/server';
import sitemap from '../sitemap';

export const runtime = 'edge';

export async function GET() {
  try {
    const sitemapData = await sitemap();
    
    let urlset = '';
    if (sitemapData && sitemapData.length > 0) {
      urlset = sitemapData.map(item => {
        // Use YYYY-MM-DD format for better compatibility
        let date: Date;
        try {
          date = item.lastModified instanceof Date ? item.lastModified : new Date(item.lastModified || Date.now());
          if (isNaN(date.getTime())) date = new Date();
        } catch (e) {
          date = new Date();
        }
        const lastmod = `<lastmod>${date.toISOString().split('T')[0]}</lastmod>`;
        
        const changefreq = item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : '';
        const priority = item.priority !== undefined ? `<priority>${item.priority.toFixed(1)}</priority>` : '';
        
        // XML escape the URL after encoding it
        const encodedUrl = encodeURI(item.url);
        const loc = encodedUrl.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
        
        return `<url><loc>${loc}</loc>${lastmod}${changefreq}${priority}</url>`;
      }).join('\n');
    }

    // XML declaration MUST be the very first character
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap_v2.xml:', error);
    // Return a valid empty sitemap on error instead of 500
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new NextResponse(emptyXml, {
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    });
  }
}
