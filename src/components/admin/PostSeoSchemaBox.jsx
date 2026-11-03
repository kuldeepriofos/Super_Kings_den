'use client';

import React, { useState } from 'react';
import {
  Globe,
  Search,
  Share2,
  Code2,
  ArrowRightLeft,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function PostSeoSchemaBox({
  slug,
  setSlug,
  title,
  excerpt = '',
  featuredImage = '',
  originalSlug = null,
  seoTitle,
  setSeoTitle,
  metaDescription,
  setMetaDescription,
  focusKeywords,
  setFocusKeywords,
  canonicalUrl,
  setCanonicalUrl,
  robots,
  setRobots,
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImage,
  setOgImage,
  schemaType,
  setSchemaType,
  customSchema,
  setCustomSchema,
  onOpenMediaPicker,
}) {
  const [activeSubTab, setActiveSubTab] = useState('seo'); // 'seo' | 'social' | 'schema'
  const [schemaJsonValid, setSchemaJsonValid] = useState(true);

  const isSlugChanged = Boolean(originalSlug && slug && slug !== originalSlug);

  // Character counter helpers
  const getTitleStatus = (len) => {
    if (len >= 50 && len <= 60) return { text: 'Optimal (50-60 chars)', color: 'text-emerald-400' };
    if (len > 60 && len <= 70) return { text: 'A bit long (>60)', color: 'text-amber-400' };
    if (len > 70) return { text: 'May truncate in Google (>70)', color: 'text-red-400' };
    if (len > 0) return { text: 'Short (<50 chars)', color: 'text-slate-400' };
    return { text: 'Empty (Will fallback to Post Title)', color: 'text-slate-500' };
  };

  const getDescStatus = (len) => {
    if (len >= 130 && len <= 160) return { text: 'Optimal (130-160 chars)', color: 'text-emerald-400' };
    if (len > 160) return { text: 'May truncate in SERP (>160)', color: 'text-red-400' };
    if (len > 0) return { text: 'Short (<130 chars)', color: 'text-slate-400' };
    return { text: 'Empty (Will fallback to Excerpt)', color: 'text-slate-500' };
  };

  const handleCustomSchemaChange = (val) => {
    setCustomSchema(val);
    if (!val.trim()) {
      setSchemaJsonValid(true);
      return;
    }
    try {
      JSON.parse(val);
      setSchemaJsonValid(true);
    } catch (e) {
      setSchemaJsonValid(false);
    }
  };

  const displayTitle = seoTitle || title || 'Post Title | Super Kings Den';
  const displayDesc =
    metaDescription ||
    (excerpt ? excerpt.replace(/<[^>]+>/g, '').slice(0, 155) : 'Comprehensive news and tactical updates for Chennai Super Kings fans.');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Box Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              SEO, Social & Schema.org Settings
            </h3>
            <p className="text-[11px] text-slate-400">
              Control Google search appearance, URL slug, social cards, and structured data
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('seo')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'seo'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Google Search & Meta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('social')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'social'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social / OpenGraph</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('schema')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'schema'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Schema.org (JSON-LD)</span>
        </button>
      </div>

      {/* TAB 1: SEO & GOOGLE SEARCH */}
      {activeSubTab === 'seo' && (
        <div className="space-y-4">
          {/* Google SERP Live Snippet Preview */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5 font-sans">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
              <span>Google Search Result Snippet Preview</span>
              <span className="text-yellow-400/90 font-mono">Live SERP</span>
            </div>

            <div className="pt-1.5 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px] flex items-center justify-center flex-shrink-0">
                  S
                </div>
                <div className="truncate text-[11px]">
                  <span className="text-white font-medium">Super Kings Den</span>
                  <span className="text-slate-500"> › {slug || 'article-slug'}</span>
                </div>
              </div>

              <h4 className="text-[#8ab4f8] hover:underline cursor-pointer text-sm md:text-base font-medium leading-snug line-clamp-1">
                {displayTitle}
              </h4>

              <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                {displayDesc}
              </p>
            </div>
          </div>

          {/* Slug Input */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              URL Slug <span className="text-yellow-400 font-mono text-[10px]">(https://superkingsden.com/[slug]/)</span>
            </label>
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden focus-within:border-yellow-400">
              <span className="px-3 py-2 text-xs text-slate-500 bg-slate-900 border-r border-slate-800 font-mono">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '-')
                      .replace(/-{2,}/g, '-')
                  )
                }
                onBlur={(e) =>
                  setSlug(e.target.value.replace(/^-+|-+$/g, '').trim())
                }
                placeholder="post-slug-url"
                className="flex-1 bg-transparent px-3 py-2 text-xs text-yellow-300 font-mono font-semibold focus:outline-none"
              />
              <span className="px-3 py-2 text-xs text-slate-500 font-mono">/</span>
            </div>
          </div>

          {/* SEO Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 font-medium">
                SEO Meta Title <span className="text-yellow-400 text-[10px]">(&lt;title&gt;)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${getTitleStatus((seoTitle || title).length).color}`}>
                  {(seoTitle || title).length} / 60 chars
                </span>
                <span className="text-[10px] text-slate-500">
                  ({getTitleStatus((seoTitle || title).length).text})
                </span>
              </div>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || 'Custom SEO Title for Google (defaults to post title)'}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
            />
          </div>

          {/* SEO Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 font-medium">
                SEO Meta Description <span className="text-yellow-400 text-[10px]">(&lt;meta description&gt;)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${getDescStatus((metaDescription || excerpt).length).color}`}>
                  {(metaDescription || excerpt).length} / 160 chars
                </span>
                <span className="text-[10px] text-slate-500">
                  ({getDescStatus((metaDescription || excerpt).length).text})
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder={excerpt ? excerpt.replace(/<[^>]+>/g, '').slice(0, 160) : 'Concise summary for search engines (defaults to post excerpt)'}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none leading-relaxed"
            />
          </div>

          {/* Focus Keywords & Canonical URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Focus Keywords</label>
              <input
                type="text"
                value={focusKeywords}
                onChange={(e) => setFocusKeywords(e.target.value)}
                placeholder="e.g. CSK, MS Dhoni, Chepauk IPL 2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Canonical URL Override</label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={`https://superkingsden.com/${slug || 'post'}/`}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Robots Indexing Directive */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Robots Indexing Directive</label>
            <select
              value={robots || 'index, follow'}
              onChange={(e) => setRobots(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
            >
              <option value="index, follow">index, follow (Recommended - Show in Google & Follow links)</option>
              <option value="noindex, follow">noindex, follow (Hide from search, but follow internal links)</option>
              <option value="noindex, nofollow">noindex, nofollow (Do not index or follow)</option>
              <option value="index, nofollow">index, nofollow (Index page, do not follow links)</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 2: SOCIAL / OPEN GRAPH */}
      {activeSubTab === 'social' && (
        <div className="space-y-4">
          {/* Social Card Preview */}
          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            {(ogImage || featuredImage) ? (
              <div className="h-40 bg-slate-900 overflow-hidden relative">
                <img
                  src={ogImage || featuredImage}
                  alt="Social Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/superkingsden-1.png';
                  }}
                />
              </div>
            ) : (
              <div className="h-28 bg-slate-900 flex flex-col items-center justify-center text-slate-600 gap-1">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[11px]">No social preview image set</span>
              </div>
            )}

            <div className="p-3 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                superkingsden.com
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1">
                {ogTitle || seoTitle || title || 'Post Title'}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {ogDescription || metaDescription || excerpt || 'Social share description'}
              </p>
            </div>
          </div>

          {/* OG Title */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Open Graph Title</label>
            <input
              type="text"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder={seoTitle || title || 'Title for Facebook / WhatsApp / Twitter'}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
            />
          </div>

          {/* OG Description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Open Graph Description</label>
            <textarea
              rows={2}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder={metaDescription || excerpt || 'Description for social media shares'}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none"
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Social Share Image (OG Image)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder={featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none font-mono text-[11px]"
              />
              {onOpenMediaPicker && (
                <button
                  type="button"
                  onClick={onOpenMediaPicker}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Media Library</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Optimal resolution: 1200 x 630 pixels. Defaults to post featured image if blank.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEMA.ORG STRUCTURED DATA */}
      {activeSubTab === 'schema' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-blue-300">Google Rich Snippets & Structured Data</div>
              <p className="text-[11px] leading-relaxed">
                Super Kings Den automatically generates Google-compliant JSON-LD schema (including publisher, author, breadcrumbs, headline, and date tags). You can choose the primary schema type or supply custom JSON-LD.
              </p>
            </div>
          </div>

          {/* Schema Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Primary Article Schema Type (@type)
            </label>
            <select
              value={schemaType || 'NewsArticle'}
              onChange={(e) => setSchemaType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
            >
              <option value="NewsArticle">NewsArticle (Recommended for Google News & Sports reporting)</option>
              <option value="BlogPosting">BlogPosting (Standard cricket blog post)</option>
              <option value="Article">Article (General editorial article)</option>
            </select>
          </div>

          {/* Custom Schema.org JSON-LD Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span>Custom Schema.org JSON-LD (Optional)</span>
                <span className="text-[10px] text-slate-500 font-mono">&lt;script type=&quot;application/ld+json&quot;&gt;</span>
              </label>
              {customSchema && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    schemaJsonValid
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {schemaJsonValid ? 'Valid JSON' : 'Invalid JSON syntax'}
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={customSchema}
              onChange={(e) => handleCustomSchemaChange(e.target.value)}
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [...]\n}`}
              className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-xs text-slate-200 font-mono outline-none leading-relaxed ${
                !schemaJsonValid ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-yellow-400'
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to use automatic NewsArticle schema, or paste custom JSON (e.g. FAQPage, HowTo).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
