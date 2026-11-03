'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowUpRight, Flame, Search, ChevronDown, History } from 'lucide-react';

const STORAGE_KEY = 'skd_visited_articles';

// Curated selection of top marquee CSK stories for "Most Viewed" filter (no dummy numbers)
const SELECTED_MOST_VIEWED_SLUGS = [
  'ms-dhoni-csk-stakes',
  'csk-ban-2016-2017',
  'csk-first-captain-2008',
  'ruturaj-gaikwad-selected-in-indias-odi-squad-ahead-of-the-upcoming-home-series-against-west-indies',
  'ruturaj-gaikwad-breaks-silence-on-csk-planning-to-appoint-a-new-head-coach',
  'csk-retained-players-2027',
  'csk-released-players-2026',
  'csk-hundreds-and-fifties',
  'list-teams-owned-by-chennai-super-kings',
  'latest-news-about-csk-this-weeks-headlines',
  'ms-dhonis-bond-with-csk-under-strain',
  'csk-news-today-end-of-month-wrap',
  'csk-coaching-staff-changes',
  'eoin-morgan-considered-for-csk-head-coach-role-with-salary-demands-remaining-a-major-hurdle',
  'eoin-morgan-as-csk-coach',
  'csk-trade-news'
];

export default function NewsGrid({
  posts = [],
  selectedFranchise,
  className = "mb-0",
  initialCount = 6,
  pageSize = 6,
  hideCategoryFilter = false,
  title,
  subtitle,
  categoryName,
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [visitedSlugs, setVisitedSlugs] = useState([]);

  // Load visited articles from browser session/local storage
  const syncVisitedFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || '[]');
        if (Array.isArray(stored)) {
          setVisitedSlugs(stored);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    syncVisitedFromStorage();
    window.addEventListener('focus', syncVisitedFromStorage);
    window.addEventListener('storage', syncVisitedFromStorage);
    return () => {
      window.removeEventListener('focus', syncVisitedFromStorage);
      window.removeEventListener('storage', syncVisitedFromStorage);
    };
  }, []);

  const recordVisit = (slug) => {
    if (typeof window === 'undefined' || !slug) return;
    try {
      const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [slug, ...existing.filter((s) => s !== slug)].slice(0, 50);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVisitedSlugs(updated);
    } catch (e) {}
  };

  // Filter options: All Updates, Recent View, Most Viewed, CSK News, JSK News, TSK News
  const defaultCategories = [
    { id: 'ALL', label: 'All Updates' },
    { id: 'RECENT', label: 'Recent View', icon: History },
    { id: 'MOST_VIEWED', label: 'Most Viewed', icon: Flame },
    { id: 'csk-news', label: 'CSK News' },
    { id: 'jsk-news', label: 'JSK News' },
    { id: 'tsk-news', label: 'TSK News' },
  ];

  const categoryArchiveFilters = [
    { id: 'ALL', label: `All ${categoryName ? categoryName : 'Articles'} (${posts.length})` },
    { id: 'RECENT', label: 'Recent View', icon: History },
    { id: 'MOST_VIEWED', label: 'Most Viewed', icon: Flame },
    { id: 'csk-news', label: 'CSK News' },
    { id: 'jsk-news', label: 'JSK News' },
    { id: 'tsk-news', label: 'TSK News' },
  ];

  const categories = hideCategoryFilter ? categoryArchiveFilters : defaultCategories;

  // Apply unified filter (search, category, recent session visit, or marquee most viewed)
  const finalPosts = useMemo(() => {
    // 1. Filter by franchise prop and in-grid search term
    const filtered = posts.filter(post => {
      const matchesFranchise = !selectedFranchise || selectedFranchise === 'ALL' || post.franchise === selectedFranchise;
      
      let matchesSearch = true;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        matchesSearch = (post.title || '').toLowerCase().includes(q) ||
                        (post.excerpt || '').toLowerCase().includes(q) ||
                        (post.slug || '').toLowerCase().includes(q);
      }
      return matchesFranchise && matchesSearch;
    });

    // 2. All Updates: Chronological latest
    if (activeFilter === 'ALL') {
      return [...filtered].sort((a, b) => {
        const dateB = Date.parse(b.date) || 0;
        const dateA = Date.parse(a.date) || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
    }

    // 3. Recent View: Prioritizes or filters articles viewed by the user
    if (activeFilter === 'RECENT') {
      if (visitedSlugs.length > 0) {
        const visitedMap = new Map();
        visitedSlugs.forEach((slug, idx) => visitedMap.set(slug, idx));

        const visitedPosts = filtered.filter((p) => visitedMap.has(p.slug));
        if (visitedPosts.length > 0) {
          return [...visitedPosts].sort((a, b) => {
            return visitedMap.get(a.slug) - visitedMap.get(b.slug);
          });
        }
      }

      return [...filtered].sort((a, b) => {
        const dateB = Date.parse(b.date) || 0;
        const dateA = Date.parse(a.date) || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
    }

    // 4. Most Viewed: Filters posts manually ticked as isMostViewed === true
    if (activeFilter === 'MOST_VIEWED') {
      const mostViewedPosts = filtered.filter((p) => p.isMostViewed === true);
      if (mostViewedPosts.length > 0) {
        return [...mostViewedPosts].sort((a, b) => {
          const dateB = Date.parse(b.date) || 0;
          const dateA = Date.parse(a.date) || 0;
          if (dateB !== dateA) return dateB - dateA;
          return (b.id || 0) - (a.id || 0);
        });
      }

      // Graceful fallback if no post marked yet
      return [...filtered]
        .filter((p) => SELECTED_MOST_VIEWED_SLUGS.includes(p.slug))
        .sort((a, b) => {
          const rankA = SELECTED_MOST_VIEWED_SLUGS.indexOf(a.slug);
          const rankB = SELECTED_MOST_VIEWED_SLUGS.indexOf(b.slug);
          return rankA - rankB;
        });
    }

    // 5. CSK News
    if (activeFilter === 'csk-news' || activeFilter === 'CSK News') {
      return [...filtered].filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const f = (p.franchise || '').toUpperCase();
        return f === 'CSK' || cat.includes('csk') || cat.includes('ipl');
      }).sort((a, b) => {
        const dateB = Date.parse(b.date) || 0;
        const dateA = Date.parse(a.date) || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
    }

    // 6. JSK News
    if (activeFilter === 'jsk-news' || activeFilter === 'JSK News') {
      return [...posts].filter((p) => {
        let matchesSearch = true;
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          matchesSearch = (p.title || '').toLowerCase().includes(q) ||
                          (p.excerpt || '').toLowerCase().includes(q) ||
                          (p.slug || '').toLowerCase().includes(q);
        }
        if (!matchesSearch) return false;
        const cat = (p.category || '').toLowerCase();
        const f = (p.franchise || '').toUpperCase();
        return f === 'JSK' || /(jsk|sa\s*20)/i.test(cat);
      }).sort((a, b) => {
        const dateB = Date.parse(b.date) || 0;
        const dateA = Date.parse(a.date) || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
    }

    // 7. TSK News
    if (activeFilter === 'tsk-news' || activeFilter === 'TSK News') {
      return [...posts].filter((p) => {
        let matchesSearch = true;
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          matchesSearch = (p.title || '').toLowerCase().includes(q) ||
                          (p.excerpt || '').toLowerCase().includes(q) ||
                          (p.slug || '').toLowerCase().includes(q);
        }
        if (!matchesSearch) return false;
        const cat = (p.category || '').toLowerCase();
        const f = (p.franchise || '').toUpperCase();
        return f === 'TSK' || /(tsk|mlc)/i.test(cat);
      }).sort((a, b) => {
        const dateB = Date.parse(b.date) || 0;
        const dateA = Date.parse(a.date) || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
    }

    return filtered;
  }, [posts, selectedFranchise, activeFilter, searchTerm, visitedSlugs, hideCategoryFilter]);

  const displayedPosts = finalPosts.slice(0, visibleCount);
  const hasMore = visibleCount < finalPosts.length;

  return (
    <section className={className}>
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
                {title || 'Latest Den Dispatches'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
                {subtitle || `Showing ${Math.min(visibleCount, finalPosts.length)} of ${finalPosts.length} Articles • Breaking news, analysis & match previews`}
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
                setVisibleCount(initialCount);
              }}
              placeholder={categoryName ? `Search within ${categoryName}...` : 'Search across 830+ articles...'}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full text-xs bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-csk-yellow shadow-inner"
            />
          </div>
        </div>

        {/* Filter Toolbar: Single Unified Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeFilter === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFilter(cat.id);
                  setVisibleCount(initialCount);
                  if (cat.id === 'RECENT') {
                    syncVisitedFromStorage();
                  }
                }}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-sm'
                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-csk-darkNavy' : cat.id === 'MOST_VIEWED' ? 'text-amber-500' : 'text-slate-400'}`} />}
                <span>{cat.label}</span>
              </button>
            );
          })}
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
              setActiveFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post, index) => {
            return (
              <React.Fragment key={post.slug || post.id || index}>
                {/* Standard Article Card */}
                <Link
                  href={`/${post.slug}/`}
                  onClick={() => recordVisit(post.slug)}
                  className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50 flex flex-col justify-between cursor-pointer transition-all duration-300 block"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
                      }}
                    />
                    
                    {/* Category badge on image */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-csk-yellow border border-csk-yellow/30 shadow-md backdrop-blur-md">
                        {post.category || 'CSK News'}
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

                    {/* Card Meta Footer (Clean real metadata only: Date & Author) */}
                    <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                          {post.date || 'Sep 2026'}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600">&bull;</span>
                        <span className="truncate max-w-[110px] text-slate-500 dark:text-slate-400">
                          By {post.author || 'Super Kings Den'}
                        </span>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-csk-yellow flex items-center group-hover:translate-x-0.5 transition transform shrink-0">
                        Read <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount(prev => prev + pageSize)}
            className="px-8 py-3 rounded-xl bg-slate-100 hover:bg-csk-yellow dark:bg-slate-900 dark:hover:bg-csk-yellow text-slate-800 dark:text-slate-200 hover:text-csk-darkNavy dark:hover:text-csk-darkNavy font-black text-xs uppercase tracking-wider transition border border-slate-300 dark:border-white/10 shadow-sm inline-flex items-center space-x-2"
          >
            <span>Load More Dispatches (+6 Stories)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
