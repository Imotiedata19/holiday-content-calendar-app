import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Plus, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Post, Platform, PostStatus, CampaignPhase } from '../types';

interface PostListViewProps {
  posts: Post[];
  onAddPost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (post: Post) => void;
  onSelectPostPreview: (post: Post) => void;
  onQuickStatusChange: (postId: string, newStatus: PostStatus) => void;
  onCopySpreadsheet?: () => void;
}

export const PostListView: React.FC<PostListViewProps> = ({
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onSelectPostPreview,
  onQuickStatusChange,
  onCopySpreadsheet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const filteredPosts = posts.filter(post => {
    if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (phaseFilter !== 'all' && post.campaignPhase !== phaseFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchCaption = post.caption?.toLowerCase().includes(q);
      const matchTags = post.hashtags?.toLowerCase().includes(q);
      const matchDate = post.scheduledDate?.includes(q);
      return matchTitle || matchCaption || matchTags || matchDate;
    }

    return true;
  });

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'instagram': return '📸 Instagram';
      case 'tiktok': return '🎵 TikTok';
      case 'pinterest': return '📌 Pinterest';
      case 'x': return '𝕏 Twitter';
      case 'facebook': return '👥 Facebook';
      case 'linkedin': return '💼 LinkedIn';
      case 'threads': return '🧵 Threads';
      default: return '✉️ Newsletter';
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'ready': return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'scheduled': return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
      case 'in_review': return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
      case 'published': return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      default: return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts by title, caption hook, or date..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="pinterest">Pinterest</option>
            <option value="x">X / Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready to Post</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_review">In Review</option>
            <option value="published">Published</option>
          </select>

          {/* Copy for Spreadsheet Button */}
          {onCopySpreadsheet && (
            <button
              onClick={onCopySpreadsheet}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
              title="Copy all posts formatted for spreadsheet paste"
            >
              <Copy className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">Copy for Spreadsheet</span>
              <span className="sm:hidden">Copy</span>
            </button>
          )}

          {/* Add Post Button */}
          <button
            onClick={onAddPost}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-sky-200" />
            <span>Draft Post</span>
          </button>
        </div>
      </div>

      {/* Posts Table / Card List */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-sm font-semibold text-slate-700">No matching posts found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing search filters or add a new post draft.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Post Title / Hook</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPosts.map(post => {
                  const hasMedia = post.media && post.media.length > 0;
                  const coverImage = hasMedia ? post.media[0].dataUrl : null;

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Thumbnail Column */}
                      <td className="py-3 px-4 w-16">
                        {coverImage ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                            <img
                              src={coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {post.media.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/70 text-white text-[8px] font-bold rounded">
                                +{post.media.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                            No Img
                          </div>
                        )}
                      </td>

                      {/* Title & Caption */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {post.title || 'Untitled Post'}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {post.caption || 'No caption text'}
                        </p>
                        {post.hashtags && (
                          <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                            {post.hashtags}
                          </span>
                        )}
                      </td>

                      {/* Scheduled Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{post.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{post.scheduledTime || '09:00'}</span>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-800 text-[11px] border border-slate-200">
                          {getPlatformIcon(post.platform)}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={post.status}
                          onChange={e => onQuickStatusChange(post.id, e.target.value as PostStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-hidden ${getStatusBadge(post.status)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="in_review">In Review</option>
                          <option value="ready">Ready to Post</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="published">Published</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectPostPreview(post)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Mockup Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditPost(post)}
                            className="p-1.5 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Edit Post"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicatePost(post)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePost(post.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
