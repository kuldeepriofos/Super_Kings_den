'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Award, 
  Trophy, 
  Calendar, 
  MapPin, 
  Share2, 
  ArrowLeft, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Plane,
  Target,
  Zap,
  Activity,
  Star
} from 'lucide-react';

export default function PlayerProfileView({ player, teammates = [] }) {
  const [copied, setCopied] = useState(false);

  if (!player) return null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: `${player.name} - Chennai Super Kings Profile`,
          text: `Explore ${player.name}'s IPL career stats, championship honors, and records on Super Kings Den!`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const isBowler = player.category === 'Bowler';
  const isAllRounder = player.category === 'All-Rounder';
  const isWK = player.category === 'WK';
  const isOverseas = player.country && player.country.toLowerCase() !== 'india';

  return (
    <article className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-400" />
          <Link href="/players" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
            CSK Players
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium truncate">
            {player.name}
          </span>
        </nav>

        {/* Hero Sports Card */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-csk-darkNavy to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-white/10 mb-10">
          {/* Jersey Number Background Watermark */}
          <span className="absolute -bottom-10 -right-6 text-[11rem] sm:text-[14rem] font-semibold text-white/5 select-none pointer-events-none font-heading leading-none">
            #{player.jersey}
          </span>

          {/* Golden Ambient Glow Accent */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-csk-yellow/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Player Avatar with Golden Ring */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-csk-yellow/80 shadow-csk-glow bg-slate-800">
                <img
                  src={player.avatar}
                  alt={player.fullName || player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://superkingsden.com/wp-content/uploads/2024/02/MS-Dhoni.jpg";
                  }}
                />
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-csk-yellow text-csk-darkNavy text-xs font-semibold uppercase tracking-wider shadow-md whitespace-nowrap">
                #{player.jersey}
              </div>
            </div>

            {/* Player Main Bio and Title */}
            <div className="flex-1 text-center md:text-left">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-csk-yellow text-csk-darkNavy">
                  {player.franchise || 'CSK'} &bull; {player.country}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15">
                  {player.category}
                </span>

                {isOverseas && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <Plane className="w-3 h-3 rotate-[-45deg]" />
                    <span>Overseas</span>
                  </span>
                )}

                {player.isLegend && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-csk-yellow border border-amber-500/30">
                    <Star className="w-3 h-3" />
                    <span>Legend</span>
                  </span>
                )}

                {player.era && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                    {player.era}
                  </span>
                )}
              </div>

              {/* Player Name */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-heading tracking-tight text-white mb-2">
                {player.name}
              </h1>

              {/* Full Name & Role */}
              <div className="text-sm sm:text-base text-slate-300 mb-4 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
                <span className="font-semibold text-csk-yellow">{player.role}</span>
                {player.fullName && player.fullName !== player.name && (
                  <>
                    <span className="text-slate-500 hidden sm:inline">&bull;</span>
                    <span className="text-slate-400">Full Name: {player.fullName}</span>
                  </>
                )}
              </div>

              {/* Specialty Tagline */}
              {player.specialty && (
                <div className="inline-block p-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-200 mb-6 max-w-2xl">
                  <span className="text-csk-yellow font-semibold mr-1">Signature Impact:</span>
                  <span>{player.specialty}</span>
                </div>
              )}

              {/* Player Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Batting Style</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {player.battingStyle || 'Right-hand bat'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bowling Style</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {player.bowlingStyle || 'Right-arm medium'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">IPL Debut</span>
                  <span className="text-xs sm:text-sm font-semibold text-csk-yellow block">
                    {player.iplDebut ? `${player.iplDebut} Season` : '2008'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Birth Date / City</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block" title={player.born}>
                    {player.born || 'India'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/players"
              className="inline-flex items-center text-xs font-semibold text-slate-300 hover:text-csk-yellow transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Squad Directory</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/10 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-300">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-csk-yellow" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Primary Impact Stats KPI Cards */}
        <section className="mb-10">
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
              Key Career Metrics &amp; Record Stats
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Matches */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Matches
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.matches}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">{player.innings || player.matches} Innings</span>
            </div>

            {/* Total Runs */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                IPL Runs
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-amber-600 dark:text-csk-yellow font-heading mt-2 tabular-nums">
                {player.runs || (player.wickets ? '0' : '—')}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">HS: {player.highestScore || '—'}</span>
            </div>

            {/* Strike Rate */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Strike Rate
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.strikeRate || '—'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Batting Pace</span>
            </div>

            {/* Average */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Batting Avg
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.average || '—'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Runs/Dismissal</span>
            </div>

            {/* Wickets */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Wickets
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-amber-600 dark:text-csk-yellow font-heading mt-2 tabular-nums">
                {player.wickets || 0}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">BBI: {player.bestBowling || '—'}</span>
            </div>

            {/* Economy / Catches */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {player.wickets > 0 ? 'Economy Rate' : isWK ? 'Dismissals' : 'Fielding Catches'}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.wickets > 0 
                  ? player.economy || '—' 
                  : isWK 
                    ? (player.catches || 0) + (player.stumpings || 0)
                    : player.catches || 0}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                {player.wickets > 0 
                  ? 'Runs per over' 
                  : isWK 
                    ? `${player.catches || 0}c / ${player.stumpings || 0}st` 
                    : 'Outfield takes'}
              </span>
            </div>
          </div>
        </section>

        {/* Detailed Stats Breakdown Tables */}
        <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batting Performance Table */}
          <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
              <Zap className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                Batting &amp; Fielding Statistics
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Matches / Innings</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.matches} / {player.innings || player.matches}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Total Career Runs</td>
                    <td className="py-2.5 text-right font-semibold text-amber-600 dark:text-csk-yellow tabular-nums">
                      {player.runs || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Highest Individual Score</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.highestScore || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Batting Average</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.average || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Batting Strike Rate</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.strikeRate || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Centuries (100s) / Fifties (50s)</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.hundreds || 0} / {player.fifties || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Fours (4s) / Sixes (6s)</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.fours || 0} / {player.sixes || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Catches / Stumpings</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.catches || 0} / {player.stumpings || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Performance Table */}
          <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
              <Target className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                Bowling &amp; Wicketkeeping Records
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Total Career Wickets</td>
                    <td className="py-2.5 text-right font-semibold text-amber-600 dark:text-csk-yellow tabular-nums">
                      {player.wickets || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Best Bowling in an Innings (BBI)</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.bestBowling || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Bowling Economy Rate</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.economy ? `${player.economy} RPO` : '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Bowling Average</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.bowlingAverage || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">4-Wicket Hauls</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.fourWickets || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Primary Role Category</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {player.category}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Bowling Delivery Style</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {player.bowlingStyle || 'None'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Active Squad Status</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {player.isCurrent ? 'Current Squad (2026)' : 'Franchise Legend'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trophies & Honors Shelf */}
        <section className="mb-10">
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
              Trophies &amp; Championship Accolades
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trophies Card */}
            <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-6 shadow-xs">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                  Titles &amp; Silverware Won
                </h3>
              </div>

              {player.trophies && player.trophies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {player.trophies.map((trophy, idx) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-csk-yellow/10 border border-amber-500/20 dark:border-csk-yellow/20 text-xs font-semibold text-amber-800 dark:text-csk-yellow"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-csk-yellow flex-shrink-0" />
                      <span>{trophy}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aiming for championship glory with the Super Kings franchise.
                </p>
              )}
            </div>

            {/* Individual Honors & Milestones */}
            <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-6 shadow-xs">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                  Career Milestones &amp; Records
                </h3>
              </div>

              {player.honors && player.honors.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {player.honors.map((honor, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-csk-yellow mt-1.5 flex-shrink-0"></span>
                      <span className="font-medium">{honor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Key squad member contributing to Chennai Super Kings match victories.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Player Bio / Career Story */}
        {player.bio && (
          <section className="mb-12">
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
              <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
                Player Profile &amp; The Yellow Legacy
              </h2>
            </div>

            <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-xs">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {player.bio}
              </p>
            </div>
          </section>
        )}

        {/* Teammates & Squad Directory Carousel */}
        {teammates && teammates.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
                <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
                  More Super Kings Players
                </h2>
              </div>
              <Link
                href="/players"
                className="text-xs font-semibold text-amber-600 dark:text-csk-yellow hover:underline"
              >
                View Full Roster &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teammates.slice(0, 4).map((tm) => (
                <Link
                  key={tm.id}
                  href={`/players/${tm.slug}`}
                  className="sports-card group rounded-2xl border border-slate-200 dark:border-csk-borderNavy p-4 bg-white dark:bg-slate-900/60 hover:border-csk-yellow/60 transition shadow-xs flex items-center space-x-3"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-csk-yellow/70 flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                    <img
                      src={tm.avatar}
                      alt={tm.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        e.target.src = "https://superkingsden.com/wp-content/uploads/2024/02/MS-Dhoni.jpg";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition truncate font-heading">
                      {tm.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      #{tm.jersey} &bull; {tm.role}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
