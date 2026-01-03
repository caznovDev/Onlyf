'use client';

import React from 'react';
import { Terminal, Code, Cpu, Database, Link as LinkIcon, Tag, Copy, Check } from 'lucide-react';
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
    "description": "A high-fidelity drone shot through the redwoods.",
    "modelId": "riley-reid",
    "type": "normal",
    "tags": ["nature", "4k", "cinematic"],
    "video_url": "https://storage.provider.com/videos/nature_01.mp4",
    "preview_url": "https://storage.provider.com/previews/nature_01.mp4",
    "thumbnail_url": "https://storage.provider.com/thumbs/nature_01.jpg"
  }'`;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Documentation', href: '/docs' }, { label: 'Upload API', href: '/docs/api' }]} />

      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-widest">
          <Terminal size={14} /> Developer Reference
        </div>
        <h1 className="text-5xl font-black tracking-tighter">API Upload Guide</h1>
        <p className="text-xl text-slate-400 leading-relaxed">
          The ProVideo API allows creators to programmatically register high-quality video content using direct media links. 
          No heavy file uploads are required; simply provide the public URLs.
        </p>
      </section>

      {/* Endpoint Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-md">POST</span>
            <code className="text-rose-500 font-bold">/api/v1/upload</code>
          </div>
          <span className="text-xs text-slate-500 font-mono">Content-Type: application/json</span>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Cpu size={20} className="text-rose-500" /> Request Body Parameters
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-3 px-2">Field</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Required</th>
                    <th className="py-3 px-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="py-4 px-2 font-mono text-rose-400">title</td>
                    <td className="py-4 px-2 text-slate-400">string</td>
                    <td className="py-4 px-2 text-rose-500 font-bold">Yes</td>
                    <td className="py-4 px-2 text-slate-300">The public title of the video.</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-2 font-mono text-rose-400">modelId</td>
                    <td className="py-4 px-2 text-slate-400">string</td>
                    <td className="py-4 px-2 text-rose-500 font-bold">Yes</td>
                    <td className="py-4 px-2 text-slate-300">The slug of the creator (e.g., "riley-reid").</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-2 font-mono text-rose-400">video_url</td>
                    <td className="py-4 px-2 text-slate-400">string (url)</td>
                    <td className="py-4 px-2 text-rose-500 font-bold">Yes</td>
                    <td className="py-4 px-2 text-slate-300">Direct public link to the MP4/MOV file.</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-2 font-mono text-rose-400">tags</td>
                    <td className="py-4 px-2 text-slate-400">string[]</td>
                    <td className="py-4 px-2 text-slate-500">No</td>
                    <td className="py-4 px-2 text-slate-300">Array of tag names. New tags are created automatically.</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-2 font-mono text-rose-400">type</td>
                    <td className="py-4 px-2 text-slate-400">enum</td>
                    <td className="py-4 px-2 text-slate-500">No</td>
                    <td className="py-4 px-2 text-slate-300">"normal" or "onlyfans". Defaults to "normal".</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Code size={20} className="text-rose-500" /> Implementation Example
            </h3>
            <div className="relative group">
              <button 
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                {copied === 'curl' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
              <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto font-mono text-sm leading-relaxed text-slate-300">
                <code className="block">
                  <span className="text-rose-500">curl</span> -X POST https://provideo.com/api/v1/upload \<br />
                  &nbsp;&nbsp;-H <span className="text-emerald-400">"Content-Type: application/json"</span> \<br />
                  &nbsp;&nbsp;-d <span className="text-blue-400">'{'{'}</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"title"</span>: <span className="text-emerald-400">"4K Cinematic Forest Walk"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"modelId"</span>: <span className="text-emerald-400">"riley-reid"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">"video_url"</span>: <span className="text-emerald-400">"https://cdn.example.com/vid.mp4"</span><br />
                  &nbsp;&nbsp;<span className="text-blue-400">{'}'}'</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
            <Tag size={20} />
          </div>
          <h4 className="font-bold">Smart Tagging</h4>
          <p className="text-xs text-slate-400">Missing tags are generated instantly based on your payload strings. Slugs are auto-generated for SEO.</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
            <LinkIcon size={20} />
          </div>
          <h4 className="font-bold">Immutable Slugs</h4>
          <p className="text-xs text-slate-400">Every submission generates a URL-safe slug with a unique hash to prevent collisions and ensure link stability.</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
            <Database size={20} />
          </div>
          <h4 className="font-bold">Instant Sync</h4>
          <p className="text-xs text-slate-400">Metadata is updated in Cloudflare D1 in real-time, making content available across all edge nodes instantly.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Ready to integrate?</h3>
          <p className="text-slate-400 text-sm">Contact support for high-volume API keys or dedicated ingest nodes.</p>
        </div>
        <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
          Contact Dev Team
        </button>
      </div>
    </div>
  );
}