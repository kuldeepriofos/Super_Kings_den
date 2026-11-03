'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  FileText,
  Users,
  Trophy,
  Filter,
  Calendar,
  Flame,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import postsIndex from '../data/postsIndex.json';
import { SQUAD_PLAYERS } from '../data/mockData';

const SUGGESTED_QUERIES = [
  'MS Dhoni',
  'Ruturaj Gaikwad',
  'Ravindra Jadeja',
  'Suresh Raina',
  'Chepauk Stadium',
  'IPL 2026',
  'Joburg Super Kings',
  'Texas Super Kings',
  'Matheesha Pathirana',
];

// Ultra-fast instant client search (0-2ms)
function performInstantSearch(searchTerm, currentType, currentFranchise, currentSort) {
  const term = (searchTerm || '').trim().toLowerCase();
  if (!term) {
    return {
      results: { articles: [], players: [], seasons: [] },
      counts: { all: 0, articles: 0, players: 0, seasons: 0 },
    };
  }

  const terms = term.split(/\s+/).filter(Boolean);

  // 1. Match Articles
  let matchedArticles = [];
  for (const post of postsIndex) {
    if (currentFranchise !== 'all') {
      const pFran = (post.franchise || 'CSK').toUpperCase();
      if (pFran !== currentFranchise.toUpperCase()) continue;
    }

    const title = (post.title || '').toLowerCase();
    const excerpt = (post.excerpt || '').toLowerCase();
    const category = (post.category || '').toLowerCase();
    const slug = (post.slug || '').toLowerCase();

    let score = 0;
    if (title.includes(term)) score += 60;
    if (slug.includes(term)) score += 40;
    if (excerpt.includes(term)) score += 25;
    if (category.includes(term)) score += 20;

    let termMatches = 0;
    for (const t of terms) {
      if (title.includes(t)) { score += 15; termMatches++; }
      else if (slug.includes(t)) { score += 10; termMatches++; }
      else if (excerpt.includes(t)) { score += 6; termMatches++; }
      else if (category.includes(t)) { score += 5; termMatches++; }
    }

    if (score > 0 || termMatches === terms.length) {
      matchedArticles.push({ ...post, _score: score });
    }
  }

  if (currentSort === 'newest') {
    matchedArticles.sort((a, b) => new Date(b.date || b.publishedAt || 0) - new Date(a.date || a.publishedAt || 0));
  } else if (currentSort === 'oldest') {
    matchedArticles.sort((a, b) => new Date(a.date || a.publishedAt || 0) - new Date(b.date || b.publishedAt || 0));
  } else {
    matchedArticles.sort((a, b) => b._score - a._score);
  }

  // 2. Match Players
  let matchedPlayers = [];
  for (const player of SQUAD_PLAYERS) {
    if (currentFranchise !== 'all') {
      const pFran = (player.franchise || 'CSK').toUpperCase();
      if (pFran !== currentFranchise.toUpperCase()) continue;
    }

    const name = (player.name || '').toLowerCase();
    const fullName = (player.fullName || '').toLowerCase();
    const role = (player.role || '').toLowerCase();
    const tag = (player.tag || '').toLowerCase();
    const specialty = (player.specialty || '').toLowerCase();
    const slug = (player.slug || '').toLowerCase();

    let score = 0;
    if (name.includes(term) || fullName.includes(term)) score += 70;
    if (slug.includes(term)) score += 50;
    if (tag.includes(term)) score += 35;
    if (role.includes(term) || specialty.includes(term)) score += 20;

    for (const t of terms) {
      if (name.includes(t) || fullName.includes(t)) score += 20;
    }

    if (score > 0) {
      matchedPlayers.push({ ...player, _score: score });
    }
  }
  matchedPlayers.sort((a, b) => b._score - a._score);

  return {
    results: {
      articles: currentType === 'players' ? [] : matchedArticles.slice(0, 100),
      players: currentType === 'articles' ? [] : matchedPlayers.slice(0, 50),
      seasons: [],
    },
    counts: {
      all: matchedArticles.length + matchedPlayers.length,
      articles: matchedArticles.length,
      players: matchedPlayers.length,
      seasons: 0,
    },
  };
}

