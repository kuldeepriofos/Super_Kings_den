import React from 'react';
import { Calendar, Trophy } from 'lucide-react';
import SeasonsTimeline from '../../components/SeasonsTimeline';

export const metadata = {
  title: 'CSK All IPL Seasons (2008–2026) — Complete Archive & Results',
  description: 'Explore all Chennai Super Kings IPL seasons from 2008 to present. 5 championship victories, season standings, match scorecards, Orange & Purple Cap winners.',
  alternates: {
    canonical: 'https://superkingsden.com/seasons',
  },
  openGraph: {
    title: 'CSK IPL Seasons Archive (2008–2026) | Super Kings Den',
    description: 'Every campaign of the Yellow Army — triumphs, heartbreak, Orange/Purple Caps, and five championship victories.',
    url: 'https://superkingsden.com/seasons',
    siteName: 'Super Kings Den',
  },
};

export default function SeasonsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>IPL 2008 &ndash; Present Archive</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          Chennai Super Kings Seasons
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Every campaign — the triumphs, the battles, and the journey of the Yellow Army. Season-by-season standings, championship glory, and individual awards.
        </p>
      </div>

      <SeasonsTimeline />
    </div>
  );
}
