'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  orientation: 'portrait' | 'landscape';
  resolution?: string;
  isExclusive?: boolean;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  orientation,
  resolution = '4K UHD',
  isExclusive = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay muted (allowed by all browsers & Twitter in-app browser)
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay was prevented; wait for user interaction
          setIsPlaying(false);
        });
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      if (video) {
        setIsMuted(video.muted);
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [src]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    setUserInteracted(true);
    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
      // Ensure video is playing
      if (video.paused) {
        video.play();
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const isPortrait = orientation === 'portrait';

  return (
    <div
      id="video-player-container"
      className={`bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative ring-1 ring-white/5 group ${
        isPortrait ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video w-full'
      }`}
    >
      <video
        id="main-html5-video"
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
        aria-label={title}
      />

      {/* Badges */}
      <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-10">
        <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
          {resolution}
        </span>
        {isExclusive && (
          <span className="bg-black/80 backdrop-blur-md text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck size={10} /> EXCLUSIVE
          </span>
        )}
      </div>

      {/* Floating Unmute Button when playing muted */}
      {isPlaying && isMuted && (
        <button
          id="unmute-floating-button"
          type="button"
          onClick={toggleSound}
          className="absolute bottom-16 right-4 sm:bottom-20 sm:right-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/85 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 animate-fade-in"
          title="Click to unmute"
        >
          <VolumeX size={16} className="text-rose-400 animate-pulse" />
          <span>Tap for sound</span>
        </button>
      )}
    </div>
  );
}
