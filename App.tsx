
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Play, Search, Menu, User, TrendingUp, Tags as TagIcon, Shield, Mail, X, ChevronRight, Users, ArrowRight, ChevronLeft } from 'lucide-react';
import { MOCK_VIDEOS, MOCK_MODELS, MOCK_TAGS, SITE_NAME } from './constants';
import VideoCard from './components/VideoCard';
import Breadcrumbs from './components/Breadcrumbs';

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
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
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
        aria-label="Previous page"
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
        aria-label="Next page"
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
  const totalPages = Math.ceil(MOCK_VIDEOS.length / ITEMS_PER_PAGE);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginatedVideos = MOCK_VIDEOS.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-primary" /> Popular Videos
        </h2>
        <div className="flex gap-2 text-slate-300 overflow-x-auto pb-2 sm:pb-0">
          {['Recent', 'Most Viewed', 'Top Rated'].map(f => (
            <button key={f} className="text-xs whitespace-nowrap bg-surface hover:bg-surface-hover px-3 py-1.5 rounded-lg border border-slate-800 transition-colors">
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
        {paginatedVideos.map(video => (
          <VideoCard key={video.id} video={video} onNavigate={(p) => navigate(p)} />
        ))}
      </div>
      
      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
};

const ModelListingPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(MOCK_MODELS.length / ITEMS_PER_PAGE);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginatedModels = MOCK_MODELS.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in">
      <Breadcrumbs 
        items={[{ label: 'Models', href: '/models' }]} 
        onNavigate={(p) => navigate(p)}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Users className="text-primary" /> Discover Creators
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Explore our curated selection of professional models and creators. From cinematic performances to exclusive behind-the-scenes content.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs bg-primary px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20">All Models</button>
          <button className="text-xs bg-surface hover:bg-surface-hover px-4 py-2 rounded-lg border border-slate-800 transition-colors text-slate-300">A-Z List</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 min-h-[400px]">
        {paginatedModels.map(model => (
          <div 
            key={model.id}
            onClick={() => navigate(`/models/${model.slug}`)}
            className="group cursor-pointer space-y-4"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
              <img 
                src={model.thumbnail} 
                alt={model.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4">
                 <div className="bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block">
                   {model.videosCount} Videos
                 </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{model.name}</h3>
                <p className="text-xs text-slate-500 truncate max-w-[180px]">{model.bio}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface border border-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform text-slate-300 group-hover:text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
};

const VideoDetail = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const slug = pathname.split('/').pop();
  const video = MOCK_VIDEOS.find(v => v.slug === slug) || MOCK_VIDEOS[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs 
        items={[
          { label: 'Videos', href: '/' },
          { label: video.title, href: `/video/${video.slug}` }
        ]} 
        onNavigate={(p) => navigate(p)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative group">
             <video 
              src={video.hoverPreviewUrl} 
              controls 
              className="w-full h-full object-contain"
              poster={video.thumbnail}
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">{video.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <button 
                onClick={() => navigate(`/models/${video.model.slug}`)}
                className="flex items-center gap-2 hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary shadow-xl">
                  <img src={video.model.thumbnail} alt={video.model.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold text-base">{video.model.name}</span>
              </button>
              <div className="h-4 w-[1px] bg-slate-800 mx-2" />
              <div className="text-slate-400">Published {new Date(video.createdAt).toLocaleDateString()}</div>
              <div className="text-slate-400">{video.views.toLocaleString()} views</div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {video.tags.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => navigate(`/tags/${tag.slug}`)}
                  className="bg-surface hover:bg-surface-hover px-3 py-1.5 rounded-full text-xs text-slate-300 border border-slate-800 transition-all hover:border-primary/40"
                >
                  #{tag.name}
                </button>
              ))}
            </div>

            <div className="bg-surface/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">About this video</h2>
              <div className="text-slate-300 leading-relaxed prose prose-invert max-w-none">
                <p>{video.description}</p>
                <p className="text-slate-500 text-sm italic">This description is optimized for indexing and user relevance. 4K high-definition video produced with professional equipment.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Recommended
          </h3>
          <div className="space-y-4">
            {MOCK_VIDEOS.slice(0, 6).map(v => (
              <div 
                key={v.id} 
                className="flex gap-3 group cursor-pointer"
                onClick={() => navigate(`/video/${v.slug}`)}
              >
                <div className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
                  <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1 rounded">5:30</div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {v.title}
                  </h4>
                  <p className="text-xs text-slate-500">{v.model.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModelDetail = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const slug = pathname.split('/').pop();
  const model = MOCK_MODELS.find(m => m.slug === slug) || MOCK_MODELS[0];
  const [page, setPage] = useState(1);

  const modelVideos = MOCK_VIDEOS.filter(v => v.model.slug === model.slug);
  const totalPages = Math.ceil(modelVideos.length / ITEMS_PER_PAGE);
  const paginatedVideos = modelVideos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const element = document.getElementById('model-videos-start');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Breadcrumbs 
        items={[
          { label: 'Models', href: '/models' },
          { label: model.name, href: `/models/${model.slug}` }
        ]} 
        onNavigate={(p) => navigate(p)}
      />

      <div className="flex flex-col md:flex-row gap-8 items-start bg-surface/30 p-8 rounded-3xl border border-slate-800">
        <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-surface shadow-2xl flex-shrink-0">
          <img src={model.thumbnail} alt={model.name} className="w-full h-full object-cover" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{model.name}</h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">{model.bio}</p>
          <div className="flex gap-4">
            <div className="bg-surface px-4 py-2 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Videos</div>
              <div className="text-xl font-bold">{model.videosCount}</div>
            </div>
            <div className="bg-surface px-4 py-2 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Followers</div>
              <div className="text-xl font-bold">128K</div>
            </div>
          </div>
        </div>
      </div>

      <div id="model-videos-start" className="pt-8">
        <h2 className="text-2xl font-bold mb-6">Latest from {model.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedVideos.map(video => (
            <VideoCard key={video.id} video={video} onNavigate={(p) => navigate(p)} />
          ))}
        </div>
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
    </div>
  );
};

const TagDetail = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const slug = pathname.split('/').pop();
  const tag = MOCK_TAGS.find(t => t.slug === slug) || MOCK_TAGS[0];
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(MOCK_VIDEOS.length / ITEMS_PER_PAGE);
  const paginatedVideos = MOCK_VIDEOS.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-surface border border-slate-800 rounded-3xl p-8 space-y-4">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <TagIcon className="text-primary" /> #{tag.name}
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl">{tag.description}</p>
        <div className="text-sm text-slate-500">{tag.videoCount} matching titles.</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedVideos.map(video => (
          <VideoCard key={video.id} video={video} onNavigate={(p) => navigate(p)} />
        ))}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={(p) => { setPage(p); window.scrollTo(0,0); }} 
      />
    </div>
  );
};

// --- Shell Layout ---

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVideos = searchQuery.length > 1 
    ? MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];
  const filteredModels = searchQuery.length > 1
    ? MOCK_MODELS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-primary text-white py-1 px-4 text-center text-[10px] font-bold uppercase tracking-widest z-[60]">
        Strictly 18+ Only • Premium Content Platform
      </div>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Play size={18} fill="white" className="ml-0.5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase hidden sm:inline">{SITE_NAME}</span>
          </div>

          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
                onFocus={() => setIsSearching(true)}
                placeholder="Search premium videos and creators..." 
                className="w-full bg-surface border border-slate-700 rounded-full py-2 px-5 pl-12 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-100 placeholder:text-slate-500 transition-all"
              />
              <Search className="absolute left-4 top-2.5 text-slate-500" size={18} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-2.5 text-slate-500 hover:text-white">
                  <X size={18} />
                </button>
              )}
            </div>

            {isSearching && searchQuery.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-fade-in">
                {filteredModels.length === 0 && filteredVideos.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm italic">No results found</div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto p-2">
                    {filteredModels.map(model => (
                      <button key={model.id} onClick={() => navigate(`/models/${model.slug}`)} className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors text-left group">
                        <img src={model.thumbnail} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                        <div className="flex-1 truncate font-semibold text-sm group-hover:text-primary">{model.name}</div>
                        <div className="text-[10px] bg-slate-800 px-2 py-0.5 rounded uppercase">Model</div>
                      </button>
                    ))}
                    {filteredVideos.map(video => (
                      <button key={video.id} onClick={() => navigate(`/video/${video.slug}`)} className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-slate-800/50">
                        <img src={video.thumbnail} className="w-14 aspect-video rounded object-cover" />
                        <div className="flex-1 truncate font-medium text-xs group-hover:text-primary">{video.title}</div>
                        <ChevronRight size={14} className="text-slate-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="hidden sm:flex items-center gap-2 bg-primary px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            <User size={16} /> SIGN IN
          </button>
          <button className="sm:hidden p-2 text-slate-300"><Menu size={24} /></button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-surface border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <Play size={20} className="text-primary" fill="currentColor" />
                <span className="text-xl font-black uppercase tracking-tighter">{SITE_NAME}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">The industry leader in high-end cinematic content and creator representation.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-300">Catalog</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li onClick={() => navigate('/')} className="hover:text-primary cursor-pointer">All Videos</li>
                <li onClick={() => navigate('/models')} className="hover:text-primary cursor-pointer">Creators</li>
                <li className="hover:text-primary cursor-pointer">Top Rated</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-300">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="hover:text-primary cursor-pointer">Terms</li>
                <li className="hover:text-primary cursor-pointer">Privacy</li>
                <li className="hover:text-primary cursor-pointer">Compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-300">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Mail size={14}/> Contact Us</li>
                <li className="flex items-center gap-2"><Shield size={14}/> DMCA</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
            © 2024 {SITE_NAME} Platform. 18+ Mandatory verification for all content.
          </div>
        </div>
      </footer>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video/:slug" element={<VideoDetail />} />
          <Route path="/models" element={<ModelListingPage />} />
          <Route path="/models/:slug" element={<ModelDetail />} />
          <Route path="/tags/:slug" element={<TagDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
