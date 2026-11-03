import React from 'react';
import HomeClient from '../components/HomeClient';
import { fetchLivePosts, fetchLiveFixtures } from '../services/api';
import { buildPageMetadata } from '../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('home', {
    title: 'Super Kings Den — Official Fan Portal | CSK, JSK & TSK News, Squads & Highlights',
    description: 'The premier independent fan destination celebrating Chennai Super Kings (IPL), Joburg Super Kings (SA20) & Texas Super Kings (MLC). News, stats, schedules & analysis.',
    canonical: 'https://superkingsden.com/',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  });
}

export default async function HomePage() {
  const [posts, fixtures] = await Promise.all([
    fetchLivePosts(),
    fetchLiveFixtures(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Primary Portal H1 for Google Search & Accessibility */}
      <h1 className="sr-only">Super Kings Den — Official Chennai Super Kings (CSK) Fan Portal &amp; Community</h1>
      <HomeClient initialPosts={posts} initialFixtures={fixtures} />
    </div>
  );
}
