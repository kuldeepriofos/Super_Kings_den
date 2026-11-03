import React from 'react';
import FranchiseFixturesView from '../../components/FranchiseFixturesView';
import { buildPageMetadata } from '../../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('/csk-fixtures', {
    title: 'CSK Fixtures & Match Results 2026 | Chennai Super Kings Schedules',
    description: 'Official Chennai Super Kings (CSK) IPL 2026 match schedule, live countdown timer, recent match results, historical match archive, and most runs & most wickets leaderboards.',
    canonical: 'https://superkingsden.com/csk-fixtures/',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  });
}

export default function CSKFixturesPage() {
  return <FranchiseFixturesView franchise="CSK" />;
}
