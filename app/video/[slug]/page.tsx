import React from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Eye, Clock, Zap, Monitor, Smartphone, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';
import VideoCard from '../../../components/VideoCard';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ShareButtons from '../../../components/ShareButtons';
import VideoPlayer from '../../../components/VideoPlayer';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rec_page?: string }>;
};

function toAbsoluteUrl(url?: string): string {
  if (!url) return 'https://freeonlyfans.qzz.io/og-image.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `https://freeonlyfans.qzz.io${url.startsWith('/') ? '' : '/'}${url}`;
}

async function getVideoData(slug: string, recPage: number, recLimit: number) {
  const db = process.env.DB as any;
  if (!db) return null;

  try {
    // Increment views
    await db.prepare(`UPDATE videos SET views = views + 1 WHERE slug = ? AND is_published = 1`).bind(slug).run();

    const video = await db.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v 
      JOIN models m ON v.model_id = m.id 
      WHERE v.slug = ? AND v.is_published = 1
    `).bind(slug).first();

    if (!video) return null;

    const { results: tags } = await db.prepare(`
      SELECT t.* FROM tags t
      JOIN video_tags vt ON t.id = vt.tag_id
      WHERE vt.video_id = ?
    `).bind(video.id).all();

    const recOffset = (recPage - 1) * recLimit;
    const { results: recVideos } = await db.prepare(`
      SELECT v.*, m.name as model_name, m.slug as model_slug, m.thumbnail as model_thumbnail
      FROM videos v
      JOIN models m ON v.model_id = m.id
      WHERE v.id != ? AND v.is_published = 1
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(video.id, recLimit, recOffset).all();

    const countResult = await db.prepare("SELECT COUNT(*) as total FROM videos WHERE id != ? AND is_published = 1").bind(video.id).first();

    const mapVideo = (v: any) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      description: v.description,
      type: v.type,
      duration: v.duration,
      views: v.views,
      thumbnail: v.thumbnail,
      twitterThumbnail: v.twitter_thumbnail || v.thumbnail,
      twitter_thumbnail: v.twitter_thumbnail || v.thumbnail,
      hoverPreviewUrl: v.hover_preview_url,
      resolution: v.resolution,
      orientation: v.orientation,
      createdAt: v.created_at,
      model: {
        id: v.model_id,
        name: v.model_name,
        slug: v.model_slug,
        thumbnail: v.model_thumbnail
      },
      tags: []
    });

    return {
      video: {
        ...mapVideo(video),
        tags: tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug }))
      },
      recommendations: recVideos.map(mapVideo),
      totalRecPages: Math.ceil((countResult?.total || 0) / recLimit)
    };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = process.env.DB as any;
  const video = await db?.prepare(`
    SELECT v.*, m.name as model_name, m.slug as model_slug 
    FROM videos v 
    JOIN models m ON v.model_id = m.id 
    WHERE v.slug = ?
  `).bind(slug).first();
  
  if (!video) {
    return { 
      title: 'Video Not Found',
      alternates: {
        canonical: `/video/${slug}`,
      },
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  let isTwitterbot = false;
  try {
    const headersList = await headers();
    const ua = (headersList.get('user-agent') || '').toLowerCase();
    isTwitterbot = ua.includes('twitterbot');
  } catch {
    // ignore
  }

  const title = `${video.title} - ${video.model_name} OnlyFans Leaked Video`;
  const description = video.description 
    ? (video.description.length > 160 ? `${video.description.slice(0, 157)}...` : video.description)
    : `Watch ${video.title} by ${video.model_name}. Leaked OnlyFans video in ${video.resolution || '4K'} resolution.`;

  const pageUrl = `https://freeonlyfans.qzz.io/video/${slug}`;
  const embedUrl = `https://freeonlyfans.qzz.io/embed/video/${slug}`;
  const absoluteSiteThumbnail = toAbsoluteUrl(video.thumbnail);
  const twitterThumbnail = video.twitter_thumbnail || video.thumbnail;
  const absoluteTwitterThumbnail = toAbsoluteUrl(twitterThumbnail);
  const absoluteVideoUrl = video.hover_preview_url ? toAbsoluteUrl(video.hover_preview_url) : '';

  // Vertical 9:16 high-res format (720x1280) for Twitter/X cards and vertical timeline display
  const cardWidth = 720;
  const cardHeight = 1280;

  // Zero-width space character (\u200B) prevents Twitter from falling back to OpenGraph or HTML title while leaving the card completely blank of text
  const emptyCardText = '\u200B';
  
  return { 
    title, 
    description,
    alternates: {
      canonical: `/video/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        noarchive: true,
        nosnippet: true,
      },
    },
    openGraph: {
      title: isTwitterbot ? emptyCardText : title,
      description: isTwitterbot ? emptyCardText : description,
      url: pageUrl,
      siteName: isTwitterbot ? '' : 'FreeOF',
      type: 'video.other',
      images: [
        { 
          url: absoluteTwitterThumbnail,
          width: cardWidth,
          height: cardHeight,
          alt: '',
          type: 'image/jpeg',
        }
      ],
      videos: absoluteVideoUrl ? [
        {
          url: absoluteVideoUrl,
          secureUrl: absoluteVideoUrl,
          type: 'video/mp4',
          width: cardWidth,
          height: cardHeight,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: emptyCardText,
      description: emptyCardText,
      images: [
        {
          url: absoluteTwitterThumbnail,
          width: cardWidth,
          height: cardHeight,
          alt: '',
        }
      ],
    },
    other: {
      'twitter:card': 'summary_large_image',
      'twitter:title': emptyCardText,
      'twitter:description': emptyCardText,
      'twitter:image': absoluteTwitterThumbnail,
      'twitter:image:src': absoluteTwitterThumbnail,
      'twitter:image:width': String(cardWidth),
      'twitter:image:height': String(cardHeight),
      ...(video.duration ? { 'og:video:duration': String(video.duration) } : {}),
      ...(video.created_at ? { 'og:video:release_date': String(video.created_at) } : {}),
    },
  };
}

export default async function VideoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;
  const recPage = parseInt(sParams.rec_page || '1');
  const recLimit = 8;

  const data = await getVideoData(slug, recPage, recLimit);
  if (!data) notFound();

  const { video, recommendations } = data;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: toAbsoluteUrl(video.thumbnail),
    uploadDate: video.createdAt,
    duration: `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
    contentUrl: toAbsoluteUrl(video.hoverPreviewUrl),
    embedUrl: `https://freeonlyfans.qzz.io/embed/video/${slug}`,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.views,
    },
    creator: {
      '@type': 'Person',
      name: video.model.name,
      url: `https://freeonlyfans.qzz.io/models/${video.model.slug}`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { label: 'Videos', href: '/' },
        { label: video.model.name, href: `/models/${video.model.slug}` },
        { label: video.title, href: `/video/${slug}` }
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <VideoPlayer
            src={video.hoverPreviewUrl}
            poster={video.thumbnail}
            title={video.title}
            orientation={video.orientation}
            resolution={video.resolution}
            isExclusive={video.type === 'onlyfans'}
          />

          <div className="space-y-6 px-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1]">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
               <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl text-slate-300">
                  <Eye size={14} className="text-rose-500" /> {video.views.toLocaleString()} Views
               </div>
               <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl text-slate-300">
                  <Clock size={14} className="text-rose-500" /> {formatDuration(video.duration)}
               </div>
               <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl text-slate-300">
                  {video.orientation === 'portrait' ? <Smartphone size={14} /> : <Monitor size={14} />} 
                  {video.orientation}
               </div>
            </div>

            <div className="pt-2">
              <ShareButtons 
                slug={slug} 
                title={video.title} 
                modelName={video.model.name} 
                videoDownloadUrl={video.hoverPreviewUrl}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800 space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Info size={20} className="text-rose-500" /> About this Production
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {video.description || "No professional description provided."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
             <div className="flex items-center gap-4">
                <img src={video.model.thumbnail} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-500/20" alt={video.model.name} />
                <div>
                   <h3 className="text-xl font-black">{video.model.name}</h3>
                   <Link href={`/models/${video.model.slug}`} className="text-rose-500 text-xs font-bold uppercase tracking-widest hover:underline">
                      View Profile
                   </Link>
                </div>
             </div>
             <div className="flex flex-wrap gap-2 pt-4">
               {video.tags.map(t => (
                 <Link key={t.id} href={`/tags/${t.slug}`} className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors">
                   #{t.name}
                 </Link>
               ))}
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2 px-2">
              <Zap size={20} className="text-rose-500" /> Trending Now
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {recommendations.slice(0, 4).map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
