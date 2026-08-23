import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Calendar as CalendarIcon, 
  ListFilter, 
  Download, 
  Plus, 
  Sparkles, 
  HardDrive, 
  CheckCircle, 
  Layers, 
  Compass, 
  RotateCcw,
  Upload,
  Copy,
  Check
} from 'lucide-react';
import { Post, StorageStats, PostStatus, HolidayMilestone } from './types';
import { 
  getAllPosts, 
  savePost, 
  saveAllPosts, 
  deletePost, 
  getStorageStats 
} from './utils/storage';
import { getSampleStarterPosts, HOLIDAY_MILESTONES } from './utils/holidays';
import { copyPostsToSpreadsheetClipboard } from './utils/csv';
import { VisualGridPreview } from './components/VisualGridPreview';
import { CalendarView } from './components/CalendarView';
import { PostListView } from './components/PostListView';
import { HolidayTimeline } from './components/HolidayTimeline';
import { CampaignStatsBar } from './components/CampaignStatsBar';
import { PostEditorModal } from './components/PostEditorModal';
import { ExportImportModal } from './components/ExportImportModal';
import { PlatformPreviewModal } from './components/PlatformPreviewModal';

export default function App() {
  // Main view state
  const [activeView, setActiveView] = useState<'grid' | 'calendar' | 'list' | 'roadmap'>('grid');

  // Posts & storage state
  const [posts, setPosts] = useState<Post[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoSaveNotification, setAutoSaveNotification] = useState<string | null>(null);
  const [copiedForSpreadsheet, setCopiedForSpreadsheet] = useState(false);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [initialDateForEditor, setInitialDateForEditor] = useState<string | undefined>(undefined);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  // Load posts on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await getAllPosts();
        if (stored && stored.length > 0) {
          setPosts(stored);
        } else {
          // Initialize with curated holiday campaign starter posts
          const starter = getSampleStarterPosts();
          await saveAllPosts(starter);
          setPosts(starter);
        }
        const stats = await getStorageStats();
        setStorageStats(stats);
      } catch (err) {
        console.error('Failed to load posts from storage:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Update storage stats whenever posts change
  const refreshStorageStats = async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
  };

  const showSaveBadge = (msg: string) => {
    setAutoSaveNotification(msg);
    setTimeout(() => {
      setAutoSaveNotification(null);
    }, 2500);
  };

  // Handlers
  const handleSavePost = async (postToSave: Post) => {
    await savePost(postToSave);
    const updated = await getAllPosts();
    setPosts(updated);
    await refreshStorageStats();
    showSaveBadge('Saved offline to browser storage');
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Delete this holiday post draft?')) {
      await deletePost(id);
      const updated = await getAllPosts();
      setPosts(updated);
      await refreshStorageStats();
      showSaveBadge('Post deleted');
    }
  };

  const handleDuplicatePost = async (post: Post) => {
    const duplicated: Post = {
      ...post,
      id: 'post_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      title: `${post.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await savePost(duplicated);
    const updated = await getAllPosts();
    setPosts(updated);
    await refreshStorageStats();
    showSaveBadge('Post duplicated');
  };

  const handleReorderPosts = async (reordered: Post[]) => {
    setPosts(reordered);
    await saveAllPosts(reordered);
    await refreshStorageStats();
    showSaveBadge('Feed order updated');
  };

  const handleQuickStatusChange = async (postId: string, newStatus: PostStatus) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedPost = { ...post, status: newStatus };
    await savePost(updatedPost);
    const updated = await getAllPosts();
    setPosts(updated);
    showSaveBadge(`Status changed to ${newStatus.replace('_', ' ')}`);
  };

  const handleImportPosts = async (imported: Post[]) => {
    await saveAllPosts(imported);
    setPosts(imported);
    await refreshStorageStats();
    showSaveBadge(`Imported ${imported.length} posts successfully`);
  };

  const handleResetToSample = async () => {
    if (window.confirm('Reset content calendar back to starter holiday template? Any unsaved local edits will be replaced.')) {
      const sample = getSampleStarterPosts();
      await saveAllPosts(sample);
      setPosts(sample);
      await refreshStorageStats();
      showSaveBadge('Reset to sample template');
    }
  };

  const openNewPostModal = (date?: string) => {
    setEditingPost(null);
    setInitialDateForEditor(date);
    setIsEditorOpen(true);
  };

  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setInitialDateForEditor(post.scheduledDate);
    setIsEditorOpen(true);
  };

  const handleAddPostForMilestone = (milestone: HolidayMilestone) => {
    setEditingPost(null);
    setInitialDateForEditor(milestone.date);
    setIsEditorOpen(true);
  };

  const handleCopySpreadsheetData = async () => {
    if (posts.length === 0) {
      showSaveBadge('No posts to copy');
      return;
    }
    const success = await copyPostsToSpreadsheetClipboard(posts);
    if (success) {
      setCopiedForSpreadsheet(true);
      showSaveBadge(`📋 Copied ${posts.length} posts! Paste directly into Google Sheets or Excel (Ctrl+V / Cmd+V)`);
      setTimeout(() => setCopiedForSpreadsheet(false), 2500);
    } else {
      showSaveBadge('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-sky-200">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-sky-300 flex items-center justify-center font-black text-xl shadow-xs border border-blue-600/30">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  Holiday Content Calendar
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[10px] font-bold uppercase tracking-wider border border-sky-300">
                  Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                Visual Grid Preview & Downloadable CSV Campaign Planner
              </p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              id="tab-grid"
              onClick={() => setActiveView('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visual Grid</span>
            </button>

            <button
              id="tab-calendar"
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar Schedule</span>
            </button>

            <button
              id="tab-list"
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'list'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post List</span>
            </button>

            <button
              id="tab-roadmap"
              onClick={() => setActiveView('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'roadmap'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Holiday Roadmap</span>
            </button>
          </nav>

          {/* Top Action CTAs */}
          <div className="flex items-center gap-2">
            {/* Copy for Spreadsheet Button */}
            <button
              id="header-copy-spreadsheet-btn"
              onClick={handleCopySpreadsheetData}
              className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                copiedForSpreadsheet
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
              }`}
              title="Copy entire calendar to clipboard for Google Sheets / Excel"
            >
              {copiedForSpreadsheet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied for Sheets!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Copy for Spreadsheet</span>
                  <span className="sm:hidden">Copy</span>
                </>
              )}
            </button>

            <button
              id="header-export-btn"
              onClick={() => setIsExportOpen(true)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            <button
              id="header-add-post-btn"
              onClick={() => openNewPostModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-sky-200" />
              <span>Draft Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auto-Save Toast Alert */}
      {autoSaveNotification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-blue-900/60 flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{autoSaveNotification}</span>
        </div>
      )}

      {/* Main App Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Campaign Metrics & Insights Bar */}
        <CampaignStatsBar
          posts={posts}
          storageStats={storageStats}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenNewPost={() => openNewPostModal()}
          onCopySpreadsheet={handleCopySpreadsheetData}
        />

        {/* View Switcher Container */}
        {activeView === 'grid' && (
          <VisualGridPreview
            posts={posts}
            onAddPost={() => openNewPostModal()}
            onEditPost={openEditPostModal}
            onDeletePost={handleDeletePost}
            onDuplicatePost={handleDuplicatePost}
            onReorderPosts={handleReorderPosts}
            onSelectPostPreview={(post) => setPreviewPost(post)}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            posts={posts}
            onSelectDate={(date) => openNewPostModal(date)}
            onEditPost={openEditPostModal}
            onAddPostForDate={(date) => openNewPostModal(date)}
          />
        )}

        {activeView === 'list' && (
          <PostListView
            posts={posts}
            onAddPost={() => openNewPostModal()}
            onEditPost={openEditPostModal}
            onDeletePost={handleDeletePost}
            onDuplicatePost={handleDuplicatePost}
            onSelectPostPreview={(post) => setPreviewPost(post)}
            onQuickStatusChange={handleQuickStatusChange}
            onCopySpreadsheet={handleCopySpreadsheetData}
          />
        )}

        {activeView === 'roadmap' && (
          <HolidayTimeline
            posts={posts}
            onAddPostForMilestone={handleAddPostForMilestone}
            onEditPost={openEditPostModal}
          />
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>100% Offline Local Browser Storage • Zero Cloud Fees & No Monthly Subscription</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetToSample}
              className="text-slate-400 hover:text-slate-700 underline flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Sample Holiday Campaign
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-blue-700 font-semibold hover:underline"
            >
              Export CSV Content Calendar
            </button>
          </div>
        </div>
      </footer>

      {/* Post Editor Modal */}
      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePost}
        initialPost={editingPost}
        initialDate={initialDateForEditor}
        totalPostsCount={posts.length}
      />

      {/* CSV & Backup Export/Import Modal */}
      <ExportImportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        posts={posts}
        onImportPosts={handleImportPosts}
      />

      {/* Simulated Device Platform Preview Modal */}
      <PlatformPreviewModal
        post={previewPost}
        onClose={() => setPreviewPost(null)}
        onEdit={(post) => openEditPostModal(post)}
      />
    </div>
  );
}
