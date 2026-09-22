'use client';

import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, Zap, Target, Users, Shield, Calendar, MapPin, ChevronRight, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { CSK_OVERVIEW_STATS, CSK_IPL_FINALS, BATTING_LEADERBOARD, BOWLING_LEADERBOARD, TEAM_RECORDS } from '../data/statsData';

export default function StatsHub() {
  const [activeTab, setActiveTab] = useState('FINALS'); // 'FINALS' | 'BATTING' | 'BOWLING' | 'RECORDS'
  const [finalsFilter, setFinalsFilter] = useState('ALL'); // 'ALL' | 'WON' | 'LOST'

  const filteredFinals = CSK_IPL_FINALS.filter(f => {
    if (finalsFilter === 'WON') return f.outcome === 'Won';
    if (finalsFilter === 'LOST') return f.outcome === 'Lost';
    return true;
  });

  return (
    <section className="py-6 space-y-10">
      
      {/* 1. Overview KPI Summary Cards */}
      <div>
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              CSK All-Time Franchise Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The numbers behind the most consistent dynasty in modern T20 cricket history
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center">
            <Zap className="w-5 h-5 text-amber-500 dark:text-csk-yellow mx-auto mb-2" />
            <div className="text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
              {CSK_OVERVIEW_STATS.totalMatches}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              IPL Matches
            </div>
            <div className="text-[10px] text-amber-700 dark:text-csk-yellow font-bold mt-1">
              {CSK_OVERVIEW_STATS.wins} Wins
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center">
            <Trophy className="w-5 h-5 text-amber-500 dark:text-csk-yellow mx-auto mb-2" />
            <div className="text-3xl font-black font-display text-amber-600 dark:text-csk-yellow tabular-nums">
              {CSK_OVERVIEW_STATS.titles}x
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              IPL Titles
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              Joint Most in IPL
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center">
            <Target className="w-5 h-5 text-amber-500 dark:text-csk-yellow mx-auto mb-2" />
            <div className="text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
              {CSK_OVERVIEW_STATS.finalsPlayed}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              Finals Played
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              All-Time #1 Record
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center">
            <TrendingUp className="w-5 h-5 text-amber-500 dark:text-csk-yellow mx-auto mb-2" />
            <div className="text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
              {CSK_OVERVIEW_STATS.winRate}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              Win Rate
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              138 Wins / 98 Losses
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center">
            <Award className="w-5 h-5 text-amber-500 dark:text-csk-yellow mx-auto mb-2" />
            <div className="text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums">
              {CSK_OVERVIEW_STATS.playoffsQualified}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              Playoffs Made
            </div>
            <div className="text-[10px] text-amber-700 dark:text-csk-yellow font-bold mt-1">
              {CSK_OVERVIEW_STATS.playoffPct} Qual. Rate
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center">
            <Shield className="w-5 h-5 text-amber-500 dark:text-csk-yellow mx-auto mb-2" />
            <div className="text-3xl font-black font-display text-amber-600 dark:text-csk-yellow tabular-nums">
              {CSK_OVERVIEW_STATS.chepaukWinRate}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              Chepauk Fortress
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              Home Win Dominance
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('FINALS')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === 'FINALS'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>All 10 IPL Finals</span>
        </button>

        <button
          onClick={() => setActiveTab('BATTING')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === 'BATTING'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Batting Records</span>
        </button>

        <button
          onClick={() => setActiveTab('BOWLING')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === 'BOWLING'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Bowling Records</span>
        </button>

        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === 'RECORDS'
              ? 'bg-csk-yellow text-csk-darkNavy shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Team Milestones</span>
        </button>
      </div>

      {/* 3. Tab Content: 10 IPL Finals */}
      {activeTab === 'FINALS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Chennai Super Kings have contested 10 grand finals &mdash; 5 Championship crowns &bull; 5 Runners-up finishes.
            </p>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setFinalsFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  finalsFilter === 'ALL'
                    ? 'bg-csk-yellow text-csk-darkNavy font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                All 10
              </button>
              <button
                onClick={() => setFinalsFilter('WON')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  finalsFilter === 'WON'
                    ? 'bg-csk-yellow text-csk-darkNavy font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                Won (5)
              </button>
              <button
                onClick={() => setFinalsFilter('LOST')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  finalsFilter === 'LOST'
                    ? 'bg-csk-yellow text-csk-darkNavy font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                Lost (5)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFinals.map((final) => {
              const isWon = final.outcome === 'Won';
              return (
                <div
                  key={final.year}
                  className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border ${
                    isWon
                      ? 'bg-amber-50/80 dark:bg-gradient-to-br dark:from-csk-navy dark:via-slate-900 dark:to-csk-darkNavy border-amber-300 dark:border-csk-yellow/50 shadow-md hover:shadow-csk-glow hover:-translate-y-1'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {isWon && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-csk-yellow to-amber-500"></div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-3xl font-black font-display ${isWon ? 'text-amber-800 dark:text-csk-yellow' : 'text-slate-900 dark:text-white'}`}>
                        {final.year}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isWon
                          ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/15'
                      }`}>
                        {isWon ? <Trophy className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                        {final.titleNum}
                      </span>
                    </div>

                    <span className={`text-xs font-bold uppercase ${isWon ? 'text-amber-800 dark:text-csk-yellow' : 'text-rose-600 dark:text-rose-400'}`}>
                      {final.margin}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-csk-yellow shrink-0" />
                    <span className="truncate">{final.venue}</span>
                  </div>

                  {/* Scoreboard Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">CSK</span>
                      <span className="font-black text-amber-700 dark:text-csk-yellow tabular-nums">{final.cskScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{final.opponent}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{final.opponentScore}</span>
                    </div>
                  </div>

                  {/* Hero & POTM */}
                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-300">
                      <strong className="text-amber-700 dark:text-csk-yellow">Hero:</strong> {final.hero}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      <strong>POTM:</strong> {final.potm}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tab Content: Batting Leaderboard */}
      {activeTab === 'BATTING' && (
        <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
            <h3 className="font-black font-display text-lg text-slate-900 dark:text-white">
              All-Time Leading Run Scorers for Chennai Super Kings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by total runs scored wearing the yellow jersey in IPL competition
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">#</th>
                  <th className="p-3.5">Batter</th>
                  <th className="p-3.5 text-center">Matches</th>
                  <th className="p-3.5 text-center">Innings</th>
                  <th className="p-3.5 text-right">Runs</th>
                  <th className="p-3.5 text-right">Avg</th>
                  <th className="p-3.5 text-right">Strike Rate</th>
                  <th className="p-3.5 text-center">50s / 100s</th>
                  <th className="p-3.5 pr-5 text-right">HS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {BATTING_LEADERBOARD.map((b) => (
                  <tr key={b.rank} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="p-3.5 pl-5 font-black text-slate-400">{b.rank}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.player}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.matches}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.innings}</td>
                    <td className="p-3.5 text-right font-black text-amber-700 dark:text-csk-yellow text-sm tabular-nums">{b.runs}</td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.avg}</td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.sr}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.fifties} / {b.hundreds}</td>
                    <td className="p-3.5 pr-5 text-right font-bold text-slate-800 dark:text-slate-200">{b.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Bowling Leaderboard */}
      {activeTab === 'BOWLING' && (
        <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
            <h3 className="font-black font-display text-lg text-slate-900 dark:text-white">
              All-Time Leading Wicket Takers for Chennai Super Kings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by total wickets taken for CSK in IPL history
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">#</th>
                  <th className="p-3.5">Bowler</th>
                  <th className="p-3.5 text-center">Matches</th>
                  <th className="p-3.5 text-center">Innings</th>
                  <th className="p-3.5 text-right">Wickets</th>
                  <th className="p-3.5 text-right">Avg</th>
                  <th className="p-3.5 text-right">Economy</th>
                  <th className="p-3.5 text-center">Best</th>
                  <th className="p-3.5 pr-5 text-center">4w Hauls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {BOWLING_LEADERBOARD.map((b) => (
                  <tr key={b.rank} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="p-3.5 pl-5 font-black text-slate-400">{b.rank}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.player}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.matches}</td>
                    <td className="p-3.5 text-center text-slate-600 dark:text-slate-400">{b.innings}</td>
                    <td className="p-3.5 text-right font-black text-amber-700 dark:text-csk-yellow text-sm tabular-nums">{b.wickets}</td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.avg}</td>
                    <td className="p-3.5 text-right text-slate-600 dark:text-slate-300 font-semibold">{b.econ}</td>
                    <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">{b.best}</td>
                    <td className="p-3.5 pr-5 text-center text-slate-600 dark:text-slate-400">{b.fourWkts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Team Milestones */}
      {activeTab === 'RECORDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_RECORDS.map((rec, idx) => (
            <div
              key={idx}
              className="sports-card rounded-2xl p-6 border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/60 transition shadow-sm hover:shadow-md"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                {rec.title}
              </span>
              <div className="text-2xl font-black font-display text-amber-700 dark:text-csk-yellow mb-2">
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
