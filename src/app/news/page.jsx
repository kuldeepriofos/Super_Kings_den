import React from 'react';
import HeroFeatured from '../../components/HeroFeatured';
import NewsGrid from '../../components/NewsGrid';
import { fetchLivePosts } from '../../services/api';

export const metadata = {
  title: 'Den Dispatches & CSK Breaking News',
  description: 'Stay updated with the latest Chennai Super Kings breaking news, match reviews, player interviews, transfer rumors, and tactical breakdowns from Chepauk.',
  alternates: {
    canonical: 'https://superkingsden.com/news',
  },
  openGraph: {
    title: 'Den Dispatches & CSK Breaking News | Super Kings Den',
    description: 'Latest news, match reports, player interviews, and tactical analysis from Chennai Super Kings, Joburg Super Kings & Texas Super Kings.',
    url: 'https://superkingsden.com/news',
    siteName: 'Super Kings Den',
  },
};

export default async function NewsIndexPage() {
  const posts = await fetchLivePosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-2 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-csk-yellow inline-block animate-pulse"></span>
          <span>Live 24/7 Coverage</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          Den Dispatches &amp; Breaking News
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Comprehensive matchday analysis, exclusive behind-the-scenes interviews, squad tactics, and press conference updates from Chepauk and beyond.
        </p>
      </div>

      <HeroFeatured posts={posts} />
      <NewsGrid posts={posts} />
    </div>
  );
}
