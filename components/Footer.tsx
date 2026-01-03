import React from 'react';
import { Play, Settings } from 'lucide-react';
import Link from 'next/link';
import { SITE_NAME } from '../constants';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-20 py-12 text-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
              <Play size={14} fill="white" className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">{SITE_NAME}</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md">The world's leading professional video platform. High-quality 4K cinematic content from the world's top creators.</p>
          
          <div className="flex items-center gap-4 mt-2">
            <Link href="/models/manage" className="text-[10px] text-slate-600 hover:text-rose-500 flex items-center gap-1 transition-colors uppercase tracking-widest font-bold">
              <Settings size={10} /> Model Registry
            </Link>
            <Link href="/upload" className="text-[10px] text-slate-600 hover:text-rose-500 flex items-center gap-1 transition-colors uppercase tracking-widest font-bold">
              <Settings size={10} /> Video Studio
            </Link>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 space-y-2">
          <p>© 2024 {SITE_NAME} Platform. All Rights Reserved.</p>
          <p className="font-bold text-slate-500 uppercase tracking-widest">18+ | Mandatory age verification for all participants and viewers.</p>
          <p className="max-w-2xl mx-auto">All individuals appearing in photos and videos on this site were at least 18 years of age at the time of photography or filming. Compliance with 18 U.S.C. § 2257 is strictly maintained.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;