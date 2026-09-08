'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Shield, Key, Lock, Unlock, Play, Video, Users, Tag, Eye, 
  CheckCircle2, AlertCircle, Loader2, Search, Trash2, Edit3, 
  ExternalLink, Copy, Check, Plus, RefreshCw, SlidersHorizontal, 
  Film, X, ChevronLeft, ChevronRight, LogOut, ArrowRight, Clock,
  Monitor, Smartphone, Wrench, Download, AlertTriangle, CheckSquare, 
  Square, PlaySquare, Maximize2, Image as ImageIcon
} from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';

export const runtime = 'edge';

const STORAGE_KEY = 'freeof_admin_key';

export default function AdminDashboardPage() {
  // Authentication State
  const [adminKey, setAdminKey] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [rememberKey, setRememberKey] = useState<boolean>(true);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'creators' | 'tools' | 'api'>('overview');

  // Stats Data
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  // Videos Tab State
  const [videos, setVideos] = useState<any[]>([]);
  const [videoPagination, setVideoPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [videoSearch, setVideoSearch] = useState('');
  const [videoStatusFilter, setVideoStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [videoTypeFilter, setVideoTypeFilter] = useState<'all' | 'onlyfans' | 'normal'>('all');
  const [filterMissingThumbnails, setFilterMissingThumbnails] = useState<boolean>(false);
  const [isVideosLoading, setIsVideosLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [previewingVideo, setPreviewingVideo] = useState<any | null>(null);
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  // Batch Video Operations State
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState<boolean>(false);

  // Creators Tab State
  const [creators, setCreators] = useState<any[]>([]);
  const [isCreatorsLoading, setIsCreatorsLoading] = useState(false);
  const [creatorSearch, setCreatorSearch] = useState('');
  const [showAddCreatorModal, setShowAddCreatorModal] = useState(false);
  const [newCreatorData, setNewCreatorData] = useState({ name: '', slug: '', bio: '', thumbnail: '' });
  const [isSavingCreator, setIsSavingCreator] = useState(false);
  const [editingCreator, setEditingCreator] = useState<any | null>(null);
  const [isUpdatingCreator, setIsUpdatingCreator] = useState(false);
  const [deletingCreatorId, setDeletingCreatorId] = useState<string | null>(null);
  const [creatorDeleteCascadePrompt, setCreatorDeleteCascadePrompt] = useState<{ creator: any; videoCount: number } | null>(null);

  // Tools & Maintenance State
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState<string | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Key Tester State
  const [testKeyInput, setTestKeyInput] = useState('');
  const [testKeyResult, setTestKeyResult] = useState<any | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 1. Verify and Authenticate Key
  const verifyKey = useCallback(async (keyToTest: string, saveToStorage: boolean = true) => {
    if (!keyToTest.trim()) {
      setAuthError('Please enter an Admin API Key.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/v1/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToTest.trim(),
        },
        body: JSON.stringify({ key: keyToTest.trim() })
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAdminKey(keyToTest.trim());
        setIsAuthenticated(true);
        if (saveToStorage) {
          localStorage.setItem(STORAGE_KEY, keyToTest.trim());
        }
        showNotification('success', 'Admin session unlocked successfully.');
      } else {
        setIsAuthenticated(false);
        setAuthError(data.error || 'Invalid Admin API Key. Access denied.');
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setAuthError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Check saved key on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setInputKey(saved);
      verifyKey(saved, false);
    }
  }, [verifyKey]);

  // 2. Fetch Dashboard Statistics
  const fetchStats = useCallback(async () => {
    if (!adminKey) return;
    setIsStatsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/stats', {
        headers: { 'x-api-key': adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        if (res.status === 403 || res.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Session expired. Please re-authenticate.');
        }
      }
    } catch (e) {
      // Failed fetching stats
    } finally {
      setIsStatsLoading(false);
    }
  }, [adminKey]);

  // 3. Fetch Videos
  const fetchVideos = useCallback(async (page: number = 1) => {
    if (!adminKey) return;
    setIsVideosLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: videoSearch,
        status: videoStatusFilter,
        type: videoTypeFilter
      });

      const res = await fetch(`/api/v1/admin/videos?${params.toString()}`, {
        headers: { 'x-api-key': adminKey }
      });

      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
        if (data.pagination) {
          setVideoPagination(data.pagination);
        }
      }
    } catch (e) {
      // Ignore
    } finally {
      setIsVideosLoading(false);
    }
  }, [adminKey, videoSearch, videoStatusFilter, videoTypeFilter]);

  // 4. Fetch Creators
  const fetchCreators = useCallback(async () => {
    if (!adminKey) return;
    setIsCreatorsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/models', {
        headers: { 'x-api-key': adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setCreators(data.models || []);
      }
    } catch (e) {
      // Ignore
    } finally {
      setIsCreatorsLoading(false);
    }
  }, [adminKey]);

  // Reload data when active tab changes or authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'videos') {
      fetchVideos(1);
    } else if (activeTab === 'creators') {
      fetchCreators();
    }
  }, [isAuthenticated, activeTab, fetchStats, fetchVideos, fetchCreators]);

  // Handle Logout / Lock
  const handleLock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAdminKey('');
    setIsAuthenticated(false);
    setInputKey('');
    setStats(null);
    setVideos([]);
    setCreators([]);
    showNotification('success', 'Admin session locked.');
  };

  // Toggle Video Publish Status
  const handleTogglePublish = async (video: any) => {
    const newStatus = video.is_published === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/v1/admin/videos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({
          id: video.id,
          is_published: newStatus
        })
      });

      if (res.ok) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, is_published: newStatus } : v));
        showNotification('success', `Video is now ${newStatus === 1 ? 'Live' : 'Draft / Hidden'}.`);
        if (stats) fetchStats();
      } else {
        showNotification('error', 'Failed to update video status.');
      }
    } catch {
      showNotification('error', 'Network error updating video.');
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this video? This cannot be undone.')) {
      return;
    }

    setDeletingVideoId(id);
    try {
      const res = await fetch(`/api/v1/admin/videos?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': adminKey }
      });

      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== id));
        showNotification('success', 'Video deleted permanently.');
        if (stats) fetchStats();
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to delete video.');
      }
    } catch {
      showNotification('error', 'Network error deleting video.');
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Save Video Edit
  const handleSaveVideoEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setIsUpdatingVideo(true);

    try {
      const res = await fetch('/api/v1/admin/videos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify(editingVideo)
      });

      if (res.ok) {
        setVideos(prev => prev.map(v => v.id === editingVideo.id ? editingVideo : v));
        showNotification('success', 'Video updated successfully.');
        setEditingVideo(null);
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to update video.');
      }
    } catch {
      showNotification('error', 'Network error saving changes.');
    } finally {
      setIsUpdatingVideo(false);
    }
  };

  // Quick Add Creator
  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreatorData.name.trim() || !newCreatorData.slug.trim()) {
      showNotification('error', 'Creator name and slug are required.');
      return;
    }

    setIsSavingCreator(true);
    try {
      const res = await fetch('/api/v1/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify(newCreatorData)
      });

      if (res.ok) {
        showNotification('success', `Creator "${newCreatorData.name}" registered successfully!`);
        setShowAddCreatorModal(false);
        setNewCreatorData({ name: '', slug: '', bio: '', thumbnail: '' });
        fetchCreators();
        if (stats) fetchStats();
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to create creator.');
      }
    } catch {
      showNotification('error', 'Network error registering creator.');
    } finally {
      setIsSavingCreator(false);
    }
  };

  // Batch Video Selection Handlers
  const handleToggleSelectVideo = (id: string) => {
    setSelectedVideoIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const allPageIds = videos.map(v => v.id);
  const isAllPageSelected = allPageIds.length > 0 && allPageIds.every(id => selectedVideoIds.includes(id));

  const handleToggleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedVideoIds(prev => prev.filter(id => !allPageIds.includes(id)));
    } else {
      setSelectedVideoIds(prev => Array.from(new Set([...prev, ...allPageIds])));
    }
  };

  // Batch Delete Execution
  const handleExecuteBatchDelete = async () => {
    if (selectedVideoIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/v1/admin/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({ ids: selectedVideoIds })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || `Deleted ${selectedVideoIds.length} videos.`);
        setSelectedVideoIds([]);
        setShowBatchDeleteModal(false);
        fetchVideos(videoPagination.page);
        if (stats) fetchStats();
      } else {
        showNotification('error', data.error || 'Failed to delete selected videos.');
      }
    } catch {
      showNotification('error', 'Network error during batch deletion.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Batch Status Update
  const handleBatchUpdateStatus = async (isPublished: boolean) => {
    if (selectedVideoIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/v1/admin/videos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({ ids: selectedVideoIds, is_published: isPublished ? 1 : 0 })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || `Updated status for ${selectedVideoIds.length} videos.`);
        setSelectedVideoIds([]);
        fetchVideos(videoPagination.page);
        if (stats) fetchStats();
      } else {
        showNotification('error', data.error || 'Failed to update videos status.');
      }
    } catch {
      showNotification('error', 'Network error during batch status update.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Batch Type Update
  const handleBatchUpdateType = async (type: 'onlyfans' | 'normal') => {
    if (selectedVideoIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/v1/admin/videos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({ ids: selectedVideoIds, type })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || `Set type to ${type} for ${selectedVideoIds.length} videos.`);
        setSelectedVideoIds([]);
        fetchVideos(videoPagination.page);
        if (stats) fetchStats();
      } else {
        showNotification('error', data.error || 'Failed to update videos type.');
      }
    } catch {
      showNotification('error', 'Network error during batch type update.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Creator Edit & Save
  const handleSaveCreatorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreator) return;
    setIsUpdatingCreator(true);
    try {
      const res = await fetch('/api/v1/admin/models', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify(editingCreator)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Creator "${editingCreator.name}" updated successfully.`);
        setEditingCreator(null);
        fetchCreators();
      } else {
        showNotification('error', data.error || 'Failed to update creator profile.');
      }
    } catch {
      showNotification('error', 'Network error updating creator profile.');
    } finally {
      setIsUpdatingCreator(false);
    }
  };

  // Creator Delete & Cascade Handling
  const handleDeleteCreator = async (creator: any, cascade: boolean = false) => {
    setDeletingCreatorId(creator.id);
    try {
      const res = await fetch(`/api/v1/admin/models?id=${creator.id}&cascade=${cascade ? 'true' : 'false'}`, {
        method: 'DELETE',
        headers: { 'x-api-key': adminKey }
      });
      const data = await res.json();
      if (res.status === 409 && data.requiresCascade) {
        setCreatorDeleteCascadePrompt({ creator, videoCount: data.videoCount });
        return;
      }
      if (res.ok) {
        showNotification('success', data.message || 'Creator deleted successfully.');
        setCreatorDeleteCascadePrompt(null);
        fetchCreators();
        if (stats) fetchStats();
      } else {
        showNotification('error', data.error || 'Failed to delete creator.');
      }
    } catch {
      showNotification('error', 'Network error deleting creator.');
    } finally {
      setDeletingCreatorId(null);
    }
  };

  // Maintenance Actions
  const handleRunMaintenanceAction = async (action: 'sync_counts' | 'clean_orphaned') => {
    setIsMaintenanceRunning(action);
    try {
      const res = await fetch('/api/v1/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message);
        fetchCreators();
        if (stats) fetchStats();
      } else {
        showNotification('error', data.error || 'Maintenance action failed.');
      }
    } catch {
      showNotification('error', 'Network error executing maintenance action.');
    } finally {
      setIsMaintenanceRunning(null);
    }
  };

  // Full Catalog Export as JSON
  const handleExportCatalog = async () => {
    setIsMaintenanceRunning('export');
    try {
      const res = await fetch('/api/v1/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminKey
        },
        body: JSON.stringify({ action: 'export_catalog' })
      });
      const data = await res.json();
      if (res.ok) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `freeof-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showNotification('success', `Exported ${data.totalVideos} videos and ${data.totalCreators} creators!`);
      } else {
        showNotification('error', data.error || 'Failed to export catalog.');
      }
    } catch {
      showNotification('error', 'Network error downloading catalog.');
    } finally {
      setIsMaintenanceRunning(null);
    }
  };

  // Run Test Key Tool
  const handleRunKeyTest = async () => {
    if (!testKeyInput.trim()) return;
    setIsTestingKey(true);
    setTestKeyResult(null);

    const start = performance.now();
    try {
      const res = await fetch('/api/v1/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': testKeyInput.trim()
        },
        body: JSON.stringify({ key: testKeyInput.trim() })
      });
      const end = performance.now();
      const data = await res.json();

      setTestKeyResult({
        status: res.status,
        latencyMs: Math.round(end - start),
        valid: data.valid,
        isAdmin: data.isAdmin,
        message: data.message || data.error
      });
    } catch (e: any) {
      setTestKeyResult({
        status: 500,
        latencyMs: 0,
        valid: false,
        isAdmin: false,
        message: e.message || 'Connection failed'
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // =========================================================================
  // LOCK SCREEN (When unauthenticated)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-xl shadow-rose-950/40">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Private Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Provide your Admin API Key to access management controls.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lock size={120} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); verifyKey(inputKey, rememberKey); }} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admin Secret Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste your Admin API Key..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono transition-colors"
                  autoFocus
                />
                <Key className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberKey} 
                  onChange={(e) => setRememberKey(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember session on this device</span>
              </label>
            </div>

            {authError && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !inputKey.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock size={18} />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Configured via <code className="text-slate-400">ADMIN_API_KEY</code> or <code className="text-slate-400">API_SECRET_KEY</code> in environment variables.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors inline-flex items-center gap-1">
            ← Return to public site
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED DASHBOARD
  // =========================================================================
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 py-3 px-4 rounded-xl shadow-2xl text-sm font-semibold border animate-in slide-in-from-bottom-4 duration-200 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-800 text-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Breadcrumbs items={[{ label: 'Admin Dashboard', href: '/admin' }]} />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Authorized
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Shield className="text-rose-500" size={28} />
            Admin Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/upload" 
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-colors"
          >
            <Plus size={16} /> New Upload
          </Link>
          <Link 
            href="/models/manage" 
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Users size={16} /> Manage Creators
          </Link>
          <button 
            onClick={handleLock} 
            title="Lock Dashboard"
            className="p-2.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Film size={16} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Video size={16} />
          <span>Videos</span>
          {stats && <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{stats.metrics?.totalVideos || 0}</span>}
        </button>

        <button
          onClick={() => setActiveTab('creators')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'creators'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Users size={16} />
          <span>Creators</span>
          {stats && <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{stats.metrics?.totalModels || 0}</span>}
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'tools'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Wrench size={16} />
          <span>Tools & Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Key size={16} />
          <span>API & Security</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Videos</span>
                <Video size={18} className="text-rose-500" />
              </div>
              <div className="text-3xl font-black text-white">
                {isStatsLoading ? <Loader2 className="animate-spin" size={24} /> : (stats?.metrics?.totalVideos || 0)}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-medium">
                <span className="text-emerald-400 font-bold">{stats?.metrics?.publishedVideos || 0} Live</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{stats?.metrics?.unpublishedVideos || 0} Drafts</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Views</span>
                <Eye size={18} className="text-blue-500" />
              </div>
              <div className="text-3xl font-black text-white">
                {isStatsLoading ? <Loader2 className="animate-spin" size={24} /> : (stats?.metrics?.totalViews || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-medium">
                Across all published videos
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Creators / Models</span>
                <Users size={18} className="text-purple-500" />
              </div>
              <div className="text-3xl font-black text-white">
                {isStatsLoading ? <Loader2 className="animate-spin" size={24} /> : (stats?.metrics?.totalModels || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-medium">
                Registered profiles
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Tags Taxonomy</span>
                <Tag size={18} className="text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-white">
                {isStatsLoading ? <Loader2 className="animate-spin" size={24} /> : (stats?.metrics?.totalTags || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-medium">
                Categorization tags
              </div>
            </div>
          </div>

          {/* Quick Actions and System Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-rose-500" /> Quick Operations
              </h2>
              <div className="space-y-2.5">
                <Link
                  href="/upload"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-between border border-slate-700 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={16} className="text-rose-500" /> Upload New Video
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </Link>

                <button
                  onClick={() => setShowAddCreatorModal(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-between border border-slate-700 transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} className="text-purple-400" /> Quick Register Creator
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => { setActiveTab('api'); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-between border border-slate-700 transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Key size={16} className="text-amber-400" /> Ingestion & Sync Setup
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Distribution Highlights */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Film size={18} className="text-rose-500" /> Content Distribution
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type: OnlyFans</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">{stats?.metrics?.onlyfansVideos || 0}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type: Normal</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">{stats?.metrics?.normalVideos || 0}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Portrait Format</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">{stats?.metrics?.portraitVideos || 0}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Landscape Format</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{stats?.metrics?.landscapeVideos || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Videos Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Clock size={18} className="text-rose-500" /> Recently Uploaded Videos
              </h2>
              <button 
                onClick={() => setActiveTab('videos')} 
                className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                View all videos →
              </button>
            </div>

            {isStatsLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-500" size={24} /></div>
            ) : (stats?.recentVideos || []).length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">No videos found. Use the Upload button to add videos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Video</th>
                      <th className="py-3 px-4">Creator</th>
                      <th className="py-3 px-4">Resolution</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.recentVideos.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={v.thumbnail || '/placeholder.jpg'} alt="" className="w-14 h-9 object-cover rounded bg-slate-950 border border-slate-800 shrink-0" />
                          <div>
                            <div className="font-bold text-white line-clamp-1 text-xs">{v.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono">/{v.slug}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-300">
                          {v.model_name || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-slate-400">
                          {v.resolution || '1080p'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleTogglePublish(v)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              v.is_published === 1 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {v.is_published === 1 ? 'Live' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-400">
                          {(v.views || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link 
                            href={`/video/${v.slug}`} 
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-white inline-flex transition-colors"
                            title="View Video"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: VIDEOS MANAGER */}
      {/* ===================================================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto relative">
              <input
                type="text"
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchVideos(1); }}
                placeholder="Search videos by title, slug, or creator..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-4 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-500" size={15} />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <select
                value={videoStatusFilter}
                onChange={(e: any) => setVideoStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl py-2 px-3 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="unpublished">Drafts Only</option>
              </select>

              <select
                value={videoTypeFilter}
                onChange={(e: any) => setVideoTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl py-2 px-3 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="onlyfans">OnlyFans</option>
                <option value="normal">Normal</option>
              </select>

              <button
                type="button"
                onClick={() => setFilterMissingThumbnails(!filterMissingThumbnails)}
                className={`text-xs font-bold py-2 px-3 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterMissingThumbnails 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="Filter videos missing thumbnail or twitter thumbnail"
              >
                <ImageIcon size={14} />
                <span className="hidden sm:inline">Missing Covers</span>
              </button>

              <button
                onClick={() => fetchVideos(1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Refresh Videos"
              >
                <RefreshCw size={15} className={isVideosLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Sticky Batch Actions Bar when items are selected */}
          {selectedVideoIds.length > 0 && (
            <div className="bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-slate-900/90 border-2 border-rose-500/50 rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <span className="bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                  {selectedVideoIds.length} Selected
                </span>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                  Apply batch operations to selected catalog videos:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBatchUpdateStatus(true)}
                  disabled={isBatchProcessing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Publish all selected videos"
                >
                  <CheckCircle2 size={13} />
                  <span>Publish All</span>
                </button>

                <button
                  onClick={() => handleBatchUpdateStatus(false)}
                  disabled={isBatchProcessing}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Set all selected videos to draft"
                >
                  <Clock size={13} />
                  <span>Set Draft</span>
                </button>

                <button
                  onClick={() => handleBatchUpdateType('onlyfans')}
                  disabled={isBatchProcessing}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  title="Set type to OnlyFans"
                >
                  Type: OnlyFans
                </button>

                <button
                  onClick={() => setShowBatchDeleteModal(true)}
                  disabled={isBatchProcessing}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-lg shadow-rose-950"
                  title="Delete all selected videos"
                >
                  {isBatchProcessing ? <Loader2 className="animate-spin" size={13} /> : <Trash2 size={13} />}
                  <span>Delete Selected</span>
                </button>

                <button
                  onClick={() => setSelectedVideoIds([])}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Deselect All"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Videos Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {isVideosLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-500" size={32} /></div>
            ) : videos.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No videos match your search or filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <button
                          type="button"
                          onClick={handleToggleSelectAllPage}
                          className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                          title={isAllPageSelected ? "Deselect page" : "Select all on page"}
                        >
                          {isAllPageSelected ? (
                            <CheckSquare size={16} className="text-rose-500" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4">Video</th>
                      <th className="py-3 px-4">Creator</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {videos
                      .filter(v => {
                        if (!filterMissingThumbnails) return true;
                        return !v.thumbnail || !v.twitter_thumbnail || v.thumbnail === '/placeholder.jpg';
                      })
                      .map((video) => {
                        const isSelected = selectedVideoIds.includes(video.id);
                        return (
                          <tr key={video.id} className={`transition-colors ${isSelected ? 'bg-rose-950/20' : 'hover:bg-slate-800/20'}`}>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectVideo(video.id)}
                                className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                              >
                                {isSelected ? (
                                  <CheckSquare size={16} className="text-rose-500" />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  onClick={() => setPreviewingVideo(video)}
                                  className="relative w-16 h-10 rounded overflow-hidden bg-slate-950 shrink-0 border border-slate-800 cursor-pointer group"
                                  title="Click to preview & inspect video"
                                >
                                  <img src={video.thumbnail || '/placeholder.jpg'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                    <Play size={12} className="text-white fill-white opacity-80 group-hover:opacity-100" />
                                  </div>
                                  {video.orientation === 'portrait' ? (
                                    <div className="absolute bottom-0.5 right-0.5 bg-black/70 p-0.5 rounded text-[8px] text-white">
                                      <Smartphone size={10} />
                                    </div>
                                  ) : (
                                    <div className="absolute bottom-0.5 right-0.5 bg-black/70 p-0.5 rounded text-[8px] text-white">
                                      <Monitor size={10} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <button
                                    onClick={() => setPreviewingVideo(video)}
                                    className="font-bold text-white line-clamp-1 text-xs max-w-xs text-left hover:text-rose-400 transition-colors cursor-pointer"
                                  >
                                    {video.title}
                                  </button>
                                  <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                                    /{video.slug}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-300">
                              {video.model_name ? (
                                <Link href={`/models/${video.model_slug}`} target="_blank" className="hover:text-rose-400 transition-colors">
                                  {video.model_name}
                                </Link>
                              ) : '—'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-bold text-slate-400">{video.resolution || '1080p'}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[10px] text-slate-500 uppercase">{video.type}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleTogglePublish(video)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  video.is_published === 1 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}
                                title="Click to toggle publish status"
                              >
                                {video.is_published === 1 ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-xs font-mono text-slate-400">
                              {(video.views || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setPreviewingVideo(video)}
                                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Inspect & Preview Player"
                                >
                                  <PlaySquare size={15} />
                                </button>
                                <Link 
                                  href={`/video/${video.slug}`} 
                                  target="_blank"
                                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                  title="View Public Page"
                                >
                                  <ExternalLink size={15} />
                                </Link>
                                <button
                                  onClick={() => setEditingVideo(video)}
                                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Quick Edit"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  disabled={deletingVideoId === video.id}
                                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Delete Video"
                                >
                                  {deletingVideoId === video.id ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {videoPagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Page {videoPagination.page} of {videoPagination.totalPages} ({videoPagination.total} total videos)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={videoPagination.page <= 1}
                    onClick={() => fetchVideos(videoPagination.page - 1)}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-30 hover:border-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={videoPagination.page >= videoPagination.totalPages}
                    onClick={() => fetchVideos(videoPagination.page + 1)}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-30 hover:border-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CREATORS MANAGER */}
      {/* ===================================================================== */}
      {activeTab === 'creators' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                placeholder="Search creator by name or slug..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-4 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-500" size={15} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowAddCreatorModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
              >
                <Plus size={15} /> Add Creator
              </button>
              <button
                onClick={fetchCreators}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Refresh Creators"
              >
                <RefreshCw size={15} className={isCreatorsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Creators Grid */}
          {isCreatorsLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-500" size={32} /></div>
          ) : creators.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-2xl">
              No creators found. Click &quot;Add Creator&quot; to register your first profile.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creators
                .filter(c => c.name.toLowerCase().includes(creatorSearch.toLowerCase()) || c.slug.toLowerCase().includes(creatorSearch.toLowerCase()))
                .map((creator) => (
                  <div key={creator.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-slate-700 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={creator.thumbnail || '/placeholder.jpg'} 
                          alt="" 
                          className="w-12 h-12 rounded-full object-cover bg-slate-950 border border-slate-800 shrink-0" 
                        />
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-white text-sm truncate">{creator.name}</h3>
                          <p className="text-[11px] text-slate-500 font-mono truncate">@{creator.slug}</p>
                        </div>
                      </div>
                      {creator.bio && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{creator.bio}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400">
                        {creator.actual_videos_count || creator.videos_count || 0} videos
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Link 
                          href={`/models/${creator.slug}`} 
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button 
                          onClick={() => setEditingCreator(creator)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Creator Details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCreator(creator)}
                          disabled={deletingCreatorId === creator.id}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Creator Profile"
                        >
                          {deletingCreatorId === creator.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: TOOLS & MAINTENANCE */}
      {/* ===================================================================== */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tool 1: Counters Recalibration */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Recalculate Video Counts</h3>
                    <p className="text-slate-400 text-xs">Sync creator video counters with actual database rows</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-3">
                  After batch deletions, Colab scraping imports, or direct SQL operations, creator <code className="text-rose-400 bg-slate-950 px-1 py-0.5 rounded">videos_count</code> columns might become desynchronized. This tool recalculates the real counts from the <code className="text-rose-400 bg-slate-950 px-1 py-0.5 rounded">videos</code> table.
                </p>
              </div>

              <button
                onClick={() => handleRunMaintenanceAction('sync_counts')}
                disabled={isMaintenanceRunning !== null}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isMaintenanceRunning === 'sync_counts' ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
                <span>Run Count Synchronization</span>
              </button>
            </div>

            {/* Tool 2: Database Integrity Cleanup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Purge Orphaned Tag References</h3>
                    <p className="text-slate-400 text-xs">Clean up stale relationship rows in video_tags</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-3">
                  Deletes cross-reference rows in <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">video_tags</code> pointing to deleted video IDs or obsolete taxonomy tags to keep database queries optimized and indices small.
                </p>
              </div>

              <button
                onClick={() => handleRunMaintenanceAction('clean_orphaned')}
                disabled={isMaintenanceRunning !== null}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isMaintenanceRunning === 'clean_orphaned' ? <Loader2 className="animate-spin" size={15} /> : <Wrench size={15} />}
                <span>Clean Orphaned Relationships</span>
              </button>
            </div>

            {/* Tool 3: Catalog Backup & JSON Export */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Export Catalog Snapshot</h3>
                    <p className="text-slate-400 text-xs">Download full database (videos, creators, tags) as JSON</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-3">
                  Instantly dump your current production catalog into a single structured <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">.json</code> file. Ideal for offline backups, migration, or feeding external processing scripts.
                </p>
              </div>

              <button
                onClick={handleExportCatalog}
                disabled={isMaintenanceRunning !== null}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950 disabled:opacity-50"
              >
                {isMaintenanceRunning === 'export' ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
                <span>Download JSON Backup</span>
              </button>
            </div>

            {/* Tool 4: Diagnostic Quick Links */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Media Audit & Coverage</h3>
                    <p className="text-slate-400 text-xs">Verify cover and thumbnail integrity</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-3">
                  Jump directly to video filtering with Missing Covers activated, or inspect Twitter Play Icon compliance to make sure every thumbnail matches the clean Twitter feed look.
                </p>
              </div>

              <button
                onClick={() => {
                  setFilterMissingThumbnails(true);
                  setActiveTab('videos');
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Search size={15} />
                <span>Find Videos Missing Thumbnails</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: API & SECURITY */}
      {/* ===================================================================== */}
      {activeTab === 'api' && (
        <div className="space-y-8">
          {/* Active Key Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Key size={18} className="text-rose-500" /> Active Session Credentials
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Active & Verified
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full truncate">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Current Key</span>
                <code className="text-xs font-mono text-emerald-300 break-all">{adminKey}</code>
              </div>
              <button
                onClick={() => handleCopy(adminKey, 'activeKey')}
                className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedText === 'activeKey' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedText === 'activeKey' ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
          </div>

          {/* Key Validator Tool */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Shield size={18} className="text-amber-500" /> API Key Tester
            </h2>
            <p className="text-xs text-slate-400">
              Test any API key or token against the live server security system to verify permissions and latency.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={testKeyInput}
                onChange={(e) => setTestKeyInput(e.target.value)}
                placeholder="Paste key to test..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleRunKeyTest}
                disabled={isTestingKey || !testKeyInput.trim()}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTestingKey ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                <span>Verify Permissions</span>
              </button>
            </div>

            {testKeyResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                testKeyResult.valid 
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Result: {testKeyResult.valid ? 'AUTHORIZED' : 'DENIED'}</span>
                  <span className="font-mono text-[10px] text-slate-400">{testKeyResult.latencyMs}ms</span>
                </div>
                <p>{testKeyResult.message}</p>
                {testKeyResult.valid && (
                  <p className="text-[11px] text-emerald-400/80">Admin Rights: {testKeyResult.isAdmin ? 'Yes (Full Write Access)' : 'No (Read Only)'}</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Colab Sync Code Snippet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Play size={18} className="text-rose-500" /> Colab Sync Ingestion Config
              </h2>
              <button
                onClick={() => handleCopy(`API_KEY = "${adminKey}"\nBASE_URL = "${window.location.origin}/api/v1"`, 'colabSnippet')}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'colabSnippet' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedText === 'colabSnippet' ? 'Copied' : 'Copy Headers'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto">
{`# Colab Sync credentials pre-configured with active admin key:
BASE_URL = "${typeof window !== 'undefined' ? window.location.origin : 'https://freeonlyfans.qzz.io'}/api/v1"
API_KEY = "${adminKey}"

API_HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "x-client-source": "colab-sync"
}`}
            </pre>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: EDIT VIDEO */}
      {/* ===================================================================== */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setEditingVideo(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Edit3 size={18} className="text-rose-500" /> Edit Video
            </h2>

            <form onSubmit={handleSaveVideoEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={editingVideo.title || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Resolution</label>
                  <select
                    value={editingVideo.resolution || '1080p'}
                    onChange={(e) => setEditingVideo({ ...editingVideo, resolution: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Orientation</label>
                  <select
                    value={editingVideo.orientation || 'landscape'}
                    onChange={(e) => setEditingVideo({ ...editingVideo, orientation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={editingVideo.thumbnail || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Twitter Thumbnail URL (with play icon)</label>
                <input
                  type="url"
                  value={editingVideo.twitter_thumbnail || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, twitter_thumbnail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_published"
                  checked={editingVideo.is_published === 1}
                  onChange={(e) => setEditingVideo({ ...editingVideo, is_published: e.target.checked ? 1 : 0 })}
                  className="rounded border-slate-700 bg-slate-950 text-rose-500"
                />
                <label htmlFor="edit_published" className="font-bold text-slate-300 select-none cursor-pointer">
                  Published Live
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingVideo}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isUpdatingVideo ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD CREATOR */}
      {/* ===================================================================== */}
      {showAddCreatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowAddCreatorModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Users size={18} className="text-rose-500" /> Register Creator Profile
            </h2>

            <form onSubmit={handleAddCreator} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sophia Rose"
                  value={newCreatorData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setNewCreatorData(prev => ({ ...prev, name, slug: prev.slug || slug }));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  placeholder="e.g. sophia-rose"
                  value={newCreatorData.slug}
                  onChange={(e) => setNewCreatorData({ ...newCreatorData, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Avatar / Thumbnail URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCreatorData.thumbnail}
                  onChange={(e) => setNewCreatorData({ ...newCreatorData, thumbnail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Bio / Vault Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief creator bio or leaked vault description..."
                  value={newCreatorData.bio}
                  onChange={(e) => setNewCreatorData({ ...newCreatorData, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCreatorModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCreator}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSavingCreator ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Register Creator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: EDIT CREATOR */}
      {/* ===================================================================== */}
      {editingCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setEditingCreator(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Edit3 size={18} className="text-rose-500" /> Edit Creator Profile
            </h2>

            <form onSubmit={handleSaveCreatorEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingCreator.name || ''}
                  onChange={(e) => setEditingCreator({ ...editingCreator, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={editingCreator.slug || ''}
                  onChange={(e) => setEditingCreator({ ...editingCreator, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Avatar / Thumbnail URL</label>
                <input
                  type="url"
                  value={editingCreator.thumbnail || ''}
                  onChange={(e) => setEditingCreator({ ...editingCreator, thumbnail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={editingCreator.bio || ''}
                  onChange={(e) => setEditingCreator({ ...editingCreator, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCreator(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCreator}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isUpdatingCreator ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: BATCH DELETE CONFIRMATION */}
      {/* ===================================================================== */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Permanently Delete {selectedVideoIds.length} Videos?
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will delete <strong className="text-white">{selectedVideoIds.length} selected videos</strong>, their tag relations, and automatically recalculate creator video counters. This operation cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                disabled={isBatchProcessing}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                disabled={isBatchProcessing}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950 disabled:opacity-50"
              >
                {isBatchProcessing ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                <span>Yes, Delete All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATOR CASCADE DELETE CONFIRMATION */}
      {/* ===================================================================== */}
      {creatorDeleteCascadePrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Associated Videos Detected
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Creator <strong className="text-white">&quot;{creatorDeleteCascadePrompt.creator.name}&quot;</strong> has{' '}
                <span className="text-rose-400 font-bold">{creatorDeleteCascadePrompt.videoCount} associated video(s)</span>.
              </p>
              <p className="text-xs text-slate-400">
                To prevent accidental loss of catalog content, creator deletion is blocked unless you explicitly authorize cascading deletion of all their videos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCreatorDeleteCascadePrompt(null)}
                className="w-full sm:w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel & Keep
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCreator(creatorDeleteCascadePrompt.creator, true)}
                disabled={deletingCreatorId === creatorDeleteCascadePrompt.creator.id}
                className="w-full sm:w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950 disabled:opacity-50"
              >
                {deletingCreatorId === creatorDeleteCascadePrompt.creator.id ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>Delete With {creatorDeleteCascadePrompt.videoCount} Videos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: VIDEO INSPECT & PREVIEW */}
      {/* ===================================================================== */}
      {previewingVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <PlaySquare className="text-rose-500 shrink-0" size={18} />
                <h2 className="text-sm font-bold text-white truncate">{previewingVideo.title}</h2>
              </div>
              <button
                onClick={() => setPreviewingVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Media Canvas */}
            <div className="bg-black relative aspect-video flex items-center justify-center">
              {previewingVideo.video_url ? (
                <video
                  src={previewingVideo.video_url}
                  poster={previewingVideo.thumbnail || undefined}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Film className="mx-auto text-slate-600" size={36} />
                  <p className="text-slate-400 text-xs">No direct video URL stream configured for this entry.</p>
                </div>
              )}
            </div>

            {/* Details and Thumbnails Comparison */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ImageIcon size={12} /> Standard Poster
                  </div>
                  {previewingVideo.thumbnail ? (
                    <img src={previewingVideo.thumbnail} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-800" />
                  ) : (
                    <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center text-slate-600 text-[10px]">
                      Missing Thumbnail
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ImageIcon size={12} /> Twitter Card Thumbnail
                  </div>
                  {previewingVideo.twitter_thumbnail ? (
                    <img src={previewingVideo.twitter_thumbnail} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-800" />
                  ) : (
                    <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center text-slate-600 text-[10px]">
                      Missing Twitter Cover
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Format</span>
                  <span className="font-bold">{previewingVideo.resolution || '1080p'} ({previewingVideo.orientation || 'landscape'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Type</span>
                  <span className="font-bold uppercase text-rose-400">{previewingVideo.type || 'onlyfans'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Status</span>
                  <span className="font-bold text-emerald-400">{previewingVideo.is_published === 1 ? 'Live' : 'Draft'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href={`/video/${previewingVideo.slug}`}
                  target="_blank"
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 text-xs"
                >
                  <ExternalLink size={13} /> View Public Watch Page
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const v = previewingVideo;
                      setPreviewingVideo(null);
                      setEditingVideo(v);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 size={13} /> Edit Metadata
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
