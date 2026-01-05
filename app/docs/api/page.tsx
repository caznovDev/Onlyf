'use client';

import React from 'react';
import { Terminal, Code, Cpu, Database, Link as LinkIcon, Tag, Copy, Check, Clock, Monitor, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import Breadcrumbs from '../../../components/Breadcrumbs';

export const runtime = 'edge';

export default function ApiDocsPage() {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `curl -X POST https://provideo.com/api/v1/upload \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "4K Cinematic Forest Walk",
    "description": "A high-fidelity drone shot through the redwoods with immersive spatial audio.",
    "modelId": "riley-reid",
    "duration": 630,
    "type": "normal",
    "resolution": "4K",
    "orientation": "landscape",
    "tags": ["nature", "cinematic", "4k", "forest"],
    "video_url": "https://storage.provider.com/videos/nature_01.mp4",
    "thumbnail_url": "https://storage.provider.com/thumbs/nature_01.jpg"
  }'`;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-12 animate-fade-in pb-20">
      <Breadcrumbs items={[{ label: 'Documentation', href: '/docs' }, { label: 'Upload API', href: '/docs/api' }]} />

      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-widest border border-rose-500/20">
          <Terminal size={14} /> Edge Computing Reference
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
          Professional <span className="text-rose-500">Registry API</span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
          Programmatically register high-fidelity video assets. Our API handles SEO slugification, automated tagging, 
          and instant global propagation across the Cloudflare edge network.
        </p>
      </section>

      {/* Endpoint Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-500/10">POST</span>
            <code className="text-rose-500 font-mono font-bold text-lg tracking-tight">/api/v1/upload</code>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck size={14} className="text-emerald-500" /> Authorized Registry
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          <div className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Cpu size={22} className="text-rose-500" /> Technical Payload
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-500 border-b border-slate-800">
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Property</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Type</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">title</td>
                    <td className="py-4 px-6 text-slate-500">string</td>
                    <td className="py-4 px-6"><span className="text-rose-500 font-black text-[10px] uppercase">Required</span></td>
                    <td className="py-4 px-6 text-slate-300">Public video title. Auto-generates SEO slug.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">modelId</td>
                    <td className="py-4 px-6 text-slate-500">string</td>
                    <td className="py-4 px-6"><span className="text-rose-500 font-black text-[10px] uppercase">Required</span></td>
                    <td className="py-4 px-6 text-slate-300">The slug of the verified creator profile.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">video_url</td>
                    <td className="py-4 px-6 text-slate-500">url</td>
                    <td className="py-4 px-6"><span className="text-rose-500 font-black text-[10px] uppercase">Required</span></td>
                    <td className="py-4 px-6 text-slate-300">Direct source link to MP4/WebM content.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">duration</td>
                    <td className="py-4 px-6 text-slate-500">int</td>
                    <td className="py-4 px-6 text-slate-600">Optional</td>
                    <td className="py-4 px-6 text-slate-300 flex items-center gap-2"><Clock size={12} className="text-rose-500" /> Total seconds for UI display.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">resolution</td>
                    <td className="py-4 px-6 text-slate-500">enum</td>
                    <td className="py-4 px-6 text-slate-600">Optional</td>
                    <td className="py-4 px-6 text-slate-300">One of: <code className="text-xs bg-slate-800 px-1">4K</code>, <code className="text-xs bg-slate-800 px-1">1080p</code>, <code className="text-xs bg-slate-800 px-1">720p</code>.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">orientation</td>
                    <td className="py-4 px-6 text-slate-500">enum</td>
                    <td className="py-4 px-6 text-slate-600">Optional</td>
                    <td className="py-4 px-6 text-slate-300 flex items-center gap-2">
                      <Monitor size={12} className="text-slate-500" /> landscape or <Smartphone size={12} className="text-slate-500" /> portrait.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">type</td>
                    <td className="py-4 px-6 text-slate-500">enum</td>
                    <td className="py-4 px-6 text-slate-600">Optional</td>
                    <td className="py-4 px-6 text-slate-300"><code className="text-xs bg-slate-800 px-1">normal</code> or <code className="text-xs bg-rose-500/20 text-rose-500 px-1">onlyfans</code> (Exclusive).</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">tags</td>
                    <td className="py-4 px-6 text-slate-500">string[]</td>
                    <td className="py-4 px-6 text-slate-600">Optional</td>
                    <td className="py-4 px-6 text-slate-300 flex items-center gap-2"><Tag size={12} className="text-rose-500" /> Array of descriptive strings.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-3">
                <Code size={22} className="text-rose-500" /> Implementation Example
              </h3>
              <div className="bg-slate-800 px-3 py-1 rounded text-[10px] font-black text-slate-400 uppercase tracking-widest">
                cURL / JSON
              </div>
            </div>
            <div className="relative group">
              <button 
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-10"
              >
                {copied === 'curl' ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
              <div className="bg-slate-950 p-8 rounded-[2rem] border border-slate-800 overflow-x-auto font-mono text-sm leading-relaxed shadow-inner">
                <code className="block">
                  <span className="text-rose-500">curl</span> -X POST https://provideo.com/api/v1/upload \<br />
                  &nbsp;&nbsp;-H <span className="text-emerald-400">"Content-Type: application/json"</span> \<br />
                  &nbsp;&nbsp;-d <span className="text-blue-400">'{'{'}</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"title"</span>: <span className="text-emerald-400">"4K Cinematic Forest Walk"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"description"</span>: <span className="text-emerald-400">"A high-fidelity drone shot..."</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"modelId"</span>: <span className="text-emerald-400">"riley-reid"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"duration"</span>: <span className="text-amber-400">630</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"resolution"</span>: <span className="text-emerald-400">"4K"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"orientation"</span>: <span className="text-emerald-400">"landscape"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"video_url"</span>: <span className="text-emerald-400">"https://cdn.example.com/vid.mp4"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"tags"</span>: [<span className="text-emerald-400">"nature"</span>, <span className="text-emerald-400">"cinematic"</span>]<br />
                  &nbsp;&nbsp;<span className="text-blue-400">{'}'}'</span>
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/50 space-y-4 hover:border-rose-500/30 transition-all group">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
            <Zap size={24} />
          </div>
          <h4 className="text-lg font-black tracking-tight">Real-time Ingestion</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Registry updates are atomic and propagate to Cloudflare D1 instantly. Media is available for streaming across 300+ PoPs immediately after 201 Created.
          </p>
        </div>
        
        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/50 space-y-4 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-lg font-black tracking-tight">Automatic Compliance</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Payloads are validated against model registry records. Only verified creator slugs are accepted, ensuring content integrity and legal compliance.
          </p>
        </div>

        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/50 space-y-4 hover:border-blue-500/30 transition-all group">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <Database size={24} />
          </div>
          <h4 className="text-lg font-black tracking-tight">Smart Discovery</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Missing tags provided in the payload are automatically created and indexed. Slugs are assigned unique hashes to prevent SEO collisions.
          </p>
        </div>
      </div>
    </div>
  );
}