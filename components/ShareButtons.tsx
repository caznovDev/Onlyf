'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, Code, CheckCheck, Download, Sparkles, HelpCircle } from 'lucide-react';

interface ShareButtonsProps {
  slug: string;
  title: string;
  modelName: string;
  videoDownloadUrl?: string;
}

export default function ShareButtons({ slug, title, modelName, videoDownloadUrl }: ShareButtonsProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showXHelp, setShowXHelp] = useState(false);

  const videoUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/video/${slug}` 
    : `https://freeonlyfans.qzz.io/video/${slug}`;

  const embedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/embed/video/${slug}`
    : `https://freeonlyfans.qzz.io/embed/video/${slug}`;

  const embedCode = `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>`;

  const handleShareX = () => {
    const text = `Watch ${title} by ${modelName} on @FreeOF:`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Share on X Button */}
      <button
        type="button"
        onClick={handleShareX}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs font-bold border border-neutral-800 transition shadow-sm hover:border-neutral-700 active:scale-95"
        title="Share on X (Twitter)"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </button>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition active:scale-95"
      >
        {copiedLink ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span className="text-emerald-400">Link Copied!</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Download Clip for X Native Autoplay */}
      {videoDownloadUrl && (
        <a
          href={videoDownloadUrl}
          download={`${slug}-clip.mp4`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-500/30 transition active:scale-95"
          title="Download MP4 video clip to upload directly to X for native autoplay"
        >
          <Download size={14} className="text-rose-400" />
          <span>Download Clip for X</span>
        </a>
      )}

      {/* Embed Button */}
      <button
        type="button"
        onClick={() => setShowEmbedModal(!showEmbedModal)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition active:scale-95"
      >
        <Code size={14} />
        <span>Embed</span>
      </button>

      {/* Info Guide Button */}
      <button
        type="button"
        onClick={() => setShowXHelp(!showXHelp)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800/80 transition"
        title="Learn how Twitter/X video autoplay works"
      >
        <HelpCircle size={13} />
        <span>X Video Guide</span>
      </button>

      {/* X Autoplay Guide Modal */}
      {showXHelp && (
        <div className="w-full mt-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-md space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-rose-400" />
              How to get seamless Autoplay on X (Twitter)
            </span>
            <button
              type="button"
              onClick={() => setShowXHelp(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Twitter (X) <strong className="text-white">only autoplays native video files</strong> directly attached to a tweet. External web links never autoplay in the timeline by platform policy.
          </p>
          <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <p className="text-rose-400 font-semibold">To get 100% native timeline autoplay:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Click <strong className="text-white">&quot;Download Clip for X&quot;</strong> to save the MP4 video clip.</li>
              <li>Attach the downloaded MP4 directly into your tweet composer on X.</li>
              <li>Paste your link <code className="text-rose-300">{videoUrl}</code> in the tweet text for viewers to watch the full video!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Embed Modal / Popover */}
      {showEmbedModal && (
        <div className="w-full mt-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Embed Video Player</span>
            <button 
              type="button"
              onClick={() => setShowEmbedModal(false)}
              className="text-slate-500 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={embedCode}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg font-mono outline-none"
            />
            <button
              type="button"
              onClick={handleCopyEmbed}
              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              {copiedEmbed ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copiedEmbed ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
