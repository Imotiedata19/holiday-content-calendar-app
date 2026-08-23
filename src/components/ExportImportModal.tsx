import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Check, 
  Copy, 
  Eye, 
  Sparkles,
  Printer,
  Table,
  ClipboardCheck
} from 'lucide-react';
import { Post } from '../types';
import { 
  generateContentCalendarCsv, 
  downloadCsvFile, 
  parseCsvToPosts,
  copyPostsToSpreadsheetClipboard,
  generateSpreadsheetPasteData
} from '../utils/csv';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onImportPosts: (imported: Post[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  posts,
  onImportPosts,
}) => {
  const [activeTab, setActiveTab] = useState<'csv_export' | 'backup_json' | 'csv_import'>('csv_export');
  
  // CSV Export Options
  const [includeMediaSummary, setIncludeMediaSummary] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeInternalNotes, setIncludeInternalNotes] = useState(true);
  const [includeLinkUrl, setIncludeLinkUrl] = useState(true);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedSpreadsheet, setCopiedSpreadsheet] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const filename = `holiday_campaign_calendar_${currentYear}.csv`;

  const generatedCsvString = generateContentCalendarCsv(posts, {
    includeMediaSummary,
    includeHashtagsColumn: includeHashtags,
    includeInternalNotes,
    includeLinkUrl,
    sortByDate: true,
  });

  const handleDownloadCsv = () => {
    downloadCsvFile(generatedCsvString, filename);
  };

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(generatedCsvString);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  const handleCopySpreadsheet = async () => {
    const success = await copyPostsToSpreadsheetClipboard(posts);
    if (success) {
      setCopiedSpreadsheet(true);
      setTimeout(() => setCopiedSpreadsheet(false), 2500);
    }
  };

  // Full JSON Backup Export
  const handleExportJsonBackup = () => {
    const backupData = {
      version: 1,
      appName: 'Holiday Campaign Content Calendar',
      exportedAt: new Date().toISOString(),
      postCount: posts.length,
      posts,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `holiday_campaign_backup_full_${currentYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle JSON Backup File Upload
  const handleJsonFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && Array.isArray(parsed.posts)) {
          onImportPosts(parsed.posts as Post[]);
          setImportStatus(`Successfully restored ${parsed.posts.length} posts with all image assets!`);
        } else if (Array.isArray(parsed)) {
          onImportPosts(parsed as Post[]);
          setImportStatus(`Successfully restored ${parsed.length} posts!`);
        } else {
          setImportStatus('Error: Unrecognized backup JSON format.');
        }
      } catch (err) {
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV File Upload
  const handleCsvFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedDrafts = parseCsvToPosts(text);
        if (parsedDrafts.length > 0) {
          onImportPosts(parsedDrafts as Post[]);
          setImportStatus(`Successfully imported ${parsedDrafts.length} posts from CSV!`);
        } else {
          setImportStatus('No valid post rows found in this CSV.');
        }
      } catch (err) {
        setImportStatus('Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="export-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Export & Download Content Calendar
              </h2>
              <p className="text-xs text-slate-500">
                100% Offline CSV Export • Compatible with Excel, Google Sheets, Notion & Social Schedulers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('csv_export')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'csv_export'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Download CSV Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('backup_json')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'backup_json'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Full Offline Backup (JSON + Media)</span>
          </button>
          <button
            onClick={() => setActiveTab('csv_import')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'csv_import'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV / Restore Backup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CSV Export */}
          {activeTab === 'csv_export' && (
            <div className="space-y-5">
              {/* Export Options toggles */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Included CSV Columns & Options
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHashtags}
                      onChange={e => setIncludeHashtags(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hashtags & Keyword List</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLinkUrl}
                      onChange={e => setIncludeLinkUrl(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Call To Action & Destination Links</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMediaSummary}
                      onChange={e => setIncludeMediaSummary(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Media Asset Notes & Image Count</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInternalNotes}
                      onChange={e => setIncludeInternalNotes(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Internal Team / Execution Notes</span>
                  </label>
                </div>
              </div>

              {/* One-Click Spreadsheet Copy Banner */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-200 text-blue-900 text-[10px] font-extrabold uppercase tracking-wide rounded-md">
                      Fastest Option
                    </span>
                    <h4 className="text-xs font-bold text-blue-950">
                      Copy All Content for Google Sheets & Excel
                    </h4>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Copies all posts formatted as table rows & columns. Simply click below and press <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-300 font-mono text-[10px]">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-300 font-mono text-[10px]">⌘+V</kbd>) into any empty spreadsheet cell.
                  </p>
                </div>

                <button
                  id="modal-copy-spreadsheet-btn"
                  onClick={handleCopySpreadsheet}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                    copiedSpreadsheet
                      ? 'bg-blue-800 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiedSpreadsheet ? (
                    <>
                      <ClipboardCheck className="w-4 h-4 text-sky-200" />
                      <span>Copied! Ready to Paste</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-sky-200" />
                      <span>Copy for Spreadsheet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="download-csv-action-btn"
                  onClick={handleDownloadCsv}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Download className="w-4 h-4 text-sky-200" />
                  <span>Download &quot;{filename}&quot;</span>
                </button>

                <button
                  onClick={handleCopyCsv}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-blue-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  {copiedCsv ? (
                    <>
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Copied Raw CSV!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Raw CSV Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-blue-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Content Sheet</span>
                </button>
              </div>

              {/* Live CSV Code Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Live CSV Output Preview ({posts.length} records):</span>
                  <span className="text-[11px] font-mono text-slate-400">UTF-8 RFC-4180</span>
                </div>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre leading-relaxed border border-slate-800">
                  {generatedCsvString}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Full Offline Backup */}
          {activeTab === 'backup_json' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Full Offline Campaign Bundle</span>
                </div>
                <p>
                  Export a complete JSON snapshot containing all drafted captions, scheduled calendar timestamps, hashtag bundles, and <strong>100% of embedded preview images</strong>.
                </p>
                <p className="text-[11px] opacity-80">
                  You can restore this backup on another computer, keep it as an offline archive, or share the entire visual campaign with teammates without cloud fees.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Campaign Summary</h4>
                  <p className="text-xs text-slate-500">
                    {posts.length} posts • {posts.reduce((acc, p) => acc + (p.media?.length || 0), 0)} images embedded
                  </p>
                </div>

                <button
                  onClick={handleExportJsonBackup}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Download className="w-4 h-4 text-sky-200" />
                  <span>Download Full JSON Backup</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Import CSV or JSON */}
          {activeTab === 'csv_import' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Import Social Calendar or Restore Backup</span>
                </h4>
                <p>
                  Upload an existing CSV content calendar or a previously exported JSON backup to populate your offline calendar and visual grid.
                </p>
              </div>

              {importStatus && (
                <div className="p-3 bg-blue-50 border border-blue-300 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload CSV */}
                <div className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center space-y-2 cursor-pointer bg-slate-50/50 relative">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleCsvFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Table className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">Upload CSV File</div>
                  <p className="text-[11px] text-slate-500">
                    Imports dates, captions, platforms, and titles
                  </p>
                </div>

                {/* Upload JSON */}
                <div className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center space-y-2 cursor-pointer bg-slate-50/50 relative">
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleJsonFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">Restore JSON Backup</div>
                  <p className="text-[11px] text-slate-500">
                    Restores complete campaign state + offline images
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
