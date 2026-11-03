import React from 'react';

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e1b] text-slate-900 dark:text-slate-100 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Top Hero Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-csk-yellow text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Searching Super Kings Den Archives...</span>
          </div>
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
          <div className="h-14 max-w-2xl bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-slate-800 rounded-2xl mx-auto" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0b162c] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 w-20 bg-amber-500/20 rounded" />
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
