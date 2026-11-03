'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Trophy, ShieldAlert, Timer, ChevronRight, Zap, 
  Award, Clock, CheckCircle2, TrendingUp, Flame, Star, ArrowUpRight
} from 'lucide-react';
import { getFranchiseFixtures } from '../data/franchiseFixturesData';
import { getFranchiseStats } from '../data/statsData';
import { getTeamLogo } from '../lib/teamLogos';
import { getFranchiseStandings } from '../data/franchiseStandingsData';

export default function FranchiseFixturesView({ franchise = 'CSK' }) {
  const data = useMemo(() => getFranchiseFixtures(franchise), [franchise]);
  const stats = useMemo(() => getFranchiseStats(franchise), [franchise]);

  // Points Table / Standings State
  const [standingsList, setStandingsList] = useState(() => getFranchiseStandings(franchise));

  // Dynamic Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [liveUpcoming, setLiveUpcoming] = useState(data.upcoming);
  const [liveCompleted, setLiveCompleted] = useState(data.results?.[0] || null);
  const [filterPast, setFilterPast] = useState('ALL'); // 'ALL' | 'WINS'
  const [centerMode, setCenterMode] = useState('auto'); // 'auto' | 'result' | 'countdown'

  // Live franchise stats (batting & bowling) from MongoDB / fallback
  const [liveStats, setLiveStats] = useState(() => getFranchiseStats(franchise));

  // Sync live standings from MongoDB API strictly for this franchise
  useEffect(() => {
    let isMounted = true;
    async function loadLiveStandings() {
      try {
        const res = await fetch(`/api/standings?franchise=${franchise}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.standings && Array.isArray(json.standings) && json.standings.length > 0) {
            // Validate that returned data actually belongs to this franchise's tournament
            const isMatch = franchise === 'CSK'
              ? json.standings.some(s => s.team?.toLowerCase().includes('chennai') || s.shortName === 'CSK')
              : franchise === 'JSK'
              ? json.standings.some(s => s.team?.toLowerCase().includes('joburg') || s.shortName === 'JSK')
              : json.standings.some(s => s.team?.toLowerCase().includes('texas') || s.shortName === 'TSK');

            if (isMatch) {
              setStandingsList(json.standings);
              return;
            }
          }
        }
      } catch (e) {}
      if (isMounted) {
        setStandingsList(getFranchiseStandings(franchise));
      }
    }
    loadLiveStandings();
    return () => { isMounted = false; };
  }, [franchise]);

  // Sync live stats (batting & bowling leaderboard) from MongoDB API
  useEffect(() => {
    let isMounted = true;
    async function loadLiveStats() {
      try {
        const res = await fetch(`/api/franchise-stats?franchise=${franchise}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setLiveStats(json.data);
            return;
          }
        }
      } catch (e) {}
    }
    loadLiveStats();
    return () => { isMounted = false; };
  }, [franchise]);

  // Latest completed match for this franchise (score, overs, winner, POTM)
  const latestCompleted = useMemo(() => {
    if (liveCompleted && (liveCompleted.homeScore || liveCompleted.resultText)) {
      return {
        matchNumber: liveCompleted.matchdayTag || 'Matchday',
        date: liveCompleted.date,
        venue: liveCompleted.venue,
        team1: liveCompleted.homeTeam,
        team1Short: liveCompleted.homeShort,
        score1: liveCompleted.homeScore || '206/4',
        overs1: liveCompleted.homeOvers || '20.0 ov',
        team2: liveCompleted.awayTeam,
        team2Short: liveCompleted.awayShort,
        score2: liveCompleted.awayScore || '186/6',
        overs2: liveCompleted.awayOvers || '20.0 ov',
        result: liveCompleted.resultText || `${liveCompleted.winner || liveCompleted.homeShort} Won`,
        winner: liveCompleted.winner,
        potm: liveCompleted.potm,
        potmRole: liveCompleted.potmRole,
        note: liveCompleted.matchNote || liveCompleted.note,
      };
    }
    return data.results?.[0] || null;
  }, [liveCompleted, data.results]);

  // Determine winning team for hero match center highlight
  const isHeroHomeWinner = useMemo(() => {
    if (!latestCompleted) return false;
    const winner = (latestCompleted.winner || '').toLowerCase().trim();
    const result = (latestCompleted.result || '').toLowerCase().trim();
    const t1Short = (latestCompleted.team1Short || '').toLowerCase().trim();
    const t1 = (latestCompleted.team1 || '').toLowerCase().trim();

    if (winner) {
      if (winner === t1Short || winner === t1) return true;
      if (t1Short && (winner.includes(t1Short) || t1Short.includes(winner))) return true;
      if (t1 && (winner.includes(t1) || t1.includes(winner))) return true;
    }
    if (result.includes('won')) {
      if (t1Short && result.includes(t1Short)) return true;
      if (t1 && result.includes(t1)) return true;
    }
    return false;
  }, [latestCompleted]);

  const isHeroAwayWinner = useMemo(() => {
    if (!latestCompleted) return false;
    const winner = (latestCompleted.winner || '').toLowerCase().trim();
    const result = (latestCompleted.result || '').toLowerCase().trim();
    const t2Short = (latestCompleted.team2Short || '').toLowerCase().trim();
    const t2 = (latestCompleted.team2 || '').toLowerCase().trim();

    if (winner) {
      if (winner === t2Short || winner === t2) return true;
      if (t2Short && (winner.includes(t2Short) || t2Short.includes(winner))) return true;
      if (t2 && (winner.includes(t2) || t2.includes(winner))) return true;
    }
    if (result.includes('won')) {
      if (t2Short && result.includes(t2Short)) return true;
      if (t2 && result.includes(t2)) return true;
    }
    return false;
  }, [latestCompleted]);

  const isTimerZero = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const hasActiveUpcomingCountdown = useMemo(() => {
    if (!liveUpcoming?.countdownTarget) return false;
    const target = new Date(liveUpcoming.countdownTarget).getTime();
    return !isNaN(target) && target > Date.now();
  }, [liveUpcoming?.countdownTarget]);

  // Auto-resolve: if countdown is active in future, show countdown; otherwise default to last match result
  const activeCenterMode = useMemo(() => {
    if (centerMode === 'result') return 'result';
    if (centerMode === 'countdown' && hasActiveUpcomingCountdown) return 'countdown';

    if (liveUpcoming?.displayMode === 'countdown' && hasActiveUpcomingCountdown) {
      return 'countdown';
    }

    return 'result';
  }, [centerMode, liveUpcoming?.displayMode, hasActiveUpcomingCountdown]);

  // Live completed matches from MongoDB (reflects admin Match Center updates)
  const [livePastMatches, setLivePastMatches] = useState([]);

  // Load updated completed match and upcoming fixture from MongoDB /api/matches
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveMatch() {
      try {
        const res = await fetch(`/api/matches?franchise=${franchise}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.fixtures && json.fixtures.length > 0) {
            const completedMatches = json.fixtures.filter(
              (f) => f.franchise === franchise && (f.homeScore || f.resultText || f.status === 'Completed')
            );
            const upcomingMatch = json.fixtures.find(
              (f) => f.franchise === franchise && f.status === 'Upcoming'
            );

            if (completedMatches.length > 0) {
              const featured = completedMatches.find((f) => f.isFeatured) || completedMatches[0];
              setLiveCompleted(featured);

              // Map all completed matches from Match Center to Past Matches card format
              const mapped = completedMatches.map((f, idx) => {
                const isWin = Boolean(
                  (f.winner &&
                    (f.winner.toLowerCase().includes(data.shortName.toLowerCase()) ||
                     f.winner.toLowerCase().includes(data.teamName.toLowerCase()))) ||
                  (f.resultText &&
                    f.resultText.toLowerCase().includes(data.shortName.toLowerCase()) &&
                    f.resultText.toLowerCase().includes('won'))
                );

                const team1ScoreFormatted = f.homeScore
                  ? `${f.homeScore}${f.homeOvers ? ` (${f.homeOvers})` : ''}`
                  : '-';
                const team2ScoreFormatted = f.awayScore
                  ? `${f.awayScore}${f.awayOvers ? ` (${f.awayOvers})` : ''}`
                  : '-';

                const rawTag = f.matchdayTag || 'Match Result';
                const cleanTag = rawTag.replace(new RegExp(`^${(f.tournament || data.league).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*•?\\s*`, 'i'), '');
                const matchSubline = `${f.tournament || data.league} • ${cleanTag || 'Match Result'} • ${f.venue || data.homeVenue}`;

                return {
                  id: f._id || f.id || `live-past-${idx}`,
                  dateHeader: (f.date || 'RECENT MATCH').toUpperCase(),
                  matchSubline,
                  team1: f.homeTeam || data.teamName,
                  team1Short: f.homeShort || data.shortName,
                  team1Score: team1ScoreFormatted,
                  team2: f.awayTeam || 'Opponent',
                  team2Short: f.awayShort || 'OPP',
                  team2Score: team2ScoreFormatted,
                  resultText: f.resultText || `${f.winner || f.homeShort} Won`,
                  winner: f.winner || f.homeTeam,
                  isWin,
                  hero: f.potm ? `POTM: ${f.potm}` : (f.matchNote || null),
                };
              });

              setLivePastMatches(mapped);
            }

            if (upcomingMatch) {
              setLiveUpcoming(upcomingMatch);
            }
          }
        }
      } catch (err) {
        // Fallback to static
      }
    }
    fetchLiveMatch();
    return () => { isMounted = false; };
  }, [franchise, data.league, data.homeVenue, data.teamName, data.shortName]);

  useEffect(() => {
    function calculateTime() {
      if (!liveUpcoming?.countdownTarget) {
        setTimeLeft({ days: 18, hours: 9, minutes: 24, seconds: 9 });
        return;
      }
      const target = new Date(liveUpcoming.countdownTarget).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [liveUpcoming?.countdownTarget]);

  // Live Match Center completed matches from MongoDB (reflects all admin edits and historical archive)
  const allPastMatches = useMemo(() => {
    if (livePastMatches && livePastMatches.length > 0) {
      return livePastMatches;
    }
    return data.pastMatches || [];
  }, [livePastMatches, data.pastMatches]);

  // Filtered past matches (ALL vs WINS)
  const filteredPastMatches = useMemo(() => {
    if (filterPast === 'WINS') {
      return allPastMatches.filter((m) => m.isWin);
    }
    return allPastMatches;
  }, [allPastMatches, filterPast]);

  // Batting and Bowling leaderboard from live franchise stats (reflects admin dashboard updates)
  const battingLeaderboard = useMemo(() => {
    const list = liveStats?.batting || stats?.batting;
    if (list && list.length > 0) {
      return list.map(b => ({
        playerName: b.player || b.playerName,
        matches: b.matches,
        runs: b.runs,
        highScore: b.high || b.highScore || '-'
      }));
    }
    return data.mostRuns;
  }, [liveStats?.batting, stats?.batting, data.mostRuns]);

  const bowlingLeaderboard = useMemo(() => {
    const list = liveStats?.bowling || stats?.bowling;
    if (list && list.length > 0) {
      return list.map(b => ({
        playerName: b.player || b.playerName,
        matches: b.matches,
        wickets: b.wickets,
        bestFigures: b.best || b.bestFigures || '-'
      }));
    }
    return data.mostWickets;
  }, [liveStats?.bowling, stats?.bowling, data.mostWickets]);

  const franchiseTheme = useMemo(() => {
    if (franchise === 'JSK') {
      return {
        badgeBg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
        activePill: 'bg-emerald-600 text-white',
        borderAccent: 'border-emerald-500/30',
        ringColor: 'ring-emerald-500',
        heroTag: 'Joburg Super Kings • SA20 League',
        trophyText: '3x SA20 Semi-Finalists'
      };
    }
    if (franchise === 'TSK') {
      return {
        badgeBg: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
        activePill: 'bg-red-600 text-white',
        borderAccent: 'border-red-500/30',
        ringColor: 'ring-red-500',
        heroTag: 'Texas Super Kings • Major League Cricket',
        trophyText: '2x MLC Playoff Contenders'
      };
    }
    return {
      badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
      activePill: 'bg-csk-yellow text-csk-darkNavy font-black',
      borderAccent: 'border-amber-500/30',
      ringColor: 'ring-amber-400',
      heroTag: 'Chennai Super Kings • Indian Premier League',
      trophyText: '5x IPL Champions • 2x CLT20'
    };
  }, [franchise]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
      
      {/* =========================================================================
          HERO BANNER & QUICK NAVIGATION
         ========================================================================= */}
      <div className="csk-hero-banner rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-csk-yellow/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-csk-yellow border border-csk-yellow/30 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 animate-pulse text-csk-yellow" />
              <span>{franchiseTheme.heroTag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight">
              {data.teamName} <span className="text-csk-yellow">Fixtures &amp; Results</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Official match schedule, live countdown timer, recent fixture scorecards, historical match results archive, and all-time batting &amp; bowling leaderboards for {data.teamName}.
            </p>
          </div>
        </div>

        {/* Section Jump Anchors (No literal 'Section 1, 2, 3' prefix) */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 mr-1">Quick Links:</span>
          <a href="#match-center" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition flex items-center gap-1.5 border border-white/5">
            <Timer className="w-3.5 h-3.5 text-csk-yellow" />
            <span>Match Center</span>
          </a>
          <a href="#points-table" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition flex items-center gap-1.5 border border-white/5">
            <Trophy className="w-3.5 h-3.5 text-csk-yellow" />
            <span>Points Table</span>
          </a>
          <a href="#past-matches" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition flex items-center gap-1.5 border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Past Matches</span>
          </a>
          <a href="#leaderboards" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition flex items-center gap-1.5 border border-white/5">
            <Trophy className="w-3.5 h-3.5 text-csk-yellow" />
            <span>Most Runs &amp; Wickets</span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          MATCH CENTER (Countdown Timer OR Last Match Score & Winner)
         ========================================================================= */}
      <section id="match-center" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
                Match Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeCenterMode === 'result'
                  ? 'Recent match scorecard, victory outcome & Player of the Match honors'
                  : 'Live countdown timer, venue details, pitch insights & head-to-head records'}
              </p>
            </div>
          </div>

          {/* Dual Toggle Pill: Last Match Score vs Next Match Countdown (Shown only when active upcoming countdown exists) */}
          {hasActiveUpcomingCountdown && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setCenterMode('result')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeCenterMode === 'result'
                    ? franchiseTheme.activePill
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Last Match Score</span>
              </button>
              <button
                type="button"
                onClick={() => setCenterMode('countdown')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeCenterMode === 'countdown'
                    ? franchiseTheme.activePill
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Next Match Countdown</span>
              </button>
            </div>
          )}
        </div>

        <div className="sports-card rounded-3xl border border-slate-200 dark:border-csk-borderNavy p-6 sm:p-8 bg-white dark:bg-csk-darkNavy shadow-xl relative overflow-hidden">
          
          {/* ========================================================================= */}
          {/* MODE 1: LATEST MATCH RESULT & WINNER SCORECARD                            */}
          {/* ========================================================================= */}
          {activeCenterMode === 'result' && latestCompleted && (
            <div className="space-y-6">
              {/* Top Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed Result</span>
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
                    {data.league} &bull; {latestCompleted.matchNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-csk-yellow" />
                  <span>{latestCompleted.date} &bull; {latestCompleted.venue}</span>
                </div>
              </div>

              {/* Big Scorecard Clash */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-white/5">
                
                {/* Team 1 Score (4 cols) */}
                <div className={`md:col-span-4 flex items-center gap-4 p-3 rounded-2xl transition-all ${
                  isHeroHomeWinner
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    : isHeroAwayWinner
                    ? 'opacity-65'
                    : ''
                }`}>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2 shrink-0 transition-all ${
                    isHeroHomeWinner
                      ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/25 shadow-md shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 shadow-sm'
                  }`}>
                    {getTeamLogo(latestCompleted.team1 || latestCompleted.team1Short) ? (
                      <img
                        src={getTeamLogo(latestCompleted.team1 || latestCompleted.team1Short)}
                        alt={latestCompleted.team1}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-2xl text-amber-600 dark:text-csk-yellow">
                        {latestCompleted.team1Short}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">HOSTS</span>
                      {isHeroHomeWinner && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                          <Trophy className="w-2.5 h-2.5" /> WINNER
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base sm:text-lg font-black leading-tight truncate ${
                      isHeroHomeWinner
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {latestCompleted.team1}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        isHeroHomeWinner
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {latestCompleted.score1}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        ({latestCompleted.overs1})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center Winner Outcome Banner (4 cols) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-200 dark:border-white/10 px-4">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-csk-yellow/50 shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-csk-yellow block">
                      MATCH WINNER
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block mt-0.5">
                      🏆 {latestCompleted.result}
                    </span>
                  </div>

                  {latestCompleted.potm && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-csk-yellow shrink-0" />
                      <span>POTM: <strong className="text-slate-900 dark:text-white">{latestCompleted.potm}</strong></span>
                    </div>
                  )}

                  {latestCompleted.note && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                      &ldquo;{latestCompleted.note}&rdquo;
                    </p>
                  )}
                </div>

                {/* Team 2 Score (4 cols) */}
                <div className={`md:col-span-4 flex items-center justify-end gap-4 text-right p-3 rounded-2xl transition-all ${
                  isHeroAwayWinner
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    : isHeroHomeWinner
                    ? 'opacity-65'
                    : ''
                }`}>
                  <div className="min-w-0">
                    <div className="flex items-center justify-end gap-2 mb-0.5">
                      {isHeroAwayWinner && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                          <Trophy className="w-2.5 h-2.5" /> WINNER
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">CHALLENGERS</span>
                    </div>
                    <h3 className={`text-base sm:text-lg font-black leading-tight truncate ${
                      isHeroAwayWinner
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {latestCompleted.team2}
                    </h3>
                    <div className="flex items-baseline justify-end gap-1.5 mt-1">
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        isHeroAwayWinner
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {latestCompleted.score2}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        ({latestCompleted.overs2})
                      </span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2 shrink-0 transition-all ${
                    isHeroAwayWinner
                      ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/25 shadow-md shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 shadow-sm'
                  }`}>
                    {getTeamLogo(latestCompleted.team2 || latestCompleted.team2Short) ? (
                      <img
                        src={getTeamLogo(latestCompleted.team2 || latestCompleted.team2Short)}
                        alt={latestCompleted.team2}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-2xl text-blue-600 dark:text-blue-400">
                        {latestCompleted.team2Short}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Fixture Teaser */}
              <div className="p-3.5 bg-amber-500/10 dark:bg-csk-yellow/5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-600 dark:text-csk-yellow shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Next Fixture: <strong className="text-slate-900 dark:text-white">{liveUpcoming.homeShort} vs {liveUpcoming.awayShort}</strong> ({liveUpcoming.date})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCenterMode('countdown')}
                  className="text-amber-700 dark:text-csk-yellow font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>View Countdown Timer &amp; Pitch Preview &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: UPCOMING MATCH COUNTDOWN & PREVIEW                                */}
          {/* ========================================================================= */}
          {activeCenterMode === 'countdown' && (
            <div>
              {/* Top Marquee Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                    Upcoming Marquee
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
                    {liveUpcoming.tournament} &bull; {liveUpcoming.matchdayTag}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-csk-yellow" />
                  <span>{liveUpcoming.date} &bull; {liveUpcoming.time}</span>
                </div>
              </div>

              {/* Teams Versus Layout */}
              <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* Home Team */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 flex items-center justify-center p-2 shadow-md">
                    {getTeamLogo(liveUpcoming.homeTeam || liveUpcoming.homeShort) ? (
                      <img
                        src={getTeamLogo(liveUpcoming.homeTeam || liveUpcoming.homeShort)}
                        alt={liveUpcoming.homeTeam}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-2xl sm:text-3xl text-amber-600 dark:text-csk-yellow">
                        {liveUpcoming.homeShort}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {liveUpcoming.homeRole}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">
                    {liveUpcoming.homeTeam}
                  </h3>
                </div>

                {/* Middle Countdown Timer */}
                <div className="flex flex-col items-center justify-center space-y-4 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-100 dark:border-white/10 px-4">
                  <span className="text-xs font-black uppercase tracking-widest text-csk-yellow px-3 py-1 rounded-full bg-slate-900 dark:bg-black/60 border border-csk-yellow/30">
                    Match Countdown
                  </span>

                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                    <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px] border border-slate-200 dark:border-white/5 shadow-xs">
                      <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-csk-yellow font-mono">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mt-0.5">Days</div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px] border border-slate-200 dark:border-white/5 shadow-xs">
                      <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-csk-yellow font-mono">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mt-0.5">Hours</div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px] border border-slate-200 dark:border-white/5 shadow-xs">
                      <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-csk-yellow font-mono">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mt-0.5">Mins</div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px] border border-slate-200 dark:border-white/5 shadow-xs">
                      <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-csk-yellow font-mono">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mt-0.5">Secs</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-center font-medium">{liveUpcoming.venue}</span>
                  </div>

                  {latestCompleted && (
                    <button
                      type="button"
                      onClick={() => setCenterMode('result')}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Last Match: {latestCompleted.result} (View Scorecard) &rarr;</span>
                    </button>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/30 flex items-center justify-center p-2 shadow-md">
                    {getTeamLogo(liveUpcoming.awayTeam || liveUpcoming.awayShort) ? (
                      <img
                        src={getTeamLogo(liveUpcoming.awayTeam || liveUpcoming.awayShort)}
                        alt={liveUpcoming.awayTeam}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-2xl sm:text-3xl text-blue-600 dark:text-blue-400">
                        {liveUpcoming.awayShort}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {liveUpcoming.awayRole}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">
                    {liveUpcoming.awayTeam}
                  </h3>
                </div>
              </div>

              {/* Pitch Report & H2H Footer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-white/10 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <span className="font-black uppercase tracking-wider text-amber-800 dark:text-csk-yellow flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-csk-yellow" />
                    {liveUpcoming.pitchTitle || 'Venue Surface Report:'}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {liveUpcoming.pitchInsight}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <span className="font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Head-to-Head (H2H) Rivalry Record:
                  </span>
                  <p className="text-slate-800 dark:text-white font-bold leading-relaxed">
                    {liveUpcoming.h2h}
                  </p>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fortress ground record favored for {data.shortName}.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* =========================================================================
          POINTS TABLE • STANDINGS (Replacing Match Results)
         ========================================================================= */}
      <section id="points-table" className="scroll-mt-24">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Points Table &bull; Standings</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${franchiseTheme.badgeBg}`}>
                {data.league}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tournament standings, win margins, net run rates &amp; points table
            </p>
          </div>
        </div>

        <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden shadow-xl bg-white dark:bg-csk-darkNavy">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-white/10">
                  <th className="py-3.5 px-4 w-16 text-center">Pos</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-3 text-center">P</th>
                  <th className="py-3.5 px-3 text-center">W</th>
                  <th className="py-3.5 px-3 text-center">L</th>
                  <th className="py-3.5 px-3 text-center">NRR</th>
                  <th className="py-3.5 px-4 text-center font-extrabold text-amber-700 dark:text-csk-yellow">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
                {standingsList.map((row, idx) => {
                  const isCurrentFranchise = 
                    row.team?.toLowerCase().includes(data.shortName.toLowerCase()) || 
                    row.team?.toLowerCase().includes(data.teamName.toLowerCase()) || 
                    Boolean(row.isLeader && franchise === 'CSK');
                  return (
                    <tr
                      key={row.pos || idx + 1}
                      className={`transition ${
                        isCurrentFranchise
                          ? 'bg-amber-50 dark:bg-csk-yellow/10 font-bold text-slate-900 dark:text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black bg-csk-yellow text-csk-darkNavy shadow-xs">
                          {row.pos || idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          {getTeamLogo(row.team) && (
                            <img
                              src={getTeamLogo(row.team)}
                              alt={`${row.team} logo`}
                              className="w-6 h-6 object-contain flex-shrink-0"
                              loading="lazy"
                            />
                          )}
                          <span className="font-extrabold font-display">{row.team}</span>
                          {row.isLeader && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-csk-yellow text-csk-darkNavy font-black uppercase">
                              Leader
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">{row.played}</td>
                      <td className="py-3.5 px-3 text-center text-green-600 dark:text-green-400 font-bold">{row.won}</td>
                      <td className="py-3.5 px-3 text-center text-red-600 dark:text-red-400 font-bold">{row.lost}</td>
                      <td className="py-3.5 px-3 text-center font-mono">{row.nrr}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {row.pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-4">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {data.league} Tournament Standings ({standingsList.length} Teams)
            </span>
            <span>Updated after every fixture</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          PAST MATCHES (CRICBUZZ / CRICINFO STYLE CARDS WITH SOFT PASTEL DATE STRIP)
         ========================================================================= */}
      <section id="past-matches" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Past Matches</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  Results Archive
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Complete historical match scorecards, series encounters, and tournament results
              </p>
            </div>
          </div>

          {/* Filter Wins vs All */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterPast('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                filterPast === 'ALL'
                  ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All Matches ({allPastMatches.length})
            </button>
            <button
              onClick={() => setFilterPast('WINS')}
              className={`px-3 py-1 rounded-lg transition ${
                filterPast === 'WINS'
                  ? 'bg-green-600 text-white font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Victories Only ({allPastMatches.filter(m => m.isWin).length})
            </button>
          </div>
        </div>

        {/* Cricinfo / Cricbuzz Match Results Layout matching exact user screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPastMatches.map((m) => {
            const isTeam1Winner = Boolean(
              m.winner && (
                m.team1?.toLowerCase() === m.winner.toLowerCase() ||
                m.team1Short?.toLowerCase() === m.winner.toLowerCase() ||
                m.team1?.toLowerCase().includes(m.winner.toLowerCase())
              )
            );
            const isTeam2Winner = Boolean(
              m.winner && (
                m.team2?.toLowerCase() === m.winner.toLowerCase() ||
                m.team2Short?.toLowerCase() === m.winner.toLowerCase() ||
                m.team2?.toLowerCase().includes(m.winner.toLowerCase())
              )
            );

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0A1633] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Date Header Strip (Exact pastel tint styling from user reference) */}
                  <div className="bg-[#E5F3EF] dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm px-4 py-2.5 uppercase tracking-wide border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span>{m.dateHeader}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      m.isWin
                        ? 'bg-green-600/15 text-green-800 dark:text-green-300'
                        : 'bg-red-600/15 text-red-800 dark:text-red-300'
                    }`}>
                      {m.isWin ? 'Won' : 'Lost'}
                    </span>
                  </div>

                  {/* Inside Match Details */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Match description line */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {m.matchSubline}
                    </p>

                    {/* Team 1 Row */}
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getTeamLogo(m.team1 || m.team1Short) ? (
                          <img
                            src={getTeamLogo(m.team1 || m.team1Short)}
                            alt={m.team1}
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            m.team1Short === data.shortName ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
                          }`} />
                        )}
                        <span className={`text-xs sm:text-sm truncate ${
                          isTeam1Winner 
                            ? 'font-black text-slate-900 dark:text-white' 
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}>
                          {m.team1}
                        </span>
                      </div>
                      <span className={`text-xs sm:text-sm font-mono shrink-0 ml-2 ${
                        isTeam1Winner 
                          ? 'font-black text-slate-900 dark:text-white' 
                          : 'font-medium text-slate-600 dark:text-slate-400'
                      }`}>
                        {m.team1Score}
                      </span>
                    </div>

                    {/* Team 2 Row */}
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getTeamLogo(m.team2 || m.team2Short) ? (
                          <img
                            src={getTeamLogo(m.team2 || m.team2Short)}
                            alt={m.team2}
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            m.team2Short === data.shortName ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
                          }`} />
                        )}
                        <span className={`text-xs sm:text-sm truncate ${
                          isTeam2Winner 
                            ? 'font-black text-slate-900 dark:text-white' 
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}>
                          {m.team2}
                        </span>
                      </div>
                      <span className={`text-xs sm:text-sm font-mono shrink-0 ml-2 ${
                        isTeam2Winner 
                          ? 'font-black text-slate-900 dark:text-white' 
                          : 'font-medium text-slate-600 dark:text-slate-400'
                      }`}>
                        {m.team2Score}
                      </span>
                    </div>

                    {/* Blue Outcome Result Line (Exact as Cricbuzz/Cricinfo in screenshot) */}
                    <div className="pt-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {m.resultText}
                    </div>
                  </div>
                </div>

                {/* Match Hero Footer */}
                {m.hero && (
                  <div className="px-4 py-2 bg-slate-50 dark:bg-black/30 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{m.hero}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          MOST RUNS & MOST WICKETS
          EXACT TABLE COLUMNS SPECIFIED BY USER:
          col- playername. match, run , high score
         ========================================================================= */}
      <section id="leaderboards" className="scroll-mt-24">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Most Runs &amp; Most Wickets</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-csk-yellow/20 text-amber-800 dark:text-csk-yellow border border-csk-yellow/30">
                Official Leaderboard
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top run-scorers and leading wicket-takers in {data.teamName} franchise history
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Table A: Most Runs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600 dark:text-csk-yellow" />
                <span>Most Runs</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Batting Firepower
              </span>
            </div>

            {/* Strict Table with exact requested columns: Player Name, Match, Run, High Score */}
            <div className="sports-article-content">
              <figure className="wp-block-table">
                <table className="has-fixed-layout">
                  <thead>
                    <tr>
                      <th>Player Name</th>
                      <th>Match</th>
                      <th>Run</th>
                      <th>High Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingLeaderboard.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-csk-yellow/20 dark:text-csk-yellow">
                              {idx + 1}
                            </span>
                            <span>{row.playerName}</span>
                          </div>
                        </td>
                        <td className="text-center font-mono">{row.matches}</td>
                        <td className="text-center font-mono font-extrabold text-amber-700 dark:text-csk-yellow">
                          {Number(row.runs).toLocaleString()}
                        </td>
                        <td className="text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {row.highScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            </div>
          </div>

          {/* Table B: Most Wickets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Most Wickets</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Bowling Milestones
              </span>
            </div>

            {/* Strict Table with exact requested columns: Player Name, Match, Wickets, Best Figures */}
            <div className="sports-article-content">
              <figure className="wp-block-table">
                <table className="has-fixed-layout">
                  <thead>
                    <tr>
                      <th>Player Name</th>
                      <th>Match</th>
                      <th>Wickets</th>
                      <th>Best Figures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bowlingLeaderboard.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300">
                              {idx + 1}
                            </span>
                            <span>{row.playerName}</span>
                          </div>
                        </td>
                        <td className="text-center font-mono">{row.matches}</td>
                        <td className="text-center font-mono font-extrabold text-blue-600 dark:text-blue-400">
                          {row.wickets}
                        </td>
                        <td className="text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {row.bestFigures}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            </div>
          </div>

        </div>
      </section>

      {/* Cross Links to other franchises */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
            Explore All 3 Super Kings Fixtures &amp; Schedules
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Follow CSK in IPL, JSK in SA20, and TSK in Major League Cricket (MLC).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {franchise !== 'CSK' && (
            <Link href="/csk-fixtures" className="px-3 py-1.5 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs transition shadow-xs hover:scale-105">
              CSK Fixtures &rarr;
            </Link>
          )}
          {franchise !== 'JSK' && (
            <Link href="/jsk-fixtures" className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs transition shadow-xs hover:scale-105">
              JSK Fixtures &rarr;
            </Link>
          )}
          {franchise !== 'TSK' && (
            <Link href="/tsk-fixtures" className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs transition shadow-xs hover:scale-105">
              TSK Fixtures &rarr;
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
