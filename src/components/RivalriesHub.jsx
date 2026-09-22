'use client';

import React, { useState } from 'react';
import { Swords, Flame, Trophy, Award, MapPin, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { RIVALRIES_DATA } from '../data/rivalriesData';

export default function RivalriesHub() {
  const [selectedRivalry, setSelectedRivalry] = useState(RIVALRIES_DATA[0]);

  const cskWinPct = Math.round((selectedRivalry.cskWins / selectedRivalry.totalMatches) * 100);
  const rivalWinPct = Math.round((selectedRivalry.rivalWins / selectedRivalry.totalMatches) * 100);

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Historic Rivalries &bull; Head-to-Head Records
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CSK vs Every IPL Franchise &bull; 12 Head-to-Head Records Across IPL History
            </p>
          </div>
        </div>

        {/* Rivalry Selector Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none max-w-full sm:max-w-xl">
          {RIVALRIES_DATA.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRivalry(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 shrink-0 ${
                selectedRivalry.id === r.id
                  ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-sm'
                  : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0 shadow-sm"
                style={{ backgroundColor: r.rivalColor }}
              />
              <span>CSK vs {r.rivalShort}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Rivalry Showcase Card */}
      <div className="sports-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-csk-yellow/30 relative overflow-hidden mb-8">
        {/* Background glowing gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-csk-yellow/5 dark:bg-csk-yellow/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Rivalry Title & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-csk-yellow">
                {selectedRivalry.name}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                {selectedRivalry.marqueeTag}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white font-heading">
              Chennai Super Kings <span className="text-amber-600 dark:text-csk-yellow font-normal">vs</span> {selectedRivalry.rival}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-csk-yellow border border-amber-500/30">
            {selectedRivalry.totalMatches} Clashes Total
          </span>
        </div>

        {/* Head-to-Head Visual Bar */}
        <div className="mb-8 bg-slate-100 dark:bg-slate-950/70 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm font-black font-display">
            <span className="text-amber-600 dark:text-csk-yellow flex items-center">
              CSK &bull; {selectedRivalry.cskWins} WINS ({cskWinPct}%)
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">
              {selectedRivalry.totalMatches} Matches Played
            </span>
            <span className="flex items-center" style={{ color: selectedRivalry.rivalColor }}>
              {selectedRivalry.rivalShort} &bull; {selectedRivalry.rivalWins} WINS ({rivalWinPct}%)
            </span>
          </div>

          {/* Progress Bar Dual Split */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 p-0.5">
            <div 
              className="bg-gradient-to-r from-csk-yellow to-amber-500 h-full rounded-l-full transition-all duration-700 ease-out" 
              style={{ width: `${cskWinPct}%` }}
              title={`CSK Wins: ${selectedRivalry.cskWins}`}
            />
            <div 
              className="h-full rounded-r-full transition-all duration-700 ease-out" 
              style={{ width: `${rivalWinPct}%`, backgroundColor: selectedRivalry.rivalColor }}
              title={`${selectedRivalry.rivalShort} Wins: ${selectedRivalry.rivalWins}`}
            />
          </div>

          {/* Form Guide (Last 5 matches) */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-white/10">
            <span className="font-semibold">Recent Form:</span>
            <div className="flex items-center space-x-1.5">
              {selectedRivalry.lastFive.map((winner, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    winner === 'CSK'
                      ? 'bg-csk-yellow text-csk-darkNavy shadow-xs'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {winner}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Chepauk Fortress */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> AnbuDen Fortress
            </span>
            <p className="text-base font-black text-slate-900 dark:text-white font-display">
              {selectedRivalry.chepaukDominance}
            </p>
            <span className="text-xs text-amber-700 dark:text-csk-yellow font-semibold mt-1 block">
              Chepauk Stadium Home Advantage
            </span>
          </div>

          {/* Highest Totals */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> Highest Scores
            </span>
            <p className="text-base font-black text-slate-900 dark:text-white font-display">
              CSK: <span className="text-amber-600 dark:text-csk-yellow">{selectedRivalry.highestScoreCSK}</span> &bull; {selectedRivalry.rivalShort}: {selectedRivalry.highestScoreRival}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
              Record T20 totals in rivalry
            </span>
          </div>

          {/* Marquee Leaders */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1 flex items-center">
              <Award className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow" /> Top Performers
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Runs: <span className="text-amber-600 dark:text-csk-yellow">{selectedRivalry.topCSKScorer}</span>
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
              Wickets: <span className="text-amber-600 dark:text-csk-yellow">{selectedRivalry.topCSKBowler}</span>
            </p>
          </div>
        </div>

        {/* Iconic Match Moment Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-csk-yellow text-xs sm:text-sm">
          <span className="font-bold text-amber-700 dark:text-csk-yellow uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iconic Showdown Moment:</span>
          </span>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            "{selectedRivalry.iconicMoment}"
          </p>
        </div>
      </div>

      {/* Complete All 12 Franchises Summary Grid */}
      <div>
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-2.5 h-6 bg-csk-yellow rounded-full flex-shrink-0" />
          <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            All 12 Teams Head-to-Head Quick Matrix
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {RIVALRIES_DATA.map((r) => {
            const winPct = Math.round((r.cskWins / r.totalMatches) * 100);
            return (
              <div
                key={r.id}
                onClick={() => { setSelectedRivalry(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="sports-card p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-csk-yellow/60 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.rivalColor }} />
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white font-heading">CSK vs {r.rivalShort}</h3>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-csk-yellow">{winPct}% Win</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 truncate">
                    {r.rival}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold text-amber-600 dark:text-csk-yellow">{r.cskWins} Wins</span>
                    <span>{r.totalMatches} Played</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{r.rivalWins} Losses</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                    <div className="bg-csk-yellow h-full" style={{ width: `${winPct}%` }} />
                    <div className="h-full" style={{ width: `${100 - winPct}%`, backgroundColor: r.rivalColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
