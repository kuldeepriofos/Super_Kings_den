import React, { Suspense } from 'react';
import SearchPageView from '../../components/SearchPageView';

export async function generateMetadata({ searchParams }) {
  const q = searchParams?.q ? decodeURIComponent(searchParams.q).trim() : '';

  if (q) {
    return {
      title: `Search: "${q}" | Super Kings Den`,
      description: `Search results for "${q}" across Chennai Super Kings, Joburg Super Kings, and Texas Super Kings articles, player profiles, and records.`,
      robots: {
        index: false, // Prevent query spam indexing in search engines
        follow: true,
      },
    };
  }

  return {
    title: 'Search Super Kings Den | Articles, Players & Championship Archives',
    description: 'Search official Super Kings Den archives covering CSK, JSK, and TSK squad chronicles, match reports, and player profiles.',
  };
}

export default function SearchPage({ searchParams }) {
  const q = searchParams?.q || '';
  const type = searchParams?.type || 'all';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#070e1b] py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-400">Loading search experience...</p>
        </div>
      }
    >
      <SearchPageView initialQuery={q} initialType={type} />
    </Suspense>
  );
}
