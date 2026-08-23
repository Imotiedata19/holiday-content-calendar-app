import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Layers, 
  Eye, 
  Edit3,
  Tag
} from 'lucide-react';
import { Post, HolidayMilestone } from '../types';
import { HOLIDAY_MILESTONES } from '../utils/holidays';

interface CalendarViewProps {
  posts: Post[];
  onSelectDate: (date: string) => void;
  onEditPost: (post: Post) => void;
  onAddPostForDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  posts,
  onSelectDate,
  onEditPost,
  onAddPostForDate,
}) => {
  // Current viewed month state (default to November of current year or today's month)
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Default to November if currently before November for convenient Q4 holiday planning
    if (d.getMonth() < 9) {
      return new Date(d.getFullYear(), 10, 1); // November 1st
    }
    return d;
  });

  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const setNovQ4 = () => {
    setCurrentDate(new Date(year, 10, 1)); // November
  };

  const setDecQ4 = () => {
    setCurrentDate(new Date(year, 11, 1)); // December
  };

  // Compute days in month and padding
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Mapping of posts by date (YYYY-MM-DD)
  const postsByDate: Record<string, Post[]> = {};
  posts.forEach(post => {
    if (post.scheduledDate) {
      if (!postsByDate[post.scheduledDate]) {
        postsByDate[post.scheduledDate] = [];
      }
      postsByDate[post.scheduledDate].push(post);
    }
  });

  // Mapping of holiday milestones by date
  const milestonesByDate: Record<string, HolidayMilestone[]> = {};
  HOLIDAY_MILESTONES.forEach(m => {
    if (!milestonesByDate[m.date]) {
      milestonesByDate[m.date] = [];
    }
    milestonesByDate[m.date].push(m);
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'pinterest': return '📌';
      case 'x': return '𝕏';
      case 'facebook': return '👥';
      case 'linkedin': return '💼';
      default: return '✉️';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-600';
      case 'scheduled': return 'bg-sky-500';
      case 'in_review': return 'bg-indigo-500';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-900 text-sm min-w-36 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Jump Buttons for Q4 */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <button
              onClick={setNovQ4}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                month === 10
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Nov (Black Friday)
            </button>
            <button
              onClick={setDecQ4}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                month === 11
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Dec (Holiday Rush)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200">
          {/* Previous Month Padding */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-24 sm:min-h-28 p-2 bg-slate-50/50 text-slate-300 select-none"
              >
                <span className="text-xs font-semibold">{dayNum}</span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayPosts = postsByDate[dateStr] || [];
            const dayMilestones = milestonesByDate[dateStr] || [];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDayDetail(dateStr)}
                className={`min-h-24 sm:min-h-28 p-1.5 sm:p-2 group flex flex-col justify-between transition-colors hover:bg-sky-50/60 cursor-pointer relative ${
                  isToday ? 'bg-sky-50/30' : 'bg-white'
                }`}
              >
                {/* Day Number and Quick Add */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPostForDate(dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sky-100 text-blue-700 rounded-md transition-all"
                    title={`Add post on ${dateStr}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Holiday Milestones Badge */}
                {dayMilestones.length > 0 && (
                  <div className="space-y-0.5 mb-1">
                    {dayMilestones.map(m => (
                      <div
                        key={m.id}
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border truncate leading-tight ${m.badgeColor}`}
                        title={`${m.name}: ${m.description}`}
                      >
                        {m.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Scheduled Posts in Cell */}
                <div className="space-y-1 overflow-hidden flex-1">
                  {dayPosts.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPost(post);
                      }}
                      className="text-[10px] sm:text-[11px] p-1 rounded-md bg-slate-100 hover:bg-sky-100/70 border border-slate-200/80 flex items-center gap-1 truncate font-medium text-slate-800 transition-colors shadow-2xs"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(post.status)}`} />
                      <span className="shrink-0 text-[10px]">{getPlatformIcon(post.platform)}</span>
                      <span className="truncate">{post.title || post.caption || 'Untitled'}</span>
                    </div>
                  ))}

                  {dayPosts.length > 3 && (
                    <div className="text-[9px] font-bold text-slate-500 pl-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Quick Inspector Drawer / Modal */}
      {selectedDayDetail && (
        <div
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Scheduled Posts for {selectedDayDetail}
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-blue-800 border border-sky-200">
                {(postsByDate[selectedDayDetail] || []).length} posts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddPostForDate(selectedDayDetail)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-700 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Post for Date
              </button>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>

          {/* Holiday Milestone if any */}
          {milestonesByDate[selectedDayDetail]?.map(m => (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${m.badgeColor}`}
            >
              <div>
                <span className="font-bold">{m.name}</span>
                <p className="text-[11px] opacity-90">{m.description}</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/10">
                {m.suggestedPhase.replace('_', ' ')}
              </span>
            </div>
          ))}

          {/* Posts for this day */}
          {(postsByDate[selectedDayDetail] || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No posts scheduled for this day. Click &ldquo;Add Post for Date&rdquo; to schedule a holiday draft.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(postsByDate[selectedDayDetail] || []).map(post => (
                <div
                  key={post.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/80 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {post.media && post.media.length > 0 ? (
                      <img
                        src={post.media[0].dataUrl}
                        alt="Thumbnail"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-lg shrink-0">
                        {getPlatformIcon(post.platform)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900">
                          {post.title || 'Untitled Post'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {post.scheduledTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {post.caption || 'No caption'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditPost(post)}
                    className="p-1.5 hover:bg-blue-100 text-blue-700 rounded-lg shrink-0 transition-colors"
                    title="Edit Post"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
