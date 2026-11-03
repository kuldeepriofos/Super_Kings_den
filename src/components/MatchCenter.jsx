'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Trophy, ShieldAlert, Timer, ChevronRight, Zap, 
  CheckCircle2, Award, Flame, ArrowRight, RotateCcw
} from 'lucide-react';
import { FIXTURES } from '../data/mockData';
import { FRANCHISE_FIXTURES_DATA } from '../data/franchiseFixturesData';
import { getTeamLogo } from '../lib/teamLogos';

export default function MatchCenter({ selectedFranchise = 'ALL', className = "mb-8 sm:mb-10", initialFixtures }) {
  const [fixturesList, setFixturesList] = useState(initialFixtures || []);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // When selectedFranchise is 'ALL', default franchise focus is 'CSK'
  const targetFranchise = (!selectedFranchise || selectedFranchise === 'ALL') ? 'CSK' : selectedFranchise;

  // Load live matches from MongoDB for the target franchise
  useEffect(() => {
    let isMounted = true;
    async function loadLiveMatches() {
      try {
        const res = await fetch(`/api/matches/?franchise=${targetFranchise}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.fixtures) {
            setFixturesList(data.fixtures);
          }
        }
      } catch (err) {
        // use fallback fixtures
      }
    }
    loadLiveMatches();
    return () => {
      isMounted = false;
    };
  }, [targetFranchise]);

  // Filter fixtures specifically for the active target franchise
  const displayList = useMemo(() => {
    if (!fixturesList || fixturesList.length === 0) {
      return [];
    }
    return fixturesList.filter(f => f.franchise === targetFranchise);
  }, [fixturesList, targetFranchise]);

  // Resolve static completed match fallback for CSK/JSK/TSK if MongoDB has no completed score yet
  const fallbackResult = useMemo(() => {
    const staticData = FRANCHISE_FIXTURES_DATA[targetFranchise] || FRANCHISE_FIXTURES_DATA.CSK;
    const res = staticData.results?.[0];
    if (!res) return null;
    return {
      tournament: staticData.league,
      matchdayTag: res.matchNumber,
      date: res.date,
      venue: res.venue,
      homeTeam: res.team1,
      homeShort: res.team1Short,
      homeScore: res.score1,
      homeOvers: res.overs1,
      awayTeam: res.team2,
      awayShort: res.team2Short,
      awayScore: res.score2,
      awayOvers: res.overs2,
      resultText: res.result,
      winner: res.winner,
      potm: res.potm,
      potmRole: res.potmRole,
      note: res.note,
    };
  }, [targetFranchise]);

  // Determine latest completed match data (from DB or fallback)
  const completedMatchData = useMemo(() => {
    const dbCompleted = displayList.find(f => f.status === 'Completed' && (f.homeScore || f.resultText));
    if (dbCompleted) return dbCompleted;
    return fallbackResult;
  }, [displayList, fallbackResult]);

  // Determine winning team for visual highlight
  const isHomeWinner = useMemo(() => {
    if (!completedMatchData) return false;
    const winner = (completedMatchData.winner || '').toLowerCase().trim();
    const result = (completedMatchData.resultText || '').toLowerCase().trim();
    const homeShort = (completedMatchData.homeShort || '').toLowerCase().trim();
    const homeTeam = (completedMatchData.homeTeam || '').toLowerCase().trim();

    if (winner) {
      if (winner === homeShort || winner === homeTeam) return true;
      if (homeShort && (winner.includes(homeShort) || homeShort.includes(winner))) return true;
      if (homeTeam && (winner.includes(homeTeam) || homeTeam.includes(winner))) return true;
    }
    if (result.includes('won')) {
      if (homeShort && result.includes(homeShort)) return true;
      if (homeTeam && result.includes(homeTeam)) return true;
    }
    return false;
  }, [completedMatchData]);

  const isAwayWinner = useMemo(() => {
    if (!completedMatchData) return false;
    const winner = (completedMatchData.winner || '').toLowerCase().trim();
    const result = (completedMatchData.resultText || '').toLowerCase().trim();
    const awayShort = (completedMatchData.awayShort || '').toLowerCase().trim();
    const awayTeam = (completedMatchData.awayTeam || '').toLowerCase().trim();

    if (winner) {
      if (winner === awayShort || winner === awayTeam) return true;
      if (awayShort && (winner.includes(awayShort) || awayShort.includes(winner))) return true;
      if (awayTeam && (winner.includes(awayTeam) || awayTeam.includes(winner))) return true;
    }
    if (result.includes('won')) {
      if (awayShort && result.includes(awayShort)) return true;
      if (awayTeam && result.includes(awayTeam)) return true;
    }
    return false;
  }, [completedMatchData]);

  // Determine upcoming match with active countdown:
  // Must be strictly an upcoming fixture with valid future countdown target in backend
  const upcomingMatchData = useMemo(() => {
    const dbUpcoming = displayList.find(f => {
      if (f.status !== 'Upcoming' && f.displayMode !== 'countdown') return false;
      if (f.isActive === false || f.isDeleted) return false;
      if (!f.countdownTarget) return false;
      const target = new Date(f.countdownTarget).getTime();
      return !isNaN(target) && target > Date.now();
    });
    return dbUpcoming || null;
  }, [displayList]);

  // Check if upcoming match has an active countdown in the future
  const hasActiveUpcomingCountdown = Boolean(upcomingMatchData);

  // Dynamic countdown timer based on upcomingMatchData.countdownTarget
  useEffect(() => {
    if (!upcomingMatchData?.countdownTarget) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    function calculateTimeLeft() {
      const target = new Date(upcomingMatchData.countdownTarget).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [upcomingMatchData?.countdownTarget]);

  // STRICTLY MUTUALLY EXCLUSIVE DISPLAY:
  // 1. Jab tak countdown hai backend se: ONLY countdown dikhega. Past score nahi dikhega.
  // 2. Agar countdown remove karenge backend se: ONLY last added score dikhega.
  // Dono ek saath kabhi nahi dikhenge (no dual toggle buttons, no teaser pill).
  const activeViewMode = hasActiveUpcomingCountdown ? 'countdown' : 'result';

  // Franchise styling & metadata
  const headerInfo = useMemo(() => {
    if (selectedFranchise === 'JSK') {
      return {
        title: 'JSK Match Center',
        subtitle: hasActiveUpcomingCountdown
          ? 'Next marquee SA20 fixture live countdown timer & Wanderers pitch preview'
          : 'Recent SA20 match scorecard, victory margin & player of the match honors',
        barColor: 'bg-csk-yellow',
      };
    }
    if (selectedFranchise === 'TSK') {
      return {
        title: 'TSK Match Center',
        subtitle: hasActiveUpcomingCountdown
          ? 'Next marquee MLC fixture live countdown timer & Grand Prairie pitch preview'
          : 'Recent MLC match scorecard, victory margin & player of the match honors',
        barColor: 'bg-csk-yellow',
      };
    }
    return {
      title: 'CSK Match Center',
      subtitle: hasActiveUpcomingCountdown
        ? 'Next marquee fixture live countdown timer & franchise match schedules'
        : 'Recent fixture scorecard, victory margin & player of the match honors',
      barColor: 'bg-csk-yellow',
    };
  }, [selectedFranchise, hasActiveUpcomingCountdown]);

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
              {headerInfo.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {headerInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Match Center Card */}
      <div className="rounded-3xl sports-card border border-slate-200 dark:border-csk-borderNavy p-6 sm:p-8 relative overflow-hidden shadow-xl bg-white dark:bg-csk-darkNavy">
        {/* Glowing background gradient elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-csk-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: LATEST MATCH RESULT & SCORECARD                              */}
        {/* ========================================================================= */}
        {activeViewMode === 'result' && completedMatchData && (
          <div className="space-y-6 relative z-10">
            {/* Top Matchday Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Match Result</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
                  {completedMatchData.tournament} &bull; {completedMatchData.matchdayTag || 'RECENT FIXTURE'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-csk-yellow" />
                <span>{completedMatchData.date} &bull; {completedMatchData.venue}</span>
              </div>
            </div>

            {/* Scorecard Clashing Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4 sm:py-6 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-white/5 px-4 sm:px-6">
              
              {/* Home Team Score (4 cols) */}
              <div className={`md:col-span-4 flex items-center gap-4 p-3 rounded-2xl transition-all ${
                isHomeWinner
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : isAwayWinner
                  ? 'opacity-65'
                  : ''
              }`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2 shrink-0 transition-all ${
                  isHomeWinner
                    ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/25 shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 shadow-sm'
                }`}>
                  {getTeamLogo(completedMatchData.homeTeam || completedMatchData.homeShort) ? (
                    <img 
                      src={getTeamLogo(completedMatchData.homeTeam || completedMatchData.homeShort)} 
                      alt={completedMatchData.homeTeam} 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span className="font-black text-2xl text-amber-600 dark:text-csk-yellow font-display">
                      {completedMatchData.homeShort}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {completedMatchData.homeRole || 'HOSTS'}
                    </span>
                    {isHomeWinner && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Trophy className="w-2.5 h-2.5" /> WINNER
                      </span>
                    )}
                  </div>
                  <h3 className={`text-base sm:text-lg font-black leading-tight truncate ${
                    isHomeWinner
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {completedMatchData.homeTeam}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                      isHomeWinner
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {completedMatchData.homeScore || '176/6'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      ({completedMatchData.homeOvers || '20.0 ov'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Match Outcome Banner & POTM (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-200 dark:border-white/10 px-4">
                <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-csk-yellow/50 shadow-sm text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-csk-yellow block">
                    MATCH OUTCOME
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block mt-0.5">
                    🏆 {completedMatchData.resultText || `${completedMatchData.winner || completedMatchData.homeShort} Won`}
                  </span>
                </div>

                {completedMatchData.potm && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-csk-yellow shrink-0" />
                    <span>POTM: <strong className="text-slate-900 dark:text-white">{completedMatchData.potm}</strong></span>
                  </div>
                )}
                {completedMatchData.note && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                    &ldquo;{completedMatchData.note}&rdquo;
                  </p>
                )}
              </div>

              {/* Away Team Score (4 cols) */}
              <div className={`md:col-span-4 flex items-center justify-end gap-4 text-right p-3 rounded-2xl transition-all ${
                isAwayWinner
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : isHomeWinner
                  ? 'opacity-65'
                  : ''
              }`}>
                <div className="min-w-0">
                  <div className="flex items-center justify-end gap-2 mb-0.5">
                    {isAwayWinner && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Trophy className="w-2.5 h-2.5" /> WINNER
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {completedMatchData.awayRole || 'CHALLENGERS'}
                    </span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-black leading-tight truncate ${
                    isAwayWinner
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {completedMatchData.awayTeam}
                  </h3>
                  <div className="flex items-baseline justify-end gap-1.5 mt-1">
                    <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                      isAwayWinner
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {completedMatchData.awayScore || '161/7'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      ({completedMatchData.awayOvers || '20.0 ov'})
                    </span>
                  </div>
                </div>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2 shrink-0 transition-all ${
                  isAwayWinner
                    ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/25 shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 shadow-sm'
                }`}>
                  {getTeamLogo(completedMatchData.awayTeam || completedMatchData.awayShort) ? (
                    <img 
                      src={getTeamLogo(completedMatchData.awayTeam || completedMatchData.awayShort)} 
                      alt={completedMatchData.awayTeam} 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span className="font-black text-2xl text-blue-600 dark:text-blue-400 font-display">
                      {completedMatchData.awayShort}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: UPCOMING MATCH COUNTDOWN & PREVIEW                           */}
        {/* ========================================================================= */}
        {activeViewMode === 'countdown' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Teams Faceoff & Countdown (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-csk-yellow border border-amber-500/30 flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1" /> {upcomingMatchData.tournament} &bull; {upcomingMatchData.matchdayTag || 'Matchday'}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-csk-yellow" /> {upcomingMatchData.date} &bull; {upcomingMatchData.time}
                </span>
              </div>

              {/* Teams Clashing Row */}
              <div className="flex items-center justify-around py-4 sm:py-6 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/5 px-4">
                {/* Home Team */}
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-csk-yellow to-amber-600 p-1 flex items-center justify-center shadow-csk-glow">
                    <div className="w-full h-full bg-white dark:bg-csk-darkNavy rounded-[12px] flex items-center justify-center shadow-inner overflow-hidden p-1">
                      {upcomingMatchData.homeLogo || getTeamLogo(upcomingMatchData.homeTeam || upcomingMatchData.homeShort) ? (
                        <img 
                          src={upcomingMatchData.homeLogo || getTeamLogo(upcomingMatchData.homeTeam || upcomingMatchData.homeShort)} 
                          alt={upcomingMatchData.homeTeam} 
                          className="w-full h-full object-contain p-1" 
                        />
                      ) : (
                        <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-csk-yellow font-display">
                          {upcomingMatchData.homeShort}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">{upcomingMatchData.homeTeam}</h3>
                  <span className="text-xs text-amber-700 dark:text-csk-yellow font-bold uppercase">{upcomingMatchData.homeRole || 'Hosts'}</span>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-csk-yellow/50 flex items-center justify-center shadow-md">
                    <span className="text-xs font-black text-amber-700 dark:text-csk-yellow italic">VS</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">{upcomingMatchData.vsLabel || 'Match Arena'}</span>
                </div>

                {/* Away Team */}
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 p-1 flex items-center justify-center shadow-blue-glow">
                    <div className="w-full h-full bg-white dark:bg-csk-darkNavy rounded-[12px] flex items-center justify-center shadow-inner overflow-hidden p-1">
                      {upcomingMatchData.awayLogo || getTeamLogo(upcomingMatchData.awayTeam || upcomingMatchData.awayShort) ? (
                        <img 
                          src={upcomingMatchData.awayLogo || getTeamLogo(upcomingMatchData.awayTeam || upcomingMatchData.awayShort)} 
                          alt={upcomingMatchData.awayTeam} 
                          className="w-full h-full object-contain p-1" 
                        />
                      ) : (
                        <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
                          {upcomingMatchData.awayShort}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">{upcomingMatchData.awayTeam}</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">{upcomingMatchData.awayRole || 'Challengers'}</span>
                </div>
              </div>

              {/* Countdown Grid */}
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold text-center mb-3">
                  Countdown to Toss &amp; First Ball
                </p>
                <div className="grid grid-cols-4 gap-3 text-center max-w-md mx-auto">
                  <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block tabular-nums">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Days</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue & H2H Stats (4 cols) */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-700 dark:text-csk-yellow flex items-center">
                <MapPin className="w-4 h-4 mr-1.5" /> Venue &amp; Pitch Preview
              </h4>

              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">{upcomingMatchData.venue}</p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">
                    {upcomingMatchData.pitchTitle || 'Venue Pitch Insight:'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed block mt-0.5">
                    {upcomingMatchData.pitchInsight || 'Dry surface offering assistance to spinners in the middle overs. Average 1st innings score is 172.'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                  Head-To-Head Record
                </span>
                <p className="text-xs font-bold text-amber-700 dark:text-csk-yellow">
                  {upcomingMatchData.h2h}
                </p>
              </div>

              <Link
                href={upcomingMatchData.previewLink || '/csk-news'}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-csk-yellow to-amber-500 text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-csk-glow flex items-center justify-center"
              >
                <span>{upcomingMatchData.previewText || 'View Match Preview & Playing 11'}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
