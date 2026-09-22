import React from 'react';
import HomeClient from '../components/HomeClient';
import { fetchLivePosts, fetchLivePlayerProfiles } from '../services/api';

export const metadata = {
  title: {
    absolute: 'Super Kings Den — Official Fan Portal | CSK, JSK & TSK News, Squads & Highlights'
  },
  description: 'The premier independent fan destination celebrating Chennai Super Kings (IPL), Joburg Super Kings (SA20) & Texas Super Kings (MLC). News, stats, schedules & analysis.',
  alternates: {
    canonical: 'https://superkingsden.com',
  },
  openGraph: {
    title: 'Super Kings Den — Official Fan Portal | CSK, JSK & TSK',
    description: 'Latest Chennai Super Kings, Joburg Super Kings & Texas Super Kings news, match analysis, player stats, and Chepauk chronicles.',
    url: 'https://superkingsden.com',
    siteName: 'Super Kings Den',
    images: [
      {
        url: 'https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
        width: 1200,
        height: 630,
        alt: 'Super Kings Den - Chennai Super Kings Portal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function HomePage() {
  const [posts, players] = await Promise.all([
    fetchLivePosts(),
    fetchLivePlayerProfiles()
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Primary Portal H1 for Google Search & Accessibility */}
      <h1 className="sr-only">Super Kings Den — Official Chennai Super Kings (CSK) Fan Portal &amp; Community</h1>
      <HomeClient initialPosts={posts} initialPlayers={players} />
    </div>
  );
}
