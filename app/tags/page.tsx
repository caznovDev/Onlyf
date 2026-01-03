import React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';

export const runtime = 'edge';

async function getTags() {
  const db = process.env.DB as any;
  if (!db) return [];

  try {
    const { results } = await db.prepare(`
      SELECT t.*, COUNT(vt.video_id) as video_count 
      FROM tags t 
      LEFT JOIN video_tags vt ON t.id = vt.tag_id 
      GROUP BY t.id
      ORDER BY video_count DESC
    `).all();

    return results.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      videoCount: t.video_count
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