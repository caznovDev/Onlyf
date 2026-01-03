import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { MOCK_VIDEOS } from '../../../constants';
import { Eye, Clock, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import VideoCard from '../../../components/VideoCard';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getVideo(slug: string) {
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
  
  // Filter 8 random videos for recommendations
  const recommendations = MOCK_VIDEOS
    .filter(v => v.slug !== slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

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
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-12">
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

      <div className="space-y-8">
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

      {/* Recommended Section */}
      <div className="pt-12 border-t border-slate-800">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Zap size={24} className="text-rose-500" /> More Like This
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </div>
    </div>
  );
}