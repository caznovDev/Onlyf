import React from 'react';
import { Metadata } from 'next';
import VideoCard from '../../../components/VideoCard';
import Pagination from '../../../components/Pagination';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { Tag as TagIcon, LayoutGrid } from 'lucide-react';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getTagData(slug: string, page: number, limit: number) {
  const db = process.env.DB as any;
  if (!db) return null;

  try {
    const tag = await db.prepare("SELECT * FROM tags WHERE slug = ?").bind(slug).first();
    if (!tag) return null;

    const offset = (page - 1) * limit;
    const { results: videoResults } = await db.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v
      JOIN video_tags vt ON v.id = vt.video_id
      JOIN models m ON v.model_id = m.id
      WHERE vt.tag_id = ? AND v.is_published = 1
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(tag.id, limit, offset).all();

    const countResult = await db.prepare(`
      SELECT COUNT(*) as total FROM video_tags WHERE tag_id = ?
    `).bind(tag.id).first();
    
    const mappedVideos = videoResults.map((v: any) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      description: v.description,
      type: v.type,
      duration: v.duration,
      views: v.views,
      thumbnail: v.thumbnail,
      hoverPreviewUrl: v.hover_preview_url,
      createdAt: v.created_at,
      model: {
        id: v.model_id,
        name: v.model_name,
        slug: v.model_slug,
        thumbnail: v.model_thumbnail
      },
      tags: []
    }));

    return { 
      tag: { id: tag.id, name: tag.name, slug: tag.slug, description: tag.description }, 
      videos: mappedVideos, 
      totalPages: Math.ceil((countResult?.total || 0) / limit) 
    };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = process.env.DB as any;
  const tag = await db?.prepare("SELECT name, description FROM tags WHERE slug = ?").bind(slug).first();
  if (!tag) return { title: 'Tag Not Found' };
  return {
    title: `${tag.name} - Browse Videos`,
    description: tag.description,
  };
}

export default async function TagVideosPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page || '1');
  const limit = 12;

  const data = await getTagData(slug, page, limit);
  if (!data) notFound();

  const { tag, videos, totalPages } = data;

  const breadcrumbs = [
    { label: 'Tags', href: '/tags' },
    { label: tag.name, href: `/tags/${tag.slug}` }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={breadcrumbs} />

      <div className="space-y-12">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="relative space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <TagIcon size={14} /> Category
            </div>
            <h1 className="text-4xl md:text-5xl font-black capitalize tracking-tight">{tag.name}</h1>
            <p className="text-slate-400 text-lg leading-relaxed">{tag.description}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid size={24} className="text-rose-500" /> Explore Videos
            </h2>
            <span className="text-sm text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.length > 0 ? (
              videos.map(video => <VideoCard key={video.id} video={video} />)
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                  <TagIcon size={32} className="text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">No videos found</h3>
                <p className="text-slate-600">We couldn't find any videos tagged with "{tag.name}" right now.</p>
              </div>
            )}
          </div>
          
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            baseUrl={`/tags/${slug}`} 
          />
        </div>
      </div>
    </div>
  );
}