import React from 'react';
import type { Metadata } from 'next';
import { Home, AlertTriangle } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: '404 - Page Not Found | FreeOF',
  description: 'The requested page could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">404 - Page Not Found</h1>
      <p className="text-slate-400 max-w-md mb-8">
        The page or video you are looking for does not exist or has been removed.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
      >
        <Home size={18} /> Back to Homepage
      </a>
    </div>
  );
}
