'use client';

import React from 'react';
import { Trophy, Star, Award, MapPin, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { TROPHIES_DATA } from '../data/rivalriesData';

export default function CSKTrophiesSection() {
  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              CSK Championship Trophies By Year
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5× IPL Champions (2010, 2011, 2018, 2021, 2023) + 2× Champions League T20 Crowns (2010, 2014)
            </p>
          </div>
        </div>

        {/* Silverware Summary Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-csk-yellow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7 Total Silverware Titles</span>
        </div>
      </div>

      {/* Grid of 7 Trophies with Prominent Years */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {TROPHIES_DATA.map((t, idx) => (
          <div
            key={idx}
            className="sports-card group relative rounded-2xl p-5 border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/60 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl"
          >
            {/* Background Trophy Watermark */}
            <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-amber-500/5 dark:text-csk-yellow/5 group-hover:text-csk-yellow/15 transition-all duration-500 pointer-events-none" />

            <div>
              {/* Prominent Year Header & Competition Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold font-display text-amber-600 dark:text-csk-yellow tracking-tight">
                    {t.year}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Title</span>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-csk-yellow border border-amber-500/30">
                  {t.title}
                </span>
              </div>

              {/* Match Final Result */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1 group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition">
                Beat {t.opponent}
              </h3>

              {/* Victory Margin */}
              <p className="text-xs font-bold text-amber-700 dark:text-csk-yellow mb-3.5 flex items-center">
                <Star className="w-3.5 h-3.5 mr-1 fill-current text-amber-500 dark:text-csk-yellow" />
                {t.margin}
              </p>

              {/* Venue & Final Hero Details */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <div className="flex items-start">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{t.venue}</span>
                </div>
                <div className="flex items-start">
                  <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow flex-shrink-0 mt-0.5" />
                  <span className="font-medium">
                    Hero: <strong className="text-slate-900 dark:text-white font-bold">{t.hero}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Captain & WhistlePodu Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-4 flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                Captain: MS Dhoni
              </span>
              <span className="text-amber-700 dark:text-csk-yellow font-bold">
                #WhistlePodu
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
