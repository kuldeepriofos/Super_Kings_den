import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, RotateCcw, Compass, Newspaper, Trophy, Users } from 'lucide-react';

export const metadata = {
  title: 'Clean Bowled! 404 Page Not Found',
  description: 'Looks like you got clean bowled outside off-stump! The page you are looking for has taken the walk back to the pavilion.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Stadium Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-csk-yellow/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10">
        
        {/* 1. Large 404 Headline with Stadium Vibe */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span>Out! Back to the Pavilion</span>
        </div>

        {/* 2. Cricket Bowled Animation Canvas */}
        <div className="relative w-full max-w-sm mx-auto h-56 my-2 flex items-center justify-center select-none">
          {/* Pitch & Crease Line */}
          <div className="absolute bottom-6 w-72 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full opacity-60">
            {/* White Crease Popping line */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-44 h-0.5 bg-white/70" />
          </div>

          {/* Stumps & Bails Group */}
          <div className="relative animate-led-flash flex items-end justify-center">
            
            {/* Left Bail */}
            <div className="absolute -top-3 left-4 w-7 h-2 bg-amber-400 dark:bg-csk-yellow rounded-sm shadow-md animate-left-bail z-20 border border-amber-600/40" />

            {/* Right Bail */}
            <div className="absolute -top-3 right-4 w-7 h-2 bg-amber-400 dark:bg-csk-yellow rounded-sm shadow-md animate-right-bail z-20 border border-amber-600/40" />

            {/* Stumps Container */}
            <div className="flex items-end space-x-3 h-36">
              
              {/* Leg Stump */}
              <div className="w-3.5 h-36 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 rounded-t-sm shadow-md animate-leg-stump border border-amber-700/30 flex flex-col justify-between py-2 items-center">
                <span className="w-1 h-3 bg-red-500 rounded-full opacity-70" />
                <span className="w-1 h-3 bg-red-500 rounded-full opacity-70" />
              </div>

              {/* Middle Stump (Cartwheels away on impact!) */}
              <div className="w-3.5 h-36 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 rounded-t-sm shadow-lg animate-middle-stump border border-amber-700/30 flex flex-col justify-between py-2 items-center">
                <span className="w-1 h-3 bg-red-500 rounded-full opacity-90 shadow-sm" />
                <span className="w-1 h-3 bg-red-500 rounded-full opacity-90 shadow-sm" />
              </div>

              {/* Off Stump (Flies back at an angle) */}
              <div className="w-3.5 h-36 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 rounded-t-sm shadow-md animate-off-stump border border-amber-700/30 flex flex-col justify-between py-2 items-center">
                <span className="w-1 h-3 bg-red-500 rounded-full opacity-70" />
                <span className="w-1 h-3 bg-red-500 rounded-full opacity-70" />
              </div>

            </div>

            {/* Delivery: Leather Cricket Ball in Flight with Seam */}
            <div className="absolute -bottom-1 -left-4 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 shadow-xl border border-red-400/40 animate-cricket-ball z-30 flex items-center justify-center">
              {/* White Ball Seam */}
              <div className="w-full h-0.5 bg-white/70 transform rotate-45" />
            </div>

          </div>
        </div>

        {/* 3. Big 404 Number + Cricket Message */}
        <h1 className="text-5xl sm:text-7xl font-semibold font-heading tracking-tight text-slate-900 dark:text-white mt-4 mb-2">
          404 <span className="text-amber-600 dark:text-csk-yellow">&bull; Clean Bowled!</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-2 font-medium">
          That Yorker swung right through the gate! The page you were searching for is no longer at the crease.
        </p>

        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
          Error 404 &bull; Umpire has raised the finger &bull; Replay shows middle stump uprooted
        </p>

        {/* 4. Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-csk-yellow hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-csk-glow hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home Pavilion</span>
          </Link>

          <Link
            href="/csk-news"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition border border-slate-200 dark:border-white/10"
          >
            <Newspaper className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
            <span>Latest Den News</span>
          </Link>
        </div>

        {/* 5. Helpful Links Grid */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 max-w-lg mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
            Quick Navigation Links
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
            <Link 
              href="/squad" 
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:text-amber-600 dark:hover:text-csk-yellow text-slate-700 dark:text-slate-300 transition border border-slate-200/60 dark:border-white/5"
            >
              Squad Roster
            </Link>
            <Link 
              href="/seasons" 
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:text-amber-600 dark:hover:text-csk-yellow text-slate-700 dark:text-slate-300 transition border border-slate-200/60 dark:border-white/5"
            >
              IPL Seasons
            </Link>
            <Link 
              href="/stats" 
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:text-amber-600 dark:hover:text-csk-yellow text-slate-700 dark:text-slate-300 transition border border-slate-200/60 dark:border-white/5"
            >
              CSK Stats
            </Link>
            <Link 
              href="/trophies" 
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:text-amber-600 dark:hover:text-csk-yellow text-slate-700 dark:text-slate-300 transition border border-slate-200/60 dark:border-white/5"
            >
              Trophies
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
