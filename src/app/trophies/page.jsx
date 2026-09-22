import React from 'react';
import { Trophy } from 'lucide-react';
import TrophiesTimeline from '../../components/TrophiesTimeline';

export const metadata = {
  title: 'CSK 7 Trophies & Championship Glory',
  description: 'Relive all 5 IPL Championships (2010, 2011, 2018, 2021, 2023) and 2 Champions League T20 titles won by MS Dhoni and Chennai Super Kings. Full match reports.',
  alternates: {
    canonical: 'https://superkingsden.com/trophies',
  },
  openGraph: {
    title: '7 Championship Trophies of Chennai Super Kings | Super Kings Den',
    description: 'A tribute to the golden dynasty: 5 IPL Trophies + 2 CLT20 Titles in comprehensive detail.',
    url: 'https://superkingsden.com/trophies',
    siteName: 'Super Kings Den',
  },
};

export default function TrophiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>The Gold Standard of Consistency</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          The 7 Golden Trophies
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Five IPL crowns (2010, 2011, 2018, 2021, 2023) and two Champions League T20 titles. Walk through every final ball, heroic knock, and magical celebration.
        </p>
      </div>

      <TrophiesTimeline />
    </div>
  );
}
