import React from 'react';
import { TrendingUp } from 'lucide-react';
import StatsHub from '../../components/StatsHub';

export const metadata = {
  title: 'CSK Cricket Stats, IPL Finals & All-Time Leaderboards',
  description: 'Complete Chennai Super Kings IPL cricket statistics: all 10 finals scorecards, batting & bowling leaderboards, win rates, and Chepauk fortress records.',
  alternates: {
    canonical: 'https://superkingsden.com/stats',
  },
  openGraph: {
    title: 'CSK Cricket Statistics & All-Time Leaderboards | Super Kings Den',
    description: 'Explore the numbers behind the 5x IPL champions: 10 finals scorecards, top run-scorers, leading wicket-takers, and Chepauk fortress records.',
    url: 'https://superkingsden.com/stats',
    siteName: 'Super Kings Den',
  },
};

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analytics &bull; Leaderboards &bull; All 10 Finals</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          CSK Cricket Statistics &amp; Records
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Dive into the numbers that defined T20 cricket’s greatest dynasty. 10 IPL finals, leaderboards, highest team totals, and fortress win records since 2008.
        </p>
      </div>

      <StatsHub />
    </div>
  );
}
