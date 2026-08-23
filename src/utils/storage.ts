import { Post, StorageStats } from '../types';

const DB_NAME = 'HolidayCampaignPlannerDB';
const DB_VERSION = 1;
const STORE_POSTS = 'posts';
const LOCAL_STORAGE_BACKUP_KEY = 'holiday_posts_metadata_backup';

// Open or create IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_POSTS)) {
        const store = db.createObjectStore(STORE_POSTS, { keyPath: 'id' });
        store.createIndex('scheduledDate', 'scheduledDate', { unique: false });
        store.createIndex('platform', 'platform', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('campaignPhase', 'campaignPhase', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Get all posts from IndexedDB
export async function getAllPosts(): Promise<Post[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_POSTS, 'readonly');
      const store = transaction.objectStore(STORE_POSTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const posts = (request.result as Post[]) || [];
        // Sort by scheduledDate, then scheduledTime
        posts.sort((a, b) => {
          const dateDiff = a.scheduledDate.localeCompare(b.scheduledDate);
          if (dateDiff !== 0) return dateDiff;
          return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
        });
        resolve(posts);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('Falling back to localStorage for getAllPosts:', err);
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        return JSON.parse(raw) as Post[];
      }
    } catch {
      // ignore
    }
    return [];
  }
}

// Save a single post (insert or update)
export async function savePost(post: Post): Promise<void> {
  const updatedPost: Post = {
    ...post,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_POSTS, 'readwrite');
      const store = transaction.objectStore(STORE_POSTS);
      const request = store.put(updatedPost);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Also update a lightweight metadata copy in localStorage
    updateLightweightBackup();
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage:', err);
    fallbackSaveToLocalStorage(updatedPost);
  }
}

// Save multiple posts in batch
export async function saveAllPosts(posts: Post[]): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_POSTS, 'readwrite');
      const store = transaction.objectStore(STORE_POSTS);

      // Clear existing and rewrite
      store.clear().onsuccess = () => {
        let count = 0;
        if (posts.length === 0) {
          resolve();
          return;
        }
        for (const post of posts) {
          store.put(post);
          count++;
          if (count === posts.length) {
            resolve();
          }
        }
      };

      transaction.onerror = () => reject(transaction.error);
    });

    updateLightweightBackup();
  } catch (err) {
    console.warn('saveAllPosts fallback to localStorage:', err);
    try {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }
}

// Delete a post by ID
export async function deletePost(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_POSTS, 'readwrite');
      const store = transaction.objectStore(STORE_POSTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    updateLightweightBackup();
  } catch (err) {
    console.warn('deletePost fallback:', err);
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        const posts: Post[] = JSON.parse(raw);
        const filtered = posts.filter(p => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  }
}

// Helper to update backup in localStorage (stripping super large base64 if needed to avoid quota exceeded)
async function updateLightweightBackup() {
  try {
    const all = await getAllPosts();
    // Create copy with small media or placeholders if needed
    const serialized = JSON.stringify(all);
    if (serialized.length < 4 * 1024 * 1024) {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, serialized);
    } else {
      // Strip media base64 for localStorage lightweight snapshot
      const light = all.map(p => ({
        ...p,
        media: p.media.map(m => ({ ...m, dataUrl: '' }))
      }));
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(light));
    }
  } catch {
    // ignore
  }
}

function fallbackSaveToLocalStorage(post: Post) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    const list: Post[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(p => p.id === post.id);
    if (index >= 0) {
      list[index] = post;
    } else {
      list.push(post);
    }
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('LocalStorage save failed:', err);
  }
}

// Calculate Storage Statistics
export async function getStorageStats(): Promise<StorageStats> {
  const posts = await getAllPosts();
  let mediaCount = 0;
  let totalBytes = 0;

  for (const p of posts) {
    totalBytes += (p.title?.length || 0) * 2;
    totalBytes += (p.caption?.length || 0) * 2;
    totalBytes += (p.hashtags?.length || 0) * 2;
    if (p.media) {
      mediaCount += p.media.length;
      for (const m of p.media) {
        totalBytes += (m.dataUrl?.length || 0) * 2;
      }
    }
  }

  return {
    postCount: posts.length,
    mediaCount,
    estimatedBytes: totalBytes,
    storageType: typeof window !== 'undefined' && window.indexedDB ? 'indexedDB' : 'localStorage',
  };
}

// Helper to convert Image File to base64 Data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
