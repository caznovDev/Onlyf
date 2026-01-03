import React from 'react';
import { Users } from 'lucide-react';
import { MOCK_MODELS } from '../../constants';
import Link from 'next/link';
import Pagination from '../../components/Pagination';
import Breadcrumbs from '../../components/Breadcrumbs';

export const runtime = 'edge';

export default async function ModelListingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 12;
  
  const models = MOCK_MODELS.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(MOCK_MODELS.length / limit);

  const breadcrumbs = [
    { label: 'Creators', href: '/models' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="space-y-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Users className="text-rose-500" /> Creators
        </h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
          {models.map(model => (
            <Link key={model.id} href={`/models/${model.slug}`} className="group space-y-3 block">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                <img 
                  src={model.thumbnail} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  alt={model.name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 bg-rose-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {model.videosCount} Videos
                </div>
              </div>
              <h3 className="text-sm font-bold group-hover:text-rose-500 transition-colors text-center line-clamp-1">{model.name}</h3>
            </Link>
          ))}
        </div>

        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          baseUrl="/models" 
        />
      </div>
    </div>
  );
}