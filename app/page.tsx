import React from 'react';
import { Metadata } from 'next';
import { TrendingUp } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import Breadcrumbs from '../components/Breadcrumbs';

import { apiFetch } from '../lib/api';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Trending Professional Videos | FreeOF',
  description: 'Discover the most popular and trending professional videos on FreeOF. High-quality content from top creators around the world.',
  alternates: {
    canonical: '/',
  },
};

async function getVideos(page: number, limit: number) {
  try {
    const data = await apiFetch(`/api/v1/videos?page=${page}&limit=${limit}`);
    
    // Map API result to Video interface
    const mappedVideos = data.videos.map((v: any) => ({
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
      videos: mappedVideos, 
      totalPages: data.pagination.totalPages 
    };
  } catch (e) {
    console.error(e);
    return { videos: [], totalPages: 0 };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 12;
  
  const { videos, totalPages } = await getVideos(page, limit);

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[]} />
      
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-rose-500" /> Popular Videos
          </h2>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-slate-500">No videos found in the database. Please run the seed script.</p>
          </div>
        )}

        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          baseUrl="/" 
        />
      </div>
    </div>
  );
}