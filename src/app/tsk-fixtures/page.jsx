import React from 'react';
import FranchiseFixturesView from '../../components/FranchiseFixturesView';
import { buildPageMetadata } from '../../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('/tsk-fixtures', {
    title: 'TSK Fixtures & Match Results 2026 | Texas Super Kings Schedules',
    description: 'Official Texas Super Kings (TSK) Major League Cricket (MLC) 2026 match schedule, Grand Prairie live countdown, match results, historical archive, and most runs & most wickets leaderboards.',
    canonical: 'https://superkingsden.com/tsk-fixtures/',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  });
}

export default function TSKFixturesPage() {
  return <FranchiseFixturesView franchise="TSK" />;
}
