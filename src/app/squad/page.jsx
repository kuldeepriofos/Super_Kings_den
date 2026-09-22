import React from 'react';
import { Users } from 'lucide-react';
import SquadShowcase from '../../components/SquadShowcase';
import { fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'CSK Squad 2026, Players & Full Roster',
  description: 'Complete Chennai Super Kings (IPL 2026), Joburg Super Kings (SA20), and Texas Super Kings (MLC) squad, player profiles, stats, and jersey numbers.',
  alternates: {
    canonical: 'https://superkingsden.com/squad',
  },
  openGraph: {
    title: 'Super Kings 2026 Official Squad & Player Profiles | Super Kings Den',
    description: 'Detailed player statistics, roles, and profiles for MS Dhoni, Ruturaj Gaikwad, Ravindra Jadeja, and the entire Super Kings family.',
    url: 'https://superkingsden.com/squad',
    siteName: 'Super Kings Den',
  },
};

export default async function SquadPage() {
  const players = await fetchLivePlayerProfiles();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Roaring Roster</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          Super Kings Squad 2026
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Meet the lions defending the yellow jersey across the Indian Premier League, SA20, and Major League Cricket. Complete statistics, roles, and biographies.
        </p>
      </div>

      <SquadShowcase players={players} selectedFranchise="ALL" />
    </div>
  );
}
