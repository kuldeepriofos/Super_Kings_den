import React from 'react';
import { Award } from 'lucide-react';
import StandingsTable from '../../components/StandingsTable';
import MatchCenter from '../../components/MatchCenter';

export const metadata = {
  title: 'IPL 2026 Standings & Points Table',
  description: 'Live IPL 2026 points table, Net Run Rate (NRR), matches won, lost, points tally, and playoff qualification scenarios for Chennai Super Kings.',
  alternates: {
    canonical: 'https://superkingsden.com/standings',
  },
  openGraph: {
    title: 'IPL 2026 Points Table & Standings | Super Kings Den',
    description: 'Track CSK standing in the IPL 2026 championship race, form guides, and Net Run Rate comparisons.',
    url: 'https://superkingsden.com/standings',
    siteName: 'Super Kings Den',
  },
};

export default function StandingsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Championship Race</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          IPL 2026 Standings &amp; Points Table
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Live championship standings, Net Run Rate (NRR) calculations, match outcomes, and qualification scenarios for the playoffs.
        </p>
      </div>

      <StandingsTable />
      <MatchCenter selectedFranchise="ALL" />
    </div>
  );
}
