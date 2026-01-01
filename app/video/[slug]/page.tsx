
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string }
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  // Fetch video from API (Cloudflare Worker)
  const video = await fetch(`https://api.provideo.com/v1/video/${slug}`).then(res => res.json());

  return {
    title: video.title,
    description: video.description.slice(0, 160),
    alternates: {
      canonical: `https://provideo.com/video/${slug}`
    }
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = params;
  const video = await fetch(`https://api.provideo.com/v1/video/${slug}`).then(res => res.json());

  // JSON-LD Schema.org Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': video.title,
    'description': video.description,
    'thumbnailUrl': video.thumbnail,
    'uploadDate': video.createdAt,
    'duration': `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
    'contentUrl': `https://provideo.com/video/${slug}`,
    'embedUrl': `https://provideo.com/embed/${slug}`,
    'interactionStatistic': {
      '@type': 'InteractionCounter',
      'interactionType': { '@type': 'WatchAction' },
      'userInteractionCount': video.views
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-4xl font-bold mb-6">{video.title}</h1>
      <div className="aspect-video bg-black rounded-3xl overflow-hidden mb-8">
        {/* Professional Player Implementation */}
        <video src={video.hoverPreviewUrl} controls className="w-full h-full" />
      </div>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg leading-relaxed">{video.description}</p>
        <p>This is a highly optimized SEO text block containing over 200 words of relevant information about the video titled "{video.title}". We ensure that our platform provides the best content for our users. Our creators work tirelessly to provide cinematic excellence. Each frame is a testament to the quality we uphold. This video is part of a larger collection of premium content that explores various themes and aesthetics. By focusing on both performance and user experience, ProVideo stands out as the premier destination for digital storytelling...</p>
      </div>
    </main>
  );
}
