'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Save, X, Globe, Camera, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../../../components/Breadcrumbs';

export const runtime = 'edge';

export default function ManageModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    thumbnail: ''
  });

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/models');
      if (res.ok) setModels(await res.json());
    } catch (e) {}
    setIsLoading(false);
  };

  useEffect(() => { fetchModels(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id?: string) => {
    setIsSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/v1/models', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { ...formData, id } : formData)
      });

      if (res.ok) {
        setStatus('success');
        setEditingId(null);
        setShowAddForm(false);
        setFormData({ name: '', slug: '', bio: '', thumbnail: '' });
        await fetchModels();
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save creator');
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (model: any) => {
    setEditingId(model.id);
    setFormData({
      name: model.name,
      slug: model.slug,
      bio: model.bio,
      thumbnail: model.thumbnail
    });
    setShowAddForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Creators', href: '/models' }, { label: 'Management', href: '/models/manage' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Users className="text-rose-500" /> Creator Management
          </h1>
          <p className="text-slate-400">Add and update creator profiles and their metadata.</p>
        </div>
        {!showAddForm && !editingId && (
          <button 
            onClick={() => { setShowAddForm(true); setFormData({ name: '', slug: '', bio: '', thumbnail: '' }); }}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
          >
            <Plus size={20} /> Add New Creator
          </button>
        )}
      </div>

      {(showAddForm || editingId) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {editingId ? <Edit2 size={24} className="text-rose-500" /> : <Plus size={24} className="text-rose-500" />}
              {editingId ? 'Edit Creator Profile' : 'Register New Creator'}
            </h2>
            <button onClick={() => { setEditingId(null); setShowAddForm(false); }} className="text-slate-500 hover:text-white p-2">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Globe size={12} /> Full Name & Identity
                </label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Riley Reid"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  URL Slug (Optional)
                </label>
                <input 
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="riley-reid"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Camera size={12} /> Avatar/Thumbnail URL
                </label>
                <input 
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <FileText size={12} /> Biography
                </label>
                <textarea 
                  name="bio"
                  rows={8}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write a brief bio about the creator..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  disabled={isSaving}
                  onClick={() => handleSave(editingId || undefined)}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-500/10 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  {isSaving ? 'Saving Changes...' : editingId ? 'Update Profile' : 'Create Creator'}
                </button>
                <button 
                  onClick={() => { setEditingId(null); setShowAddForm(false); }}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 />
              <p className="font-bold">Creator profile saved successfully.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle />
              <p className="font-bold">{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="font-bold">Existing Creators ({models.length})</h3>
        </div>
        
        {isLoading ? (
          <div className="p-20 flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading registry...</p>
          </div>
        ) : models.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Creator</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Videos</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {models.map(model => (
                  <tr key={model.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={model.thumbnail} className="w-10 h-10 rounded-full object-cover border border-slate-700" alt="" />
                        <span className="font-bold text-sm">{model.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">/{model.slug}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {model.videos_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => startEdit(model)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Edit Profile"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-500">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No creators registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}