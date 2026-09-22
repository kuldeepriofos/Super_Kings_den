import React from 'react';
import { Trophy, Star, Award, MapPin, Calendar, Flame } from 'lucide-react';
import { TROPHIES_DATA } from '../data/rivalriesData';

export default function TrophiesTimeline() {
  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
            The Trophy Cabinet &bull; 7 Silverware Crowns
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            5× Indian Premier League Championships + 2× Champions League T20 Titles
          </p>
        </div>
      </div>

      {/* Grid of Championship Trophies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {TROPHIES_DATA.map((t, idx) => (
          <div
            key={idx}
            className="sports-card group relative rounded-2xl p-5 border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/60 transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Background Trophy Watermark */}
            <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-amber-500/5 dark:text-csk-yellow/5 group-hover:text-csk-yellow/15 transition-all duration-500 pointer-events-none" />

            <div>
              {/* Year & Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black font-display text-amber-600 dark:text-csk-yellow flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current" /> {t.year}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-csk-yellow border border-amber-500/20">
                  {t.title}
                </span>
              </div>

              {/* Final Clashed Opponent */}
              <h3 className="text-base font-black text-slate-900 dark:text-white font-display mb-1">
                Defeated {t.opponent}
              </h3>

              <p className="text-xs font-bold text-amber-700 dark:text-csk-yellow mb-3">
                {t.margin}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow flex-shrink-0" />
                  <span className="truncate">{t.venue}</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow flex-shrink-0" />
                  <span className="truncate">Hero: <strong className="text-slate-900 dark:text-white">{t.hero}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Captain: MS Dhoni</span>
              <span className="text-amber-700 dark:text-csk-yellow font-black">#WhistlePodu</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
