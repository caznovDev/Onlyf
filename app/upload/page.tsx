'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Video, Type, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mRes = await fetch('/api/v1/search?q=a');
        const mData = await mRes.json();
        setModels(mData.models || []);
        
        // Use standard tags
        setTags([
          { slug: 'trending', name: 'Trending' },
          { slug: '4k-ultra', name: '4K Ultra' },
          { slug: 'exclusive', name: 'Exclusive' },
          { slug: 'bts', name: 'Behind Scenes' }
        ]);
      } catch (e) {}
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

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Studio (API Link Submission)', href: '/upload' }]} />

      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
          <Info size={24} />
        </div>
        <div>
          <h3 className="font-bold text-rose-500">API Link Submission Mode</h3>
          <p className="text-sm text-slate-400">Provide direct public URLs for media. No local files are processed.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Type className="text-rose-500" /> Content Metadata
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Creator *</label>
                  <select 
                    required
                    value={formData.modelId}
                    onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select...</option>
                    {models.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all"
                  >
                    <option value="normal">Standard</option>
                    <option value="onlyfans">Exclusive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => toggleTag(t.slug)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        formData.selectedTags.includes(t.slug) 
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LinkIcon className="text-rose-500" /> Direct Links
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Video size={10} /> Video URL *
                </label>
                <input 
                  required
                  type="url" 
                  placeholder="https://example.com/video.mp4"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Video size={10} /> Preview Clip URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://example.com/preview.mp4"
                  value={formData.preview_url}
                  onChange={(e) => setFormData({...formData, preview_url: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                   Thumbnail URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://example.com/cover.jpg"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-500/10 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              {isSubmitting ? 'Submitting...' : 'Register Video'}
            </button>
          </div>

          {status === 'success' && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 />
              <div className="text-xs">
                <p className="font-bold">Successfully Registered</p>
                <p>The video is now live on the index.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle />
              <div className="text-xs">
                <p className="font-bold">Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}