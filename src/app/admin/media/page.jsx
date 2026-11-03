'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  RefreshCw,
  Copy,
  CheckCircle2,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 36, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      }
    } catch (err) {
      console.error('Fetch media error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(1, search);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia(1, search);
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

      setSelectedMedia(data.media);
      fetchMedia(1, '');
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/media/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        if (selectedMedia?.url === item.url) {
          setSelectedMedia(null);
        }
        fetchMedia(pagination.page, search);
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-yellow-400" />
            Media Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, upload and manage all {pagination.total.toLocaleString()} images stored locally on disk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Add New Media'}</span>
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

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images by name or year..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchMedia(pagination.page, search)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh library"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Images */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        {loading && mediaItems.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaItems.map((item) => (
              <div
                key={item.url}
                onClick={() => setSelectedMedia(item)}
                className="aspect-square rounded-xl bg-slate-950 border border-slate-800 hover:border-yellow-400 overflow-hidden relative cursor-pointer group transition-all transform hover:scale-[1.02] shadow"
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-white truncate font-medium">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 text-xs">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30 text-yellow-400" />
            <p>No media files found matching your search.</p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{mediaItems.length}</strong> of{' '}
            <strong className="text-white">{pagination.total.toLocaleString()}</strong> images
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchMedia(pagination.page - 1, search)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-xs font-semibold"
            >
              Previous
            </button>
            <span className="text-yellow-400 font-bold px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchMedia(pagination.page + 1, search)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-xs font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Image Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Attachment Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="w-full h-56 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">File name:</span>
                  <span className="font-bold text-white break-all">{selectedMedia.name}</span>
                </div>

                {selectedMedia.size && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">File size:</span>
                    <span className="text-slate-300">{Math.round(selectedMedia.size / 1024)} KB</span>
                  </div>
                )}

                {selectedMedia.dateFormatted && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Uploaded on:</span>
                    <span className="text-slate-300">{selectedMedia.dateFormatted}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block text-[11px] mb-1">File URL:</span>
                  <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.url}
                      className="w-full bg-transparent text-yellow-300 font-mono text-[11px] outline-none px-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedMedia.url)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Copy URL"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-2">
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Original</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(selectedMedia)}
                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Confirm Delete Image
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{deleteConfirm.name}</strong> from disk? This cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
