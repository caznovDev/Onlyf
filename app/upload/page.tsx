'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileVideo, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function UploadPage() {
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modelId: '',
    type: 'normal',
    selectedTags: [] as string[],
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
  });

  useEffect(() => {
    // Fetch models and tags for the selectors
    const fetchData = async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          fetch('/api/v1/search?q=a'), // Generic search to get some models
          fetch('/api/v1/videos') // Just to trigger a potential list if we had a dedicated endpoint
        ]);
        // In a real app, you'd have dedicated /api/v1/models and /api/v1/tags GET endpoints
        // For now, we'll assume the search API returns enough models
        const mData = await mRes.json();
        setModels(mData.models || []);
        
        // Mocking tags for the UI if not available from API
        setTags([
          { id: 't1', name: '4K' },
          { id: 't2', name: 'Exclusive' },
          { id: 't3', name: 'Cinematic' },
          { id: 't4', name: 'Behind the Scenes' }
        ]);
      } catch (e) {}
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, [`${type}File`]: file }));
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoFile || !formData.title || !formData.modelId) {
      setErrorMessage('Please fill in all required fields and upload a video.');
      return;
    }

    setIsUploading(true);
    setStatus('idle');
    setProgress(10);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('modelId', formData.modelId);
    payload.append('type', formData.type);
    payload.append('tags', JSON.stringify(formData.selectedTags));
    if (formData.videoFile) payload.append('video', formData.videoFile);
    if (formData.thumbnailFile) payload.append('thumbnail', formData.thumbnailFile);

    try {
      // Simulate progress for UX
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : p));
      }, 500);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: payload,
      });

      clearInterval(interval);
      setProgress(100);

      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/'), 2000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Upload', href: '/upload' }]} />

      <div className="space-y-2">
        <h1 className="text-4xl font-black flex items-center gap-3">
          <Upload className="text-rose-500" /> Creator Studio
        </h1>
        <p className="text-slate-400">Publish your high-quality content to the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold border-l-4 border-rose-500 pl-3">Video Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Cinematic Sunset Session"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell your viewers about this video..."
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Creator</option>
                    {models.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="normal">Standard (Free)</option>
                    <option value="onlyfans">Exclusive (Locked)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        formData.selectedTags.includes(t.id) 
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
          {/* Video Upload Zone */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold border-l-4 border-rose-500 pl-3">Media</h2>
            
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-rose-500 transition-colors flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden group">
                <input 
                  type="file" 
                  accept="video/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileChange(e, 'video')}
                />
                {formData.videoFile ? (
                  <div className="space-y-2">
                    <FileVideo size={32} className="text-rose-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-300 truncate max-w-[150px]">{formData.videoFile.name}</p>
                    <p className="text-[10px] text-slate-500">Click to change video</p>
                  </div>
                ) : (
                  <>
                    <FileVideo size={32} className="text-slate-700 group-hover:text-rose-500 transition-colors" />
                    <p className="text-xs font-bold text-slate-500 mt-2">Drop video here</p>
                    <p className="text-[10px] text-slate-600">MP4, MOV, WEBM</p>
                  </>
                )}
              </div>

              <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-rose-500 transition-colors flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                />
                {formData.thumbnailFile ? (
                  <div className="absolute inset-0">
                    <img src={URL.createObjectURL(formData.thumbnailFile)} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-bold">Change Thumbnail</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} className="text-slate-700 group-hover:text-rose-500 transition-colors" />
                    <p className="text-xs font-bold text-slate-500 mt-2">Cover Image</p>
                    <p className="text-[10px] text-slate-600">JPG, PNG (16:9)</p>
                  </>
                )}
              </div>
            </div>

            <button 
              disabled={isUploading}
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-500/10 flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              {isUploading ? `Uploading ${progress}%` : 'Publish Video'}
            </button>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 />
              <div>
                <p className="font-bold">Published!</p>
                <p className="text-xs">Your video is now live on the platform.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle />
              <div>
                <p className="font-bold">Error Occurred</p>
                <p className="text-xs">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}