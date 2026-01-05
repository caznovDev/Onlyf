import React from 'react';
import { Metadata } from 'next';
// Fix: Import missing Info icon from lucide-react
import { Eye, Clock, Calendar, Zap, Monitor, Smartphone, ShieldCheck, Info } from 'lucide-react';
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

    const { results: tags } = await db.prepare(`
      SELECT t.* FROM tags t
      JOIN video_tags vt ON t.id = vt.tag_id
      WHERE vt.video_id = ?
    `).bind(video.id).all();

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
      resolution: v.resolution,
      orientation: v.orientation,
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
  return { title: video.title, description: video.description.slice(0, 160) };
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

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <Breadcrumbs items={[
        { label: 'Videos', href: '/' },
        { label: video.model.name, href: `/models/${video.model.slug}` },
        { label: video.title, href: `/video/${slug}` }
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className={`bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative ring-1 ring-white/5 ${video.orientation === 'portrait' ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video'}`}>
            <video 
              src={video.hoverPreviewUrl} 
              controls 
              className="w-full h-full object-contain"
              poster={video.thumbnail}
            />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                {video.resolution}
              </span>
              {video.type === 'onlyfans' && (
                <span className="bg-black/80 backdrop-blur-md text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck size={10} /> EXCLUSIVE
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 px-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1]">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
               <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl text-slate-300">
                  <Eye size={14} className="text-rose-500" /> {video.views.toLocaleString()} Views
               </div>
               <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl text-slate-300">
                  <Clock size={14} className="text-rose-500" /> {formatDuration(video.duration)}
               </div>
               <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl text-slate-300">
                  {video.orientation === 'portrait' ? <Smartphone size={14} /> : <Monitor size={14} />} 
                  {video.orientation}
               </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800 space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Info size={20} className="text-rose-500" /> About this Production
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {video.description || "No professional description provided."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
             <div className="flex items-center gap-4">
                <img src={video.model.thumbnail} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-500/20" />
                <div>
                   <h3 className="text-xl font-black">{video.model.name}</h3>
                   <Link href={`/models/${video.model.slug}`} className="text-rose-500 text-xs font-bold uppercase tracking-widest hover:underline">
                      View Profile
                   </Link>
                </div>
             </div>
             <div className="flex flex-wrap gap-2 pt-4">
               {video.tags.map(t => (
                 <Link key={t.id} href={`/tags/${t.slug}`} className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors">
                   #{t.name}
                 </Link>
               ))}
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2 px-2">
              <Zap size={20} className="text-rose-500" /> Trending Now
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {recommendations.slice(0, 4).map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}