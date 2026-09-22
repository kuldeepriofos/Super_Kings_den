import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Play, Eye } from 'lucide-react';
import { fetchWebStories } from '../../services/api';

export const metadata = {
  title: 'CSK Web Stories & Visual Highlights',
  description: 'Tap through fast-loading visual Web Stories featuring Chennai Super Kings champions, IPL trade buzz, player spotlights, and iconic match-winning moments.',
  alternates: {
    canonical: 'https://superkingsden.com/web-stories',
  },
  openGraph: {
    title: 'CSK Web Stories & Visual Highlights | Super Kings Den',
    description: 'Fast-paced visual stories, player spotlights, and tournament chronicles for Super Kings fans.',
    url: 'https://superkingsden.com/web-stories',
    siteName: 'Super Kings Den',
  },
};

export default async function WebStoriesIndexPage() {
  const stories = await fetchWebStories();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">
          Web Stories
        </span>
      </nav>

      {/* Hero Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-2 text-csk-yellow mb-2 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4 text-csk-yellow" />
          <span>Visual Micro-Content &bull; {stories.length} Stories</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold text-white font-heading tracking-tight mb-2">
          Super Kings Web Stories
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Bite-sized visual snapshots, iconic moments, and rapid insights designed for mobile fans on the go.
        </p>
      </div>

      {/* Web Stories Grid (Mobile 9:16 aspect ratio cards) */}
      <h2 className="sr-only">Web Stories Collection</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {stories.map((story) => {
          const poster = story.poster || '/uploads/2025/08/ILP-2026-trade-Buzz.jpg';
          return (
            <Link
              key={story.id}
              href={`/web-stories/${story.slug}`}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-end p-4 border border-slate-200 dark:border-white/10"
            >
              {/* Background Poster Image */}
              <img
                src={poster}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Play Badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-csk-yellow group-hover:scale-110 transition">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>

              {/* Story Content */}
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-csk-yellow block mb-1">
                  Web Story
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-3 leading-snug group-hover:text-csk-yellow transition font-display">
                  {story.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

