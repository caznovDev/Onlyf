import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
};

function toAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `https://freeonlyfans.qzz.io${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = process.env.DB as any;
  const video = await db?.prepare(`
    SELECT v.title, v.description, v.thumbnail, v.hover_preview_url, m.name as model_name 
    FROM videos v 
    JOIN models m ON v.model_id = m.id 
    WHERE v.slug = ?
  `).bind(slug).first();

  if (!video) {
    return {
      title: 'Video Not Found',
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  return {
    title: `${video.title} - ${video.model_name} (Player)`,
    description: video.description || `Watch ${video.title} on FreeOF`,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        noarchive: true,
        nosnippet: true,
      },
    },
    alternates: {
      canonical: `/video/${slug}`,
    },
  };
}

export default async function EmbedVideoPage({ params }: Props) {
  const { slug } = await params;
  const db = process.env.DB as any;
  if (!db) notFound();

  const video = await db.prepare(`
    SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail 
    FROM videos v 
    JOIN models m ON v.model_id = m.id 
    WHERE v.slug = ? AND v.is_published = 1
  `).bind(slug).first();

  if (!video) notFound();

  const videoSrc = toAbsoluteUrl(video.hover_preview_url);
  const posterSrc = toAbsoluteUrl(video.thumbnail);
  const mainPageUrl = `https://freeonlyfans.qzz.io/video/${slug}`;

  return (
    <div className="fixed inset-0 z-[999999] bg-black w-screen h-screen flex items-center justify-center m-0 p-0 overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000000 !important;
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        header, footer {
          display: none !important;
        }
        main {
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}} />

      <video
        src={videoSrc}
        poster={posterSrc}
        controls
        autoPlay
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
      />

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none opacity-90">
        <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg tracking-wider">
          {video.resolution || '4K'}
        </span>
        {video.type === 'onlyfans' && (
          <span className="bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck size={10} /> Exclusive
          </span>
        )}
      </div>

      <a
        href={mainPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-black/80 hover:bg-rose-600 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all flex items-center gap-1.5 shadow-lg group pointer-events-auto"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 group-hover:bg-white animate-pulse" />
        Watch on FreeOF
        <ExternalLink size={12} className="opacity-70 group-hover:opacity-100" />
      </a>
    </div>
  );
}
