'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ArrowUpRight, Flame, Search, ChevronDown } from 'lucide-react';

export default function NewsGrid({ posts = [], selectedFranchise }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(18);

  const categories = [
    { id: 'ALL', label: 'All Updates' },
    { id: 'CSK News', label: 'CSK News' },
    { id: 'Squad & Auctions', label: 'Squad & Auctions' },
    { id: 'Records & Stats', label: 'Records & Stats' },
    { id: 'Features & Stories', label: 'Features & Stories' },
    { id: 'Match Central', label: 'Match Central' },
    { id: 'JSK', label: 'JSK (SA20)' },
    { id: 'TSK', label: 'TSK (MLC)' },
  ];

  // Filter posts by category, franchise, and in-grid search
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesFranchise = !selectedFranchise || selectedFranchise === 'ALL' || post.franchise === selectedFranchise;
      
      let matchesCategory = true;
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'JSK' || selectedCategory === 'TSK') {
          matchesCategory = post.franchise === selectedCategory;
        } else {
          matchesCategory = (post.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
        }
      }

      let matchesSearch = true;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        matchesSearch = (post.title || '').toLowerCase().includes(q) ||
                        (post.excerpt || '').toLowerCase().includes(q) ||
                        (post.slug || '').toLowerCase().includes(q);
      }

      return matchesFranchise && matchesCategory && matchesSearch;
    });
  }, [posts, selectedFranchise, selectedCategory, searchTerm]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <section className="mb-14">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
                Latest Den Dispatches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {Math.min(visibleCount, filteredPosts.length)} of {filteredPosts.length} Articles &bull; Breaking news, analysis &amp; match previews
              </p>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(18); // Reset page on new search
              }}
              placeholder="Search across 770+ articles..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full text-xs bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-csk-yellow shadow-inner"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(18);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-sm'
                  : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Articles */}
      {displayedPosts.length === 0 ? (
        <div className="sports-card p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            No articles found matching "{searchTerm}".
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try searching for "Dhoni", "Shivam Dube", "Ruturaj", "Pathirana", or reset category filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post, index) => (
            <React.Fragment key={post.slug || post.id || index}>
              {/* Standard Article Card with direct link for SEO */}
              <Link
                href={`/${post.slug}`}
                className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50 flex flex-col justify-between cursor-pointer transition-all duration-300 block"
              >
                {/* Card Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
                    }}
                  />
                  
                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-csk-yellow border border-csk-yellow/30 shadow-md backdrop-blur-md">
                      {post.franchise}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-slate-200 backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/70 text-slate-200 backdrop-blur-sm flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-amber-500 dark:text-csk-yellow" /> {post.readingTime || '3 min read'}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug mb-2.5 font-display">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Card Meta Footer */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      By {post.author || 'Super Kings Den'}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-csk-yellow flex items-center group-hover:translate-x-0.5 transition transform">
                      Read <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </React.Fragment>
          ))}
        </div>
      )}


      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount(prev => prev + 18)}
            className="px-8 py-3 rounded-xl bg-slate-100 hover:bg-csk-yellow dark:bg-slate-900 dark:hover:bg-csk-yellow text-slate-800 dark:text-slate-200 hover:text-csk-darkNavy dark:hover:text-csk-darkNavy font-black text-xs uppercase tracking-wider transition border border-slate-300 dark:border-white/10 shadow-sm inline-flex items-center space-x-2"
          >
            <span>Load More Dispatches (+18 Stories)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
