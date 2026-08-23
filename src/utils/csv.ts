import { Post, Platform, PostStatus, CampaignPhase } from '../types';

/**
 * Escapes a single CSV cell value according to RFC-4180 rules
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

export interface CsvExportOptions {
  includeMediaSummary?: boolean;
  includeHashtagsColumn?: boolean;
  includeInternalNotes?: boolean;
  includeLinkUrl?: boolean;
  sortByDate?: boolean;
}

/**
 * Generates a downloadable CSV Content Calendar from an array of posts
 */
export function generateContentCalendarCsv(posts: Post[], options: CsvExportOptions = {}): string {
  const {
    includeMediaSummary = true,
    includeHashtagsColumn = true,
    includeInternalNotes = true,
    includeLinkUrl = true,
    sortByDate = true,
  } = options;

  const exportList = [...posts];
  if (sortByDate) {
    exportList.sort((a, b) => {
      const dateDiff = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateDiff !== 0) return dateDiff;
      return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
    });
  }

  const headers = [
    'Scheduled Date',
    'Scheduled Time',
    'Platform',
    'Campaign Phase',
    'Status',
    'Post Title / Hook',
    'Caption Draft',
  ];

  if (includeHashtagsColumn) headers.push('Hashtags');
  if (includeLinkUrl) {
    headers.push('Call To Action');
    headers.push('Destination Link');
  }
  if (includeMediaSummary) headers.push('Media Asset (Count / File info)');
  if (includeInternalNotes) headers.push('Internal Notes');

  const rows: string[] = [];
  rows.push(headers.map(h => escapeCsvCell(h)).join(','));

  for (const post of exportList) {
    const rowValues: string[] = [
      escapeCsvCell(post.scheduledDate || ''),
      escapeCsvCell(post.scheduledTime || '09:00'),
      escapeCsvCell(post.platform?.toUpperCase() || 'INSTAGRAM'),
      escapeCsvCell(formatPhaseLabel(post.campaignPhase)),
      escapeCsvCell(formatStatusLabel(post.status)),
      escapeCsvCell(post.title || ''),
      escapeCsvCell(post.caption || ''),
    ];

    if (includeHashtagsColumn) {
      rowValues.push(escapeCsvCell(post.hashtags || ''));
    }
    if (includeLinkUrl) {
      rowValues.push(escapeCsvCell(post.callToAction || ''));
      rowValues.push(escapeCsvCell(post.linkUrl || ''));
    }
    if (includeMediaSummary) {
      const mediaSummary = post.media && post.media.length > 0 
        ? `${post.media.length} image(s) [${post.media.map(m => m.filename || 'local_image').join(', ')}]`
        : 'No media attached';
      rowValues.push(escapeCsvCell(mediaSummary));
    }
    if (includeInternalNotes) {
      rowValues.push(escapeCsvCell(post.internalNotes || ''));
    }

    rows.push(rowValues.join(','));
  }

  // Prepend UTF-8 BOM so Excel and Google Sheets open special characters and emojis seamlessly
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Formats a cell value for Tab-Separated Value (TSV) clipboard copy so spreadsheets
 * (Google Sheets, Excel, Numbers) cleanly parse multiple lines and special characters.
 */
function escapeTsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // If contains tabs, double quotes, or newlines, wrap in quotes and escape quotes
  if (str.includes('\t') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates clipboard-ready Tab-Separated Values (TSV) text for direct pasting
 * into spreadsheet apps like Google Sheets, Microsoft Excel, Apple Numbers, and Notion.
 */
export function generateSpreadsheetPasteData(posts: Post[]): string {
  const exportList = [...posts].sort((a, b) => {
    const dateDiff = (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
    if (dateDiff !== 0) return dateDiff;
    return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
  });

  const headers = [
    'Scheduled Date',
    'Scheduled Time',
    'Platform',
    'Campaign Phase',
    'Status',
    'Post Title / Hook',
    'Caption Draft',
    'Hashtags',
    'Call To Action',
    'Destination Link',
    'Media Assets',
    'Internal Notes',
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeTsvCell).join('\t'));

  for (const post of exportList) {
    const mediaSummary = post.media && post.media.length > 0 
      ? `${post.media.length} image(s) [${post.media.map(m => m.filename || 'image').join(', ')}]`
      : 'None';

    const rowValues: string[] = [
      escapeTsvCell(post.scheduledDate || ''),
      escapeTsvCell(post.scheduledTime || '09:00'),
      escapeTsvCell(post.platform?.toUpperCase() || 'INSTAGRAM'),
      escapeTsvCell(formatPhaseLabel(post.campaignPhase)),
      escapeTsvCell(formatStatusLabel(post.status)),
      escapeTsvCell(post.title || ''),
      escapeTsvCell(post.caption || ''),
      escapeTsvCell(post.hashtags || ''),
      escapeTsvCell(post.callToAction || ''),
      escapeTsvCell(post.linkUrl || ''),
      escapeTsvCell(mediaSummary),
      escapeTsvCell(post.internalNotes || ''),
    ];

    rows.push(rowValues.join('\t'));
  }

  return rows.join('\r\n');
}

/**
 * Copies all posts in rich spreadsheet format to the user's clipboard.
 * Uses both text/html (table) and text/plain (TSV) for highest fidelity across all spreadsheet tools.
 */
export async function copyPostsToSpreadsheetClipboard(posts: Post[]): Promise<boolean> {
  const tsvText = generateSpreadsheetPasteData(posts);

  const exportList = [...posts].sort((a, b) => {
    const dateDiff = (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
    if (dateDiff !== 0) return dateDiff;
    return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
  });

  // Build clean HTML table representation for rich clipboard paste
  const htmlRows = exportList.map(p => {
    const mediaSummary = p.media && p.media.length > 0 
      ? `${p.media.length} image(s) [${p.media.map(m => m.filename || 'image').join(', ')}]`
      : 'None';

    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br/>');

    return `<tr>
      <td>${escapeHtml(p.scheduledDate || '')}</td>
      <td>${escapeHtml(p.scheduledTime || '09:00')}</td>
      <td>${escapeHtml((p.platform || 'INSTAGRAM').toUpperCase())}</td>
      <td>${escapeHtml(formatPhaseLabel(p.campaignPhase))}</td>
      <td>${escapeHtml(formatStatusLabel(p.status))}</td>
      <td><strong>${escapeHtml(p.title || '')}</strong></td>
      <td>${escapeHtml(p.caption || '')}</td>
      <td>${escapeHtml(p.hashtags || '')}</td>
      <td>${escapeHtml(p.callToAction || '')}</td>
      <td>${escapeHtml(p.linkUrl || '')}</td>
      <td>${escapeHtml(mediaSummary)}</td>
      <td>${escapeHtml(p.internalNotes || '')}</td>
    </tr>`;
  }).join('');

  const htmlTable = `<table>
    <thead>
      <tr style="background-color: #f3f4f6; font-weight: bold;">
        <th>Scheduled Date</th>
        <th>Scheduled Time</th>
        <th>Platform</th>
        <th>Campaign Phase</th>
        <th>Status</th>
        <th>Post Title / Hook</th>
        <th>Caption Draft</th>
        <th>Hashtags</th>
        <th>Call To Action</th>
        <th>Destination Link</th>
        <th>Media Assets</th>
        <th>Internal Notes</th>
      </tr>
    </thead>
    <tbody>${htmlRows}</tbody>
  </table>`;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([htmlTable], { type: 'text/html' });
      const blobPlain = new Blob([tsvText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobPlain,
        })
      ]);
      return true;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsvText);
      return true;
    }
  } catch (err) {
    console.warn('ClipboardItem write failed, trying writeText fallback:', err);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tsvText);
        return true;
      }
    } catch (fallbackErr) {
      console.error('Failed to copy to clipboard:', fallbackErr);
    }
  }

  // Fallback using textarea element
  try {
    const textarea = document.createElement('textarea');
    textarea.value = tsvText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    return false;
  }
}

/**
 * Initiates browser download of the CSV file
 */
