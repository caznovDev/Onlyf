import React from 'react';
import { TrendingUp } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import { MOCK_VIDEOS } from '../constants';

export const runtime = 'edge';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 12; // Adjusted limit for better grid
  
  const videos = MOCK_VIDEOS.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(MOCK_VIDEOS.length / limit);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-rose-500" /> Popular Videos
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        baseUrl="/" 
      />
    </div>
  );
}