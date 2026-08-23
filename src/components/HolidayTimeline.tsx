import React from 'react';
import { 
  Calendar, 
  Plus, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  Package, 
  Gift, 
  PartyPopper,
  ArrowRight
} from 'lucide-react';
import { Post, HolidayMilestone } from '../types';
import { HOLIDAY_MILESTONES } from '../utils/holidays';

interface HolidayTimelineProps {
  posts: Post[];
  onAddPostForMilestone: (milestone: HolidayMilestone) => void;
  onEditPost: (post: Post) => void;
}

export const HolidayTimeline: React.FC<HolidayTimelineProps> = ({
  posts,
  onAddPostForMilestone,
  onEditPost,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const getMilestoneIcon = (category: string) => {
    switch (category) {
      case 'major_retail': return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'ecommerce': return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'shipping': return <Package className="w-4 h-4 text-indigo-600" />;
      case 'cultural': return <Gift className="w-4 h-4 text-blue-500" />;
      default: return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Holiday Retail & Campaign Roadmap
          </h3>
          <p className="text-xs text-slate-500">
            Key Q4 shopping events, shipping cutoffs, and recommended campaign stages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOLIDAY_MILESTONES.map(milestone => {
          // Find posts on this exact date
          const matchingPosts = posts.filter(p => p.scheduledDate === milestone.date);
          const isPassed = milestone.date < todayStr;

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                matchingPosts.length > 0
                  ? 'bg-white border-blue-400 shadow-xs ring-1 ring-blue-500/10'
                  : 'bg-white/90 border-slate-200 hover:border-blue-300'
              } ${isPassed ? 'opacity-70' : ''}`}
            >
              <div>
                {/* Milestone Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getMilestoneIcon(milestone.category)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {milestone.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {milestone.date}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${milestone.badgeColor}`}>
                    {milestone.suggestedPhase.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {milestone.description}
                </p>
              </div>

              {/* Matching Scheduled Posts */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {matchingPosts.length} post{matchingPosts.length === 1 ? '' : 's'} scheduled
                  </span>

                  <button
                    onClick={() => onAddPostForMilestone(milestone)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Schedule Post</span>
                  </button>
                </div>

                {matchingPosts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {matchingPosts.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        onClick={() => onEditPost(post)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200/80 text-xs flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs">{post.platform === 'instagram' ? '📸' : '📱'}</span>
                          <span className="font-semibold text-slate-800 truncate">{post.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {post.scheduledTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
