'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Folder,
  Plus,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  Edit,
  Trash2,
  Search,
  X,
  FileText,
  ChevronLeft,
  Globe,
  Eye,
  Code,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [showCreateSeo, setShowCreateSeo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState(null);
  const [originalSlug, setOriginalSlug] = useState('');
  const [editActiveTab, setEditActiveTab] = useState('general'); // 'general' | 'seo' | 'preview'
  const [editSaving, setEditSaving] = useState(false);

  // Delete category confirmation state
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories/');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenEdit = (cat) => {
    setEditingCategory({
      ...cat,
      seoTitle: cat.seoTitle || '',
      metaDescription: cat.metaDescription || '',
      focusKeywords: cat.focusKeywords || '',
      canonicalUrl: cat.canonicalUrl || `https://superkingsden.com/category/${cat.slug}/`,
      ogImage: cat.ogImage || '',
    });
    setOriginalSlug(cat.slug);
    setEditActiveTab('general');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          seoTitle,
          metaDescription,
          focusKeywords,
          canonicalUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: `Category "${name}" created successfully!` });
        setName('');
        setSlug('');
        setDescription('');
        setSeoTitle('');
        setMetaDescription('');
        setFocusKeywords('');
        setCanonicalUrl('');
        setShowCreateSeo(false);
        fetchCategories();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to create category' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    setEditSaving(true);
    try {
      const targetId = editingCategory._id || editingCategory.slug;
      const res = await fetch(`/api/admin/categories/${targetId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          seoTitle: editingCategory.seoTitle,
          metaDescription: editingCategory.metaDescription,
          focusKeywords: editingCategory.focusKeywords,
          canonicalUrl: editingCategory.canonicalUrl,
          ogImage: editingCategory.ogImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        let msg = 'Category updated successfully!';
        if (data.slugChanged) {
          msg += ` Automatic 301 Permanent Redirect created from /category/${data.oldSlug}/ to /category/${data.newSlug}/.`;
        }
        setActionMessage({ type: 'success', text: msg });
        setEditingCategory(null);
        fetchCategories();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to update category' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setEditSaving(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCat) return;

    setDeleting(true);
    try {
      const targetId = deleteConfirmCat._id || deleteConfirmCat.slug;
      const res = await fetch(`/api/admin/categories/${targetId}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: `Category "${deleteConfirmCat.name}" deleted.` });
        setDeleteConfirmCat(null);
        fetchCategories();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to delete category' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.slug && c.slug.toLowerCase().includes(q))
    );
  });

  // Calculate clean text for snippet preview
  const getCleanDescription = (raw) => {
    if (!raw) return '';
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-yellow-400 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Articles</span>
            </Link>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-[11px] font-bold text-yellow-400">Categories</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Folder className="w-6 h-6 text-yellow-400" />
            Categories &amp; Guides
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize articles, manage rich category overviews, SEO meta tags, and automated 301 redirects.
          </p>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden md:inline">View All</span> Posts
          </Link>
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid: Categories Table (2 cols) & Add New Category Form (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-3">Slug</th>
                    <th className="py-3 px-3 text-center">Live Posts</th>
                    <th className="py-3 px-3">SEO Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-800 rounded w-24" />
                        </td>
                        <td className="py-4 px-3">
                          <div className="h-4 bg-slate-800 rounded w-20" />
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="h-4 bg-slate-800 rounded w-8 mx-auto" />
                        </td>
                        <td className="py-4 px-3">
                          <div className="h-4 bg-slate-800 rounded w-16" />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-4 bg-slate-800 rounded w-8 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const hasCustomSeo = Boolean(cat.seoTitle || cat.metaDescription);
                      const cleanDesc = getCleanDescription(cat.description);
                      return (
                        <tr key={cat.slug} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                              <span className="font-semibold">{cat.name}</span>
                            </div>
                            {cleanDesc && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 font-normal mt-0.5">
                                {cleanDesc}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            /{cat.slug}/
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-yellow-400">
                            {cat.count || 0}
                          </td>
                          <td className="py-3 px-3">
                            {hasCustomSeo ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Custom SEO
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full">
                                Auto Generated
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(cat)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 hover:bg-slate-700 transition cursor-pointer"
                                title="Edit Category & SEO"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/category/${cat.slug}/`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                                title="View live category page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => setDeleteConfirmCat(cat)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                title="Delete Category"
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
                        No categories found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add New Category Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Plus className="w-4 h-4 text-yellow-400" />
            <span>Add New Category</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                    );
                  }
                }}
                placeholder="e.g. IPL 2026 Specials"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 text-white placeholder-slate-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Slug URL</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. ipl-2026-specials"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 text-white placeholder-slate-600 outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Category Overview / Guide (HTML Supported)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write category overview or guide (supports HTML headings, paragraphs, lists)..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 text-white placeholder-slate-600 outline-none resize-none"
              />
            </div>

            {/* Expandable SEO Fields for New Category */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCreateSeo(!showCreateSeo)}
                className="flex items-center gap-1.5 text-[11px] text-yellow-400 hover:text-yellow-300 font-semibold cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{showCreateSeo ? 'Hide SEO Meta Fields' : '+ Configure SEO Meta Fields'}</span>
              </button>

              {showCreateSeo && (
                <div className="mt-3 space-y-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Custom SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="e.g. IPL 2026 Specials & Analysis | Super Kings Den"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-yellow-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Concise 150-160 char summary for Google search..."
                      rows={2}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-yellow-400 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Focus Keyword</label>
                    <input
                      type="text"
                      value={focusKeywords}
                      onChange={(e) => setFocusKeywords(e.target.value)}
                      placeholder="e.g. IPL 2026 CSK"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-yellow-400 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Creating...' : 'Create Category'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* EDIT CATEGORY MODAL (WIDE, TABBED, FULL SEO & HTML PREVIEW) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit Category: <span className="text-yellow-400">{editingCategory.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update guide content, customize SEO meta tags, and handle URLs safely.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setEditActiveTab('general')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  editActiveTab === 'general'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>General & Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('seo')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  editActiveTab === 'seo'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO Metadata & SERP</span>
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  editActiveTab === 'preview'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Page Banner Preview</span>
              </button>
            </div>

            {/* Slug Change 301 Warning Banner */}
            {originalSlug && editingCategory.slug && editingCategory.slug !== originalSlug && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Permanent Redirect (301) Will Be Created:</span>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-amber-300">
                    <span>/category/{originalSlug}/</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>/category/{editingCategory.slug}/</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    Existing backlinks and bookmarks will be automatically routed to the new URL without losing SEO rank.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              {/* TAB 1: GENERAL & OVERVIEW */}
              {editActiveTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.name || ''}
                        onChange={(e) =>
                          setEditingCategory((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Slug URL</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.slug || ''}
                        onChange={(e) =>
                          setEditingCategory((prev) => ({
                            ...prev,
                            slug: e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/[\s_-]+/g, '-'),
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Category Description / Rich Guide</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        HTML tags (&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;) supported
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={editingCategory.description || ''}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Enter category overview guide..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-yellow-400 leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      This content renders in the gold/navy hero banner on the category page. Long descriptions automatically include an expandable &quot;Read Full Category Guide&quot; toggle.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: SEO & METADATA */}
              {editActiveTab === 'seo' && (
                <div className="space-y-4">
                  {/* Google SERP Simulator */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Google Search Result Snippet Preview
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      https://superkingsden.com/category/{editingCategory.slug}/
                    </div>
                    <div className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer truncate">
                      {editingCategory.seoTitle ||
                        `${editingCategory.name} News, Articles & Analysis | Super Kings Den`}
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {editingCategory.metaDescription ||
                        getCleanDescription(editingCategory.description) ||
                        `Explore all news, analysis, and stories categorized under ${editingCategory.name} on Super Kings Den.`}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium">SEO Meta Title</label>
                      <span
                        className={`text-[10px] font-mono ${
                          (editingCategory.seoTitle || '').length > 60
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {(editingCategory.seoTitle || '').length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingCategory.seoTitle || ''}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, seoTitle: e.target.value }))
                      }
                      placeholder={`${editingCategory.name} News, Articles & Analysis | Super Kings Den`}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium">SEO Meta Description</label>
                      <span
                        className={`text-[10px] font-mono ${
                          (editingCategory.metaDescription || '').length > 160
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {(editingCategory.metaDescription || '').length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={editingCategory.metaDescription || ''}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      placeholder="Clean summary for search engine snippet..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-yellow-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Focus Keyword(s)</label>
                      <input
                        type="text"
                        value={editingCategory.focusKeywords || ''}
                        onChange={(e) =>
                          setEditingCategory((prev) => ({
                            ...prev,
                            focusKeywords: e.target.value,
                          }))
                        }
                        placeholder="e.g. IPL 2026 CSK"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Canonical URL</label>
                      <input
                        type="url"
                        value={
                          editingCategory.canonicalUrl ||
                          `https://superkingsden.com/category/${editingCategory.slug}/`
                        }
                        onChange={(e) =>
                          setEditingCategory((prev) => ({
                            ...prev,
                            canonicalUrl: e.target.value,
                          }))
                        }
                        placeholder={`https://superkingsden.com/category/${editingCategory.slug}/`}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Social OG Image URL (Optional)</label>
                    <input
                      type="text"
                      value={editingCategory.ogImage || ''}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, ogImage: e.target.value }))
                      }
                      placeholder="/uploads/2026/06/Chennai-Super-Kings-2026.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE PREVIEW */}
              {editActiveTab === 'preview' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-yellow-400" />
                    <span>How this category banner looks to visitors on the frontend:</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#00275B] to-[#001736] border border-blue-900/60 shadow-xl space-y-3 text-white">
                    <div className="flex items-center space-x-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                      <Folder className="w-4 h-4 text-yellow-400" />
                      <span>Category Archive &bull; {editingCategory.count || 0} Articles</span>
                    </div>

                    <h2 className="text-2xl font-black text-white">
                      {editingCategory.name || 'Category Name'}
                    </h2>

                    {editingCategory.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: editingCategory.description
                            .replace(/\s+data-[a-z0-9-]+="[^"]*"/gi, '')
                            .replace(/<p>\s*<\/p>/gi, ''),
                        }}
                        className="category-rich-html prose prose-invert prose-yellow max-w-none space-y-2 text-slate-200 text-xs sm:text-sm [&>h2]:text-white [&>h2]:font-bold [&>h3]:text-yellow-400 [&>h3]:font-bold [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>li]:leading-relaxed [&>li>strong]:text-yellow-300 [&>a]:text-yellow-400 [&>a]:underline"
                      />
                    ) : (
                      <p className="text-xs text-slate-300">
                        Curated dispatches, statistics, and stories filed under {editingCategory.name}.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-500/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{editSaving ? 'Saving...' : 'Save Category Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Category?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete category{' '}
                <span className="font-bold text-white">&quot;{deleteConfirmCat.name}&quot;</span>?
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2 text-xs">
              <button
                onClick={() => setDeleteConfirmCat(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
