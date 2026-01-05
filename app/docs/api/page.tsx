'use client';

import React, { useState } from 'react';
import { 
  Terminal, Code, Cpu, Database, Link as LinkIcon, Tag, Copy, 
  Check, Clock, Monitor, Smartphone, ShieldCheck, Zap, Users,
  CheckCircle2, AlertCircle, Search, ArrowRight
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

  const videoCurl = `curl -X POST https://provideo.com/api/v1/upload \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "4K Cinematic Forest Walk",
    "modelId": "riley-reid",
    "video_url": "https://cdn.example.com/vid.mp4",
    "resolution": "4K",
    "orientation": "landscape"
  }'`;

  const creatorCurl = `curl -X POST https://provideo.com/api/v1/models \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "slug": "jane-doe",
    "bio": "Cinematographer and lifestyle creator.",
    "thumbnail": "https://cdn.example.com/jane.jpg"
  }'`;

  const checkCurl = `curl https://provideo.com/api/v1/models/check?slug=jane-doe`;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12 animate-fade-in pb-32 px-4">
      <Breadcrumbs items={[{ label: 'Documentation', href: '/docs' }, { label: 'Developer API', href: '/docs/api' }]} />

      {/* Header Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
          <Terminal size={12} /> REST API v1.0
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Developer <span className="text-rose-500">Registry</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
            A high-fidelity programmatic interface for content managers. Sync your entire media vault to the edge with millisecond propagation.
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
        <div className="lg:col-span-7 space-y-16">
          
          {activeTab === 'videos' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Register Media</h2>
                    <p className="text-slate-400 text-sm">Onboard new assets to the global distribution network.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">POST</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/upload</code>
                   </div>
                   <div className="p-6">
                     <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-800">
                            <th className="pb-3 font-black uppercase tracking-widest">Field</th>
                            <th className="pb-3 font-black uppercase tracking-widest">Required</th>
                            <th className="pb-3 font-black uppercase tracking-widest">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          <tr className="border-b border-slate-800/50">
                            <td className="py-4 font-mono text-rose-400">title</td>
                            <td className="py-4 text-rose-500 font-bold">Yes</td>
                            <td className="py-4 italic">Display title for SEO.</td>
                          </tr>
                          <tr className="border-b border-slate-800/50">
                            <td className="py-4 font-mono text-rose-400">modelId</td>
                            <td className="py-4 text-rose-500 font-bold">Yes</td>
                            <td className="py-4">The slug of the creator profile.</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-mono text-rose-400">video_url</td>
                            <td className="py-4 text-rose-500 font-bold">Yes</td>
                            <td className="py-4">Public MP4 source link.</td>
                          </tr>
                        </tbody>
                     </table>
                   </div>
                </div>
              </section>

              <section className="bg-slate-900/50 border-l-4 border-rose-500 p-8 rounded-r-3xl space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-rose-500">
                  <ShieldCheck size={18} /> Pro Tip: Bulk Uploads
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Always use the <strong>Verification API</strong> before pushing video payloads to ensure the associated creator slug exists. This significantly reduces ingestion failures in automated pipelines.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Verification</h2>
                    <p className="text-slate-400 text-sm">Check if a creator is already in the edge registry.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded">GET</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/models/check</code>
                   </div>
                   <div className="p-6">
                      <p className="text-sm text-slate-400 mb-4">Query Parameter: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-400">slug</code> (required)</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="text-[10px] font-black text-emerald-500 mb-2 uppercase">Success Response (200)</div>
                          <pre className="text-[10px] text-slate-400 font-mono">{"{\n  \"exists\": true,\n  \"model\": { ... }\n}"}</pre>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="text-[10px] font-black text-slate-500 mb-2 uppercase">Missing Response (200)</div>
                          <pre className="text-[10px] text-slate-400 font-mono">{"{\n  \"exists\": false\n}"}</pre>
                        </div>
                      </div>
                   </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Onboarding</h2>
                    <p className="text-slate-400 text-sm">Programmatically create new creator identities.</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex items-center gap-3">
                     <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">POST</span>
                     <code className="text-rose-500 font-bold text-sm">/api/v1/models</code>
                   </div>
                   <div className="p-6 space-y-4">
                     <table className="w-full text-xs text-left">
                        <tbody className="text-slate-300">
                          <tr className="border-b border-slate-800/50">
                            <td className="py-4 font-mono text-rose-400">name</td>
                            <td className="py-4 font-bold text-rose-500 uppercase text-[9px]">Required</td>
                            <td className="py-4">Full display name.</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-mono text-rose-400">slug</td>
                            <td className="py-4 text-slate-500">Optional</td>
                            <td className="py-4">Unique URL identifier. Auto-generated if omitted.</td>
                          </tr>
                        </tbody>
                     </table>
                   </div>
                </div>
              </section>
            </div>
          )}

        </div>

        {/* Right Column: Interactive Playground/Examples */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <Code size={14} className="text-rose-500" /> CLI Snippets
               </span>
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                 <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                 <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
               </div>
            </div>

            <div className="p-8 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {activeTab === 'videos' ? 'Register Video' : 'Verify Slug'}
                  </h4>
                  <button 
                    onClick={() => copyToClipboard(activeTab === 'videos' ? videoCurl : checkCurl, 'curl-main')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                  >
                    {copied === 'curl-main' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="bg-black p-6 rounded-2xl border border-white/5 font-mono text-xs leading-relaxed overflow-x-auto">
                  <pre className="text-slate-300">
                    {activeTab === 'videos' ? videoCurl : checkCurl}
                  </pre>
                </div>
              </div>

              {activeTab === 'creators' && (
                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Create Profile</h4>
                    <button 
                      onClick={() => copyToClipboard(creatorCurl, 'curl-onboard')}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                    >
                      {copied === 'curl-onboard' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="bg-black p-6 rounded-2xl border border-white/5 font-mono text-xs leading-relaxed overflow-x-auto">
                    <pre className="text-slate-300">{creatorCurl}</pre>
                  </div>
                </div>
              )}

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <Database size={16} />
                  <span className="text-xs font-black uppercase">Edge Latency</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Registry operations are processed by Cloudflare Workers at the closest edge node. Median global propagation for D1 writes is under <span className="text-slate-300 font-bold">200ms</span>.
                </p>
                <div className="pt-2">
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[85%] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-3xl space-y-4">
            <h4 className="text-sm font-black flex items-center gap-2 text-blue-400">
              <AlertCircle size={18} /> Error Handling
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-[10px] text-slate-500">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span><strong className="text-slate-300">409 Conflict:</strong> Returned when a creator slug already exists in the registry.</span>
              </li>
              <li className="flex items-start gap-3 text-[10px] text-slate-500">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span><strong className="text-slate-300">404 Not Found:</strong> Returned during video upload if the provided <code className="text-rose-400 font-mono">modelId</code> is invalid.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}