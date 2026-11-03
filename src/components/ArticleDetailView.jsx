'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, User, ChevronRight, Share2, ArrowLeft, Flame, Sparkles, Shield } from 'lucide-react';
import { sanitizeHtml } from '../lib/sanitizeHtml';


export default function ArticleDetailView({ post, relatedPosts = [] }) {
  if (!post) return null;

  // Track visited article in session storage for "Recently Viewed" filter
  React.useEffect(() => {
    if (post && post.slug && typeof window !== 'undefined') {
      try {
        const key = 'skd_visited_articles';
        const existing = JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || '[]');
        const updated = [post.slug, ...existing.filter((s) => s !== post.slug)].slice(0, 50);
        sessionStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        // Storage disabled or quota exceeded
      }
    }
  }, [post?.slug]);

  // Best-effort view counter: ping the server at most once per session per
  // article so popularity is tracked as a real number (not a static label).
  React.useEffect(() => {
    if (!post?.slug || typeof window === 'undefined') return;
    try {
      const seenKey = `skd_viewed_${post.slug}`;
      if (sessionStorage.getItem(seenKey)) return;
      sessionStorage.setItem(seenKey, '1');
      fetch('/api/posts/view/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: post.slug }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) {
      // storage disabled — skip view ping
    }
  }, [post?.slug]);

  // Structured Data Schema for Google News & SEO
  const rawImage = post.ogImage || post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
  const postImageUrl = rawImage.startsWith('http')
    ? rawImage
    : `https://superkingsden.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  const postUrl = `https://superkingsden.com/${post.slug}/`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'NewsArticle',
    'headline': post.seoTitle || post.title,
    'description': post.metaDescription || (post.excerpt || '').replace(/<[^>]+>/g, '').slice(0, 200),
    'image': [postImageUrl],
    'datePublished': post.publishedAt || post.date,
    'dateModified': post.modified || post.date,
    'author': [
      {
        '@type': 'Person',
        'name': post.author || 'Super Kings Den Team',
      },
    ],
    'publisher': {
      '@type': 'Organization',
      'name': 'Super Kings Den',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://superkingsden.com/superkingsden-1.png',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    'articleSection': post.category || 'CSK News',
    'keywords': post.focusKeywords || 'CSK, Chennai Super Kings, IPL 2026',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://superkingsden.com',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': post.category || 'News',
        'item': 'https://superkingsden.com/csk-news',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': postUrl,
      },
    ],
  };

  const shareUrl = `https://superkingsden.com/${post.slug}`;
  const encodedTitle = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(shareUrl);

  return (
    <article className="min-h-screen pb-16">
      {/* Schema.org Article & Breadcrumbs JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {post.customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.customSchema }}
        />
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/5 py-3 mb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition flex items-center">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link href="/news" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
              News
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-amber-700 dark:text-csk-yellow font-semibold">
              {post.category || 'News'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-[240px] sm:max-w-md font-medium">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Body (8 cols on lg) */}
          <div className="lg:col-span-8">
            {/* Back Button */}
            <Link
              href="/news"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-csk-yellow transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Den Dispatches</span>
            </Link>

            {/* Article Header Category Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-csk-yellow text-csk-darkNavy shadow-sm">
                {post.category || 'CSK News'}
              </span>
            </div>

            {/* Article Headline H1 */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white font-heading tracking-tight leading-tight mb-6">
              {post.title}
            </h1>

            {/* Meta Bar: Author, Date, Reading Time */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-csk-yellow to-amber-600 flex items-center justify-center text-csk-darkNavy shadow-md">
                  <Shield className="w-5 h-5 text-csk-darkNavy fill-csk-darkNavy" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {post.author}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Super Kings Senior Correspondent
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> {post.date}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> {post.readingTime}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl border border-slate-200 dark:border-csk-borderNavy aspect-[16/9] bg-slate-100 dark:bg-slate-900">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
                }}
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md text-[10px] font-bold bg-black/75 text-csk-yellow backdrop-blur-md border border-csk-yellow/30">
                SuperKingsDen Exclusives
              </div>
            </div>

            {/* Main Content HTML (Rendered from WordPress or Catalog) */}
            <div
              className="sports-article-content text-slate-800 dark:text-slate-200 leading-relaxed space-y-5 text-base sm:text-lg font-normal mb-10"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            {/* Social Share Bar */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-csk-yellow" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                    Share This Story With The Yellow Army:
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>𝕏 Post</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>

          </div>


          {/* Right Sidebar (4 cols on lg) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Newsletter Card */}
            <div className="sports-card p-6 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-gradient-to-br from-amber-50 to-slate-50 dark:from-csk-navy/90 dark:to-csk-darkNavy">
              <div className="flex items-center space-x-2 text-amber-700 dark:text-csk-yellow mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Yellow Army Dispatch</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-heading mb-2">
                Never Miss A Match Alert
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                Get breaking IPL 2026 team news, playing XI drops, and press conference quotes delivered straight to your inbox.
              </p>
              <form className="space-y-2.5">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-csk-yellow"
                />
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-semibold text-xs uppercase tracking-wider transition shadow-csk-glow"
                >
                  Join 100K+ Fans
                </button>
              </form>
            </div>

            {/* Related Stories */}
            <div className="sports-card p-6 rounded-2xl border border-slate-200 dark:border-csk-borderNavy">
              <div className="flex items-center space-x-2.5 mb-5">
                <div className="w-2.5 h-6 bg-csk-yellow rounded-full flex-shrink-0"></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white uppercase font-heading tracking-tight">
                    Related Stories
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id || related.slug}
                    href={`/${related.slug}`}
                    className="group flex gap-3 pb-4 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <img
                        src={related.featuredImage}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-csk-yellow uppercase tracking-wider block">
                        {related.category || 'CSK News'}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug font-heading">
                        {related.title}
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                        {related.readingTime || '3 min read'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Fan Poll */}
            <div className="sports-card p-6 rounded-2xl border border-slate-200 dark:border-csk-borderNavy text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-csk-yellow/20 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-csk-yellow" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white font-heading mb-1">
                Whistle Podu Anthem
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Support the Yellow Army on matchday. Listen to the official roar!
              </p>
              <Link
                href="/csk-team"
                className="inline-block w-full py-2.5 rounded-xl border border-amber-500 dark:border-csk-yellow text-amber-700 dark:text-csk-yellow hover:bg-csk-yellow hover:text-csk-darkNavy font-semibold text-xs uppercase tracking-wider transition"
              >
                Explore CSK Players
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </article>
  );
}
