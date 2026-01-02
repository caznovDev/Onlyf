'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Eye, Clock, Lock } from 'lucide-react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isHovered) {
      hoverTimer.current = setTimeout(() => setShowPreview(true), 500);
    } else {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setShowPreview(false);
    }
    return () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); };
  }, [isHovered]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  return (
    <div 
      className="group relative flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-rose-500/10 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/video/${video.slug}`} className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${showPreview ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />
        
        {showPreview && (
          <video
            src={video.hoverPreviewUrl}
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
          />
        )}

        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        {video.type === 'onlyfans' && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <Lock size={10} /> EXCLUSIVE
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock size={12} /> {formatDuration(video.duration)}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <Play size={24} fill="white" className="ml-1 text-white" />
          </div>
        </div>
      </Link>

      <div className="p-3 flex flex-col gap-1.5">
        <Link href={`/video/${video.slug}`}>
          <h3 className="text-sm font-semibold line-clamp-2 leading-tight hover:text-rose-500 transition-colors">
            {video.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-auto">
          <Link href={`/models/${video.model.slug}`} className="text-xs text-slate-400 hover:text-white transition-colors">
            {video.model.name}
          </Link>
          
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Eye size={12} />
            <span>{formatViews(video.views)} views</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;