export type Platform = 'instagram' | 'tiktok' | 'pinterest' | 'x' | 'facebook' | 'linkedin' | 'threads' | 'email';

export type PostStatus = 'draft' | 'in_review' | 'ready' | 'scheduled' | 'published';

export type CampaignPhase = 
  | 'teaser' 
  | 'early_access' 
  | 'black_friday' 
  | 'cyber_monday' 
  | 'holiday_gifting' 
  | 'shipping_deadline' 
  | 'last_chance' 
  | 'christmas' 
  | 'boxing_day' 
  | 'new_year' 
  | 'general';

export interface PostMedia {
  id: string;
  dataUrl: string; // Base64 string stored in IndexedDB for 100% offline persistence
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  altText?: string;
  aspectRatio?: '1:1' | '4:5' | '9:16' | '16:9';
}

export interface Post {
  id: string;
  title: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM (24-hr)
  platform: Platform;
  caption: string;
  hashtags: string;
  status: PostStatus;
  campaignPhase: CampaignPhase;
  media: PostMedia[];
  callToAction?: string;
  linkUrl?: string;
  internalNotes?: string;
  gridOrderIndex?: number;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayMilestone {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  category: 'major_retail' | 'ecommerce' | 'cultural' | 'shipping';
  suggestedPhase: CampaignPhase;
  description: string;
  badgeColor: string;
}

export interface StorageStats {
  postCount: number;
  mediaCount: number;
  estimatedBytes: number;
  storageType: 'indexedDB' | 'localStorage';
}
