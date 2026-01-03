'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Search, Users, Menu, X } from 'lucide-react';
import { SITE_NAME } from '../constants';

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{videos: any[], models: any[]}>({videos: [], models: []});
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({videos: [], models: []});
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch (e) {}
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Play size={18} fill="white" className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase hidden xs:inline">{SITE_NAME}</span>
        </Link>
        
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
            onFocus={() => setIsSearching(true)}
            placeholder="Search..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 px-5 pl-10 text-sm focus:border-rose-500 transition-all outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
          
          {isSearching && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[60]">
              {searchResults.models.length > 0 && (
                <div className="p-2 bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">Creators</div>
              )}
              {searchResults.models.map(m => (
                <div key={m.slug} onClick={() => {router.push(`/models/${m.slug}`); setIsSearching(false); setSearchQuery('');}} className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3">
                  <img src={m.thumbnail} className="w-8 h-8 rounded-full object-cover" alt="" /> <span className="text-sm">{m.name}</span>
                </div>
              ))}
              {searchResults.videos.length > 0 && (
                <div className="p-2 bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 border-t border-slate-700">Videos</div>
              )}
              {searchResults.videos.map(v => (
                <div key={v.slug} onClick={() => {router.push(`/video/${v.slug}`); setIsSearching(false); setSearchQuery('');}} className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3">
                  <img src={v.thumbnail} className="w-12 h-8 rounded object-cover" alt="" />
                  <span className="text-sm line-clamp-1">{v.title}</span>
                </div>
              ))}
              {searchResults.videos.length === 0 && searchResults.models.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">No results found</div>
              )}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/models" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <Users size={18} /> Creators
          </Link>
        </nav>

        <button 
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 animate-in slide-in-from-top duration-200">
          <Link 
            href="/models" 
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-900 transition-colors font-bold"
            onClick={() => setIsMenuOpen(false)}
          >
            <Users className="text-rose-500" size={20} /> Creators
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;