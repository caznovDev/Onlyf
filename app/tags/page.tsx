import React from 'react';
import { Metadata } from 'next';
import { Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';

import { apiFetch } from '../../lib/api';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Leaked OnlyFans Categories & Tags',
  description: 'Explore leaked OnlyFans videos by category and tag. Find exactly what you are looking for in our high-quality leaked library.',
  alternates: {
    canonical: '/tags',
  },
};

async function getTags() {
  try {
    const data = await apiFetch('/api/v1/tags');
    return data.tags.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      videoCount: t.video_count || 0
    }));
  } catch (e) {
    return [];
  }
}

export default async function TagsListingPage() {
  const tags = await getTags();
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
        
        {tags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tags.map(tag => (
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
        ) : (
          <p className="text-center py-20 text-slate-500">No tags configured in the database.</p>
        )}
      </div>
    </div>
  );
}