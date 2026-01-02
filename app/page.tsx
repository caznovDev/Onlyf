import React from 'react';
import { TrendingUp } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { MOCK_VIDEOS } from '../constants';

export const runtime = 'edge';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 8;
  
  // In production, fetch from D1 via your internal API or direct binding
  // For now, we use the mock data with basic slicing for demonstration
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, i) => (
            <a
              key={i}
              href={`?page=${i + 1}`}
              className={`px-4 py-2 rounded-lg font-bold border transition-all ${
                page === i + 1
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}