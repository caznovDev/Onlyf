import React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { MOCK_TAGS } from '../../constants';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';

export const runtime = 'edge';

export default async function TagsListingPage() {
  const breadcrumbs = [
    { label: 'Tags', href: '/tags' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <TagIcon className="text-rose-500" /> Browse Tags
          </h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_TAGS.map(tag => (
            <Link 
              key={tag.id} 
              href={`/tags/${tag.slug}`} 
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-rose-500/50 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <TagIcon size={24} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {tag.videoCount} Videos
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-rose-500 transition-colors capitalize">
                {tag.name}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {tag.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}