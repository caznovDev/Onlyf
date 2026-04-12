import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Video, Tag, Home } from 'lucide-react';

import { apiFetch } from '../../lib/api';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'HTML Sitemap - Free OnlyFans Leaks',
  description: 'Complete sitemap for Free OnlyFans Leaks. Find all leaked models, videos, and categories in one place.',
  alternates: {
    canonical: '/sitemap',
  },
};

async function getSitemapData() {
  try {
    const data = await apiFetch('/api/v1/sitemap');
    return {
      models: data.models || [],
      videos: data.videos || [],
      tags: data.tags || []
    };
  } catch (e) {
    console.error(e);
    return { models: [], videos: [], tags: [] };
  }
}

export default async function SitemapPage() {
  const { models, videos, tags } = await getSitemapData();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase">HTML Sitemap</h1>
        <p className="text-slate-400">Explore all content on Free OnlyFans Leaks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Main Sections */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-500 border-b border-slate-800 pb-2">
            <Home size={20} /> Main Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-slate-300 hover:text-white transition-colors">Home - Trending Leaks</Link>
            </li>
            <li>
              <Link href="/models" className="text-slate-300 hover:text-white transition-colors">All Leaked Models</Link>
            </li>
            <li>
              <Link href="/tags" className="text-slate-300 hover:text-white transition-colors">Leaked Categories & Tags</Link>
            </li>
          </ul>
        </section>

        {/* Categories/Tags */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-500 border-b border-slate-800 pb-2">
            <Tag size={20} /> Categories
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {tags.map((tag: any) => (
              <li key={tag.slug}>
                <Link href={`/tags/${tag.slug}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Models */}
        <section className="space-y-4 md:col-span-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-500 border-b border-slate-800 pb-2">
            <Users size={20} /> Leaked Models
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {models.map((model: any) => (
              <li key={model.slug}>
                <Link href={`/models/${model.slug}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {model.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Videos */}
        <section className="space-y-4 md:col-span-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-500 border-b border-slate-800 pb-2">
            <Video size={20} /> Latest Leaked Videos
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {videos.map((video: any) => (
              <li key={video.slug}>
                <Link href={`/video/${video.slug}`} className="text-sm text-slate-400 hover:text-white transition-colors line-clamp-1">
                  {video.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
