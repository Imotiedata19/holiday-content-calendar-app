import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Image as ImageIcon, 
  Sparkles, 
  HardDrive, 
  Layers, 
  Clock, 
  TrendingUp,
  Download,
  Copy
} from 'lucide-react';
import { Post, StorageStats } from '../types';
import { HOLIDAY_MILESTONES } from '../utils/holidays';

interface CampaignStatsBarProps {
  posts: Post[];
  storageStats: StorageStats | null;
  onOpenExport: () => void;
  onOpenNewPost: () => void;
  onCopySpreadsheet?: () => void;
}

export const CampaignStatsBar: React.FC<CampaignStatsBarProps> = ({
  posts,
  storageStats,
  onOpenExport,
  onOpenNewPost,
  onCopySpreadsheet,
}) => {
  const totalPosts = posts.length;
  const readyPosts = posts.filter(p => p.status === 'ready' || p.status === 'scheduled' || p.status === 'published').length;
  const draftPosts = posts.filter(p => p.status === 'draft' || p.status === 'in_review').length;
  const readinessPercent = totalPosts > 0 ? Math.round((readyPosts / totalPosts) * 100) : 0;

  const totalImages = posts.reduce((sum, p) => sum + (p.media?.length || 0), 0);

  // Compute next major holiday countdown
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingMilestone = HOLIDAY_MILESTONES.find(m => m.date >= todayStr) || HOLIDAY_MILESTONES[4]; // Default to Black Friday
  
  let daysUntil = 0;
  if (upcomingMilestone) {
    const tDate = new Date();
    tDate.setHours(0, 0, 0, 0);
    const mDate = new Date(upcomingMilestone.date + 'T00:00:00');
    const diffTime = mDate.getTime() - tDate.getTime();
    daysUntil = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Campaign Readiness Score */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold uppercase tracking-wider">Campaign Readiness</span>
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{readinessPercent}%</span>
          <span className="text-xs font-semibold text-slate-500">
            {readyPosts} of {totalPosts} posts ready
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${readinessPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Next Major Holiday Milestone */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wider">Upcoming Milestone</span>
          <Calendar className="w-4 h-4 text-sky-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {upcomingMilestone ? upcomingMilestone.name : 'Black Friday'}
          </div>
          <div className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>{daysUntil === 0 ? 'Happening Today!' : `${daysUntil} days remaining`}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono mt-2">
          Target: {upcomingMilestone?.date}
        </span>
      </div>

      {/* 3. Media & Visual Assets Stored Offline */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wider">Visual Assets Stored</span>
          <ImageIcon className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900">{totalImages}</div>
          <div className="text-xs text-slate-500 font-medium">
            Previews serialized in browser IndexedDB
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold mt-2">
          <HardDrive className="w-3 h-3 text-blue-600" />
          <span>{formatStorageSize(storageStats?.estimatedBytes || 0)} cached offline</span>
        </div>
      </div>

      {/* 4. Quick Export & Spreadsheet Copy */}
      <div className="p-4 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-xs flex flex-col justify-between border border-blue-900/40">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
          <span className="font-bold uppercase tracking-wider text-sky-400">Offline & Free</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-300 font-mono border border-sky-400/30">
            No Subscription
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-snug">
          Export your complete holiday content calendar to CSV or copy directly into a spreadsheet.
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          {onCopySpreadsheet && (
            <button
              onClick={onCopySpreadsheet}
              className="flex-1 py-1.5 px-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
              title="Copy all rows formatted for spreadsheet paste"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy for Sheets</span>
            </button>
          )}
          <button
            onClick={onOpenExport}
            className="py-1.5 px-2.5 bg-blue-800/80 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-blue-700/60"
            title="Download CSV file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
