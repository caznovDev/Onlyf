
import { Video, Model, Tag } from './types';

export const SITE_NAME = 'ProVideo';
export const DOMAIN = 'provideo.com';

export const MOCK_MODELS: Model[] = [
  {
    id: 'm1',
    name: 'Riley Reid',
    slug: 'riley-reid',
    bio: 'Riley Reid is a professional model and actress known for her extensive career in the industry. She has received numerous awards and has a massive following worldwide.',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    videosCount: 42
  },
  {
    id: 'm2',
    name: 'Lena Paul',
    slug: 'lena-paul',
    bio: 'Lena Paul is a celebrated figure in the entertainment world, recognized for her versatile performances and engaging personality.',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    videosCount: 28
  },
  {
    id: 'm3',
    name: 'Abella Danger',
    slug: 'abella-danger',
    bio: 'Award-winning performer with a focus on cinematic production values and high-energy performances.',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
    videosCount: 35
  },
  {
    id: 'm4',
    name: 'Lana Rhoades',
    slug: 'lana-rhoades',
    bio: 'Iconic industry veteran known for her brand and artistic approach to modern content creation.',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
    videosCount: 19
  },
  {
    id: 'm5',
    name: 'Mia Malkova',
    slug: 'mia-malkova',
    bio: 'Specializing in high-end lifestyle content and cinematic sequences across global locations.',
    thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
    videosCount: 50
  },
  {
    id: 'm6',
    name: 'Angela White',
    slug: 'angela-white',
    bio: 'Director and performer, bringing a unique professional perspective to high-end video content.',
    thumbnail: 'https://images.unsplash.com/photo-1488423191216-2fd9ed13caea?auto=format&fit=crop&w=400&h=400&q=80',
    videosCount: 62
  }
];

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Trending', slug: 'trending', description: 'The most popular videos right now.', videoCount: 150 },
  { id: 't2', name: 'Amateur', slug: 'amateur', description: 'Real people, real experiences.', videoCount: 85 },
  { id: 't3', name: 'POV', slug: 'pov', description: 'Point of view perspective.', videoCount: 200 },
  { id: 't4', name: '4K Ultra', slug: '4k-ultra', description: 'Highest resolution cinematic content.', videoCount: 45 },
  { id: 't5', name: 'Behind Scenes', slug: 'bts', description: 'Exclusive look at how we create content.', videoCount: 30 }
];

export const MOCK_VIDEOS: Video[] = Array.from({ length: 32 }).map((_, i) => ({
  id: `v${i}`,
  title: i % 2 === 0 ? `Cinematic Mastery Vol. ${i + 1}` : `Exclusive Studio Session ${i + 1}`,
  slug: i % 2 === 0 ? `cinematic-mastery-${i + 1}` : `exclusive-session-${i + 1}`,
  description: `Experience the best high-definition content featuring professional lighting and top-tier talent. This volume ${i + 1} showcases a unique journey through modern aesthetics. In this exclusive scene, we explore the depths of visual storytelling. Every frame is meticulously crafted to ensure the highest level of engagement for our viewers. This video is part of our commitment to professional excellence and high-end production standards.`,
  type: i % 5 === 0 ? 'onlyfans' : 'normal',
  model: MOCK_MODELS[i % MOCK_MODELS.length],
  duration: 420 + (i * 15),
  views: 15000 + (i * 2450),
  thumbnail: `https://picsum.photos/seed/pvid${i}/1280/720`,
  hoverPreviewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  createdAt: new Date(2024, 0, 30 - i).toISOString(),
  tags: [MOCK_TAGS[i % MOCK_TAGS.length], MOCK_TAGS[(i + 1) % MOCK_TAGS.length]]
}));
