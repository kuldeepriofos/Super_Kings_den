import React from 'react';
import FranchiseFixturesView from '../../components/FranchiseFixturesView';
import { buildPageMetadata } from '../../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('/jsk-fixtures', {
    title: 'JSK Fixtures & Match Results 2026 | Joburg Super Kings Schedules',
    description: 'Official Joburg Super Kings (JSK) SA20 2026 match schedule, Wanderers live countdown timer, recent match results, historical match archive, and most runs & most wickets leaderboards.',
    canonical: 'https://superkingsden.com/jsk-fixtures/',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  });
}

export default function JSKFixturesPage() {
  return <FranchiseFixturesView franchise="JSK" />;
}