export default function SearchPageView({ initialQuery = '', initialType = 'all' }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get('q') || initialQuery || '';
  const typeFromUrl = searchParams.get('type') || initialType || 'all';

  const [query, setQuery] = useState(queryFromUrl);
  const [activeType, setActiveType] = useState(typeFromUrl); // 'all' | 'articles' | 'players' | 'seasons'
  const [franchise, setFranchise] = useState('all'); // 'all' | 'CSK' | 'JSK' | 'TSK'
  const [sortBy, setSortBy] = useState('relevant'); // 'relevant' | 'newest' | 'oldest'

  // Pre-calculate instant results immediately on first render (0ms initial paint!)
  const initialInstant = performInstantSearch(queryFromUrl, typeFromUrl, 'all', 'relevant');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(initialInstant.results);
  const [counts, setCounts] = useState(initialInstant.counts);
  const [searchedTerm, setSearchedTerm] = useState(queryFromUrl);

  const reqIdRef = useRef(0);

  const executeSearch = useCallback(
    async (searchTerm, currentType, currentFranchise, currentSort) => {
      const term = searchTerm.trim();
      if (!term) {
        setResults({ articles: [], players: [], seasons: [] });
        setCounts({ all: 0, articles: 0, players: 0, seasons: 0 });
        setSearchedTerm('');
        setLoading(false);
        return;
      }

      setSearchedTerm(term);

      // 1. INSTANT RESULT POPULATION (0ms):
      // Calculate and display local results immediately so user NEVER sees an empty screen or delay!
      const instant = performInstantSearch(term, currentType, currentFranchise, currentSort);
      setResults(instant.results);
      setCounts(instant.counts);

      // 2. FAST BACKGROUND SYNC with server/MongoDB:
      const requestId = ++reqIdRef.current;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: term,
          type: currentType,
          franchise: currentFranchise,
          sortBy: currentSort,
        });

        const res = await fetch(`/api/search/?${params.toString()}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        // Only update if this request is still the most recent one
        if (requestId === reqIdRef.current && data.success && data.results) {
          setResults(data.results);
          setCounts(data.counts || instant.counts);
        }
      } catch (err) {
        // Silently preserve instant local results on any network hiccup
      } finally {
        if (requestId === reqIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Sync with URL query on navigation or param change
  useEffect(() => {
    if (queryFromUrl) {
      setQuery(queryFromUrl);
      executeSearch(queryFromUrl, activeType, franchise, sortBy);
    }
  }, [queryFromUrl, executeSearch]);

  const handleSearchSubmit = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const term = query.trim();
    if (!term) return;

    // Update browser URL query
    const params = new URLSearchParams();
    params.set('q', term);
    if (activeType !== 'all') params.set('type', activeType);
    router.replace(`/search/?${params.toString()}`, { scroll: false });

    executeSearch(term, activeType, franchise, sortBy);
  };

  const handleChipClick = (suggestion) => {
    setQuery(suggestion);
    const params = new URLSearchParams();
    params.set('q', suggestion);
    if (activeType !== 'all') params.set('type', activeType);
    router.replace(`/search/?${params.toString()}`, { scroll: false });

    executeSearch(suggestion, activeType, franchise, sortBy);
  };

  const handleTypeChange = (newType) => {
    setActiveType(newType);
    if (searchedTerm) {
      executeSearch(searchedTerm, newType, franchise, sortBy);
    }
  };

  const handleFranchiseChange = (newFranchise) => {
    setFranchise(newFranchise);
    if (searchedTerm) {
      executeSearch(searchedTerm, activeType, newFranchise, sortBy);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (searchedTerm) {
      executeSearch(searchedTerm, activeType, franchise, newSort);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e1b] text-slate-900 dark:text-slate-100 py-8 sm:py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Hero Search Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-csk-yellow text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Super Kings Den Knowledge Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Search <span className="text-amber-500 dark:text-csk-yellow">Super Kings Den</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Explore 800+ articles, player bios, career stats, and championship memories across CSK (IPL), JSK (SA20), and TSK (MLC).
          </p>

          {/* Search Input Bar */}
          <form
            onSubmit={handleSearchSubmit}
            action="/search/"
            method="GET"
            className="relative flex items-center max-w-2xl mx-auto bg-white dark:bg-[#0b162c] border-2 border-slate-200 dark:border-slate-800 focus-within:border-amber-500 dark:focus-within:border-csk-yellow rounded-2xl shadow-xl transition-all p-1.5 overflow-hidden"
          >
            {/* Hidden submit button to guarantee Enter key form submission in all browsers */}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />

            {/* Top Loading Progress Line */}
            {loading && (
              <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />
              </div>
            )}

            <div className="pl-3.5 pr-2 text-slate-400">
              {loading ? (
                <Loader2 className="w-5 h-5 text-amber-500 dark:text-csk-yellow animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-amber-500 dark:text-csk-yellow" />
              )}
            </div>

            <input
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search Dhoni, Ruturaj, match chronicles, player stats, Chepauk..."
              className="flex-1 bg-transparent py-2.5 px-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              autoFocus
              autoComplete="off"
            />

            {query && !loading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white mr-1 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-yellow-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-400">Popular:</span>
            {SUGGESTED_QUERIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleChipClick(item)}
                className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  searchedTerm.toLowerCase() === item.toLowerCase()
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-csk-yellow'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Results Controls: Tabs & Filters */}
        {searchedTerm && (
          <div className="bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Type Category Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b md:border-b-0 border-slate-200 dark:border-slate-800 pb-3 md:pb-0">
                <button
                  onClick={() => handleTypeChange('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeType === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All Results</span>
                  <span className="ml-1 text-[10px] opacity-80 font-mono">({counts.all})</span>
                </button>

                <button
                  onClick={() => handleTypeChange('articles')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeType === 'articles'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Articles &amp; News</span>
                  <span className="ml-1 text-[10px] opacity-80 font-mono">({counts.articles})</span>
                </button>

                <button
                  onClick={() => handleTypeChange('players')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeType === 'players'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Squad &amp; Legends</span>
                  <span className="ml-1 text-[10px] opacity-80 font-mono">({counts.players})</span>
                </button>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-amber-500 outline-none cursor-pointer"
                  >
                    <option value="relevant">Most Relevant</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Status Header */}
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              Showing results for <span className="font-bold text-slate-900 dark:text-white">"{searchedTerm}"</span>
              {counts.all > 0 && ` (${counts.all} total matches found)`}
            </div>
          </div>
        )}

        {/* Loading State: Only show skeleton placeholders if loading and NO results are ready yet */}
        {loading && counts.all === 0 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-csk-yellow font-bold">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                <span>Searching official archives, squad chronicles &amp; stats for &quot;{query || searchedTerm}&quot;...</span>
              </div>
              <span className="font-mono text-[11px] opacity-75 hidden sm:inline animate-pulse">Fetching live results...</span>
            </div>

            {/* Skeleton Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="h-44 bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
                  <div className="h-3 w-20 bg-amber-500/20 rounded" />
                  <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800/60 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS SECTION - Always show when we have results or when done searching */}
        {searchedTerm && (counts.all > 0 || !loading) && (
          <div className="space-y-8">
            
            {/* 1. MATCHED PLAYERS & LEGENDS (Show prominently on top) */}
            {(activeType === 'all' || activeType === 'players') && results.players?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <span>Squad &amp; Player Profiles ({results.players.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.players.map((player) => (
                    <Link
                      key={player.slug || player.id}
                      href={`/${player.slug}/`}
                      className="group bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-csk-yellow rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-amber-400/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={player.photoUrl || player.avatarUrl || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                          alt={player.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-csk-yellow">
                            {player.franchise || 'CSK'}
                          </span>
                          {player.tag && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30">
                              {player.tag}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-csk-yellow transition truncate">
                          {player.name}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {player.role || player.specialty || 'Super King'}
                        </p>

                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                          {player.matches !== undefined && (
                            <span>{player.matches} Matches</span>
                          )}
                          {player.runs !== undefined && Number(player.runs) > 0 && (
                            <span>{player.runs} Runs</span>
                          )}
                          {player.wickets !== undefined && Number(player.wickets) > 0 && (
                            <span>{player.wickets} Wkts</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MATCHED ARTICLES & NEWS */}
            {(activeType === 'all' || activeType === 'articles') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span>Articles &amp; Dispatches ({results.articles?.length || 0})</span>
                  </h2>
                </div>

                {results.articles?.length === 0 ? (
                  <div className="bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                    No articles matched "{searchedTerm}" under the selected filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.articles.map((post) => (
                      <Link
                        key={post.slug || post.id}
                        href={`/${post.slug}/`}
                        className="group bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-csk-yellow rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        {/* Image Container */}
                        <div className="aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                          <img
                            src={post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-csk-yellow border border-csk-yellow/30">
                              {post.category || 'CSK News'}
                            </span>
                          </div>
                        </div>

                        {/* Article Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {post.excerpt.replace(/<[^>]+>/g, '')}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.date || 'Recent'}
                            </span>
                            <span className="text-amber-600 dark:text-csk-yellow font-bold group-hover:translate-x-1 transition flex items-center gap-0.5">
                              Read story &rarr;
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State when zero total results */}
            {counts.all === 0 && (
              <div className="bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-sm max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-black">
                  ?
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  No matching results for "{searchedTerm}"
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We couldn't find any articles, players, or match records matching your exact terms. Check your spelling or try one of the popular topics below:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {SUGGESTED_QUERIES.slice(0, 6).map((item) => (
                    <button
                      key={item}
                      onClick={() => handleChipClick(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial Empty State (When user opens /search without query) */}
        {!searchedTerm && (
          <div className="py-12 text-center space-y-6 max-w-xl mx-auto">
            <div className="p-4 bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-amber-500">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                What are you looking for?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type a player name, match opponent, year, or tournament above to search our entire library of CSK, JSK, and TSK cricket dispatches.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
