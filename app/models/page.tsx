import React from 'react';
import { Users } from 'lucide-react';
import { MOCK_MODELS } from '../../constants';
import Link from 'next/link';

export const runtime = 'edge';

export default function ModelListingPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold flex items-center gap-3">
        <Users className="text-rose-500" /> Creators
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {MOCK_MODELS.map(model => (
          <Link key={model.id} href={`/models/${model.slug}`} className="group space-y-4 block">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
              <img 
                src={model.thumbnail} 
                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                alt={model.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 bg-rose-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {model.videosCount} Videos
              </div>
            </div>
            <h3 className="text-lg font-bold group-hover:text-rose-500 transition-colors">{model.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}