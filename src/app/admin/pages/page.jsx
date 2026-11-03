'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
  ArrowRightLeft,
  X,
  Save,
  Share2,
  Sliders,
  FileText,
  Image as ImageIcon,
  CheckCheck,
  Code2,
} from 'lucide-react';
import MediaLibraryModal from '../../../components/admin/MediaLibraryModal';

export default function AdminStaticPagesManager() {
  const [pages, setPages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    contentPages: 0,
    coreRoutes: 0,
    published: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'content' | 'core_route'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'published' | 'draft'

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' | 'create'
  const [activeTab, setActiveTab] = useState('seo'); // 'seo' | 'general' | 'social' | 'schema' | 'content'
  const [editingPage, setEditingPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    pageType: 'content',
    routePath: '',
    content: '',
    excerpt: '',
    seoTitle: '',
    metaDescription: '',
    focusKeywords: '',
    canonicalUrl: '',
    robots: 'index, follow',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    schemaType: 'WebPage',
    customSchema: '',
    isPublished: true,
  });

  // Notifications
  const [notification, setNotification] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch pages from API
  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages/');
      if (!res.ok) throw new Error('Failed to load pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.pages || []);
        if (data.counts) {
          setStats(data.counts);
        }
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      // Type filter
      if (filterType === 'franchise_hubs') {
        const isHub = ['chennai-super-kings', 'joburg-super-kings', 'texas-super-kings', 'jsk-news', 'tsk-news'].includes(page.slug);
        if (!isHub) return false;
      } else if (filterType !== 'all' && page.pageType !== filterType) {
        return false;
      }
      // Status filter
      if (filterStatus === 'published' && !page.isPublished) return false;
      if (filterStatus === 'draft' && page.isPublished) return false;
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = page.title?.toLowerCase().includes(q);
        const matchesSlug = page.slug?.toLowerCase().includes(q);
        const matchesPath = page.routePath?.toLowerCase().includes(q);
        const matchesSeo = page.seoTitle?.toLowerCase().includes(q);
        const matchesDesc = page.metaDescription?.toLowerCase().includes(q);
        const matchesKeywords = page.focusKeywords?.toLowerCase().includes(q);
        return (
          matchesTitle ||
          matchesSlug ||
          matchesPath ||
          matchesSeo ||
          matchesDesc ||
          matchesKeywords
        );
      }
      return true;
    });
  }, [pages, filterType, filterStatus, search]);

  // Open Edit Modal
  const openEditModal = (page) => {
    setModalMode('edit');
    setEditingPage(page);
    setForm({
      id: page.id || page._id,
      title: page.title || '',
      slug: page.slug || '',
      pageType: page.pageType || 'content',
      routePath: page.routePath || '',
      content: page.content || '',
      excerpt: page.excerpt || '',
      seoTitle: page.seoTitle || '',
      metaDescription: page.metaDescription || '',
      focusKeywords: page.focusKeywords || '',
      canonicalUrl: page.canonicalUrl || '',
      robots: page.robots || 'index, follow',
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImage: page.ogImage || '',
      schemaType: page.schemaType || (page.slug === 'about-us' ? 'AboutPage' : page.slug === 'contact-us' ? 'ContactPage' : 'WebPage'),
      customSchema: page.customSchema || '',
      isPublished: page.isPublished !== false,
    });
    setActiveTab('seo');
    setModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingPage(null);
    setForm({
      id: '',
      title: '',
      slug: '',
      pageType: 'content',
      routePath: '',
      content: '',
      excerpt: '',
      seoTitle: '',
      metaDescription: '',
      focusKeywords: '',
      canonicalUrl: '',
      robots: 'index, follow',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      schemaType: 'WebPage',
      customSchema: '',
      isPublished: true,
    });
    setActiveTab('general');
    setModalOpen(true);
  };

  // Auto slug generation from title (for new pages only)
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, title: val };
      if (modalMode === 'create' && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(val);
      }
      return updated;
    });
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSlugInput = (val) => {
    const formatted = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-{2,}/g, '-');
    setForm((prev) => ({ ...prev, slug: formatted }));
  };

  const handleSlugBlur = () => {
    setForm((prev) => ({
      ...prev,
      slug: (prev.slug || '').replace(/^-+|-+$/g, '').trim(),
    }));
  };

  // Handle Save (PUT or POST)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showNotification('Page title is required', 'error');
      return;
    }
    const cleanSlug = (form.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();

    if (!cleanSlug) {
      showNotification('Page slug is required', 'error');
      return;
    }

    const payload = {
      ...form,
      slug: cleanSlug,
    };

    setSaving(true);
    try {
      if (modalMode === 'edit') {
        const id = editingPage._id || editingPage.id;
        const res = await fetch(`/api/admin/pages/${id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update page');
        }

        showNotification('Page details & SEO metadata updated successfully!', 'success');
      } else {
        // Create new static page
        const res = await fetch('/api/admin/pages/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create page');
        }
        showNotification('New static page created successfully!', 'success');
      }

      setModalOpen(false);
      fetchPages();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (page) => {
    if (page.pageType === 'core_route') {
      showNotification('System core routes cannot be deleted', 'error');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${page.title}" (/${page.slug}/)? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const id = page._id || page.id;
      const res = await fetch(`/api/admin/pages/${id}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete page');
      }
      showNotification('Page deleted successfully', 'success');
      fetchPages();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(key);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Helper for live preview link
  const getPageUrl = (page) => {
    if (page.pageType === 'core_route') {
      return page.routePath || `/${page.slug}/`;
    }
    return `/${page.slug}/`;
  };

  // Character Counter color helpers
  const getTitleStatus = (len) => {
    if (len >= 50 && len <= 60) return { text: 'Optimal (50-60 chars)', color: 'text-emerald-400' };
    if (len > 60 && len <= 70) return { text: 'A bit long (>60)', color: 'text-amber-400' };
    if (len > 70) return { text: 'May truncate in Google (>70)', color: 'text-red-400' };
    if (len > 0) return { text: 'Short (<50 chars)', color: 'text-slate-400' };
    return { text: 'Empty', color: 'text-slate-500' };
  };

  const getDescStatus = (len) => {
    if (len >= 130 && len <= 160) return { text: 'Optimal (130-160 chars)', color: 'text-emerald-400' };
    if (len > 160) return { text: 'Will truncate in SERP (>160)', color: 'text-red-400' };
    if (len > 0) return { text: 'Short (<130 chars)', color: 'text-slate-400' };
    return { text: 'Empty', color: 'text-slate-500' };
  };

  // Detect slug change in edit mode
  const isSlugChanged = modalMode === 'edit' && editingPage && form.slug !== editingPage.slug;

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium backdrop-blur-md transition-all ${
            notification.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Pages Manager
              </h1>
              <p className="text-xs text-slate-400">
                Edit URLs (slugs), SEO Meta Titles, Descriptions, Robots indexing, Social Cards, and Schema.org for all site & core pages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPages}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            title="Refresh from MongoDB"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-yellow-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Page</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pages</span>
            <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats.total || pages.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Managed routes in system</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Content / Legal Pages</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">
            {stats.contentPages || pages.filter((p) => p.pageType === 'content').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">About, Privacy, Terms, Contact...</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Core System Routes</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2">
            {stats.coreRoutes || pages.filter((p) => p.pageType === 'core_route').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">/stats, /csk-trophies, /csk-team, /home...</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Published Pages</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {pages.filter((p) => p.isPublished !== false).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Live to public and search engines</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by title, slug, route, SEO meta, or keywords..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-yellow-400 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Pages ({pages.length})
          </button>
          <button
            onClick={() => setFilterType('content')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'content'
                ? 'bg-blue-500 text-white font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Content / Policy Pages ({pages.filter((p) => p.pageType === 'content').length})
          </button>
          <button
            onClick={() => setFilterType('franchise_hubs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'franchise_hubs'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Franchise Hubs (CSK, JSK, TSK)
          </button>
          <button
            onClick={() => setFilterType('core_route')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'core_route'
                ? 'bg-purple-500 text-white font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Core Routes ({pages.filter((p) => p.pageType === 'core_route').length})
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Page & Type</th>
                <th className="py-3 px-4">Slug / Live URL</th>
                <th className="py-3 px-4">SEO Meta Title</th>
                <th className="py-3 px-4">Meta Description Snippet</th>
                <th className="py-3 px-4">Robots</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                      <span>Loading pages...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Globe className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-400">No pages found</span>
                      <span className="text-xs text-slate-500">
                        Try modifying your search or filter pills.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => {
                  const titleStatus = getTitleStatus(page.seoTitle?.length || 0);
                  const isCore = page.pageType === 'core_route';
                  const pageUrl = getPageUrl(page);

                  return (
                    <tr
                      key={page.id || page._id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Page Title & Type */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm group-hover:text-yellow-400 transition-colors">
                          {page.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {isCore ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              <Lock className="w-2.5 h-2.5" />
                              Core Route
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              <FileText className="w-2.5 h-2.5" />
                              Content Page
                            </span>
                          )}
                          {!page.isPublished && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Slug & Live URL */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-yellow-400/90 font-semibold truncate max-w-[180px]">
                            /{page.slug}/
                          </span>
                          <button
                            onClick={() => copyToClipboard(pageUrl, page.slug)}
                            className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800"
                            title="Copy URL Path"
                          >
                            {copiedSlug === page.slug ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {isCore && page.routePath && page.routePath !== `/${page.slug}` && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Route: {page.routePath}
                          </div>
                        )}
                      </td>

                      {/* SEO Meta Title */}
                      <td className="py-3 px-4 max-w-[260px]">
                        <div className="text-xs text-slate-200 line-clamp-2" title={page.seoTitle}>
                          {page.seoTitle || <span className="text-slate-500 italic">Not set</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold ${titleStatus.color}`}>
                            {page.seoTitle?.length || 0} chars
                          </span>
                        </div>
                      </td>

                      {/* Meta Description */}
                      <td className="py-3 px-4 max-w-[320px]">
                        <div
                          className="text-xs text-slate-400 line-clamp-2 leading-relaxed"
                          title={page.metaDescription}
                        >
                          {page.metaDescription || (
                            <span className="text-slate-500 italic">No description provided</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {page.metaDescription?.length || 0} chars
                        </div>
                      </td>

                      {/* Robots */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            page.robots?.includes('noindex')
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {page.robots || 'index, follow'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Page in New Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => openEditModal(page)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-yellow-400/10 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 border border-yellow-400/30 rounded-lg transition-all"
                            title="Edit Slug & SEO"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit SEO</span>
                          </button>

                          {!isCore ? (
                            <button
                              onClick={() => handleDelete(page)}
                              className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-2 text-slate-600 cursor-not-allowed"
                              title="System Core Route: Protected from deletion"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Page Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0b1329] border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {modalMode === 'edit' ? `Edit "${editingPage?.title}"` : 'Add New Static Page'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {modalMode === 'edit'
                      ? `https://superkingsden.com/${editingPage?.slug}/`
                      : 'Create a new static route or content page with custom SEO'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/50">
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'seo'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SEO & SERP Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'general'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Slug & Page Settings</span>
                {isSlugChanged && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'social'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Social & OpenGraph</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'schema'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Schema.org (JSON-LD)</span>
              </button>

              {form.pageType === 'content' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'content'
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Page Content</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: SEO & SERP */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  {/* Google SERP Live Search Preview */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/80">
                      <span>Google Search Result Snippet Preview</span>
                      <span className="text-yellow-400/90 font-mono text-[10px]">Live SERP Mockup</span>
                    </div>

                    <div className="pt-2 font-sans">
                      {/* URL / Breadcrumb */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px] flex items-center justify-center">
                          S
                        </div>
                        <div className="truncate">
                          <span className="text-white text-[11px] font-medium">Super Kings Den</span>
                          <span className="text-slate-500 text-[11px]">
                            {' '}
                            › {form.slug ? form.slug : 'page'}
                          </span>
                        </div>
                      </div>

                      {/* Title in Google Blue */}
                      <h3 className="text-[#8ab4f8] hover:underline cursor-pointer text-base md:text-lg font-medium leading-snug mt-1 line-clamp-1">
                        {form.seoTitle || form.title || 'Page Title | Super Kings Den'}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300 text-xs leading-relaxed mt-1 line-clamp-2">
                        {form.metaDescription ||
                          'Set an enticing meta description for this page so readers on Google click through to your article or page.'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Edit URL Slug in SEO Tab */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>URL Slug (Permalink)</span>
                        <span className="text-yellow-400 text-[10px]">https://superkingsden.com/{form.slug || 'page'}/</span>
                      </label>
                      {isSlugChanged && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          Slug Modified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden focus-within:border-yellow-400">
                      <span className="px-3.5 py-2.5 text-xs text-slate-500 bg-slate-900 border-r border-slate-800 font-mono">
                        /
                      </span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => handleSlugInput(e.target.value)}
                        onBlur={handleSlugBlur}
                        placeholder="page-slug"
                        className="flex-1 bg-transparent px-3 py-2 text-xs text-yellow-300 font-mono font-semibold focus:outline-none"
                        required
                      />
                      <span className="px-3.5 py-2.5 text-xs text-slate-500 font-mono">/</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Edit this slug directly to update the page URL.
                    </p>
                  </div>

                  {/* SEO Meta Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>SEO Meta Title</span>
                        <span className="text-yellow-400 text-[10px]">(&lt;title&gt;)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${getTitleStatus(form.seoTitle.length).color}`}>
                          {form.seoTitle.length} / 60 chars
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({getTitleStatus(form.seoTitle.length).text})
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      placeholder="e.g. CSK Cricket Stats & All-Time Leaderboards | Super Kings Den"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-medium"
                    />
                    <p className="text-[11px] text-slate-500">
                      Optimal length: 50–60 characters. This appears in Google search result headlines and browser tabs.
                    </p>
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>Meta Description</span>
                        <span className="text-yellow-400 text-[10px]">(&lt;meta name=&quot;description&quot;&gt;)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${getDescStatus(form.metaDescription.length).color}`}>
                          {form.metaDescription.length} / 160 chars
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({getDescStatus(form.metaDescription.length).text})
                        </span>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={form.metaDescription}
                      onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      placeholder="e.g. Explore complete Chennai Super Kings IPL records, highest run scorers, purple cap winners, and Chepauk fortress statistics."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400 leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500">
                      Optimal length: 130–160 characters. A concise summary shown underneath the title link in search engines.
                    </p>
                  </div>

                  {/* Focus Keywords & Canonical URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Focus Keywords</label>
                      <input
                        type="text"
                        value={form.focusKeywords}
                        onChange={(e) => setForm({ ...form, focusKeywords: e.target.value })}
                        placeholder="e.g. CSK, Dhoni, IPL stats, Chepauk"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                      />
                      <p className="text-[11px] text-slate-500">Comma-separated target search phrases.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Canonical URL Override</label>
                      <input
                        type="text"
                        value={form.canonicalUrl}
                        onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                        placeholder={`https://superkingsden.com/${form.slug || 'page'}/`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono text-[11px]"
                      />
                      <p className="text-[11px] text-slate-500">
                        Leave blank to auto-use <span className="font-mono">https://superkingsden.com/{form.slug}/</span>.
                      </p>
                    </div>
                  </div>

                  {/* Robots Indexing Directive */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Robots Indexing Directive</label>
                    <select
                      value={form.robots}
                      onChange={(e) => setForm({ ...form, robots: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="index, follow">index, follow (Recommended - Show in Google & Follow links)</option>
                      <option value="noindex, follow">noindex, follow (Hide from Google, but follow links)</option>
                      <option value="noindex, nofollow">noindex, nofollow (Completely hide from crawlers)</option>
                      <option value="index, nofollow">index, nofollow (Index page, do not follow outbound links)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 2: GENERAL & SLUG */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Page Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Page Display Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Privacy Policy, Cricket Stats, About Us"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-bold"
                      required
                    />
                  </div>

                  {/* Page Slug */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>URL Slug</span>
                      {modalMode === 'edit' && editingPage.pageType === 'core_route' && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 font-normal">
                          <Lock className="w-3 h-3" /> Core Route
                        </span>
                      )}
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden focus-within:border-yellow-400">
                      <span className="px-3.5 py-2.5 text-xs text-slate-500 bg-slate-900 border-r border-slate-800 font-mono">
                        https://superkingsden.com/
                      </span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => handleSlugInput(e.target.value)}
                        onBlur={handleSlugBlur}
                        placeholder="my-static-page"
                        className="flex-1 bg-transparent px-3 py-2.5 text-xs text-yellow-300 font-mono font-semibold focus:outline-none"
                        required
                      />
                      <span className="px-3 py-2.5 text-xs text-slate-500 font-mono">/</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Lowercase alphanumeric characters and hyphens only.
                    </p>
                  </div>

                  {/* Page Type & Publishing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Page Type</label>
                      <select
                        value={form.pageType}
                        onChange={(e) => setForm({ ...form, pageType: e.target.value })}
                        disabled={modalMode === 'edit' && editingPage?.pageType === 'core_route'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 disabled:opacity-60"
                      >
                        <option value="content">Content / Policy / Editorial Page</option>
                        <option value="core_route">Core System Route</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Publication Status</label>
                      <select
                        value={form.isPublished ? 'published' : 'draft'}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'published' })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                      >
                        <option value="published">Published (Live to public)</option>
                        <option value="draft">Draft (Offline)</option>
                      </select>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Short Excerpt / Summary</label>
                    <textarea
                      rows={2}
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Brief excerpt about this page..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SOCIAL & OPENGRAPH */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  {/* Social Card Preview */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/80">
                      Social Card Preview (Facebook, Twitter/X, WhatsApp)
                    </div>

                    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg mt-3">
                      {form.ogImage ? (
                        <div className="h-44 bg-slate-950 overflow-hidden relative">
                          <img
                            src={form.ogImage}
                            alt="OG Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/superkingsden-1.png';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-slate-950 flex flex-col items-center justify-center text-slate-600 gap-1">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-[11px]">No social preview image selected</span>
                        </div>
                      )}

                      <div className="p-3.5 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                          superkingsden.com
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {form.ogTitle || form.seoTitle || form.title || 'Page Title'}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {form.ogDescription || form.metaDescription || 'No social description set.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OG Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Open Graph Title</label>
                    <input
                      type="text"
                      value={form.ogTitle}
                      onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                      placeholder={form.seoTitle || form.title || 'Page Title for Social Media'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave blank to automatically use the SEO Meta Title.
                    </p>
                  </div>

                  {/* OG Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Open Graph Description</label>
                    <textarea
                      rows={2}
                      value={form.ogDescription}
                      onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                      placeholder={form.metaDescription || 'Description for social media shares'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave blank to automatically use the Meta Description.
                    </p>
                  </div>

                  {/* OG Image */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Open Graph Social Image</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={form.ogImage}
                        onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                        placeholder="/uploads/2026/06/Chennai-Super-Kings-2026.jpg"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Recommended size: 1200 x 630 pixels.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: SCHEMA.ORG STRUCTURED DATA */}
              {activeTab === 'schema' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-blue-300">Schema.org Structured Data & Rich Snippets</div>
                      <p className="leading-relaxed">
                        Structured data helps Google understand this static page&apos;s identity and context. Super Kings Den automatically outputs standard JSON-LD structured data with breadcrumbs and publisher credentials.
                      </p>
                    </div>
                  </div>

                  {/* Schema Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Primary Schema.org Page Type (@type)
                    </label>
                    <select
                      value={form.schemaType || 'WebPage'}
                      onChange={(e) => setForm({ ...form, schemaType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="WebPage">WebPage (General static page)</option>
                      <option value="AboutPage">AboutPage (About us / Company identity)</option>
                      <option value="ContactPage">ContactPage (Contact form & outreach)</option>
                      <option value="FAQPage">FAQPage (Frequently asked questions)</option>
                      <option value="ItemPage">ItemPage (Specific topic or policy document)</option>
                      <option value="CollectionPage">CollectionPage (Listings or archives)</option>
                    </select>
                  </div>

                  {/* Custom Schema Override */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <span>Custom Schema.org JSON-LD (Optional)</span>
                        <span className="text-[10px] text-yellow-400 font-mono">&lt;script type=&quot;application/ld+json&quot;&gt;</span>
                      </label>
                    </div>
                    <textarea
                      rows={8}
                      value={form.customSchema}
                      onChange={(e) => setForm({ ...form, customSchema: e.target.value })}
                      placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "How to join Super Kings Den?",\n      "acceptedAnswer": { "@type": "Answer", "text": "..." }\n    }\n  ]\n}`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-400 font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave blank to use automatic Schema.org tags, or paste custom JSON-LD (e.g. FAQPage, Organization, ItemList).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: PAGE CONTENT (FOR CONTENT PAGES) */}
              {activeTab === 'content' && form.pageType === 'content' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Full HTML / Markdown Page Body</label>
                    <textarea
                      rows={14}
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Write or paste your page content here (HTML or plain text)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500">
                      HTML markup and paragraph tags are rendered on the live frontend.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/10 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{modalMode === 'edit' ? 'Update Page & SEO' : 'Create Page'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal Picker */}
      <MediaLibraryModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(mediaItem) => {
          if (mediaItem && mediaItem.url) {
            setForm((prev) => ({
              ...prev,
              ogImage: mediaItem.url,
            }));
          }
          setMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
