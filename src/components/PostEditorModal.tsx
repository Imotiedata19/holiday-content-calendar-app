import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  Plus, 
  Hash, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Post, Platform, PostStatus, CampaignPhase, PostMedia } from '../types';
import { HOLIDAY_MILESTONES, HOLIDAY_HASHTAG_PACKS } from '../utils/holidays';
import { fileToDataUrl } from '../utils/storage';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  initialPost?: Post | null;
  initialDate?: string;
  totalPostsCount?: number;
}

const PLATFORMS: { id: Platform; label: string; icon: string; maxChars: number }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸', maxChars: 2200 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', maxChars: 2200 },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', maxChars: 500 },
  { id: 'x', label: 'X / Twitter', icon: '𝕏', maxChars: 280 },
  { id: 'facebook', label: 'Facebook', icon: '👥', maxChars: 5000 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', maxChars: 3000 },
  { id: 'threads', label: 'Threads', icon: '🧵', maxChars: 500 },
  { id: 'email', label: 'Email / Newsletter', icon: '✉️', maxChars: 10000 },
];

const CAMPAIGN_PHASES: { id: CampaignPhase; label: string; icon: string }[] = [
  { id: 'teaser', label: 'Teaser & Warm-up', icon: '👀' },
  { id: 'early_access', label: 'VIP / Early Access', icon: '🔑' },
  { id: 'black_friday', label: 'Black Friday Main Event', icon: '🛍️' },
  { id: 'cyber_monday', label: 'Cyber Monday / Cyber Week', icon: '⚡' },
  { id: 'holiday_gifting', label: 'Gift Guide & Curations', icon: '🎁' },
  { id: 'shipping_deadline', label: 'Guaranteed Shipping Cutoff', icon: '📦' },
  { id: 'last_chance', label: 'Last Chance / Flash Sale', icon: '⏳' },
  { id: 'christmas', label: 'Christmas & Hanukkah', icon: '🎄' },
  { id: 'boxing_day', label: 'Boxing Day & Clearance', icon: '🏷️' },
  { id: 'new_year', label: 'New Year / Fresh Start', icon: '🥂' },
  { id: 'general', label: 'General Holiday Promo', icon: '⭐' },
];

