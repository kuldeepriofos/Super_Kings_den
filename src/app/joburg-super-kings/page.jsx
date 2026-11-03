import React from 'react';
import JSKHeroBanner from '../../components/JSKHeroBanner';
import JSKNewsSection from '../../components/JSKNewsSection';
import MatchCenter from '../../components/MatchCenter';
import JSKCurrentSquadSection from '../../components/JSKCurrentSquadSection';
import JSKCoachesSection from '../../components/JSKCoachesSection';
import StatsHub from '../../components/StatsHub';
import { fetchLivePosts, fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'Joburg Super Kings (JSK) — Official SA20 Franchise Hub',
  description: 'Official Joburg Super Kings franchise hub. Explore JSK news, active squad stars, Bullring fortress records, and Stephen Fleming coaching staff.',
  alternates: {
    canonical: 'https://superkingsden.com/joburg-super-kings',
  },
  openGraph: {
    title: 'Joburg Super Kings (JSK) — Official SA20 Franchise Hub | Super Kings Den',
    description: 'Explore JSK news updates, Wanderers stadium milestones, active squad roster, and coaching think tank.',
    url: 'https://superkingsden.com/joburg-super-kings',
    siteName: 'Super Kings Den',
  },
};

export default async function JoburgSuperKingsPage() {
  const [posts, players] = await Promise.all([
    fetchLivePosts(),
    fetchLivePlayerProfiles('JSK'),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Primary Accessibility Heading */}
      <h1 className="sr-only">Joburg Super Kings (JSK) Official SA20 Franchise Hub</h1>

      {/* Section 1: Hero Banner */}
      <JSKHeroBanner className="mb-8 sm:mb-10" />

      {/* Section 2: JSK News (4 articles + View More -> /jsk-news) */}
      <JSKNewsSection posts={posts} className="mb-8 sm:mb-10" />

      {/* Section 3: Match Center (Next Marquee Fixture & Countdown) */}
      <MatchCenter selectedFranchise="JSK" className="mb-8 sm:mb-10" />

      {/* Section 4: Current Squad */}
      <JSKCurrentSquadSection players={players} className="mb-8 sm:mb-10" />

      {/* Section 5: Coaching & Support Staff (Featured Coaches) */}
      <JSKCoachesSection className="mb-8 sm:mb-10" featuredOnly={true} />

      {/* Section 6: Franchise Statistics & Records (All-time Analytics, Leaderboards & Milestones) */}
      <StatsHub franchise="JSK" className="mb-0" />
    </div>
  );
}
