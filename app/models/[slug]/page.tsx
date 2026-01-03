import React from 'react';
import { Metadata } from 'next';
import VideoCard from '../../../components/VideoCard';
import Pagination from '../../../components/Pagination';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { Users, Info } from 'lucide-react';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getModelData(slug: string, page: number, limit: number) {
  const db = process.env.DB as any;
  if (!db) return null;

  try {
    const model = await db.prepare("SELECT * FROM models WHERE slug = ?").bind(slug).first();
    if (!model) return null;

    const offset = (page - 1) * limit;
    const { results: videoResults } = await db.prepare(`
      SELECT v.* FROM videos v 
      WHERE v.model_id = ? AND v.is_published = 1
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(model.id, limit, offset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM videos WHERE model_id = ? AND is_published = 1").bind(model.id).first();
    
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
        id: model.id,
        name: model.name,
        slug: model.slug,
        thumbnail: model.thumbnail
      },
      tags: []
    }));

    return { 
      model: {
        id: model.id,
        name: model.name,
        slug: model.slug,
        bio: model.bio,
        thumbnail: model.thumbnail,
        videosCount: model.videos_count
      }, 
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
  const model = await db?.prepare("SELECT name, bio FROM models WHERE slug = ?").bind(slug).first();
  
  if (!model) return { title: 'Creator Not Found' };
  
  return {
    title: `${model.name} - Creator Profile`,
    description: model.bio,
  };
}

export default async function ModelProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page || '1');
  const limit = 12;

  const data = await getModelData(slug, page, limit);
  if (!data) notFound();

  const { model, videos, totalPages } = data;

  const breadcrumbs = [
    { label: 'Creators', href: '/models' },
    { label: model.name, href: `/models/${model.slug}` }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={breadcrumbs} />

      <div className="space-y-12">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-rose-600 to-purple-600 opacity-20" />
          <div className="relative pt-24 pb-8 px-8 flex flex-col md:flex-row items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-slate-950 shadow-2xl shrink-0">
              <img src={model.thumbnail} className="w-full h-full object-cover" alt={model.name} />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-black">{model.name}</h1>
              <p className="text-slate-400 flex items-center gap-2"><Users size={16}/> {model.videosCount} Videos Published</p>
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info size={14}/> Biography
              </h2>
              <p className="text-slate-300 leading-relaxed max-w-3xl">{model.bio}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-l-4 border-rose-500 pl-4">Creator Videos</h2>
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(video => <VideoCard key={video.id} video={video} />)}
            </div>
          ) : (
            <p className="text-slate-500 py-12 text-center">No videos found for this creator.</p>
          )}
          
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            baseUrl={`/models/${slug}`} 
          />
        </div>
      </div>
    </div>
  );
}