'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Activity,
  Layers,
  HelpCircle,
  X,
  Check,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    permanent301: 0,
    temporary302: 0,
    active: 0,
    inactive: 0,
    totalHits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  // Filters & search
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | '301' | '302'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'most_hits' | 'last_hit' | 'source'

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Notifications
  const [notification, setNotification] = useState(null);

  // Modal: Add / Edit
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    statusCode: 301,
    matchType: 'exact',
    isActive: true,
    description: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal: Delete confirmation
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal: Live URL Redirect Tester
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testUrlInput, setTestUrlInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testingUrl, setTestingUrl] = useState(false);

  // Copy indicator
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Redirects
  const fetchRedirects = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: '50',
          sortBy,
        });
        if (search.trim()) params.append('search', search.trim());
        if (filterType !== 'all') params.append('type', filterType);
        if (filterStatus !== 'all') params.append('status', filterStatus);

        const res = await fetch(`/api/admin/redirects/?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setRedirects(data.redirects || []);
          if (data.stats) setStats(data.stats);
          if (data.pagination) setPagination(data.pagination);
        } else {
          showNotification('error', data.error || 'Failed to fetch redirects');
        }
      } catch (err) {
        showNotification('error', err.message || 'Error fetching redirects');
      } finally {
        setLoading(false);
      }
    },
    [search, filterType, filterStatus, sortBy]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRedirects(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchRedirects]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleCopy = (text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  // Open Editor for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      source: '',
      destination: '',
      statusCode: 301,
      matchType: 'exact',
      isActive: true,
      description: '',
    });
    setFormError('');
    setEditorModalOpen(true);
  };

  // Open Editor for Update
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      source: item.source,
      destination: item.destination,
      statusCode: item.statusCode || 301,
      matchType: item.matchType || 'exact',
      isActive: item.isActive !== false,
      description: item.description || '',
    });
    setFormError('');
    setEditorModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.source.trim()) {
      setFormError('Source URL path is required (e.g., /old-link/)');
      return;
    }
    if (!formData.destination.trim()) {
      setFormError('Destination URL is required (e.g., /new-link/ or https://...)');
      return;
    }

    setFormSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/redirects/${editingItem._id || editingItem.id}/`
        : '/api/admin/redirects/';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showNotification(
          'success',
          editingItem ? 'Redirect updated successfully!' : 'New redirect rule created!'
        );
        setEditorModalOpen(false);
        fetchRedirects(pagination.page);
      } else {
        setFormError(data.error || 'Failed to save redirect rule');
      }
    } catch (err) {
      setFormError(err.message || 'Network error while saving redirect');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`/api/admin/redirects/${item._id || item.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setRedirects((prev) =>
          prev.map((r) => (r._id === item._id ? { ...r, isActive: !r.isActive } : r))
        );
        setStats((prev) => ({
          ...prev,
          active: item.isActive ? prev.active - 1 : prev.active + 1,
          inactive: item.isActive ? prev.inactive + 1 : prev.inactive - 1,
        }));
      } else {
        showNotification('error', data.error || 'Could not update status');
      }
    } catch (err) {
      showNotification('error', 'Failed to toggle status');
    }
  };

  // Delete Redirect
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/redirects/${deleteModalItem._id || deleteModalItem.id}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Redirect rule deleted.');
        setDeleteModalItem(null);
        fetchRedirects(pagination.page);
      } else {
        showNotification('error', data.error || 'Failed to delete');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/admin/redirects/bulk/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || 'Bulk action completed');
        setSelectedIds(new Set());
        fetchRedirects(pagination.page);
      } else {
        showNotification('error', data.error || 'Bulk action failed');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Run Test Redirect
  const handleRunTest = async (e) => {
    if (e) e.preventDefault();
    if (!testUrlInput.trim()) return;

    setTestingUrl(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/redirects/lookup/?url=${encodeURIComponent(testUrlInput.trim())}`);
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ matched: false, error: err.message });
    } finally {
      setTestingUrl(false);
    }
  };

  // Export Rules as JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(redirects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `superkingsden-redirects-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const selectAllCurrentPage = () => {
    if (selectedIds.size === redirects.length && redirects.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(redirects.map((r) => r._id || r.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest">
              SEO &amp; Traffic Routing
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ArrowRightLeft className="w-6 h-6 text-yellow-400" />
            301 &amp; 302 Redirection Module
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage permanent (301) and temporary (302) URL redirection rules to preserve backlink SEO equity, eliminate 404 broken links, and track traffic analytics in MongoDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setTestModalOpen(true);
              setTestResult(null);
              setTestUrlInput('/dhoni/');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-800 hover:border-yellow-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-yellow-400" />
            <span>Test URL</span>
          </button>

          <button
            onClick={handleExportJson}
            title="Download redirect rules as JSON"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Redirect</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fadeIn shadow-md ${
            notification.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/70 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 4 Stats Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Total Redirects</span>
            <Layers className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.active} Active • {stats.inactive} Paused
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-emerald-400">301 Permanent</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{stats.permanent301}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            Passes 100% SEO Link Equity
          </div>
        </div>

        <div className="bg-slate-900/80 border border-sky-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-sky-400">302 Temporary</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-300">{stats.temporary302}</div>
          <div className="text-[11px] text-sky-500/80 mt-1">
            Promotions &amp; Match Days
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-amber-400">Total Hits Preserved</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {stats.totalHits.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1">
            Redirect requests handled
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search source path, target destination, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Code Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-yellow-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('301')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === '301'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              301
            </button>
            <button
              onClick={() => setFilterType('302')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === '302'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              302
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Paused Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="most_hits">Most Hits</option>
            <option value="last_hit">Last Hit</option>
            <option value="source">Source Path (A-Z)</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-300">
            <CheckCircle2 className="w-4 h-4 text-yellow-400" />
            <span>{selectedIds.size} redirect(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction('activate')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              Activate
            </button>
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction('deactivate')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
            >
              Pause
            </button>
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction('reset_hits')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              Reset Hits
            </button>
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction('delete')}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* 301 Browser Cache Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-200">Browser Cache Tip:</strong> Browsers (Chrome / Edge) store <strong className="text-emerald-400">301 Permanent Redirects</strong> in their local memory cache. If you paused a 301 rule and your browser still redirects, test in an <strong className="text-white">Incognito Tab (Ctrl+Shift+N)</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-yellow-300">Ctrl + Shift + R</kbd> to clear your browser cache.
          </span>
        </div>
      </div>

      {/* Main Redirects Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === redirects.length && redirects.length > 0}
                    onChange={selectAllCurrentPage}
                    className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-16">Status</th>
                <th className="py-3 px-3 w-20">Type</th>
                <th className="py-3 px-4">Source URL Path</th>
                <th className="py-3 px-2 w-8 text-center"></th>
                <th className="py-3 px-4">Target Destination</th>
                <th className="py-3 px-3 text-right">Hits</th>
                <th className="py-3 px-3 text-right">Last Hit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Loading redirection rules...</p>
                  </td>
                </tr>
              ) : redirects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ArrowRightLeft className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-300">No redirect rules found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || filterType !== 'all' || filterStatus !== 'all'
                        ? 'Try clearing your search or filters.'
                        : 'Click "Add New Redirect" to create your first 301 or 302 rule.'}
                    </p>
                  </td>
                </tr>
              ) : (
                redirects.map((item) => {
                  const id = item._id || item.id;
                  const isSelected = selectedIds.has(id);
                  const is301 = Number(item.statusCode) === 301;

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(id)}
                          className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                        />
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? 'Click to Pause' : 'Click to Activate'}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              item.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Code Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-black text-[10px] tracking-wide ${
                            is301
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {item.statusCode || 301}
                        </span>
                      </td>

                      {/* Source Path */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-100 max-w-xs truncate">
                        <div className="flex items-center gap-1.5 group">
                          <span className="truncate" title={item.source}>
                            {item.source}
                          </span>
                          <button
                            onClick={() => handleCopy(item.source, `src_${id}`)}
                            title="Copy path"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-yellow-400 transition-opacity"
                          >
                            {copiedId === `src_${id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {item.description && (
                          <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5" title={item.description}>
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Arrow */}
                      <td className="py-3 px-2 text-center text-slate-500">
                        <ArrowRight className="w-3.5 h-3.5 inline text-yellow-400/70" />
                      </td>

                      {/* Destination */}
                      <td className="py-3 px-4 font-mono text-yellow-300 max-w-xs truncate">
                        <div className="flex items-center gap-1.5 group">
                          <span className="truncate" title={item.destination}>
                            {item.destination}
                          </span>
                          <button
                            onClick={() => handleCopy(item.destination, `dest_${id}`)}
                            title="Copy destination"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-yellow-400 transition-opacity"
                          >
                            {copiedId === `dest_${id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Hit Counter */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            item.hitCount > 0 ? 'text-amber-300' : 'text-slate-500'
                          }`}
                        >
                          {item.hitCount > 0 && <Flame className="w-3 h-3 text-amber-400" />}
                          {item.hitCount.toLocaleString()}
                        </span>
                      </td>

                      {/* Last Hit */}
                      <td className="py-3 px-3 text-right text-slate-400 text-[11px] font-mono">
                        {formatRelativeTime(item.lastHitAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Live test in browser tab */}
                          <Link
                            href={item.source}
                            target="_blank"
                            title="Open Source URL in browser to test live redirect"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-yellow-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit rule"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModalItem(item)}
                            title="Delete rule"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total rules)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchRedirects(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-white px-2">{pagination.page}</span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRedirects(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT REDIRECT */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                  <ArrowRightLeft className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? 'Edit Redirection Rule' : 'Create 301 / 302 Redirection Rule'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure SEO status code, URL path, and destination target
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditorModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Source Path */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Source URL / Path <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="/old-player-link/ or /csk-team-2024"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-xs font-mono text-white outline-none transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  The incoming request path on superkingsden.com to catch and redirect.
                </p>
              </div>

              {/* Destination URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Target Destination URL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="/ms-dhoni/ or https://official-store.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-xs font-mono text-white outline-none transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Where users and bots should be routed (relative path or full https:// link).
                </p>
              </div>

              {/* Status Code Picker (301 vs 302 Radio Cards) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  HTTP Redirection Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* 301 Permanent */}
                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.statusCode === 301
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="statusCode"
                          value={301}
                          checked={formData.statusCode === 301}
                          onChange={() => setFormData({ ...formData, statusCode: 301 })}
                          className="text-emerald-500 focus:ring-emerald-400"
                        />
                        <span className="font-black text-xs">301 Permanent</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                        SEO Best
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Page has moved permanently. Passes 100% Google SEO juice &amp; updates search index.
                    </span>
                  </label>

                  {/* 302 Temporary */}
                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.statusCode === 302
                        ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/40 text-sky-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="statusCode"
                          value={302}
                          checked={formData.statusCode === 302}
                          onChange={() => setFormData({ ...formData, statusCode: 302 })}
                          className="text-sky-500 focus:ring-sky-400"
                        />
                        <span className="font-black text-xs">302 Temporary</span>
                      </div>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                        Campaign
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Temporary move (match tickets, contests, short promotions). Keeps old URL in Google.
                    </span>
                  </label>
                </div>
              </div>

              {/* Match Type & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Match Pattern
                  </label>
                  <select
                    value={formData.matchType}
                    onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="exact">Exact Path Match (Recommended)</option>
                    <option value="prefix">Prefix Match (/old/* → /new/*)</option>
                    <option value="regex">Regular Expression (Regex)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Rule Status
                  </label>
                  <div className="flex items-center gap-3 h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <input
                      type="checkbox"
                      id="ruleIsActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                    />
                    <label htmlFor="ruleIsActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      {formData.isActive ? 'Active (Live)' : 'Paused'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Internal Notes / Reason (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Migrated old WordPress URL after slug change"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 text-xs text-white outline-none"
                />
              </div>

              {/* Realtime Live Preview Box */}
              {formData.source.trim() && formData.destination.trim() && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-yellow-500/20 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Live Routing Simulation</span>
                  </div>
                  <div className="font-mono text-[10px] break-all text-slate-400">
                    <span className="text-white">Request:</span> superkingsden.com{formData.source}
                  </div>
                  <div className="font-mono text-[10px] break-all text-yellow-300">
                    <span className="text-white">Redirects:</span> HTTP {formData.statusCode} ➔ {formData.destination}
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
                >
                  {formSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingItem ? 'Save Changes' : 'Create Redirection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIVE URL REDIRECT TESTER */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                  <Activity className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live URL Redirect Simulator</h3>
                  <p className="text-[11px] text-slate-400">
                    Test any incoming URL to verify if a 301 or 302 rule triggers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleRunTest} className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Enter Test Path or Full URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testUrlInput}
                    onChange={(e) => setTestUrlInput(e.target.value)}
                    placeholder="/dhoni/ or /old-csk-article"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 text-xs font-mono text-white outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={testingUrl}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
                  >
                    {testingUrl ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>Simulate</span>
                  </button>
                </div>
              </form>

              {/* Test Results Output */}
              {testResult && (
                <div className="mt-4 p-4 rounded-xl border bg-slate-950/80 animate-fadeIn">
                  {testResult.matched ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Match Found! Redirect Active
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            testResult.redirect.statusCode === 301
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          HTTP {testResult.redirect.statusCode}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono text-xs">
                        <div className="text-slate-400">
                          Incoming:{' '}
                          <span className="text-white">{testResult.redirect.source}</span>
                        </div>
                        <div className="text-yellow-400 flex items-center gap-1">
                          <span>Target:</span>
                          <span className="text-yellow-300 font-bold">
                            {testResult.redirect.destination}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          Pattern Match Type: {testResult.redirect.matchType || 'exact'}
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          href={testResult.redirect.source}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-[11px] transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Test in Real Browser Tab</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-center py-2">
                      <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                      <div className="text-xs font-bold text-slate-300">No Redirection Match</div>
                      <p className="text-[11px] text-slate-500">
                        {testResult.message || 'This URL will not be redirected and will load normal content or 404.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Redirection Rule?</h3>
                <p className="text-xs text-slate-400">
                  This action cannot be undone. Any traffic to this URL will no longer be redirected.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <div>Source: <span className="text-red-400 font-bold">{deleteModalItem.source}</span></div>
              <div className="mt-1">Target: <span className="text-yellow-300">{deleteModalItem.destination}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {deleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
