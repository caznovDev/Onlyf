'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Link as LinkIcon, Video, Type, CheckCircle2, AlertCircle, 
  Loader2, Info, ChevronDown, Clock, Eye, Play, Monitor, 
  Smartphone, ShieldCheck, Search, Globe, FileText, Zap
} from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function UploadPage() {
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modelId: '',
    type: 'normal',
    video_url: '',
    thumbnail_url: '',
    durationString: '',
    resolution: '1080p',
    orientation: 'landscape',
    tagsInput: ''
  });

  // Derived Values
  const durationSeconds = useMemo(() => {
    if (!formData.durationString) return 0;
    const parts = formData.durationString.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  }, [formData.durationString]);

  const tagsArray = useMemo(() => {
    return formData.tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }, [formData.tagsInput]);

  useEffect(() => {
    fetch('/api/v1/models').then(res => res.json()).then(data => {
      setModels(Array.isArray(data) ? data : (data.results || []));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: durationSeconds,
          tags: tagsArray
        }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/'), 2000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
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
    <div className="max-w-7xl mx-auto py-8 space-y-8 animate-fade-in pb-20">
      <Breadcrumbs items={[{ label: 'Studio', href: '/upload' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 space-y-12 shadow-2xl backdrop-blur-sm">
            
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <FileText className="text-rose-500" /> Content Identity
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Global Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all text-xl font-bold placeholder:text-slate-800"
                    placeholder="Enter cinematic title..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Creator Registry</label>
                    <div className="relative">
                      <select 
                        required
                        value={formData.modelId}
                        onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                        className="w-full appearance-none bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none cursor-pointer"
                      >
                        <option value="">Select Artist...</option>
                        {models.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Distribution Type</label>
                    <div className="relative">
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full appearance-none bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none cursor-pointer"
                      >
                        <option value="normal">Public (Standard)</option>
                        <option value="onlyfans">Private (Exclusive)</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Studio Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-800"
                    placeholder="Provide a professional summary of the content..."
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Zap className="text-rose-500" /> Technical Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Duration (MM:SS)</label>
                  <div className="relative">
                    <input 
                      value={formData.durationString}
                      onChange={(e) => setFormData({...formData, durationString: e.target.value})}
                      placeholder="00:00"
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none font-mono"
                    />
                    <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Master Resolution</label>
                  <select 
                    value={formData.resolution}
                    onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none"
                  >
                    <option value="4K">4K UHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Orientation</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, orientation: 'landscape'})}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${formData.orientation === 'landscape' ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      <Monitor size={18} />
                      <span className="text-[10px] font-bold">Landscape</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, orientation: 'portrait'})}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${formData.orientation === 'portrait' ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      <Smartphone size={18} />
                      <span className="text-[10px] font-bold">Portrait</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <LinkIcon className="text-rose-500" /> Source Media Assets
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Video Source Link (Direct MP4)</label>
                  <input 
                    required
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    placeholder="https://cdn.example.com/vault/video.mp4"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">High-Res Poster Frame (Thumbnail)</label>
                  <input 
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    placeholder="https://cdn.example.com/vault/cover.jpg"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Discovery Tags (Comma separated)</label>
                  <input 
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({...formData, tagsInput: e.target.value})}
                    placeholder="cinematic, 4k, exclusive, behind-the-scenes"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Professional Sidebar / Proofing */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> Professional Proofing
              </span>
              {formData.video_url && <span className="text-[10px] font-bold text-emerald-500 animate-pulse">Live Link Active</span>}
            </div>

            <div className={`relative bg-black transition-all duration-500 ${formData.orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video'}`}>
              {formData.video_url ? (
                <video 
                  key={formData.video_url}
                  src={formData.video_url} 
                  autoPlay muted loop 
                  className="w-full h-full object-cover"
                />
              ) : formData.thumbnail_url ? (
                <img src={formData.thumbnail_url} className="w-full h-full object-cover opacity-50" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-800">
                  <Play size={48} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Media Payload</span>
                </div>
              )}
              
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-black">
                {formData.resolution}
              </div>
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border border-white/10">
                {formData.durationString || '00:00'}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black leading-tight line-clamp-2">
                  {formData.title || 'Draft Title'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden ring-1 ring-white/10">
                    {selectedModel?.thumbnail && <img src={selectedModel.thumbnail} className="w-full h-full object-cover" />}
                  </div>
                  <span className="font-bold">{selectedModel?.name || 'Studio Member'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Ratio</div>
                  <div className="text-xs font-bold text-slate-300 capitalize">{formData.orientation}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Access</div>
                  <div className="text-xs font-bold text-rose-500 uppercase tracking-tighter">{formData.type}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/50 space-y-4">
                <button 
                  disabled={isSubmitting || !formData.video_url || !formData.modelId}
                  onClick={handleSubmit}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Globe size={20} />}
                  {isSubmitting ? 'Syncing...' : 'Push to Global Edge'}
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl space-y-3">
             <div className="flex items-center gap-2 text-emerald-500">
               <ShieldCheck size={18} />
               <h4 className="font-bold text-sm">Edge Verification</h4>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
               By publishing, you confirm that this content meets all legal compliance standards. Slugs are immutable and SEO-optimized automatically.
             </p>
          </div>

          {status === 'error' && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <div className="text-xs">
                <p className="font-bold">Registry Error</p>
                <p className="opacity-80">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}