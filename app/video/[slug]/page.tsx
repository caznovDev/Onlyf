import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { Eye, Clock, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import VideoCard from '../../../components/VideoCard';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Pagination from '../../../components/Pagination';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rec_page?: string }>;
};

async function getVideoData(slug: string, recPage: number, recLimit: number) {
  const db = process.env.DB as any;
  if (!db) return null;

  try {
    const video = await db.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v 
      JOIN models m ON v.model_id = m.id 
      WHERE v.slug = ? AND v.is_published = 1
    `).bind(slug).first();

    if (!video) return null;

    // Fetch tags for this video
    const { results: tags } = await db.prepare(`
      SELECT t.* FROM tags t
      JOIN video_tags vt ON t.id = vt.tag_id
      WHERE vt.video_id = ?
    `).bind(video.id).all();

    // Fetch recommended videos (similar model or random)
    const recOffset = (recPage - 1) * recLimit;
    const { results: recVideos } = await db.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v
      JOIN models m ON v.model_id = m.id
      WHERE v.id != ? AND v.is_published = 1
      ORDER BY RANDOM()
      LIMIT ? OFFSET ?
    `).bind(video.id, recLimit, recOffset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM videos WHERE id != ? AND is_published = 1").bind(video.id).first();

    const mapVideo = (v: any) => ({
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
    });

    return {
      video: {
        ...mapVideo(video),
        tags: tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug }))
      },
      recommendations: recVideos.map(mapVideo),
      totalRecPages: Math.ceil((countResult?.total || 0) / recLimit)
    };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = process.env.DB as any;
  const video = await db?.prepare("SELECT title, description FROM videos WHERE slug = ?").bind(slug).first();
  
  if (!video) return { title: 'Video Not Found' };

  return {
    title: video.title,
    description: video.description.slice(0, 160),
  };
}

export default async function VideoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;
  const recPage = parseInt(sParams.rec_page || '1');
  const recLimit = 8;

  const data = await getVideoData(slug, recPage, recLimit);
  if (!data) notFound();

  const { video, recommendations, totalRecPages } = data;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const breadcrumbs = [
    { label: 'Videos', href: '/' },
    { label: video.model.name, href: `/models/${video.model.slug}` },
    { label: video.title, href: `/video/${video.slug}` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          {video.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
          <Link href={`/models/${video.model.slug}`} className="flex items-center gap-2 hover:text-rose-500 transition-colors">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700">
              <img src={video.model.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-200">{video.model.name}</span>
          </Link>
          <div className="flex items-center gap-1.5"><Eye size={16}/> {video.views.toLocaleString()} views</div>
          <div className="flex items-center gap-1.5"><Clock size={16}/> {formatDuration(video.duration)}</div>
          <div className="flex items-center gap-1.5"><Calendar size={16}/> {new Date(video.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative group">
        <video 
          src={video.hoverPreviewUrl} 
          controls 
          className="w-full h-full object-contain"
          poster={video.thumbnail}
        />
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold mb-4">About this video</h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {video.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {video.tags.map(tag => (
            <Link key={tag.id} href={`/tags/${tag.slug}`} className="bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-1.5 rounded-full text-xs font-medium">
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-12 border-t border-slate-800">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Zap size={24} className="text-rose-500" /> More Like This
        </h2>
        
        {recommendations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination 
                currentPage={recPage} 
                totalPages={totalRecPages} 
                baseUrl={`/video/${slug}`} 
              />
            </div>
          </>
        ) : (
          <p className="text-slate-500">No other videos to recommend.</p>
        )}
      </div>
    </div>
  );
}