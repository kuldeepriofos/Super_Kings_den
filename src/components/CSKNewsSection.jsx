'use client';

import React, { useMemo } from 'react';
import SmartImage from './SmartImage';
import Link from 'next/link';
import { Flame, Clock, ChevronRight, User, ArrowRight } from 'lucide-react';
import postsIndex from '../data/postsIndex.json';

export default function CSKNewsSection({ posts = null, className = "mb-8 sm:mb-10" }) {
  const sourcePosts = (posts && posts.length > 0) ? posts : postsIndex;

  // Filter exactly 4 articles from 'CSK News' category
  const cskNewsPosts = useMemo(() => {
    const list = (sourcePosts || []).filter(p => {
      const cat = (p.category || '').toLowerCase();
      return cat === 'csk news' || cat.includes('csk news');
    });

    if (list.length >= 4) {
      return list.slice(0, 4);
    }

    // Fallback to CSK franchise posts if needed
    const fallback = (sourcePosts || []).filter(p => p.franchise === 'CSK');
    return [...list, ...fallback.filter(p => !list.includes(p))].slice(0, 4);
  }, [sourcePosts]);

  if (cskNewsPosts.length === 0) return null;

  const leadStory = cskNewsPosts[0];
  const sideStories = cskNewsPosts.slice(1, 4);

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              CSK News &amp; Updates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              Live Updates &bull; Breaking Stories &amp; Chepauk Chronicles
            </p>
          </div>
        </div>

        {/* View More Button -> opens /csk-news page */}
        <Link
          href="/csk-news"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-black text-xs uppercase tracking-wider transition shadow-sm hover:shadow self-start sm:self-auto"
        >
          <span>View More CSK News</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero Featured Grid Design: 1 Large Lead Card + 3 Stacked Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Lead Story (8 cols) */}
        {leadStory && (
          <Link 
            href={`/${leadStory.slug}`}
            className="lg:col-span-8 group relative rounded-2xl overflow-hidden cursor-pointer sports-card border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50 transition-all duration-300 flex flex-col justify-end min-h-[420px] sm:min-h-[480px]"
          >
            {/* Background Image with Dynamic Gradient Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <SmartImage
                src={leadStory.featuredImage}
                alt={leadStory.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent"></div>
            </div>

            {/* Lead Story Content */}
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-csk-yellow text-csk-darkNavy shadow-md">
                  CSK &bull; {leadStory.category || 'NEWS'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center">
                  <Flame className="w-3 h-3 mr-1 text-red-400" /> Featured
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3 group-hover:text-csk-yellow transition font-display">
                {leadStory.title}
              </h3>

              <p className="text-slate-200 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-4 max-w-3xl">
                {leadStory.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs text-slate-300">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center font-medium text-white">
                    <User className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> {leadStory.author || 'Super Kings Den'}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {leadStory.readingTime || '3 min read'}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="flex items-center font-bold text-csk-yellow group-hover:translate-x-1 transition transform">
                    Read Full Story <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Side Stack of 3 Stories (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {sideStories.map((post, idx) => (
            <Link
              key={post.id || idx}
              href={`/${post.slug}`}
              className="group p-4 rounded-xl sports-card border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow transition flex items-center space-x-4 cursor-pointer flex-1 bg-white dark:bg-slate-900/60 shadow-xs hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10">
                <SmartImage
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover group-hover:scale-110 transition duration-500"
              />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900/90 text-csk-yellow border border-csk-yellow/40">
                  CSK
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-amber-700 dark:text-csk-yellow uppercase tracking-wide block mb-1">
                  {post.category || 'CSK News'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug mb-1 font-display">
                  {post.title}
                </h3>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{post.date}</span>
                  <span>&bull;</span>
                  <span>{post.readingTime || '3 min read'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
