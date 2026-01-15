'use client';

import React, { useState } from 'react';
import { 
  Terminal, Code, Cpu, Database, Link as LinkIcon, Tag, Copy, 
  Check, Clock, Monitor, Smartphone, ShieldCheck, Zap, Users,
  CheckCircle2, AlertCircle, Search, ArrowRight, Image as ImageIcon,
  Edit3, Play, UserPlus
} from 'lucide-react';
import Breadcrumbs from '../../../components/Breadcrumbs';

export const runtime = 'edge';

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'creators'>('videos');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const videoRegisterCurl = `curl -X POST https://onlyfree007.pages.dev/api/v1/upload \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "4K Cinematic Forest Walk",
    "description": "High-fidelity drone footage...",
    "modelId": "riley-reid",
    "video_url": "https://cdn.example.com/vid.mp4",
    "thumbnail_url": "https://cdn.example.com/thumb.jpg",
    "duration": 630,
    "resolution": "4K",
    "orientation": "landscape",
    "type": "normal",
    "tags": ["nature", "4k"]
  }'`;

  const creatorCreateCurl = `curl -X POST https://onlyfree007.pages.dev/api/v1/models \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "slug": "jane-doe",
    "bio": "Cinematographer and digital artist specializing in 4K outdoor aesthetics.",
    "thumbnail": "https://cdn.example.com/portraits/jane-doe.jpg"
  }'`;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12 animate-fade-in pb-32 px-4">
      <Breadcrumbs items={[{ label: 'Documentation', href: '/docs' }, { label: 'Developer API', href: '/docs/api' }]} />

      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
          <Terminal size={12} /> REST API v1.2 (Latest)
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Developer <span className="text-rose-500">Registry</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
            High-fidelity programmatic interface. Optimized for automated migrations and massive ingestion pipelines.
          </p>
        </div>
      </section>

      <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('videos')} className={`px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 ${activeTab === 'videos' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}><Zap size={16} /> Videos</button>
        <button onClick={() => setActiveTab('creators')} className={`px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 ${activeTab === 'creators' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}><Users size={16} /> Creators</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-20">
          {activeTab === 'videos' ? (
            <section className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">Video Ingestion</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
                <p className="text-sm text-slate-400">The <code className="text-rose-400">modelId</code> field is polymorphic: it accepts either the creator's <span className="text-white font-bold">Internal UUID</span> or their <span className="text-white font-bold">Unique Slug</span>.</p>
                <div className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-xs text-rose-500">POST /api/v1/upload</div>
              </div>
              <table className="w-full text-[11px] text-left">
                <thead className="text-slate-500 border-b border-slate-800">
                  <tr><th className="py-2">Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody className="text-slate-300 divide-y divide-slate-800/50">
                  <tr><td className="py-4 font-bold">modelId</td><td>string</td><td>UUID or slug of the creator.</td></tr>
                  <tr><td className="py-4 font-bold">video_url</td><td>url</td><td>Direct MP4 link.</td></tr>
                </tbody>
              </table>
            </section>
          ) : (
            <section className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">Creator Profiles</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
                <p className="text-sm text-slate-400">Register new identities at the edge.</p>
                <div className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-xs text-rose-500">POST /api/v1/models</div>
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">CURL Example</span>
            </div>
            <div className="p-8">
              <pre className="text-slate-300 text-[10px] whitespace-pre-wrap font-mono bg-black p-4 rounded-xl border border-white/5">
                {activeTab === 'videos' ? videoRegisterCurl : creatorCreateCurl}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}