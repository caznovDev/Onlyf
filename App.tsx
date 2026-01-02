
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Play, Search, Menu, User, TrendingUp, Tags as TagIcon, Shield, Mail, X, ChevronRight, Users, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { MOCK_VIDEOS, MOCK_MODELS, MOCK_TAGS, SITE_NAME } from './constants';
import VideoCard from './components/VideoCard';
import Breadcrumbs from './components/Breadcrumbs';
import { Video, Model } from './types';

const ITEMS_PER_PAGE = 8;

// --- Reusable Pagination Component ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) { if (!pages.includes(i)) pages.push(i); }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-12 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-surface border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors text-slate-300"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 text-slate-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                  currentPage === page
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-surface border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-surface border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors text-slate-300"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

// --- Page Components ---
const HomePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS.slice(0, ITEMS_PER_PAGE));
  const [totalPages, setTotalPages] = useState(Math.ceil(MOCK_VIDEOS.length / ITEMS_PER_PAGE));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/videos?page=${page}&limit=${ITEMS_PER_PAGE}`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (e) {
        // Fallback to mocks if API fails
        setVideos(MOCK_VIDEOS.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-primary" /> Popular Videos
        </h2>
        {loading && <Loader2 className="animate-spin text-primary" size={20} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} onNavigate={(p) => navigate(p)} />
        ))}
      </div>
      
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

const VideoDetail = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const slug = pathname.split('/').pop();
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/v1/video/${slug}`);
        if (res.ok) setVideo(await res.json());
        else setVideo(MOCK_VIDEOS.find(v => v.slug === slug) || MOCK_VIDEOS[0]);
      } catch (e) {
        setVideo(MOCK_VIDEOS.find(v => v.slug === slug) || MOCK_VIDEOS[0]);
      }
    };
    fetchVideo();
  }, [slug]);

  if (!video) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Videos', href: '/' }, { label: video.title, href: `/video/${video.slug}` }]} onNavigate={(p) => navigate(p)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative group">
             <video src={video.hoverPreviewUrl} controls className="w-full h-full object-contain" poster={video.thumbnail} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">{video.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <button onClick={() => navigate(`/models/${video.model.slug}`)} className="flex items-center gap-2 hover:text-primary transition-colors group">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary">
                  <img src={video.model.thumbnail} alt={video.model.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold text-base">{video.model.name}</span>
              </button>
              <div className="h-4 w-[1px] bg-slate-800 mx-2" />
              <div className="text-slate-400">{video.views.toLocaleString()} views</div>
            </div>
            <div className="bg-surface/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">About this video</h2>
              <p className="text-slate-300 leading-relaxed">{video.description}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Recommended</h3>
          <div className="space-y-4">
            {MOCK_VIDEOS.slice(0, 6).map(v => (
              <div key={v.id} className="flex gap-3 group cursor-pointer" onClick={() => navigate(`/video/${v.slug}`)}>
                <div className="w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{v.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModelListingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Models', href: '/models' }]} onNavigate={(p) => navigate(p)} />
      <h1 className="text-4xl font-bold flex items-center gap-3"><Users className="text-primary" /> Creators</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {MOCK_MODELS.map(model => (
          <div key={model.id} onClick={() => navigate(`/models/${model.slug}`)} className="group cursor-pointer space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
              <img src={model.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 bg-primary/90 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{model.videosCount} Videos</div>
            </div>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{model.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{videos: any[], models: any[]}>({videos: [], models: []});
  const searchRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Play size={18} fill="white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase hidden sm:inline">{SITE_NAME}</span>
          </div>
          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
              onFocus={() => setIsSearching(true)}
              placeholder="Search premium videos..." 
              className="w-full bg-surface border border-slate-700 rounded-full py-2 px-5 pl-12 text-sm focus:border-primary transition-all"
            />
            <Search className="absolute left-4 top-2.5 text-slate-500" size={18} />
            {isSearching && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[60]">
                {searchResults.models.map(m => (
                  <div key={m.slug} onClick={() => {navigate(`/models/${m.slug}`); setIsSearching(false);}} className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3">
                    <img src={m.thumbnail} className="w-8 h-8 rounded-full" /> <span>{m.name}</span>
                  </div>
                ))}
                {searchResults.videos.map(v => (
                  <div key={v.slug} onClick={() => {navigate(`/video/${v.slug}`); setIsSearching(false);}} className="p-3 hover:bg-white/5 cursor-pointer border-t border-slate-800/50">
                    {v.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="hidden sm:flex items-center gap-2 bg-primary px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <User size={16} /> SIGN IN
          </button>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-surface border-t border-slate-800 mt-20 py-12 text-center text-xs text-slate-600">
        © 2024 {SITE_NAME} Platform. 18+ Mandatory verification for all content.
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:slug" element={<VideoDetail />} />
        <Route path="/models" element={<ModelListingPage />} />
        {/* Placeholder routes for simplicity */}
        <Route path="/models/:slug" element={<HomePage />} />
        <Route path="/tags/:slug" element={<HomePage />} />
      </Routes>
    </Layout>
  </Router>
);

export default App;
