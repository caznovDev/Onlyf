import React from 'react';
import { Metadata } from 'next';
import { MOCK_MODELS, MOCK_VIDEOS } from '../../../constants';
import VideoCard from '../../../components/VideoCard';
import Pagination from '../../../components/Pagination';
import { Users, Info } from 'lucide-react';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getModelData(slug: string, page: number, limit: number) {
  const model = MOCK_MODELS.find(m => m.slug === slug) || MOCK_MODELS[0];
  const allVideos = MOCK_VIDEOS.filter(v => v.model.slug === slug);
  const videos = allVideos.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(allVideos.length / limit);
  
  return { model, videos, totalPages };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = MOCK_MODELS.find(m => m.slug === slug) || MOCK_MODELS[0];
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

  const { model, videos, totalPages } = await getModelData(slug, page, limit);

  return (
    <div className="space-y-12 animate-fade-in">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.length > 0 ? (
            videos.map(video => <VideoCard key={video.id} video={video} />)
          ) : (
            <p className="text-slate-500 col-span-full py-12 text-center">No videos found for this creator.</p>
          )}
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          baseUrl={`/models/${slug}`} 
        />
      </div>
    </div>
  );
}