const STATUS_OPTIONS: { id: PostStatus; label: string; color: string }[] = [
  { id: 'draft', label: 'Draft', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'in_review', label: 'In Review', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'ready', label: 'Ready to Post', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'published', label: 'Published', color: 'bg-slate-100 text-slate-800 border-slate-300' },
];

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPost,
  initialDate,
  totalPostsCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [campaignPhase, setCampaignPhase] = useState<CampaignPhase>('holiday_gifting');
  const [callToAction, setCallToAction] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [mediaList, setMediaList] = useState<PostMedia[]>([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '4:5' | '9:16' | '16:9'>('1:1');
  const [showHashtagPacks, setShowHashtagPacks] = useState(false);
  const [showHolidayPresets, setShowHolidayPresets] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPost) {
        setTitle(initialPost.title || '');
        setScheduledDate(initialPost.scheduledDate || '');
        setScheduledTime(initialPost.scheduledTime || '09:00');
        setPlatform(initialPost.platform || 'instagram');
        setCaption(initialPost.caption || '');
        setHashtags(initialPost.hashtags || '');
        setStatus(initialPost.status || 'draft');
        setCampaignPhase(initialPost.campaignPhase || 'holiday_gifting');
        setCallToAction(initialPost.callToAction || '');
        setLinkUrl(initialPost.linkUrl || '');
        setInternalNotes(initialPost.internalNotes || '');
        setMediaList(initialPost.media || []);
        if (initialPost.media && initialPost.media[0]?.aspectRatio) {
          setSelectedAspectRatio(initialPost.media[0].aspectRatio);
        }
      } else {
        // New post defaults
        const today = new Date().toISOString().split('T')[0];
        setTitle('');
        setScheduledDate(initialDate || today);
        setScheduledTime('10:00');
        setPlatform('instagram');
        setCaption('');
        setHashtags('');
        setStatus('draft');
        setCampaignPhase('holiday_gifting');
        setCallToAction('');
        setLinkUrl('');
        setInternalNotes('');
        setMediaList([]);
        setSelectedAspectRatio('1:1');
      }
    }
  }, [isOpen, initialPost, initialDate]);

  if (!isOpen) return null;

  const currentPlatformConfig = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
  const charCount = caption.length;
  const isOverLimit = charCount > currentPlatformConfig.maxChars;

  // Handle image files selection
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newMediaItems: PostMedia[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const dataUrl = await fileToDataUrl(file);
        newMediaItems.push({
          id: 'media_' + Math.random().toString(36).substring(2, 9),
          dataUrl,
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          aspectRatio: selectedAspectRatio,
        });
      } catch (err) {
        console.error('Error reading image file:', err);
      }
    }

    setMediaList(prev => [...prev, ...newMediaItems]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyHashtagPack = (packTags: string) => {
    setHashtags(prev => {
      const combined = prev ? `${prev} ${packTags}` : packTags;
      // Deduplicate tags
      const unique = Array.from(new Set(combined.split(/\s+/).filter(t => t.startsWith('#')))).join(' ');
      return unique;
    });
    setShowHashtagPacks(false);
  };

  const handleSelectHolidayPreset = (milestone: typeof HOLIDAY_MILESTONES[0]) => {
    setScheduledDate(milestone.date);
    setCampaignPhase(milestone.suggestedPhase);
    if (!title) {
      setTitle(`${milestone.name} Post`);
    }
    setShowHolidayPresets(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) {
      alert('Please select a scheduled date for this post.');
      return;
    }

    const postToSave: Post = {
      id: initialPost?.id || 'post_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      title: title.trim() || `${platform.toUpperCase()} Post (${scheduledDate})`,
      scheduledDate,
      scheduledTime,
      platform,
      caption,
      hashtags: hashtags.trim(),
      status,
      campaignPhase,
      media: mediaList.map(m => ({ ...m, aspectRatio: selectedAspectRatio })),
      callToAction: callToAction.trim(),
      linkUrl: linkUrl.trim(),
      internalNotes: internalNotes.trim(),
      gridOrderIndex: initialPost?.gridOrderIndex ?? (totalPostsCount + 1),
      createdAt: initialPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(postToSave);
    onClose();
  };

  return (
    <div 
      id="post-editor-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="post-editor-modal-container"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-semibold text-lg border border-blue-200">
              {currentPlatformConfig.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {initialPost ? 'Edit Holiday Draft' : 'Create Holiday Post Draft'}
              </h2>
              <p className="text-xs text-slate-500">
                100% Offline Local Browser Storage • Auto-serialized to IndexedDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="close-editor-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Row: Title & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Post Title / Hook
              </label>
              <input
                id="post-title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Cyber Monday 40% Off Bestsellers"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Workflow Status
              </label>
              <select
                id="post-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as PostStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule & Campaign Phase Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                  Scheduled Date
                </label>
                <button
                  type="button"
                  onClick={() => setShowHolidayPresets(!showHolidayPresets)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  Holiday Presets
                </button>
              </div>
              <input
                id="post-date-input"
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />

              {/* Holiday Presets Dropdown popup */}
              {showHolidayPresets && (
                <div className="mt-2 p-2 bg-white border border-slate-200 rounded-xl shadow-lg space-y-1 max-h-48 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase">
                    Select Q4 Holiday Milestone
                  </p>
                  {HOLIDAY_MILESTONES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectHolidayPreset(m)}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-900 rounded-md transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Target Time
              </label>
              <input
                id="post-time-input"
                type="time"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Campaign Phase
              </label>
              <select
                id="campaign-phase-select"
                value={campaignPhase}
                onChange={e => setCampaignPhase(e.target.value as CampaignPhase)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              >
                {CAMPAIGN_PHASES.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.icon} {phase.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Primary Target Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media Asset Upload Section (IndexedDB offline persistence) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                Upload Preview Images (Stored Offline in Browser)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Aspect Ratio:</span>
                {(['1:1', '4:5', '9:16', '16:9'] as const).map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ratio)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                      selectedAspectRatio === ratio
                        ? 'bg-blue-100 text-blue-900 border-blue-400'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Click to browse photos or drag and drop here
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports JPG, PNG, WEBP, GIF. Persisted automatically in browser storage.
                </p>
              </div>
            </div>

            {/* Uploaded Media Thumbnails */}
            {mediaList.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {mediaList.map((media, idx) => (
                  <div
                    key={media.id || idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 w-24 h-24 flex items-center justify-center"
                  >
                    <img
                      src={media.dataUrl}
                      alt={media.filename || 'Preview'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedia(idx);
                        }}
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {mediaList.length > 1 && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded-md">
                        {idx + 1}/{mediaList.length}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Caption & Hashtag Draft Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Drafted Caption Text
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-medium ${
                    isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  {charCount} / {currentPlatformConfig.maxChars} chars
                </span>
              </div>
            </div>

            <textarea
              id="post-caption-textarea"
              rows={4}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write your holiday post hook, story, promotional offer, discount code, and question to the audience..."
              className={`w-full p-3.5 bg-slate-50 border rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden transition-all ${
                isOverLimit
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                  : 'border-slate-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {isOverLimit && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Caption exceeds the character limit for {currentPlatformConfig.label}.
              </p>
            )}
          </div>

          {/* Hashtags Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                Hashtags & Keywords
              </label>
              <button
                type="button"
                onClick={() => setShowHashtagPacks(!showHashtagPacks)}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                Insert Holiday Hashtag Packs
              </button>
            </div>

            <input
              id="post-hashtags-input"
              type="text"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="#BlackFriday #HolidayGifting #StockingStuffers #CyberMonday"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
            />

            {/* Hashtag Packs Dropdown */}
            {showHashtagPacks && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-blue-950 uppercase">
                  One-Click Holiday Hashtag Bundles
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HOLIDAY_HASHTAG_PACKS.map((pack, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyHashtagPack(pack.tags)}
                      className="p-2 text-left bg-white border border-blue-200/80 rounded-lg hover:border-blue-400 hover:bg-blue-100/50 transition-all group"
                    >
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                        {pack.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {pack.tags}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Call to Action & Link URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Call to Action (CTA)
              </label>
              <input
                id="post-cta-input"
                type="text"
                value={callToAction}
                onChange={e => setCallToAction(e.target.value)}
                placeholder="e.g. Tap link in bio to shop 40% off"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                Landing Page / Product URL
              </label>
              <input
                id="post-link-input"
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://yourstore.com/holiday-sale"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Internal Execution Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Internal Team / Self Notes (Exported in CSV)
            </label>
            <input
              id="post-notes-input"
              type="text"
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              placeholder="e.g. Pin comment with discount code 'HOLIDAY40'. Post reel sound link: ..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <button
            id="cancel-editor-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              id="save-post-btn"
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-sky-200" />
              {initialPost ? 'Update Post Draft' : 'Save Holiday Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
