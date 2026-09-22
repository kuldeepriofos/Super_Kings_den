'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';


export default function SearchModal({ isOpen, onClose, posts, onSelectPost }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

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
    ? posts.slice(0, 5)
    : posts.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.franchise.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0A1226] border border-slate-200 dark:border-csk-borderNavy rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-amber-600 dark:text-csk-yellow mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CSK, JSK, TSK news, player profiles, stats..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 py-1.5 block">
            {query.trim() === '' ? 'Trending Topics & Recent Posts' : `${results.length} Stories Found`}
          </span>

          {results.length === 0 ? (
            <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching stories found for "{query}". Try searching "Dhoni", "Chepauk", "Ruturaj", or "TSK".
            </div>
          ) : (
            results.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  onSelectPost(post);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-csk-yellow block">
                      {post.franchise} &bull; {post.category}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition truncate">
                      {post.title}
                    </h5>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition transform group-hover:translate-x-1 ml-2 flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
