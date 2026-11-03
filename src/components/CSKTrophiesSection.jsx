'use client';

import React, { useState } from 'react';
import { Trophy, Star, Award, MapPin, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { TROPHIES_DATA } from '../data/rivalriesData';

export default function CSKTrophiesSection({ className = "mb-12 sm:mb-14" }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'IPL' | 'CLT20'

  const filteredTrophies = filter === 'ALL'
    ? TROPHIES_DATA
    : filter === 'IPL'
    ? TROPHIES_DATA.filter(t => !t.title.includes('CLT20'))
    : TROPHIES_DATA.filter(t => t.title.includes('CLT20'));

  return (
    <section className={className}>
      {/* ─── Section Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              CSK Championship Trophies By Year
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              Official silverware gallery &bull; 5× IPL Champions + 2× Champions League T20 Crowns
            </p>
          </div>
        </div>

        {/* Silverware Summary Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-csk-yellow shadow-xs self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7 Total Silverware Titles</span>
        </div>
      </div>

      {/* ─── Interactive Filter Buttons ─── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            filter === 'ALL'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Silverware (7)</span>
        </button>

        <button
          onClick={() => setFilter('IPL')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            filter === 'IPL'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>5× IPL Trophies</span>
        </button>

        <button
          onClick={() => setFilter('CLT20')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            filter === 'CLT20'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>2× CLT20 Crowns</span>
        </button>
      </div>

      {/* ─── Grid of Trophies by Year ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTrophies.map((t, idx) => {
          const isCLT20 = (t.title || '').includes('CLT20');
          const trophyImg = isCLT20 ? '/clt20-trophy-silver.jpg' : '/ipl-trophy-gold.jpg';
          const trophyLabel = isCLT20 ? 'CLT20 TROPHY' : 'IPL GOLD TROPHY';

          return (
            <div
              key={`${t.year}-${t.title}-${idx}`}
              className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/80 transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900/70 shadow-xs hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* ── Trophy Visual Showcase Container ── */}
                <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-[#050C1F] via-[#081538] to-[#040A18] flex items-center justify-center p-3 border-b border-slate-200 dark:border-white/10">
                  {/* Subtle Ambient Spotlight */}
                  <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none"></div>

                  {/* Trophy Photo */}
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
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border ${
                      isCLT20
                        ? 'bg-blue-950/85 text-blue-300 border-blue-400/40'
                        : 'bg-amber-950/85 text-amber-400 border-amber-500/40'
                    }`}>
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
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
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
                <span className="text-amber-600 dark:text-csk-yellow font-extrabold">
                  #WhistlePodu
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
