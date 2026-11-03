'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Star, Award, MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import { TROPHIES_DATA } from '../data/rivalriesData';

export default function CSKTrophyShowcase({ className = "mb-8 sm:mb-10" }) {
  const visibleTrophies = TROPHIES_DATA.slice(0, 3);
  const fourthTrophy = TROPHIES_DATA[3] || TROPHIES_DATA[0];

  const isFourthCLT20 = (fourthTrophy.title || '').includes('CLT20');
  const fourthTrophyImg = isFourthCLT20 ? '/clt20-trophy-silver.jpg' : '/ipl-trophy-gold.jpg';
  const fourthTrophyLabel = isFourthCLT20 ? 'CLT20 TROPHY' : 'IPL GOLD TROPHY';

  return (
    <section className={className}>
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              CSK Trophy Cabinet
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
              5× IPL Titles &bull; 2× CLT20 Crowns &bull; 10 Grand Finals &bull; 100% MS Dhoni Era
            </p>
          </div>
        </div>

        <Link
          href="/csk-trophies"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-csk-yellow border border-amber-200/80 dark:border-amber-500/30 hover:bg-csk-yellow hover:text-csk-darkNavy transition-all self-start sm:self-auto group shadow-xs"
        >
          <span>View All 7 Trophies</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ─── 3 Real Trophy Cards + 4th Blurred Card with "See More Trophies" ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. First 3 Real Trophy Cards */}
        {visibleTrophies.map((t, idx) => {
          const isCLT20 = (t.title || '').includes('CLT20');
          const trophyImg = isCLT20 ? '/clt20-trophy-silver.jpg' : '/ipl-trophy-gold.jpg';
          const trophyLabel = isCLT20 ? 'CLT20 TROPHY' : 'IPL GOLD TROPHY';

          return (
            <Link
              href="/csk-trophies"
              key={`${t.year}-${t.title}-${idx}`}
              className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/80 transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900/70 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div>
                {/* ── Trophy Visual Showcase Container ── */}
                <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-[#050C1F] via-[#081538] to-[#040A18] flex items-center justify-center p-3 border-b border-slate-200 dark:border-white/10">
                  {/* Subtle Ambient Spotlight */}
                  <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none"></div>

                  {/* Real Trophy Photo */}
                  <img
                    src={trophyImg}
                    alt={`${t.year} ${t.title} - Official Trophy`}
                    className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] group-hover:scale-108 transition-transform duration-500 relative z-10"
                    loading="lazy"
                  />

                  {/* Top-Left: Star + Year Pill */}
                  <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/50 shadow-md">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-400 font-display tracking-wide">
                      {t.year}
                    </span>
                  </div>

                  {/* Top-Right: Trophy Title Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border ${
                        isCLT20
                          ? 'bg-blue-950/85 text-blue-300 border-blue-400/40'
                          : 'bg-amber-950/85 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      {isCLT20 ? 'CLT20 CHAMPIONS' : 'IPL CHAMPIONS'}
                    </span>
                  </div>

                  {/* Bottom Trophy Label Tag */}
                  <div className="absolute bottom-2 inset-x-3 z-20 text-center">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-md text-slate-300 border border-white/15 shadow-sm">
                      {trophyLabel}
                    </span>
                  </div>
                </div>

                {/* ── Card Body & Match Victory Details ── */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      GRAND FINAL
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {t.margin}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display mb-3 group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition leading-snug">
                    Defeated {t.opponent}
                  </h3>

                  {/* Match Info Pills */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5">
                    <div className="flex items-start">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 dark:text-slate-300 leading-tight">
                        {t.venue}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight text-slate-700 dark:text-slate-300">
                        Hero: <strong className="text-slate-900 dark:text-white font-bold">{t.hero}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Card Footer ── */}
              <div className="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  CAPTAIN: MS DHONI
                </span>
                <span className="text-amber-600 dark:text-csk-yellow font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  #WhistlePodu &rarr;
                </span>
              </div>
            </Link>
          );
        })}

        {/* 2. 4th Card: Same card design as the 3 cards, with image & content blurred + "See More Trophies" button */}
        <Link
          href="/csk-trophies"
          className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/80 transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900/70 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          {/* ── Blurred Content (Exact same structure and styling as other 3 cards) ── */}
          <div className="filter blur-[5px] select-none pointer-events-none opacity-70 dark:opacity-60 flex flex-col justify-between h-full">
            <div>
              {/* Trophy Visual Showcase Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-[#050C1F] via-[#081538] to-[#040A18] flex items-center justify-center p-3 border-b border-slate-200 dark:border-white/10">
                <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none"></div>

                <img
                  src={fourthTrophyImg}
                  alt={`${fourthTrophy.year} ${fourthTrophy.title} - Official Trophy`}
                  className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                  loading="lazy"
                />

                {/* Top-Left: Star + Year Pill */}
                <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-950/85 border border-amber-500/50">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-amber-400 font-display tracking-wide">
                    {fourthTrophy.year}
                  </span>
                </div>

                {/* Top-Right: Trophy Title Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isFourthCLT20
                        ? 'bg-blue-950/85 text-blue-300 border-blue-400/40'
                        : 'bg-amber-950/85 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    {isFourthCLT20 ? 'CLT20 CHAMPIONS' : 'IPL CHAMPIONS'}
                  </span>
                </div>

                {/* Bottom Trophy Label Tag */}
                <div className="absolute bottom-2 inset-x-3 text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/85 text-slate-300 border border-white/15">
                    {fourthTrophyLabel}
                  </span>
                </div>
              </div>

              {/* Card Body & Match Victory Details */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    GRAND FINAL
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {fourthTrophy.margin}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display mb-3 leading-snug">
                  Defeated {fourthTrophy.opponent}
                </h3>

                {/* Match Info Pills */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5">
                  <div className="flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 leading-tight">
                      {fourthTrophy.venue}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow shrink-0 mt-0.5" />
                    <span className="font-medium leading-tight text-slate-700 dark:text-slate-300">
                      Hero: <strong className="text-slate-900 dark:text-white font-bold">{fourthTrophy.hero}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                CAPTAIN: MS DHONI
              </span>
              <span className="text-amber-600 dark:text-csk-yellow font-extrabold">
                #WhistlePodu &rarr;
              </span>
            </div>
          </div>

          {/* ── Centered "See More Trophies" Action Button Overlay ── */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/10 dark:bg-black/25">
            <div className="px-5 py-3 rounded-full bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider shadow-2xl group-hover:scale-105 group-hover:bg-amber-300 transition-all duration-300 flex items-center gap-2 border border-amber-300 ring-4 ring-black/10 dark:ring-white/10">
              <Trophy className="w-4 h-4 fill-csk-darkNavy" />
              <span>See More Trophies</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
