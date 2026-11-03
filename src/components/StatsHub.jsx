'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Zap, Target, Shield, Flame } from 'lucide-react';
import { getFranchiseStats } from '../data/statsData';

export default function StatsHub({ franchise = 'CSK', className = 'mb-8 sm:mb-10' }) {
  const [activeTab, setActiveTab] = useState('BATTING'); // 'BATTING' | 'BOWLING' | 'RECORDS'
  const [data, setData] = useState(() => getFranchiseStats(franchise));

  useEffect(() => {
    let isMounted = true;
    async function loadLiveStats() {
      try {
        const res = await fetch(`/api/admin/franchise-stats?franchise=${franchise}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && json.data.overview) {
            setData(json.data);
          }
        }
      } catch (e) {}
    }
    loadLiveStats();
    return () => { isMounted = false; };
  }, [franchise]);
  const isJSK = (data?.franchise || franchise) === 'JSK';
  const isTSK = (data?.franchise || franchise) === 'TSK';
  const overview = data?.overview || {};

  // Franchise dynamic color accents
  const barColor = 'bg-csk-yellow';
  const accentText = isJSK
    ? 'text-emerald-700 dark:text-emerald-400'
    : isTSK
    ? 'text-amber-600 dark:text-yellow-400'
    : 'text-amber-700 dark:text-csk-yellow';
  const activeTabClass = isJSK
    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
    : isTSK
    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
    : 'bg-csk-yellow text-csk-darkNavy font-black shadow-md';

  return (
    <section className={className}>
      {/* 1. Header with Franchise Identity */}
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{data.title}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {data.league}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
            {data.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Overview KPI Summary Cards (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {/* Matches */}
        <div className="sports-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 text-center">
          <Zap className={`w-5 h-5 ${accentText} mx-auto mb-2`} />
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
            {data.overview.totalMatches}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            {data.matchLabel}
          </div>
          <div className={`text-[10px] ${accentText} font-bold mt-1`}>
            {data.overview.wins} Wins
          </div>
        </div>

        {/* Titles / Trophies */}
        <div className="sports-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 text-center">
          <Trophy className={`w-5 h-5 ${accentText} mx-auto mb-2`} />
          <div className={`text-2xl sm:text-3xl font-black font-display ${accentText} tabular-nums`}>
            {data.overview.titles}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            {data.league} Silverware
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {data.overview.titleSub}
          </div>
        </div>

        {/* Finals / Playoff Runs */}
        <div className="sports-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 text-center">
          <Target className={`w-5 h-5 ${accentText} mx-auto mb-2`} />
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
            {data.overview.finalsPlayed}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            Finals / Semis
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {data.overview.finalsSub}
          </div>
        </div>

        {/* Win Rate */}
        <div className="sports-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 text-center">
          <TrendingUp className={`w-5 h-5 ${accentText} mx-auto mb-2`} />
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
            {data.overview.winRate}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            Win Rate
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {data.overview.winLossSub}
          </div>
        </div>

        {/* Playoffs Rate */}
        <div className="sports-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 text-center">
          <Award className={`w-5 h-5 ${accentText} mx-auto mb-2`} />
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
            {data.overview.playoffsQualified}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            Playoff Quals
          </div>
          <div className={`text-[10px] ${accentText} font-bold mt-1`}>
            {data.overview.playoffRateSub}
          </div>
        </div>

        {/* Home Fortress */}
        <div className="sports-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 text-center">
          <Shield className={`w-5 h-5 ${accentText} mx-auto mb-2`} />
          <div className={`text-2xl sm:text-3xl font-black font-display ${accentText} tabular-nums`}>
            {data.overview.fortressWinRate}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            {data.fortressLabel}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {data.fortressSub}
          </div>
        </div>
      </div>

      {/* 3. Interactive Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('BATTING')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'BATTING'
              ? activeTabClass
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Batting Records</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BOWLING')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'BOWLING'
              ? activeTabClass
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Bowling Records</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RECORDS')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'RECORDS'
              ? activeTabClass
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Team Milestones</span>
        </button>
      </div>

      {/* 4. Tab Content: Batting Leaderboard */}
      {activeTab === 'BATTING' && (
        <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
            <h3 className="font-black font-display text-base sm:text-lg text-slate-900 dark:text-white">
              {data.battingTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {data.battingSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3.5 pl-4 sm:pl-5">#</th>
                  <th className="p-3.5">Batter</th>
                  <th className="p-3.5 text-center">Matches</th>
                  <th className="p-3.5 text-center">Innings</th>
                  <th className="p-3.5 text-right font-black">Runs</th>
                  <th className="p-3.5 text-right">Avg</th>
                  <th className="p-3.5 text-right">Strike Rate</th>
                  <th className="p-3.5 text-center">50s / 100s</th>
                  <th className="p-3.5 pr-4 sm:pr-5 text-right">HS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {data.batting.map((b) => (
                  <tr key={b.rank} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="p-3.5 pl-4 sm:pl-5 font-bold text-slate-400">{b.rank}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.player}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.matches}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.innings}</td>
                    <td className={`p-3.5 text-right font-black ${accentText} text-sm tabular-nums`}>
                      {b.runs}
                    </td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.avg}</td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.sr}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.fifties} / {b.hundreds}</td>
                    <td className="p-3.5 pr-4 sm:pr-5 text-right font-bold text-slate-800 dark:text-slate-200">{b.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Bowling Leaderboard */}
      {activeTab === 'BOWLING' && (
        <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
            <h3 className="font-black font-display text-base sm:text-lg text-slate-900 dark:text-white">
              {data.bowlingTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {data.bowlingSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3.5 pl-4 sm:pl-5">#</th>
                  <th className="p-3.5">Bowler</th>
                  <th className="p-3.5 text-center">Matches</th>
                  <th className="p-3.5 text-center">Innings</th>
                  <th className="p-3.5 text-right font-black">Wickets</th>
                  <th className="p-3.5 text-right">Avg</th>
                  <th className="p-3.5 text-right">Economy</th>
                  <th className="p-3.5 text-center">Best</th>
                  <th className="p-3.5 pr-4 sm:pr-5 text-center">4w Hauls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {data.bowling.map((b) => (
                  <tr key={b.rank} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="p-3.5 pl-4 sm:pl-5 font-bold text-slate-400">{b.rank}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.player}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.matches}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.innings}</td>
                    <td className={`p-3.5 text-right font-black ${accentText} text-sm tabular-nums`}>
                      {b.wickets}
                    </td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.avg}</td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.econ}</td>
                    <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">{b.best}</td>
                    <td className="p-3.5 pr-4 sm:pr-5 text-center text-slate-600 dark:text-slate-400">{b.fourWkts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Team Milestones */}
      {activeTab === 'RECORDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {data.records.map((rec, idx) => (
            <div
              key={idx}
              className="sports-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50 transition shadow-xs hover:shadow-md"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                {rec.title}
              </span>
              <div className={`text-xl sm:text-2xl font-black font-display ${accentText} mb-2`}>
                {rec.value}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rec.details}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
