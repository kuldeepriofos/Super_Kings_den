'use client';

import React, { useState, useEffect, useRef } from 'react';
import SmartImage from './SmartImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, posts = [], onSelectPost }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const router = useRouter();

  const handleFormSubmit = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const clean = query.trim();
    if (!clean) return;

    const targetUrl = `/search/?q=${encodeURIComponent(clean)}`;
    onClose();
    if (typeof window !== 'undefined') {
      window.location.href = targetUrl;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? posts.slice(0, 8)
    : posts.filter(p => 
        (p.title || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.franchise || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.slug || '').toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0A1226] border border-slate-200 dark:border-csk-borderNavy rounded-2xl overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <form
          onSubmit={handleFormSubmit}
          action="/search/"
          method="GET"
          className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10"
        >
          {/* Default hidden submit button so Enter key ALWAYS triggers submission */}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />

          <Search className="w-5 h-5 text-amber-600 dark:text-csk-yellow mr-3 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleFormSubmit(e);
              }
            }}
            placeholder="Search CSK, JSK, TSK news, player profiles, stats..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoComplete="off"
          />

          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {query.trim() && (
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 mr-2 transition cursor-pointer flex items-center gap-1.5"
            >
              Search
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
          >
            ESC
          </button>
        </form>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 py-1.5 block">
            {query.trim() === '' ? 'Trending Topics & Recent Posts' : `${results.length} Quick Stories Found`}
          </span>

          {results.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
              <p>No quick stories found for "{query}".</p>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
              >
                <span>Search All Players, Stats &amp; Archives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            results.map((post) => (
              <Link
                key={post.slug || post.id}
                href={`/${post.slug}/`}
                onClick={() => {
                  if (typeof window !== 'undefined' && post.slug) {
                    try {
                      const key = 'skd_visited_articles';
                      const existing = JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || '[]');
                      const updated = [post.slug, ...existing.filter((s) => s !== post.slug)].slice(0, 50);
                      sessionStorage.setItem(key, JSON.stringify(updated));
                      localStorage.setItem(key, JSON.stringify(updated));
                    } catch (e) {}
                  }
                  if (onSelectPost) onSelectPost(post);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition block"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                    <SmartImage
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-csk-yellow block">
                      {post.category || 'CSK News'}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition truncate">
                      {post.title}
                    </h5>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition transform group-hover:translate-x-1 ml-2 flex-shrink-0" />
              </Link>
            ))
          )}
        </div>

        {/* Footer: Link to full search page */}
        {query.trim() && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> to search everything
            </span>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-csk-yellow hover:underline cursor-pointer"
            >
              <span>View full search results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
