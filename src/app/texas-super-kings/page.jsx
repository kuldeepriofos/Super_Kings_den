import React from 'react';
import TSKHeroBanner from '../../components/TSKHeroBanner';
import TSKNewsSection from '../../components/TSKNewsSection';
import MatchCenter from '../../components/MatchCenter';
import TSKCurrentSquadSection from '../../components/TSKCurrentSquadSection';
import TSKCoachesSection from '../../components/TSKCoachesSection';
import StatsHub from '../../components/StatsHub';
import { fetchLivePosts, fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'Texas Super Kings (TSK) — Official MLC Franchise Hub',
  description: 'Official Texas Super Kings franchise hub. Explore TSK news, active player squad, Grand Prairie stadium fortress, and Stephen Fleming coaching staff.',
  alternates: {
    canonical: 'https://superkingsden.com/texas-super-kings',
  },
  openGraph: {
    title: 'Texas Super Kings (TSK) — Official MLC Franchise Hub | Super Kings Den',
    description: 'Explore Texas Super Kings match schedules, Grand Prairie home fortress, active player squad, and Major League Cricket updates.',
    url: 'https://superkingsden.com/texas-super-kings',
    siteName: 'Super Kings Den',
  },
};

export default async function TexasSuperKingsPage() {
  const [posts, players] = await Promise.all([
    fetchLivePosts(),
    fetchLivePlayerProfiles('TSK'),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Primary Accessibility Heading */}
      <h1 className="sr-only">Texas Super Kings (TSK) Official MLC Franchise Hub</h1>

      {/* Section 1: Hero Banner */}
      <TSKHeroBanner className="mb-8 sm:mb-10" />

      {/* Section 2: TSK News (4 articles + View More -> /tsk-news) */}
      <TSKNewsSection posts={posts} className="mb-8 sm:mb-10" />

      {/* Section 3: Match Center (Next Marquee Fixture & Countdown) */}
      <MatchCenter selectedFranchise="TSK" className="mb-8 sm:mb-10" />

      {/* Section 4: Current Squad */}
      <TSKCurrentSquadSection players={players} className="mb-8 sm:mb-10" />

      {/* Section 5: Coaching & Support Staff (Featured Coaches) */}
      <TSKCoachesSection className="mb-8 sm:mb-10" featuredOnly={true} />

      {/* Section 6: Franchise Statistics & Records (All-time Analytics, Leaderboards & Milestones) */}
      <StatsHub franchise="TSK" className="mb-0" />
    </div>
  );
}
