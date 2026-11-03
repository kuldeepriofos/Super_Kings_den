'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Search,
  Check,
  Image as ImageIcon,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select or Upload Media',
  selectButtonText = 'Set Featured Image',
}) {
  const [activeTab, setActiveTab] = useState('library'); // 'upload' | 'library'
  const [mediaItems, setMediaItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 36, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const fetchMedia = async (pageToLoad = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: '36',
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await fetch(`/api/admin/media/?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMediaItems(data.media || []);
        setPagination(data.pagination || { page: 1, limit: 36, total: 0, totalPages: 1 });
        if (data.media?.length > 0 && !selectedMedia) {
          setSelectedMedia(data.media[0]);
        }
      }
    } catch (err) {
      console.error('Fetch media error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia(1, search);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) fetchMedia(1, search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Refresh list, select new media item, and switch to library tab
      setSelectedMedia(data.media);
      setActiveTab('library');
      fetchMedia(1, '');
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmSelect = () => {
    if (selectedMedia && onSelect) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl h-[90vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar */}
        <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-yellow-400" />
              <span>{title}</span>
            </h2>

            {/* Navigation Tabs */}
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-yellow-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'bg-yellow-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Upload Files */}
        {activeTab === 'upload' && (
          <div
            className={`flex-1 p-8 flex flex-col items-center justify-center transition-colors ${
              dragOver ? 'bg-yellow-500/10 border-2 border-dashed border-yellow-400' : 'bg-slate-900/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept="image/*"
              className="hidden"
            />

            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center mb-4 text-yellow-400">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Drop files to upload</h3>
            <p className="text-xs text-slate-400 mb-6">or select image files from your computer</p>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Uploading Image...' : 'Select Files'}
            </button>

            <p className="text-[11px] text-slate-500 mt-4">
              Maximum upload file size: 25 MB. Supported: JPG, PNG, WEBP, AVIF, GIF, SVG.
            </p>

            {uploadError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Media Library */}
        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left Area: Filter Bar + Image Thumbnails Grid */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
              {/* Filter / Search Bar */}
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search media items by name..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchMedia(pagination.page, search)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    title="Refresh media list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-yellow-300 border border-yellow-500/20 flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload New</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Thumbnails Grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                {loading && mediaItems.length === 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-slate-800/60 animate-pulse" />
                    ))}
                  </div>
                ) : mediaItems.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {mediaItems.map((item) => {
                      const isSelected = selectedMedia?.url === item.url;
                      return (
                        <div
                          key={item.url}
                          onClick={() => setSelectedMedia(item)}
                          className={`aspect-square rounded-xl bg-slate-950 border overflow-hidden relative cursor-pointer group transition-all transform hover:scale-[1.02] ${
                            isSelected
                              ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-yellow-400 text-slate-950 flex items-center justify-center shadow font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate font-medium">{item.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-30 text-yellow-400" />
                    <p>No media files found matching your search.</p>
                  </div>
                )}
              </div>

              {/* Pagination Bar */}
              <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing <strong className="text-white">{mediaItems.length}</strong> of{' '}
                  <strong className="text-white">{pagination.total.toLocaleString()}</strong> items
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchMedia(pagination.page - 1, search)}
                    disabled={pagination.page <= 1}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs"
                  >
                    Previous
                  </button>
                  <span className="text-yellow-400 font-bold px-1">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchMedia(pagination.page + 1, search)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Right Area: Attachment Details Sidebar */}
            <div className="w-full md:w-80 bg-slate-950/70 p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0">
              {selectedMedia ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Attachment Details
                  </h4>

                  {/* Large Preview */}
                  <div className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-500">File Name:</div>
                      <div className="font-semibold text-white break-all">{selectedMedia.name}</div>
                    </div>

                    {selectedMedia.size && (
                      <div>
                        <div className="text-[11px] text-slate-500">File Size:</div>
                        <div className="text-slate-300">
                          {Math.round(selectedMedia.size / 1024)} KB
                        </div>
                      </div>
                    )}

                    {selectedMedia.dateFormatted && (
                      <div>
                        <div className="text-[11px] text-slate-500">Uploaded On:</div>
                        <div className="text-slate-300">{selectedMedia.dateFormatted}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] text-slate-500 mb-1">File URL:</div>
                      <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1.5">
                        <input
                          type="text"
                          readOnly
                          value={selectedMedia.url}
                          className="w-full bg-transparent text-[11px] text-yellow-300 font-mono outline-none px-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(selectedMedia.url)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          title="Copy URL"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs py-12">
                  Select an image from the library to view attachment details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Bar */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-400">
            {selectedMedia ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>Selected: <strong className="text-white">{selectedMedia.name}</strong></span>
              </span>
            ) : (
              <span>No image selected</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!selectedMedia}
              onClick={handleConfirmSelect}
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-yellow-500/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              {selectButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
