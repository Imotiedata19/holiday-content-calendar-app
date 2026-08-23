import React, { useState } from 'react';
import { 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Smartphone, 
  Grid3X3, 
  Layers, 
  Sparkles,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Post, Platform, CampaignPhase, PostStatus } from '../types';

interface VisualGridPreviewProps {
  posts: Post[];
  onAddPost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (post: Post) => void;
  onReorderPosts: (reordered: Post[]) => void;
  onSelectPostPreview: (post: Post) => void;
}

export const VisualGridPreview: React.FC<VisualGridPreviewProps> = ({
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onReorderPosts,
  onSelectPostPreview,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16'>('1:1');
  const [showPhoneFrame, setShowPhoneFrame] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'feed_flow'>('grid');

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false;
    if (filterPhase !== 'all' && post.campaignPhase !== filterPhase) return false;
    return true;
  });

  // Reorder handlers
  const handleMove = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredPosts.length) return;

    const newPosts = [...posts];
    const itemA = filteredPosts[index];
    const itemB = filteredPosts[targetIndex];

    const actualIdxA = newPosts.findIndex(p => p.id === itemA.id);
    const actualIdxB = newPosts.findIndex(p => p.id === itemB.id);

    if (actualIdxA >= 0 && actualIdxB >= 0) {
      // Swap order
      const temp = newPosts[actualIdxA];
      newPosts[actualIdxA] = newPosts[actualIdxB];
      newPosts[actualIdxB] = temp;
      onReorderPosts(newPosts);
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '4:5': return 'aspect-[4/5]';
      case '9:16': return 'aspect-[9/16]';
      default: return 'aspect-square';
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'ready': return 'bg-blue-600 text-white';
      case 'scheduled': return 'bg-sky-500 text-white';
      case 'in_review': return 'bg-indigo-500 text-white';
      case 'published': return 'bg-slate-600 text-white';
      default: return 'bg-blue-400 text-slate-950 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>3-Column Grid</span>
            </button>
            <button
              onClick={() => setActiveTab('feed_flow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'feed_flow'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vertical Feed Flow</span>
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="hidden sm:inline font-medium">Aspect:</span>
            {(['1:1', '4:5', '9:16'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  aspectRatio === ratio
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {ratio === '1:1' ? '1:1 Square' : ratio === '4:5' ? '4:5 Portrait' : '9:16 Story/Reels'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Platforms ({posts.length})</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="pinterest">Pinterest</option>
            <option value="x">X / Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          {/* Phone Mockup Toggle */}
          <button
            onClick={() => setShowPhoneFrame(!showPhoneFrame)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              showPhoneFrame
                ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showPhoneFrame ? 'Hide Frame' : 'Phone Frame'}</span>
          </button>

          {/* Add Post Button */}
          <button
            onClick={onAddPost}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-sky-200" />
            <span>Draft Post</span>
          </button>
        </div>
      </div>

      {/* Main Grid Visual Canvas */}
      <div className="flex justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            showPhoneFrame
              ? 'max-w-[420px] bg-slate-950 p-4 rounded-[40px] shadow-2xl border-4 border-slate-800'
              : 'max-w-4xl'
          }`}
        >
          {showPhoneFrame && (
            <div className="flex items-center justify-between text-slate-400 text-xs px-4 py-2 mb-2 font-medium">
              <span>9:41</span>
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
              <span className="flex items-center gap-1">5G 100%</span>
            </div>
          )}

          {/* Feed Header in Phone Frame */}
          {showPhoneFrame && (
            <div className="bg-slate-900 text-white px-3 py-2.5 rounded-2xl mb-3 flex items-center justify-between border border-blue-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs font-bold">
                    🎄
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">holiday_campaign</div>
                  <div className="text-[10px] text-slate-400">Offline Planner Preview</div>
                </div>
              </div>
              <div className="text-xs font-mono font-semibold text-sky-400">
                {filteredPosts.length} posts
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No Holiday Posts Drafted Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Start by uploading preview imagery, writing post hooks, and setting scheduled dates to curate your offline holiday feed grid.
              </p>
              <button
                onClick={onAddPost}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-sky-200" />
                Draft First Holiday Post
              </button>
            </div>
          ) : (
            /* Grid of Posts */
            <div
              className={`grid gap-2 sm:gap-3 ${
                activeTab === 'grid'
                  ? 'grid-cols-3'
                  : 'grid-cols-1 max-w-lg mx-auto'
              }`}
            >
              {filteredPosts.map((post, index) => {
                const hasMedia = post.media && post.media.length > 0;
                const coverImage = hasMedia ? post.media[0].dataUrl : null;

                return (
                  <div
                    key={post.id}
                    className={`group relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-xs transition-all hover:shadow-md hover:border-blue-400 ${getAspectRatioClass()}`}
                  >
                    {/* Background Image or Fallback Typography Card */}
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-blue-100/50 flex flex-col justify-between text-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                            {post.platform}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {post.scheduledDate}
                          </span>
                        </div>
                        <p className="text-xs font-semibold line-clamp-3 leading-snug text-slate-800">
                          {post.title || post.caption || 'No caption draft'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Click to attach image
                        </span>
                      </div>
                    )}

                    {/* Top Status & Carousel Indicators */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-xs ${getStatusBadge(post.status)}`}>
                        {post.status.replace('_', ' ')}
                      </span>

                      {post.media && post.media.length > 1 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold backdrop-blur-xs flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          {post.media.length}
                        </span>
                      )}
                    </div>

                    {/* Bottom Date Overlay Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 text-white flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1 text-[10px] font-medium truncate">
                        <Calendar className="w-2.5 h-2.5 shrink-0 text-sky-400" />
                        <span className="truncate">{post.scheduledDate}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">
                        {post.scheduledTime || '09:00'}
                      </span>
                    </div>

                    {/* Interactive Hover Overlay Controls */}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                      {/* Top Reorder controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(index, 'prev');
                            }}
                            className={`p-1.5 rounded-lg bg-white/20 hover:bg-white/40 transition-colors ${
                              index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Move left / earlier in feed"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === filteredPosts.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(index, 'next');
                            }}
                            className={`p-1.5 rounded-lg bg-white/20 hover:bg-white/40 transition-colors ${
                              index === filteredPosts.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Move right / later in feed"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-slate-300">
                          Slot #{index + 1}
                        </span>
                      </div>

                      {/* Middle Title & Hook Preview */}
                      <div className="my-auto text-center px-1">
                        <p className="text-xs font-bold line-clamp-2 mb-1 text-white">
                          {post.title}
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                          {post.caption || 'No caption text drafted'}
                        </p>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => onSelectPostPreview(post)}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                          title="Simulated Mobile Post Mockup"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditPost(post)}
                          className="p-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-white font-bold transition-colors"
                          title="Edit Post Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicatePost(post)}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                          title="Duplicate Post"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add More Tile */}
              <button
                onClick={onAddPost}
                className={`rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center p-4 text-slate-400 hover:text-blue-700 ${getAspectRatioClass()}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200/80 group-hover:bg-blue-100 flex items-center justify-center mb-1.5">
                  <Plus className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-xs font-semibold">Add Post Slot</span>
                <span className="text-[10px] text-slate-400">Offline draft</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