export function downloadCsvFile(csvContent: string, filename = 'holiday_content_calendar.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses an uploaded CSV file back into Post draft structures
 */
export function parseCsvToPosts(csvText: string): Partial<Post>[] {
  const text = csvText.replace(/^\uFEFF/, ''); // Remove BOM if present
  const lines = parseCsvLines(text);
  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.trim().toLowerCase());
  const posts: Partial<Post>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 0 || (values.length === 1 && values[0].trim() === '')) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });

    // Match fields flexibly
    const scheduledDate = rowObj['scheduled date'] || rowObj['date'] || new Date().toISOString().split('T')[0];
    const scheduledTime = rowObj['scheduled time'] || rowObj['time'] || '09:00';
    const platformRaw = (rowObj['platform'] || 'instagram').toLowerCase();
    const platform = isValidPlatform(platformRaw) ? platformRaw : 'instagram';
    const title = rowObj['post title / hook'] || rowObj['title'] || rowObj['hook'] || 'Imported Post';
    const caption = rowObj['caption draft'] || rowObj['caption'] || rowObj['text'] || '';
    const hashtags = rowObj['hashtags'] || '';
    const statusRaw = (rowObj['status'] || 'draft').toLowerCase().replace(/\s+/g, '_');
    const status: PostStatus = isValidStatus(statusRaw) ? statusRaw : 'draft';
    const phaseRaw = (rowObj['campaign phase'] || rowObj['phase'] || 'general').toLowerCase().replace(/\s+/g, '_');
    const campaignPhase: CampaignPhase = isValidPhase(phaseRaw) ? phaseRaw : 'general';
    const callToAction = rowObj['call to action'] || rowObj['cta'] || '';
    const linkUrl = rowObj['destination link'] || rowObj['link'] || rowObj['url'] || '';
    const internalNotes = rowObj['internal notes'] || rowObj['notes'] || '';

    posts.push({
      id: 'post_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      title,
      scheduledDate,
      scheduledTime,
      platform,
      caption,
      hashtags,
      status,
      campaignPhase,
      callToAction,
      linkUrl,
      internalNotes,
      media: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return posts;
}

/**
 * Robust CSV line splitter that handles multiline quoted values
 */
function parseCsvLines(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' && nextChar === '\n') {
        row.push(cell.trim());
        result.push(row);
        row = [];
        cell = '';
        i++; // Skip \n
      } else if (char === '\n' || char === '\r') {
        row.push(cell.trim());
        result.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }

  return result;
}

function isValidPlatform(val: string): val is Platform {
  return ['instagram', 'tiktok', 'pinterest', 'x', 'facebook', 'linkedin', 'threads', 'email'].includes(val);
}

function isValidStatus(val: string): val is PostStatus {
  return ['draft', 'in_review', 'ready', 'scheduled', 'published'].includes(val);
}

function isValidPhase(val: string): val is CampaignPhase {
  return [
    'teaser', 'early_access', 'black_friday', 'cyber_monday',
    'holiday_gifting', 'shipping_deadline', 'last_chance',
    'christmas', 'boxing_day', 'new_year', 'general'
  ].includes(val);
}

function formatPhaseLabel(phase: CampaignPhase): string {
  switch (phase) {
    case 'teaser': return 'Teaser / Warm-up';
    case 'early_access': return 'VIP / Early Access';
    case 'black_friday': return 'Black Friday Main Event';
    case 'cyber_monday': return 'Cyber Monday / Cyber Week';
    case 'holiday_gifting': return 'Gift Guide & Curations';
    case 'shipping_deadline': return 'Guaranteed Shipping Cutoff';
    case 'last_chance': return 'Last Chance / Flash Sale';
    case 'christmas': return 'Christmas & Hanukkah';
    case 'boxing_day': return 'Boxing Day & Clearance';
    case 'new_year': return 'New Year / Fresh Start';
    default: return 'General Campaign';
  }
}

function formatStatusLabel(status: PostStatus): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'in_review': return 'In Review';
    case 'ready': return 'Ready to Post';
    case 'scheduled': return 'Scheduled';
    case 'published': return 'Published';
    default: return 'Draft';
  }
}
