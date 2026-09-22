'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function TournamentBanner() {
  return (
    <section className="mb-14">
      {/* Container with sports-card styling & high-impact responsive banner */}
      <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-amber-500/20 group">
        
        {/* Banner Background Image */}
        <div 
          className="relative w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[340px] bg-slate-950 bg-cover bg-center flex items-center"
          style={{
            backgroundImage: `url('/csk-emotion-clean.jpg')`,
            backgroundPosition: 'center 20%',
          }}
        >
          {/* Subtle Left Vignette Overlay for Crisp Text Readability across all screens */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* Banner Content (Aligned to left as in screenshot) */}
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-xl">
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest text-slate-300 uppercase block mb-1.5 sm:mb-2">
              CHENNAI SUPER KINGS
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold font-heading text-white tracking-tight leading-tight uppercase mb-4 sm:mb-6 drop-shadow-md">
              MORE THAN A TEAM.<br />
              A EMOTION.
            </h2>

            <Link
              href="/csk-news"
              className="inline-flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-csk-yellow hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-csk-glow hover:scale-105 active:scale-95 group/btn"
            >
              <span>Explore CSK</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Floating Script Accent: Yellove Forever (as in screenshot) */}
          <div className="absolute right-6 sm:right-10 bottom-6 sm:bottom-8 hidden md:block pointer-events-none select-none">
            <span 
              className="text-white/40 text-2xl lg:text-3xl italic font-serif tracking-wider drop-shadow"
              style={{ fontFamily: 'Brush Script MT, cursive, sans-serif' }}
            >
              Yellove<br />Forever
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
