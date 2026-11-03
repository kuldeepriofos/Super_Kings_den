'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Globe,
  Clock,
  User,
  Search,
  Flame,
} from 'lucide-react';
import MediaLibraryModal from '../../../../components/admin/MediaLibraryModal';
import RichTextEditor from '../../../../components/admin/RichTextEditor';
import PostSeoSchemaBox from '../../../../components/admin/PostSeoSchemaBox';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('CSK News');
  const [franchise, setFranchise] = useState('CSK');
  const [author, setAuthor] = useState('Super Kings Den Team');
  const [featuredImage, setFeaturedImage] = useState('');
  const [readingTime, setReadingTime] = useState('3 min read');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isMostViewed, setIsMostViewed] = useState(false);

  // SEO & Schema.org States
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robots, setRobots] = useState('index, follow');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [schemaType, setSchemaType] = useState('NewsArticle');
  const [customSchema, setCustomSchema] = useState('');

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Media Library Modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState('featured'); // 'featured' | 'content'
  const editorRef = useRef(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/admin/categories/');
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (e) {
        // ignore
      }
    }
    loadCats();
  }, []);

  const handleTitleChange = (val) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleMediaSelect = (media) => {
    if (mediaTarget === 'featured') {
      setFeaturedImage(media.url);
    } else if (mediaTarget === 'og') {
      setOgImage(media.url);
    } else if (mediaTarget === 'content') {
      if (editorRef.current?.insertImage) {
        editorRef.current.insertImage(media);
      } else {
        const imgHtml = `\n\n<figure class="wp-block-image size-large aligncenter"><img src="${media.url}" alt="${media.name || ''}" /><figcaption class="wp-element-caption"></figcaption></figure>\n\n<p class="wp-block-paragraph"><br></p>`;
        setContent((prev) => (prev ? `${prev}${imgHtml}` : imgHtml));
      }
    }
  };

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }

    setSaving(true);
    setError('');

    const cleanSlug = (slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();

    try {
      const res = await fetch('/api/admin/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: cleanSlug,
          category,
          franchise,
          author,
          featuredImage,
          readingTime,
          excerpt,
          content,
          isPublished,
          isMostViewed,
          seoTitle,
          metaDescription,
          focusKeywords,
          canonicalUrl,
          robots,
          ogTitle,
          ogDescription,
          ogImage,
          schemaType,
          customSchema,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [
    title,
    slug,
    category,
    franchise,
    author,
    featuredImage,
    readingTime,
    excerpt,
    content,
    isPublished,
    seoTitle,
    metaDescription,
    focusKeywords,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    schemaType,
    customSchema,
    router,
  ]);

  // Global Ctrl+S shortcut to save instantly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto pb-12">
      {/* Sticky Action Bar */}
      <div className="sticky top-16 z-20 bg-[#060c18]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800/90 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back Link & New Post Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/posts"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Back to All Posts"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {title || 'Add New Post'}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                  isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isPublished ? 'Will Publish' : 'Draft'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {slug ? `/${slug}/` : 'slug will be auto-generated from title'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
            Ctrl + S to publish
          </span>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Publishing...' : 'Publish Post'}</span>
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Headline / Title Input */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white font-bold text-base md:text-lg outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Permalink Info */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Globe className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              <span className="font-medium text-slate-500">Permalink:</span>
              <span className="font-mono text-slate-300 truncate">
                https://superkingsden.com/<strong className="text-yellow-400">{slug || 'your-title-slug'}</strong>/
              </span>
            </div>
          </div>

          {/* Article Rich Text Editor */}
          <div className="space-y-2">
            <RichTextEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              onOpenMedia={() => {
                setMediaTarget('content');
                setMediaModalOpen(true);
              }}
              placeholder="Write your article here. Use Visual mode for formatted preview, or switch to HTML mode..."
            />
          </div>

          {/* Excerpt & SEO Meta Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-yellow-400" />
                <span>Short Excerpt & Search Snippet</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {excerpt.length} characters
              </span>
            </div>

            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence summary for Google SEO cards and previews..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white text-xs outline-none transition-all resize-y placeholder:text-slate-600"
            />

          </div>

          {/* Full SEO & Schema.org Settings Box */}
          <PostSeoSchemaBox
            slug={slug}
            setSlug={setSlug}
            title={title}
            excerpt={excerpt}
            featuredImage={featuredImage}
            originalSlug={null}
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            focusKeywords={focusKeywords}
            setFocusKeywords={setFocusKeywords}
            canonicalUrl={canonicalUrl}
            setCanonicalUrl={setCanonicalUrl}
            robots={robots}
            setRobots={setRobots}
            ogTitle={ogTitle}
            setOgTitle={setOgTitle}
            ogDescription={ogDescription}
            setOgDescription={setOgDescription}
            ogImage={ogImage}
            setOgImage={setOgImage}
            schemaType={schemaType}
            setSchemaType={setSchemaType}
            customSchema={customSchema}
            setCustomSchema={setCustomSchema}
            onOpenMediaPicker={() => {
              setMediaTarget('og');
              setMediaModalOpen(true);
            }}
          />
        </div>

        {/* Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Box 1: Publish & Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Publish Status
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isPublished ? '● Published' : '○ Draft'}
              </span>
            </div>

            {/* Toggle Published */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs font-bold text-white block">Published to Live Site</span>
                <span className="text-[11px] text-slate-400">
                  {isPublished ? 'Visible to public readers' : 'Saved as draft in admin only'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer"
              />
            </label>

            {/* Toggle Most Viewed Spotlight */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/50 transition-colors">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Most Viewed Article</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {isMostViewed ? 'Featured in homepage "Most Viewed" filter' : 'Normal listing (not pinned in Most Viewed)'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isMostViewed}
                onChange={(e) => setIsMostViewed(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-amber-400 cursor-pointer"
              />
            </label>

            {/* Quick Publish button in sidebar */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Publishing...' : 'Publish Post Now'}</span>
            </button>
          </div>

          {/* Box 2: Featured Image */}
          <div className="bg-slate-900/80 border border-yellow-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-yellow-400" />
                <span>Featured Image</span>
              </h3>
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {featuredImage ? (
              <div className="space-y-2">
                <div
                  onClick={() => {
                    setMediaTarget('featured');
                    setMediaModalOpen(true);
                  }}
                  className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 hover:border-yellow-400 overflow-hidden relative cursor-pointer group shadow"
                >
                  <img
                    src={featuredImage}
                    alt="Featured preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-yellow-400 gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Replace Image</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono truncate px-1" title={featuredImage}>
                  {featuredImage}
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setMediaTarget('featured');
                  setMediaModalOpen(true);
                }}
                className="w-full aspect-video rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-yellow-400/60 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-yellow-400/10 text-slate-500 group-hover:text-yellow-400 transition-colors mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-yellow-400">
                  Set Featured Image
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Choose from media library or upload
                </span>
              </div>
            )}
          </div>

          {/* Box 3: Taxonomy & Metadata */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800/80 pb-3">
              Taxonomy & Details
            </h3>

            {/* Category */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
              >
                {category && !categories.some((c) => c.name.toLowerCase() === category.toLowerCase()) && (
                  <option value={category}>{category}</option>
                )}
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Author</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
              />
            </div>

            {/* Reading Time */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Reading Time Estimate</span>
              </label>
              <input
                type="text"
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        title={mediaTarget === 'featured' ? 'Set Featured Image' : 'Insert Media into Post'}
        selectButtonText={mediaTarget === 'featured' ? 'Set Featured Image' : 'Insert into Post'}
      />
    </div>
  );
}
