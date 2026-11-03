'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  Folder,
  X,
  Layers,
  Sliders,
  Flame,
  User,
} from 'lucide-react';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title'
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [deleteModalPost, setDeleteModalPost] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState({});
  const [bulkAction, setBulkAction] = useState('');
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Bulk Edit Form state (WordPress style)
  const [bulkEditData, setBulkEditData] = useState({
    category: 'NO_CHANGE',
    author: '',
    status: 'NO_CHANGE', // 'NO_CHANGE' | 'publish' | 'draft'
    franchise: 'NO_CHANGE',
    isMostViewed: 'NO_CHANGE', // 'NO_CHANGE' | 'true' | 'false'
  });

  // Load categories for filter dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories/');
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (e) {
        // ignore
      }
    }
    loadCategories();
  }, []);

  const fetchPosts = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: '15',
          sortBy: sortBy,
        });
        if (search.trim()) params.append('search', search.trim());
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);

        const res = await fetch(`/api/admin/posts/?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setPosts(data.posts || []);
          setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Fetch posts error:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, selectedCategory, sortBy]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  // Bulk Selection Handlers
  const toggleSelect = (post) => {
    const id = post._id || post.slug;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((i) => i !== id);
        setSelectedTitles((t) => {
          const updated = { ...t };
          delete updated[id];
          return updated;
        });
        return next;
      } else {
        setSelectedTitles((t) => ({ ...t, [id]: post.title }));
        return [...prev, id];
      }
    });
  };

  const isAllPageSelected =
    posts.length > 0 && posts.every((p) => selectedIds.includes(p._id || p.slug));

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageKeys = new Set(posts.map((p) => p._id || p.slug));
      setSelectedIds((prev) => prev.filter((id) => !pageKeys.has(id)));
      setSelectedTitles((t) => {
        const updated = { ...t };
        pageKeys.forEach((k) => delete updated[k]);
        return updated;
      });
    } else {
      const newTitles = { ...selectedTitles };
      const newIds = [...selectedIds];
      posts.forEach((p) => {
        const k = p._id || p.slug;
        if (!newIds.includes(k)) {
          newIds.push(k);
          newTitles[k] = p.title;
        }
      });
      setSelectedIds(newIds);
      setSelectedTitles(newTitles);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectedTitles({});
    setBulkAction('');
  };

  // Single Delete
  const handleDelete = async () => {
    if (!deleteModalPost) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleteModalPost._id || deleteModalPost.slug}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: 'Article deleted successfully.' });
        setDeleteModalPost(null);
        fetchPosts(pagination.page);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to delete post' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Bulk Edit Handler (WordPress Style)
  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      const res = await fetch('/api/admin/posts/bulk/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          data: bulkEditData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: data.message || `Successfully updated ${selectedIds.length} article(s).`,
        });
        setBulkEditOpen(false);
        clearSelection();
        setBulkEditData({
          category: 'NO_CHANGE',
          author: '',
          status: 'NO_CHANGE',
          franchise: 'NO_CHANGE',
          isMostViewed: 'NO_CHANGE',
        });
        fetchPosts(pagination.page);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to bulk update articles' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setBulkUpdating(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/posts/bulk/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: data.message || `Successfully deleted ${selectedIds.length} article(s).`,
        });
        setBulkDeleteOpen(false);
        clearSelection();
        fetchPosts(pagination.page);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to bulk delete articles' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setBulkDeleting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-yellow-400" />
            Articles CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage all {pagination.total.toLocaleString()} articles stored in MongoDB
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-800 hover:border-yellow-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Folder className="w-3.5 h-3.5 text-yellow-400" />
            <span>Categories</span>
          </Link>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar with WordPress Bulk Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, keywords or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Dropdowns & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* WordPress-style Bulk Actions Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
            >
              <option value="">Bulk Actions</option>
              <option value="edit">Edit (Bulk Edit)</option>
              <option value="delete">Move to Trash / Delete</option>
            </select>
            <button
              type="button"
              onClick={() => {
                if (selectedIds.length === 0) {
                  setActionMessage({ type: 'error', text: 'Please select one or more articles first.' });
                  setTimeout(() => setActionMessage(null), 3000);
                  return;
                }
                if (bulkAction === 'edit') setBulkEditOpen(true);
                if (bulkAction === 'delete') setBulkDeleteOpen(true);
              }}
              disabled={!bulkAction}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition border border-slate-700 cursor-pointer disabled:pointer-events-none"
            >
              Apply
            </button>
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none max-w-xs truncate cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By (Default: Latest First) */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-yellow-400 font-bold focus:border-yellow-400 outline-none cursor-pointer"
            title="Sort Articles"
          >
            <option value="newest">⚡ Latest First</option>
            <option value="oldest">⏳ Oldest First</option>
            <option value="title">🔤 Title (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Floating Bulk Selection Action Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs shadow">
              {selectedIds.length}
            </span>
            <div>
              <span className="text-xs font-bold text-white block">
                {selectedIds.length} article{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <span className="text-[11px] text-slate-400">
                Bulk edit categories, authors, status or delete selected items
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Bulk Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 hover:border-red-400 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAllPage}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer"
                    title="Select / Deselect all on this page"
                  />
                </th>
                <th className="py-3 px-4 w-16">Cover</th>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-3 text-center">
                      <div className="w-4 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-slate-800 rounded w-16" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-slate-800 rounded w-20" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-6 bg-slate-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => {
                  const postKey = post._id || post.slug;
                  const isSelected = selectedIds.includes(postKey);

                  return (
                    <tr
                      key={postKey}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-yellow-500/10 border-l-2 border-yellow-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(post)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer"
                        />
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <img
                              src="/superkingsden-1.png"
                              alt="Super King's Den"
                              className="w-5 h-5 object-contain opacity-40"
                            />
                          )}
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/posts/${post.slug}`}
                            className="font-bold text-white hover:text-yellow-400 transition-colors line-clamp-1 text-[13px]"
                          >
                            {post.title}
                          </Link>
                          {post.isMostViewed && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0"
                              title="Marked as Most Viewed"
                            >
                              <Flame className="w-3 h-3 text-amber-400" />
                              Most Viewed
                            </span>
                          )}
                          {post.isPublished === false && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex-shrink-0">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                          /{post.slug}/
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]">
                          {post.category || 'CSK News'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-medium">
                        {post.date}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/posts/${post.slug}`}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 hover:bg-slate-700 transition-colors"
                            title="Edit article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/${post.slug}/`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="View on site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModalPost(post)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No articles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{posts.length}</span> of{' '}
            <span className="font-semibold text-white">{pagination.total.toLocaleString()}</span> articles
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-yellow-400 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* WordPress-Style Bulk Edit Modal */}
      {bulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-bold text-white">
                  Bulk Edit ({selectedIds.length} Articles Selected)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkEditOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Articles Preview */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Articles Selected to Update:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                {selectedIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200"
                  >
                    <span className="truncate max-w-[200px]">
                      {selectedTitles[id] || id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIds((prev) => prev.filter((i) => i !== id));
                        setSelectedTitles((t) => {
                          const n = { ...t };
                          delete n[id];
                          return n;
                        });
                      }}
                      className="text-slate-500 hover:text-red-400 font-bold ml-1"
                      title="Remove from bulk edit"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Fields Grid (WordPress Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={bulkEditData.category}
                  onChange={(e) =>
                    setBulkEditData({ ...bulkEditData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="NO_CHANGE">— No Change —</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Author
                </label>
                <input
                  type="text"
                  value={bulkEditData.author}
                  onChange={(e) =>
                    setBulkEditData({ ...bulkEditData, author: e.target.value })
                  }
                  placeholder="Leave blank for — No Change —"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* Status (Publish / Draft) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={bulkEditData.status}
                  onChange={(e) =>
                    setBulkEditData({ ...bulkEditData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="NO_CHANGE">— No Change —</option>
                  <option value="publish">Published (Visible to public readers)</option>
                  <option value="draft">Draft (Saved in admin only)</option>
                </select>
              </div>

              {/* Franchise */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Franchise
                </label>
                <select
                  value={bulkEditData.franchise}
                  onChange={(e) =>
                    setBulkEditData({ ...bulkEditData, franchise: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="NO_CHANGE">— No Change —</option>
                  <option value="CSK">CSK (Chennai Super Kings)</option>
                  <option value="JSK">JSK (Joburg Super Kings)</option>
                  <option value="TSK">TSK (Texas Super Kings)</option>
                </select>
              </div>

              {/* Most Viewed Spotlight */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Most Viewed Spotlight</span>
                </label>
                <select
                  value={bulkEditData.isMostViewed}
                  onChange={(e) =>
                    setBulkEditData({ ...bulkEditData, isMostViewed: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="NO_CHANGE">— No Change —</option>
                  <option value="true">Mark as Most Viewed (Featured in tab)</option>
                  <option value="false">Remove from Most Viewed (Standard listing)</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBulkEditOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkUpdate}
                disabled={bulkUpdating || selectedIds.length === 0}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {bulkUpdating ? 'Updating...' : `Update ${selectedIds.length} Article(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Delete {selectedIds.length} Articles?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete all{' '}
              <strong className="text-yellow-400">{selectedIds.length}</strong> selected article(s)?
              This will remove them from MongoDB and the website. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {bulkDeleting ? 'Deleting...' : `Yes, Delete All ${selectedIds.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Confirm Delete Article
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-yellow-300">"{deleteModalPost.title}"</span>?
              This will remove the post from MongoDB and local data.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
