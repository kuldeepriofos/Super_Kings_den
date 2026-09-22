'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Award, Calendar, ChevronRight, Filter, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import { IPL_SEASONS_DATA } from '../data/seasonsData';

export default function SeasonsTimeline() {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CHAMPIONS' | 'FINALS'
  const [selectedYear, setSelectedYear] = useState(null);

  const filteredSeasons = IPL_SEASONS_DATA.filter((season) => {
    if (filter === 'CHAMPIONS') return season.isChampion;
    if (filter === 'FINALS') return season.isChampion || season.isRunnerUp;
    return true;
  });

  return (
    <section className="py-6">
      {/* Top Filter & Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Every Campaign of the Yellow Army
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              2008 &ndash; Present Archive &bull; Complete Standings, Results &amp; Championship Records
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'ALL'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({IPL_SEASONS_DATA.length})
          </button>
          <button
            onClick={() => setFilter('CHAMPIONS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filter === 'CHAMPIONS'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Champions (5)</span>
          </button>
          <button
            onClick={() => setFilter('FINALS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filter === 'FINALS'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Finalists (10)</span>
          </button>
        </div>
      </div>

      {/* Seasons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSeasons.map((season) => {
          const isSelected = selectedYear === season.year;
          return (
            <div
              key={season.year}
              onClick={() => setSelectedYear(isSelected ? null : season.year)}
              className={`rounded-2xl p-6 transition-all duration-300 relative overflow-hidden cursor-pointer border ${
                season.isChampion
                  ? 'bg-amber-50/85 dark:bg-gradient-to-br dark:from-[#0B1E48] dark:via-[#081534] dark:to-[#040C20] border-amber-300 dark:border-amber-400/80 shadow-md dark:shadow-lg hover:shadow-csk-glow hover:-translate-y-1 ring-1 ring-amber-400/40'
                  : season.isRunnerUp
                  ? 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-white/15 hover:border-amber-500/60 hover:-translate-y-1 shadow-xs'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
              }`}
            >
              {/* Gold Top Accent Line for Champions */}
              {season.isChampion && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-csk-yellow to-amber-500"></div>
              )}

              {/* Card Header: Year & Position Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`text-3xl font-extrabold font-display tracking-tight tabular-nums ${
                    season.isChampion ? 'text-amber-800 dark:text-csk-yellow' : 'text-slate-900 dark:text-white'
                  }`}>
                    {season.year}
                  </span>
                  {season.isChampion && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-csk-yellow text-csk-darkNavy border border-amber-400/50 flex items-center gap-1 shadow-xs">
                      <Trophy className="w-3 h-3" /> Champions
                    </span>
                  )}
                  {season.isRunnerUp && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/20 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Runners-up
                    </span>
                  )}
                </div>

                <span className={`text-[11px] font-bold ${season.isChampion ? 'text-amber-900/80 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {season.cskRecord.split('(')[0]}
                </span>
              </div>

              {/* Summary / Moment */}
              <p className={`text-xs leading-relaxed mb-5 line-clamp-3 ${season.isChampion ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                {season.summary}
              </p>

              {/* Tournament Champions & Runners-up Row */}
              <div className={`p-3.5 rounded-xl border space-y-2 mb-4 text-xs ${
                season.isChampion
                  ? 'bg-white/90 dark:bg-white/10 border-amber-200/80 dark:border-white/15'
                  : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={season.isChampion ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>Champion:</span>
                  <span className={`font-bold ${season.isChampion ? 'text-amber-900 dark:text-csk-yellow' : 'text-slate-900 dark:text-slate-200'}`}>
                    {season.champion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={season.isChampion ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>Runner-up:</span>
                  <span className={`font-semibold ${season.isChampion ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
                    {season.runnerUp}
                  </span>
                </div>
              </div>

              {/* Awards: Orange & Purple Cap */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`p-2.5 rounded-lg border ${
                  season.isChampion
                    ? 'bg-white/90 dark:bg-white/10 border-amber-200/80 dark:border-white/20'
                    : 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-300/80 dark:border-amber-500/20 text-amber-900 dark:text-amber-300'
                }`}>
                  <span className="font-black block uppercase tracking-wider text-[9px] text-amber-700 dark:text-amber-400">
                    Orange Cap
                  </span>
                  <div className="font-bold truncate text-slate-900 dark:text-white">{season.orangeCap.player}</div>
                  <div className={`text-[10px] font-medium ${season.isChampion ? 'text-slate-600 dark:text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {season.orangeCap.runs} runs &bull; {season.orangeCap.team}
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  season.isChampion
                    ? 'bg-purple-50/90 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-500/20'
                    : 'bg-purple-50/80 dark:bg-purple-500/10 border-purple-300/80 dark:border-purple-500/20 text-purple-900 dark:text-purple-300'
                }`}>
                  <span className="font-black block uppercase tracking-wider text-[9px] text-purple-700 dark:text-purple-400">
                    Purple Cap
                  </span>
                  <div className="font-bold truncate text-slate-900 dark:text-white">{season.purpleCap.player}</div>
                  <div className={`text-[10px] font-medium ${season.isChampion ? 'text-slate-600 dark:text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {season.purpleCap.wickets} wkts &bull; {season.purpleCap.team}
                  </div>
                </div>
              </div>

              {/* View All Matches & Scorecards Link */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                season.isChampion ? 'border-amber-200/80 dark:border-white/15' : 'border-slate-200 dark:border-white/10'
              }`}>
                <span className={`text-[11px] font-bold ${season.isChampion ? 'text-amber-900/70 dark:text-slate-300' : 'text-slate-400'}`}>
                  Full Campaign
                </span>
                <Link
                  href={`/seasons/${season.year}`}
                  className={`inline-flex items-center text-xs font-bold uppercase tracking-wide hover:underline group-hover:translate-x-0.5 transition ${
                    season.isChampion ? 'text-amber-800 dark:text-csk-yellow' : 'text-amber-600 dark:text-csk-yellow'
                  }`}
                >
                  All Matches & Stats <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
