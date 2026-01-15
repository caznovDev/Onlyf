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

  const videoPatchCurl = `curl -X PATCH https://onlyfree007.pages.dev/api/v1/video/4k-cinematic-forest-walk \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Updated: 4K Forest Walk (Final Cut)",
    "is_published": 1,
    "resolution": "4K"
  }'`;

  const videoCheckCurl = `curl https://onlyfree007.pages.dev/api/v1/videos/check?slug=4k-cinematic-forest-walk`;

  const creatorCreateCurl = `curl -X POST https://onlyfree007.pages.dev/api/v1/models \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "slug": "jane-doe",
    "bio": "Cinematographer and digital artist specializing in 4K outdoor aesthetics.",
    "thumbnail": "https://cdn.example.com/portraits/jane-doe.jpg"
  }'`;

  const creatorCheckCurl = `curl https://onlyfree007.pages.dev/api/v1/models/check?slug=jane-doe`;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12 animate-fade-in pb-32 px-4">
      <Breadcrumbs items={[{ label: 'Documentation', href: '/docs' }, { label: 'Developer API', href: '/docs/api' }]} />

      {/* Header Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
          <Terminal size={12} /> REST API v1.1 (Stable)
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Developer <span className="text-rose-500">Registry</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
            A high-fidelity programmatic interface for global content distribution. Built for massive ingestion pipelines and millisecond edge propagation.
          </p>
        </div>
      </section>

      {/* API Selector Tabs */}
      <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'videos' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Zap size={16} /> Video Operations
        </button>
        <button 
          onClick={() => setActiveTab('creators')}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'creators' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Users size={16} /> Creator Operations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Documentation Content */}
        <div className="lg:col-span-7 space-y-20">
          
          {activeTab === 'videos' ? (
            <div className="space-y-20 animate-in fade-in slide-in-from-left-4 duration-500">
              
              {/* 1. Video Verification */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">1. Verification</h2>
                    <p className="text-slate-400 text-sm">Check if a video slug is registered before ingestion.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded">GET</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/videos/check</code>
                   </div>
                   <div className="p-6">
                      <p className="text-sm text-slate-400 mb-4">Parameter: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-400">slug</code> (required)</p>
                   </div>
                </div>
              </section>

              {/* 2. Video Registration */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">2. Registration</h2>
                    <p className="text-slate-400 text-sm">Register new media assets with full technical specs.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">POST</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/upload</code>
                   </div>
                   <div className="p-6 overflow-x-auto">
                     <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-800">
                            <th className="pb-3 font-black uppercase tracking-widest">Field</th>
                            <th className="pb-3 font-black uppercase tracking-widest">Type</th>
                            <th className="pb-3 font-black uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-800/50">
                          <tr><td className="py-4 font-mono text-rose-400 font-bold">title</td><td className="py-4 text-slate-500">string</td><td className="py-4 text-rose-500 font-bold uppercase">Req</td></tr>
                          <tr><td className="py-4 font-mono text-rose-400 font-bold">modelId</td><td className="py-4 text-slate-500">string</td><td className="py-4 text-rose-500 font-bold uppercase">Req</td></tr>
                          <tr><td className="py-4 font-mono text-rose-400 font-bold">video_url</td><td className="py-4 text-slate-500">url</td><td className="py-4 text-rose-500 font-bold uppercase">Req</td></tr>
                        </tbody>
                     </table>
                   </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-20 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* 1. Creator Verification */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">1. Identity Check</h2>
                    <p className="text-slate-400 text-sm">Verify if a creator exists in the global edge registry.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded">GET</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/models/check</code>
                   </div>
                   <div className="p-6">
                      <p className="text-sm text-slate-400">Parameter: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-400">slug</code></p>
                   </div>
                </div>
              </section>

              {/* 2. Creator Registration */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">2. Onboarding</h2>
                    <p className="text-slate-400 text-sm">Initialize a new creator profile for content distribution.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">POST</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/models</code>
                   </div>
                   <div className="p-6 overflow-x-auto">
                     <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-800">
                            <th className="pb-3 font-black uppercase tracking-widest">Field</th>
                            <th className="pb-3 font-black uppercase tracking-widest">Type</th>
                            <th className="pb-3 font-black uppercase tracking-widest">Requirement</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-800/50">
                          <tr>
                            <td className="py-4 font-mono text-rose-400 font-bold">name</td>
                            <td className="py-4 text-slate-500">string</td>
                            <td className="py-4 text-rose-500 font-bold uppercase">Required</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-mono text-rose-400">slug</td>
                            <td className="py-4 text-slate-500">string</td>
                            <td className="py-4 text-slate-500 uppercase font-bold">Optional</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-mono text-rose-400">bio</td>
                            <td className="py-4 text-slate-500">text</td>
                            <td className="py-4 text-slate-500 uppercase font-bold">Optional</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-mono text-rose-400">thumbnail</td>
                            <td className="py-4 text-slate-500">url</td>
                            <td className="py-4 text-slate-500 uppercase font-bold">Optional</td>
                          </tr>
                        </tbody>
                     </table>
                   </div>
                </div>
              </section>
            </div>
          )}

        </div>

        {/* Right Column: Code Snippets */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <Code size={14} className="text-rose-500" /> API Examples
               </span>
            </div>

            <div className="p-8 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {activeTab === 'videos' ? 'Register Video' : 'Register Creator'}
                  </h4>
                  <button 
                    onClick={() => copyToClipboard(activeTab === 'videos' ? videoRegisterCurl : creatorCreateCurl, 'curl-primary')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                  >
                    {copied === 'curl-primary' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="bg-black p-6 rounded-2xl border border-white/5 font-mono text-[10px] leading-relaxed overflow-x-auto">
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {activeTab === 'videos' ? videoRegisterCurl : creatorCreateCurl}
                  </pre>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-800/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {activeTab === 'videos' ? 'Check Status' : 'Verify Slug'}
                  </h4>
                  <button 
                    onClick={() => copyToClipboard(activeTab === 'videos' ? videoCheckCurl : creatorCheckCurl, 'curl-secondary')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                  >
                    {copied === 'curl-secondary' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="bg-black p-6 rounded-2xl border border-white/5 font-mono text-[10px] leading-relaxed overflow-x-auto">
                  <pre className="text-slate-300">{activeTab === 'videos' ? videoCheckCurl : creatorCheckCurl}</pre>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <Database size={16} />
                  <span className="text-xs font-black uppercase">Edge Policy</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Registry updates are propagated to global edge locations within <span className="text-slate-300 font-bold">150ms</span>. Slugs are used as primary keys for CDN caching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
