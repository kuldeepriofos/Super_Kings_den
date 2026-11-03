import React from 'react';
import { Trophy } from 'lucide-react';
import CSKTrophiesSection from '../../components/CSKTrophiesSection';
import { buildPageMetadata } from '../../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('/csk-trophies', {
    title: 'CSK Championship Trophies By Year | 7 Silverware Crowns | Super Kings Den',
    description: 'Explore CSK Championship Trophies By Year: all 5 IPL Championships (2010, 2011, 2018, 2021, 2023) and 2 Champions League T20 titles won by MS Dhoni and Chennai Super Kings.',
    canonical: 'https://superkingsden.com/csk-trophies/',
    ogImage: '/ipl-trophy-gold.jpg',
  });
}

export default function CSKTrophiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner mb-8 sm:mb-10">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>The Gold Standard of Consistency</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          CSK Championship Trophies By Year
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Five IPL crowns (2010, 2011, 2018, 2021, 2023) and two Champions League T20 titles (2010, 2014). Walk through every final ball, heroic knock, and magical silverware celebration.
        </p>
      </div>

      <CSKTrophiesSection className="mb-8" />
    </div>
  );
}
