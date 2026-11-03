import React from 'react';
import CSKHeroBanner from '../../components/CSKHeroBanner';
import CSKNewsSection from '../../components/CSKNewsSection';
import CSKTrophyShowcase from '../../components/CSKTrophyShowcase';
import MatchCenter from '../../components/MatchCenter';
import CSKCurrentSquadSection from '../../components/CSKCurrentSquadSection';
import CSKCoachesSection from '../../components/CSKCoachesSection';
import StatsHub from '../../components/StatsHub';
import { fetchLivePosts, fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'Chennai Super Kings (CSK) — Official IPL Franchise Hub',
  description: 'Official Chennai Super Kings franchise hub. Explore CSK news, 5 IPL championships and CLT20 trophies, active current squad players, and championship coaching staff.',
  alternates: {
    canonical: 'https://superkingsden.com/chennai-super-kings',
  },
  openGraph: {
    title: 'Chennai Super Kings (CSK) — Official IPL Franchise Hub | Super Kings Den',
    description: 'Explore CSK news updates, 7 trophies timeline, active player squad, and Stephen Fleming coaching staff.',
    url: 'https://superkingsden.com/chennai-super-kings',
    siteName: 'Super Kings Den',
  },
};

export default async function ChennaiSuperKingsPage() {
  const [posts, players] = await Promise.all([
    fetchLivePosts(),
    fetchLivePlayerProfiles(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Primary Accessibility Heading */}
      <h1 className="sr-only">Chennai Super Kings (CSK) Official Franchise Hub</h1>

      {/* Section 1: Hero Banner */}
      <CSKHeroBanner className="mb-8 sm:mb-10" />

      {/* Section 2: CSK News (4 blogs from csk-news category + View More -> /csk-news) */}
      <CSKNewsSection posts={posts} className="mb-8 sm:mb-10" />

      {/* Section 3: CSK Trophy Showcase (Silverware Legacy & Highlights) */}
      <CSKTrophyShowcase className="mb-8 sm:mb-10" />

      {/* Section 4: Match Center (Next Marquee Fixture & Countdown) */}
      <MatchCenter selectedFranchise="CSK" className="mb-8 sm:mb-10" />

      {/* Section 5: Current Squad */}
      <CSKCurrentSquadSection players={players} className="mb-8 sm:mb-10" />

      {/* Section 6: Coaching & Support Staff (Featured 2 Head Coaches) */}
      <CSKCoachesSection className="mb-8 sm:mb-10" featuredOnly={true} />

      {/* Section 7: Franchise Statistics & Records (All-time Analytics, Leaderboards & Milestones) */}
      <StatsHub franchise="CSK" className="mb-0" />
    </div>
  );
}
