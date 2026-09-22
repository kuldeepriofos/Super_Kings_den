'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Clock, Sparkles, ChevronRight, User } from 'lucide-react';


export default function HeroFeatured({ posts }) {
  if (!posts || posts.length === 0) return null;

  const leadStory = posts[0];
  const sideStories = posts.slice(1, 4);

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Top Headlines
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live Updates &bull; 2026 Season Coverage
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Lead Story */}
        <Link 
          href={`/${leadStory.slug}`}
          className="lg:col-span-8 group relative rounded-2xl overflow-hidden cursor-pointer sports-card border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50 transition-all duration-300 flex flex-col justify-end min-h-[420px] sm:min-h-[480px]"
        >
          {/* Background Image with Dynamic Gradient Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src={leadStory.featuredImage} 
              alt={leadStory.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              onError={(e) => {
                e.target.src = "https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent"></div>
          </div>

          {/* Lead Story Content */}
          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-csk-yellow text-csk-darkNavy shadow-md">
                {leadStory.franchise} &bull; {leadStory.category}
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
                  <User className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> {leadStory.author}
                </span>
                <span>&bull;</span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> {leadStory.readingTime}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="flex items-center font-bold text-csk-yellow group-hover:translate-x-1 transition transform">
                  Read Full Story <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Side Stack of 3 Trending Stories */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {sideStories.map((post, idx) => (
            <Link
              key={post.id || idx}
              href={`/${post.slug}`}
              className="group p-4 rounded-xl sports-card border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow transition flex items-center space-x-4 cursor-pointer flex-1"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.target.src = "https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
                  }}
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900/90 text-csk-yellow border border-csk-yellow/40">
                  {post.franchise}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-amber-700 dark:text-csk-yellow uppercase tracking-wide block mb-1">
                  {post.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug mb-1 font-display">
                  {post.title}
                </h3>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{post.date}</span>
                  <span>&bull;</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
