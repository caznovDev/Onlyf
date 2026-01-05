'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Link as LinkIcon, Video, Type, CheckCircle2, AlertCircle, Loader2, Info, ChevronDown, Clock, Eye, Play, Monitor } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function UploadPage() {
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modelId: '',
    type: 'normal',
    selectedTags: [] as string[],
    video_url: '',
    preview_url: '',
    thumbnail_url: '',
    durationString: '', // UI state for MM:SS
  });

  // Calculate actual seconds from duration string
  const durationSeconds = useMemo(() => {
    if (!formData.durationString) return 0;
    const parts = formData.durationString.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  }, [formData.durationString]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mRes = await fetch('/api/v1/models');
        if (mRes.ok) {
          const mData = await mRes.json();
          setModels(Array.isArray(mData) ? mData : (mData.results || []));
        }
        
        setTags([
          { slug: 'trending', name: 'Trending' },
          { slug: '4k-ultra', name: '4K Ultra' },
          { slug: 'exclusive', name: 'Exclusive' },
          { slug: 'bts', name: 'Behind Scenes' }
        ]);
      } catch (e) {
        console.error("Failed to load upload form data:", e);
      }
    };
    fetchData();
  }, []);

  const toggleTag = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(slug)
        ? prev.selectedTags.filter(s => s !== slug)
        : [...prev.selectedTags, slug]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video_url || !formData.title || !formData.modelId) {
      setErrorMessage('Title, Creator, and Video Link are required.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: durationSeconds,
          tags: formData.selectedTags
        }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/'), 2000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedModel = models.find(m => m.slug === formData.modelId);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Studio (API Link Submission)', href: '/upload' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Video className="text-rose-500" /> Video Details
              </h2>
              <div className="text-[10px] font-black uppercase tracking-tighter text-slate-500 bg-slate-800 px-2 py-1 rounded">
                Draft Mode
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Type size={14} className="text-rose-500" /> Title *
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all placeholder:text-slate-700 text-lg font-bold"
                  placeholder="Cinematic drone shot of the skyline..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-rose-500" /> Duration (MM:SS)
                  </label>
                  <input 
                    type="text" 
                    value={formData.durationString}
                    onChange={(e) => setFormData({...formData, durationString: e.target.value})}
                    placeholder="e.g. 12:45"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    Creator *
                  </label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.modelId}
                      onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                      className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all cursor-pointer text-slate-200"
                    >
                      <option value="" disabled>Choose Creator...</option>
                      {models.map(m => (
                        <option key={m.id} value={m.slug}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-700"
                  placeholder="Describe the cinematic journey..."
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={14} className="text-rose-500" /> Source Media Assets
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <input 
                      required
                      type="url" 
                      placeholder="Master Video URL (MP4/Direct)"
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="url" 
                      placeholder="Thumbnail Cover Image URL"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 text-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
              {isSubmitting ? 'Pushing to Edge...' : 'Publish Content'}
            </button>
          </div>
        </form>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2 space-y-6 sticky top-24">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Monitor size={12} /> Live Proofing
              </span>
              {formData.video_url && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </div>

            <div className="aspect-video bg-black relative group flex items-center justify-center">
              {formData.video_url ? (
                <video 
                  key={formData.video_url}
                  src={formData.video_url} 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover"
                />
              ) : formData.thumbnail_url ? (
                <img src={formData.thumbnail_url} className="w-full h-full object-cover opacity-50" alt="Thumbnail Preview" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-700">
                  <Play size={48} />
                  <span className="text-xs font-bold uppercase tracking-widest">No Media Linked</span>
                </div>
              )}
              
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/10">
                <Clock size={12} className="text-rose-500" />
                {formData.durationString || '00:00'}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold leading-tight line-clamp-2">
                  {formData.title || 'Untitled Masterpiece'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden">
                    {selectedModel?.thumbnail && <img src={selectedModel.thumbnail} className="w-full h-full object-cover" />}
                  </div>
                  <span>{selectedModel?.name || 'Unknown Creator'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                  <Eye size={14} /> 0 views
                </div>
                <div className="bg-slate-800 text-[10px] font-black uppercase px-2 py-0.5 rounded text-slate-400">
                  {formData.type}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl space-y-3">
             <div className="flex items-center gap-2 text-rose-500">
               <Info size={18} />
               <h4 className="font-bold text-sm">Edge Validation</h4>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               Content is published globally across 300+ edge nodes. Ensure your source links are publicly accessible and support CORS for smooth streaming.
             </p>
          </div>

          {status === 'error' && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-2xl flex items-center gap-3 animate-bounce">
              <AlertCircle />
              <div className="text-xs">
                <p className="font-bold">Registry Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}