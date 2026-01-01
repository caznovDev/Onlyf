
export type VideoType = 'onlyfans' | 'normal';

export interface Model {
  id: string;
  name: string;
  slug: string;
  bio: string;
  thumbnail: string;
  videosCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  videoCount: number;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: VideoType;
  model: Model;
  duration: number; // in seconds
  views: number;
  thumbnail: string;
  hoverPreviewUrl: string;
  createdAt: string;
  tags: Tag[];
}

export interface Breadcrumb {
  label: string;
  href: string;
}
