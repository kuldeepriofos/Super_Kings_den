'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  Award, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  Flame, 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  Target,
  Shield,
  Layers,
  Crown
} from 'lucide-react';

const CHAMPION_YEARS = new Set([2010, 2011, 2018, 2021, 2023]);
const RUNNER_UP_YEARS = new Set([2008, 2012, 2013, 2015, 2019]);

const OPPONENT_THEMES = {
  MI: { name: 'Mumbai Indians', color: '#004BA0', badge: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30' },
  RCB: { name: 'Royal Challengers Bengaluru', color: '#EC1C24', badge: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30' },
  KKR: { name: 'Kolkata Knight Riders', color: '#3A225D', badge: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30' },
  RR: { name: 'Rajasthan Royals', color: '#EA1A85', badge: 'bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-500/30' },
  DC: { name: 'Delhi Capitals / Chargers', color: '#004C97', badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30' },
  DD: { name: 'Delhi Daredevils', color: '#004C97', badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30' },
  SRH: { name: 'Sunrisers Hyderabad', color: '#F26522', badge: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30' },
  KXIP: { name: 'Kings XI Punjab', color: '#ED1B24', badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30' },
  PBKS: { name: 'Punjab Kings', color: '#ED1B24', badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30' },
  GT: { name: 'Gujarat Titans', color: '#1B2133', badge: 'bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30' },
  LSG: { name: 'Lucknow Super Giants', color: '#0057E7', badge: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30' },
  RPSG: { name: 'Rising Pune Supergiant', color: '#D11D50', badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30' },
  GL: { name: 'Gujarat Lions', color: '#E05822', badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' },
  PWI: { name: 'Pune Warriors India', color: '#00A4CC', badge: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30' },
  KTK: { name: 'Kochi Tuskers Kerala', color: '#FF7F00', badge: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30' },
};

export default function SingleSeasonView({ seasonData, allYears = [] }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'WON' | 'LOST' | 'PLAYOFF'
  const [searchQuery, setSearchQuery] = useState('');

  if (!seasonData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display mb-2">
          Season Not Found
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          The requested IPL season data is not currently available.
        </p>
        <Link
          href="/seasons"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Seasons
        </Link>
      </div>
    );
  }

  const {
    year,
    title,
    isChampion,
    isRunnerUp,
    isSuspended,
    cskPosition,
    champion,
    runnerUp,
    captain,
    summary,
    matchesPlayed = 0,
    wins = 0,
    losses = 0,
    winRate = '0%',
    homeWins = 0,
    awayWins = 0,
    topScorer,
    topWicketTaker,
    orangeCap,
    purpleCap,
    matches = []
  } = seasonData;

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (filter === 'WON' && m.result !== 'won') return false;
      if (filter === 'LOST' && m.result !== 'lost') return false;
      if (filter === 'PLAYOFF' && m.stage === 'League') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOpponent = (m.opponent || '').toLowerCase();
        const matchVenue = (m.venue || '').toLowerCase();
        const matchStage = (m.stage || '').toLowerCase();
        const matchPotm = (m.playerOfMatch || '').toLowerCase();
        return matchOpponent.includes(q) || matchVenue.includes(q) || matchStage.includes(q) || matchPotm.includes(q);
      }

      return true;
    });
  }, [matches, filter, searchQuery]);

  // Opponent head-to-head records in this season
  const opponentRecords = useMemo(() => {
    const map = {};
    matches.forEach(m => {
      const opp = m.opponent || 'Opponent';
      const abbr = m.opponentAbbr || opp.slice(0, 3).toUpperCase();
      if (!map[abbr]) {
        map[abbr] = {
          name: opp,
          abbr,
          played: 0,
          won: 0,
          lost: 0
        };
      }
      map[abbr].played += 1;
      if (m.result === 'won') map[abbr].won += 1;
      else if (m.result === 'lost') map[abbr].lost += 1;
    });
    return Object.values(map).sort((a, b) => b.won - a.won || b.played - a.played);
  }, [matches]);

  const playoffMatchesCount = matches.filter(m => m.stage !== 'League').length;

  // Next / Prev Year Links
  const currentIdx = allYears.indexOf(Number(year));
  const prevYear = currentIdx < allYears.length - 1 ? allYears[currentIdx + 1] : null;
  const nextYear = currentIdx > 0 ? allYears[currentIdx - 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* 1. Quick Season Carousel & Navigation Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">Home</Link>
            <span>/</span>
            <Link href="/seasons" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">Seasons Archive</Link>
            <span>/</span>
            <span className="font-extrabold text-slate-900 dark:text-white">IPL {year}</span>
          </nav>

          <div className="flex items-center space-x-2">
            {prevYear && (
              <Link
                href={`/seasons/${prevYear}`}
                className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-csk-yellow text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5 text-amber-600 dark:text-csk-yellow" />
                <span>{prevYear}</span>
              </Link>
            )}
            {nextYear && (
              <Link
                href={`/seasons/${nextYear}`}
                className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-csk-yellow text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs"
              >
                <span>{nextYear}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-amber-600 dark:text-csk-yellow" />
              </Link>
            )}
          </div>
        </div>

        {/* Horizontal Year Quick-Switch Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-white/10">
          {allYears.map((yr) => {
            const isCurrent = Number(year) === yr;
            const isChamp = CHAMPION_YEARS.has(yr);
            const isRunner = RUNNER_UP_YEARS.has(yr);

            return (
              <Link
                key={yr}
                href={`/seasons/${yr}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 border ${
                  isCurrent
                    ? 'bg-csk-yellow text-csk-darkNavy font-black border-csk-yellow shadow-md'
                    : isChamp
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-csk-yellow border-amber-300 dark:border-amber-500/30 hover:border-csk-yellow'
                    : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-csk-yellow'
                }`}
              >
                {isChamp && <Trophy className={`w-3 h-3 ${isCurrent ? 'text-csk-darkNavy' : 'text-amber-600 dark:text-csk-yellow'}`} />}
                <span>{yr}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Redesigned Season Grand Hero Command Center (Consistent Light Yellow across ALL seasons) */}
      <div 
        className="relative rounded-3xl p-6 sm:p-10 border-2 border-amber-400/80 overflow-hidden shadow-xl transition-all bg-gradient-to-br from-amber-100/95 via-amber-50/90 to-yellow-50/80 dark:from-[#0B1E48] dark:via-[#081534] dark:to-[#040C20] text-slate-900 dark:text-white ring-2 ring-amber-400/30"
      >
        {/* Background Watermark */}
        {isChampion ? (
          <Trophy className="absolute -bottom-10 -right-10 w-64 h-64 text-amber-500/10 dark:text-csk-yellow/10 pointer-events-none" />
        ) : isRunnerUp ? (
          <Award className="absolute -bottom-10 -right-10 w-64 h-64 text-amber-500/10 dark:text-csk-yellow/10 pointer-events-none" />
        ) : (
          <Shield className="absolute -bottom-10 -right-10 w-64 h-64 text-amber-500/10 dark:text-csk-yellow/10 pointer-events-none" />
        )}

        <div className="relative z-10">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight tabular-nums text-amber-950 dark:text-csk-yellow">
              {year}
            </span>

            {isChampion && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-csk-yellow text-csk-darkNavy text-xs font-bold uppercase tracking-wide shadow-sm">
                <Crown className="w-4 h-4 fill-current" />
                <span>IPL Champions</span>
              </span>
            )}

            {isRunnerUp && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-200/80 dark:bg-slate-800 text-amber-950 dark:text-slate-100 border border-amber-300 dark:border-white/10 text-xs font-bold uppercase tracking-wide shadow-xs">
                <Award className="w-4 h-4 text-amber-700 dark:text-csk-yellow" />
                <span>Runners-Up</span>
              </span>
            )}

            {!isChampion && !isRunnerUp && !isSuspended && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-200/80 dark:bg-slate-800 text-amber-950 dark:text-csk-yellow border border-amber-300 dark:border-white/10 text-xs font-bold uppercase tracking-wide shadow-xs">
                <Flame className="w-4 h-4 text-amber-600 dark:text-csk-yellow" />
                <span>{cskPosition}</span>
              </span>
            )}

            <span className="px-3 py-1.5 rounded-xl text-xs font-medium border shadow-xs bg-white/90 dark:bg-slate-900/80 border-amber-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
              CSK Finish: <strong className="font-bold text-amber-800 dark:text-csk-yellow">{cskPosition}</strong>
            </span>

            <span className="px-3 py-1.5 rounded-xl text-xs font-medium border shadow-xs bg-white/90 dark:bg-slate-900/80 border-amber-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
              Skipper: <strong className="font-bold text-amber-800 dark:text-csk-yellow">{captain}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase font-heading tracking-tight mb-3 text-slate-950 dark:text-white">
            Chennai Super Kings &bull; {title} Campaign
          </h1>

          <p className="text-xs sm:text-sm max-w-4xl leading-relaxed mb-6 font-medium text-slate-700 dark:text-slate-200">
            {summary}
          </p>

          {/* Quick Metrics KPI Cards (Consistent High-Contrast across ALL seasons) */}
          {!isSuspended && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-amber-300/80 dark:border-white/15">
              <div className="p-3.5 rounded-2xl border shadow-xs bg-white/95 dark:bg-slate-900/80 border-amber-200 dark:border-white/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Matches
                </span>
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  {matchesPlayed}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border shadow-xs bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                  Won
                </span>
                <span className="text-2xl font-bold font-display text-emerald-700 dark:text-emerald-400">
                  {wins}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border shadow-xs bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block mb-1">
                  Lost
                </span>
                <span className="text-2xl font-bold font-display text-rose-700 dark:text-rose-400">
                  {losses}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border shadow-xs bg-amber-100/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-csk-yellow block mb-1">
                  Win Rate
                </span>
                <span className="text-2xl font-bold font-display text-amber-800 dark:text-csk-yellow">
                  {winRate}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border shadow-xs bg-white/95 dark:bg-slate-900/80 border-amber-200 dark:border-white/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Home Wins
                </span>
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  {homeWins}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border shadow-xs bg-white/95 dark:bg-slate-900/80 border-amber-200 dark:border-white/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Away Wins
                </span>
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  {awayWins}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Season Honors & Caps Showcase */}
      {!isSuspended && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top CSK Run Scorer */}
          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47] shadow-sm hover:border-csk-yellow transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-csk-yellow">
                Top CSK Run Getter
              </span>
              <Award className="w-4 h-4 text-amber-600 dark:text-csk-yellow" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-display">
                {topScorer}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                Leading yellow jersey batter in {year}
              </p>
            </div>
          </div>

          {/* Top CSK Wicket Taker */}
          <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47] shadow-sm hover:border-csk-yellow transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-csk-yellow">
                Top CSK Wicket Taker
              </span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-display">
                {topWicketTaker}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                Primary bowling strike weapon in {year}
              </p>
            </div>
          </div>

          {/* Orange Cap Winner */}
          {orangeCap && (
            <div className="sports-card rounded-2xl p-5 border border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
                  IPL {year} Orange Cap
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                  Batting King
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {orangeCap.player} ({orangeCap.team})
                </div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">
                  {orangeCap.runs} runs in tournament
                </p>
              </div>
            </div>
          )}

          {/* Purple Cap Winner */}
          {purpleCap && (
            <div className="sports-card rounded-2xl p-5 border border-purple-300 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-950/20 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-400">
                  IPL {year} Purple Cap
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-600 text-white">
                  Golden Arm
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {purpleCap.player} ({purpleCap.team})
                </div>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mt-1">
                  {purpleCap.wickets} wickets in tournament
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Opponent Head-to-Head Breakdown in this Season */}
      {!isSuspended && opponentRecords.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0D1E47] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-6 bg-csk-yellow rounded-full flex-shrink-0"></div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold uppercase font-heading text-slate-900 dark:text-white tracking-tight flex items-center">
                  CSK Opponent Breakdown &bull; {year} Campaign
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Head-to-head records against every rival in {year}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {opponentRecords.length} Opponents Faced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {opponentRecords.map(item => {
              const theme = OPPONENT_THEMES[item.abbr] || { color: '#64748B', badge: 'bg-slate-100 text-slate-800' };
              const isDominant = item.won > item.lost;
              const isUndefeated = item.lost === 0 && item.won > 0;

              return (
                <div
                  key={item.abbr}
                  className={`p-3 rounded-xl border text-center transition ${
                    isUndefeated
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className="text-xs font-bold font-display mb-0.5 text-slate-900 dark:text-white">
                    vs {item.abbr}
                  </div>
                  <div className="text-xs font-bold text-amber-800 dark:text-csk-yellow tabular-nums">
                    {item.won}&ndash;{item.lost}
                  </div>
                  <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {item.played} {item.played === 1 ? 'match' : 'matches'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Suspended Notice for 2016 & 2017 */}
      {isSuspended && (
        <div className="rounded-3xl p-8 sm:p-10 border-2 border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 text-center max-w-3xl mx-auto shadow-lg">
          <ShieldCheck className="w-14 h-14 text-amber-600 dark:text-csk-yellow mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-3">
            Chennai Super Kings Hiatus ({year})
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-medium">
            Chennai Super Kings did not participate in IPL {year} due to a 2-year franchise suspension. During this time, MS Dhoni, Faf du Plessis, and Ravichandran Ashwin featured for Rising Pune Supergiant, while Suresh Raina, Ravindra Jadeja, and Dwayne Bravo represented Gujarat Lions.
          </p>
          <p className="text-sm font-bold text-amber-800 dark:text-csk-yellow mb-6">
            The franchise made a historic, fairytale comeback in 2018 to lift Title #3!
          </p>
          <div>
            <Link
              href="/seasons/2018"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-csk-yellow text-csk-darkNavy font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition"
            >
              Relive the 2018 Comeback Title <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* 6. Complete Season Matches List */}
      {!isSuspended && (
        <section className="space-y-6">
          {/* Controls Bar: Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0D1E47] border border-slate-200 dark:border-white/10 shadow-sm">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center shadow-xs ${
                  filter === 'ALL'
                    ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Matches ({matches.length})
              </button>

              <button
                onClick={() => setFilter('WON')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center shadow-xs ${
                  filter === 'WON'
                    ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 hover:bg-csk-yellow hover:text-csk-darkNavy'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-csk-darkNavy" /> Won ({wins})
              </button>

              <button
                onClick={() => setFilter('LOST')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center shadow-xs ${
                  filter === 'LOST'
                    ? 'bg-rose-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:text-rose-400'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Lost ({losses})
              </button>

              {playoffMatchesCount > 0 && (
                <button
                  onClick={() => setFilter('PLAYOFF')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center shadow-xs ${
                    filter === 'PLAYOFF'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:text-amber-400'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 mr-1" /> Playoffs &amp; Finals ({playoffMatchesCount})
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search opponent, venue, POTM..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-csk-yellow text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
                  Match Schedule &amp; Scorecards
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official ball-by-ball tournament records &bull; {filteredMatches.length} Matches
                </p>
              </div>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((m, idx) => {
                const isWin = m.result === 'won';
                const isFinal = (m.stage || '').toLowerCase() === 'final';
                const isPlayoff = (m.stage || '').toLowerCase().includes('qualifier') || (m.stage || '').toLowerCase().includes('eliminator') || isFinal || (m.stage || '').toLowerCase().includes('semi');
                const oppTheme = OPPONENT_THEMES[m.opponentAbbr] || { color: '#64748B', badge: 'bg-slate-100 text-slate-800' };

                return (
                  <div
                    key={m.matchId || idx}
                    className={`sports-card group relative rounded-2xl p-5 border transition-all ${
                      isFinal
                        ? 'border-amber-400 bg-gradient-to-r from-amber-100/90 via-amber-50/80 to-yellow-50/70 dark:from-amber-950/40 dark:to-slate-900/80 shadow-md ring-2 ring-amber-400/40'
                        : isWin
                        ? 'bg-amber-50/85 dark:bg-amber-950/25 border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-csk-yellow shadow-xs hover:shadow-md'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-slate-300 shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {/* Top Row: Stage Badge, Date & Venue */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-xs ${
                          isFinal
                            ? 'bg-csk-yellow text-csk-darkNavy font-bold'
                            : isPlayoff
                            ? 'bg-amber-500/20 text-amber-800 dark:text-csk-yellow border border-amber-500/30'
                            : isWin
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-csk-yellow border border-amber-300 dark:border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        }`}>
                          {m.stage}
                        </span>

                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {m.date}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center truncate max-w-[280px]">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-csk-yellow shrink-0" />
                        <span className="truncate">{m.venue}</span>
                      </div>
                    </div>

                    {/* Middle Section: 3-column Scorecard & Outcome */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* CSK Side */}
                      <div className="sm:col-span-4 flex items-center justify-between sm:justify-start sm:space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-[#FFCB05] ring-2 ring-amber-400/40 shadow-xs" />
                            <span className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white">
                              Chennai Super Kings
                            </span>
                          </div>
                          {m.cskTopScorer && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              Bat: <span className="font-semibold text-slate-900 dark:text-slate-200">{m.cskTopScorer}</span>
                            </p>
                          )}
                          {m.cskTopBowler && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Bowl: <span className="font-semibold text-slate-900 dark:text-slate-200">{m.cskTopBowler}</span>
                            </p>
                          )}
                        </div>

                        <div className="text-right sm:text-left">
                          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
                            {m.cskScore}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                            {m.cskOvers}
                          </span>
                        </div>
                      </div>

                      {/* Center Outcome / Margin */}
                      <div className="sm:col-span-4 text-center py-2 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-200 dark:border-white/10">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-xs ${
                          isWin
                            ? 'bg-csk-yellow text-csk-darkNavy font-bold border border-amber-400/60 shadow-xs'
                            : 'bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                        }`}>
                          {isWin ? <CheckCircle2 className="w-4 h-4 mr-1 text-csk-darkNavy" /> : <XCircle className="w-4 h-4 mr-1 text-rose-600 dark:text-rose-400" />}
                          {m.margin}
                        </span>

                        {m.playerOfMatch && m.playerOfMatch !== 'N/A' && (
                          <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center">
                            <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-current" />
                            <span>POTM: <strong className="font-bold text-slate-900 dark:text-white">{m.playerOfMatch}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Opponent Side */}
                      <div className="sm:col-span-4 flex items-center justify-between sm:justify-end sm:space-x-4">
                        <div className="sm:text-right order-2 sm:order-1">
                          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
                            {m.opponentScore}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                            {m.opponentOvers}
                          </span>
                        </div>

                        <div className="order-1 sm:order-2 sm:text-right">
                          <div className="flex items-center space-x-2 sm:justify-end">
                            <span className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white">
                              {m.opponent}
                            </span>
                            <span 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: oppTheme.color }}
                            />
                          </div>
                          {m.opponentTopScorer && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              Bat: <span className="font-semibold text-slate-900 dark:text-slate-200">{m.opponentTopScorer}</span>
                            </p>
                          )}
                          {m.opponentTopBowler && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Bowl: <span className="font-semibold text-slate-900 dark:text-slate-200">{m.opponentTopBowler}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  No matches found matching your selected filter.
                </p>
                <button
                  onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
                  className="mt-3 px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-bold text-xs uppercase tracking-wide"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. Bottom Navigation Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-100/95 via-amber-50/90 to-yellow-50/80 dark:from-[#001B44] dark:via-[#00275B] dark:to-[#081432] border-2 border-amber-400/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-900 dark:text-white shadow-lg ring-1 ring-amber-400/30">
        <div>
          <h4 className="text-base sm:text-lg font-bold font-display uppercase tracking-wide text-slate-950 dark:text-white">
            Explore More Super Kings Campaigns
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Journey through all 19 seasons of CSK excellence from 2008 to 2026.
          </p>
        </div>

        <Link
          href="/seasons"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-csk-yellow text-csk-darkNavy font-bold text-xs uppercase tracking-wide shadow-md hover:bg-amber-400 transition"
        >
          View All Seasons Archive <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

