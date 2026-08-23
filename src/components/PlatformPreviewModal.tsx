import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Repeat, 
  Share2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { Post, Platform } from '../types';

interface PlatformPreviewModalProps {
  post: Post | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
}

export const PlatformPreviewModal: React.FC<PlatformPreviewModalProps> = ({
  post,
  onClose,
  onEdit,
}) => {
  const [activePlatformView, setActivePlatformView] = useState<Platform>(post?.platform || 'instagram');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!post) return null;

  const hasMedia = post.media && post.media.length > 0;
  const currentMedia = hasMedia ? post.media[activeMediaIndex] : null;

  return (
    <div
      id="preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="preview-modal-container"
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Mockup Preview:
            </span>
            <div className="flex items-center gap-1">
              {(['instagram', 'x', 'tiktok', 'linkedin'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setActivePlatformView(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    activePlatformView === p
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(post);
                onClose();
              }}
              className="p-1.5 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mockup Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex items-center justify-center">
          {/* INSTAGRAM MOCKUP */}
          {activePlatformView === 'instagram' && (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden text-slate-900">
              {/* Profile Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-700 p-[2px]">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-800">
                      ✨
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">your_brand_official</div>
                    <div className="text-[10px] text-slate-400">Sponsored • Holiday Collection</div>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Post Media Image / Carousel */}
              <div className="relative bg-slate-900 aspect-square flex items-center justify-center overflow-hidden">
                {currentMedia ? (
                  <img
                    src={currentMedia.dataUrl}
                    alt={currentMedia.filename || 'Post media'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-300">No Image Attached</p>
                    <p className="text-[11px]">Upload an image in the editor to preview here</p>
                  </div>
                )}

                {/* Carousel Controls if multiple images */}
                {post.media && post.media.length > 1 && (
                  <>
                    <button
                      type="button"
                      disabled={activeMediaIndex === 0}
                      onClick={() => setActiveMediaIndex(prev => Math.max(0, prev - 1))}
                      className="absolute left-2 p-1 rounded-full bg-black/60 text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={activeMediaIndex === post.media.length - 1}
                      onClick={() => setActiveMediaIndex(prev => Math.min(post.media.length - 1, prev + 1))}
                      className="absolute right-2 p-1 rounded-full bg-black/60 text-white disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1">
                      {post.media.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i === activeMediaIndex ? 'bg-white w-3' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-3 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800">
                  <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
                  <MessageCircle className="w-5 h-5 cursor-pointer" />
                  <Send className="w-5 h-5 cursor-pointer" />
                </div>
                <Bookmark className="w-5 h-5 text-slate-800 cursor-pointer" />
              </div>

              {/* Likes & Caption Text */}
              <div className="px-3.5 pb-3.5 space-y-1.5 text-xs text-slate-900">
                <div className="font-bold">1,842 likes</div>

                <div className="space-y-1">
                  <p className="whitespace-pre-line leading-relaxed">
                    <span className="font-bold mr-1.5">your_brand_official</span>
                    {post.caption || 'Your drafted caption will show here...'}
                  </p>

                  {post.hashtags && (
                    <p className="text-blue-900 font-mono text-[11px] leading-relaxed">
                      {post.hashtags}
                    </p>
                  )}
                </div>

                {post.callToAction && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800 flex items-center justify-between">
                    <span>{post.callToAction}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono uppercase pt-1">
                  Scheduled for {post.scheduledDate} at {post.scheduledTime || '09:00'}
                </div>
              </div>
            </div>
          )}

          {/* X / TWITTER MOCKUP */}
          {activePlatformView === 'x' && (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3 text-slate-900">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  𝕏
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate">Your Brand</span>
                    <span className="text-slate-500 text-xs truncate">@YourBrand</span>
                    <span className="text-slate-400 text-xs">· {post.scheduledDate}</span>
                  </div>

                  <p className="text-xs text-slate-800 mt-1 whitespace-pre-line leading-relaxed">
                    {post.caption || 'Write your X post draft...'}
                  </p>

                  {post.hashtags && (
                    <p className="text-sky-600 text-xs font-mono mt-1">
                      {post.hashtags}
                    </p>
                  )}
                </div>
              </div>

              {currentMedia && (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                  <img
                    src={currentMedia.dataUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 hover:text-slate-700 cursor-pointer">
                  <MessageCircle className="w-4 h-4" /> <span>24</span>
                </div>
                <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                  <Repeat className="w-4 h-4" /> <span>88</span>
                </div>
                <div className="flex items-center gap-1 hover:text-rose-600 cursor-pointer">
                  <Heart className="w-4 h-4" /> <span>312</span>
                </div>
                <div className="flex items-center gap-1 hover:text-slate-700 cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* TIKTOK / REELS MOCKUP */}
          {activePlatformView === 'tiktok' && (
            <div className="w-full max-w-xs bg-slate-950 text-white rounded-3xl overflow-hidden aspect-[9/16] relative flex flex-col justify-between p-4 shadow-2xl border-4 border-slate-800">
              {currentMedia ? (
                <img
                  src={currentMedia.dataUrl}
                  alt="TikTok"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  Attach vertical video thumbnail
                </div>
              )}

              <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-white/90">
                <span>Following</span>
                <span className="font-bold border-b-2 border-white pb-0.5">For You</span>
                <span className="opacity-0">🔍</span>
              </div>

              {/* Bottom Caption & Right Sidebar */}
              <div className="relative z-10 flex items-end justify-between gap-3">
                <div className="space-y-1.5 max-w-[75%]">
                  <div className="font-bold text-xs">@yourbrand_holiday</div>
                  <p className="text-[11px] text-white/90 line-clamp-3 leading-snug">
                    {post.caption}
                  </p>
                  <p className="text-[10px] text-sky-300 font-mono">
                    {post.hashtags}
                  </p>
                  <div className="text-[9px] text-slate-400 flex items-center gap-1">
                    <span>🎵 Original Sound - Holiday Remix 2026</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </div>
                    <span className="text-[9px] font-semibold">48.2K</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[9px] font-semibold">612</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-[9px] font-semibold">3.8K</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LINKEDIN MOCKUP */}
          {activePlatformView === 'linkedin' && (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3 text-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                  💼
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Your Business Official</div>
                  <div className="text-[10px] text-slate-500">12,400 followers • {post.scheduledDate}</div>
                </div>
              </div>

              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {post.caption || 'Write your professional holiday announcement...'}
              </p>

              {post.hashtags && (
                <p className="text-blue-700 font-mono text-[11px]">
                  {post.hashtags}
                </p>
              )}

              {currentMedia && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[1.91/1]">
                  <img
                    src={currentMedia.dataUrl}
                    alt="LinkedIn post"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
