import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { MOCK_VIDEOS } from '../../../constants';
import { Eye, Clock, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getVideo(slug: string) {
  // In production, you would fetch from your D1-backed API:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/video/${slug}`);
  // return res.json();
  
  // Fallback to mock data for demonstration/build stability
  return MOCK_VIDEOS.find(v => v.slug === slug) || MOCK_VIDEOS[0];
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);

  return {
    title: video.title,
    description: video.description.slice(0, 160),
    openGraph: {
      title: video.title,
      description: video.description.slice(0, 160),
      images: [video.thumbnail],
    },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = await getVideo(slug);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': video.title,
    'description': video.description,
    'thumbnailUrl': video.thumbnail,
    'uploadDate': video.createdAt,
    'duration': `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">About this video</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {video.tags.map(tag => (
              <span key={tag.id} className="bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer">
                #{tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
            <h3 className="text-rose-500 font-bold mb-2 flex items-center gap-2">
              <User size={18} /> Support the Creator
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Get access to exclusive content and full length videos from {video.model.name}.
            </p>
            <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-500/20">
              Unlock Full Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}