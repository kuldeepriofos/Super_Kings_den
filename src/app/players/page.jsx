import React from 'react';
import { Users } from 'lucide-react';
import SquadShowcase from '../../components/SquadShowcase';
import { fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'CSK Players, Squad & Legends Directory',
  description: 'Complete roster of Chennai Super Kings cricketers from 2008 to 2026. Explore current squad stars, legendary champions, career stats, and jersey numbers.',
  alternates: {
    canonical: 'https://superkingsden.com/players',
  },
  openGraph: {
    title: 'CSK Players & Legends Directory | Super Kings Den',
    description: 'Search and explore the icons who wore the yellow jersey — player profiles, stats, roles, and championship milestones.',
    url: 'https://superkingsden.com/players',
    siteName: 'Super Kings Den',
  },
};

export default async function PlayersPage() {
  const players = await fetchLivePlayerProfiles();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>All-Time Directory &bull; Current Squad &amp; Legends</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold text-white font-heading tracking-tight mb-2">
          Chennai Super Kings Players &amp; Legends
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Meet the lions defending the yellow jersey and the immortal legends who built the 5-time championship legacy at Chepauk.
        </p>
      </div>

      <SquadShowcase players={players} />
    </div>
  );
}
