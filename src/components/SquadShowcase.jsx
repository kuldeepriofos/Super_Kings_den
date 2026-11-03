'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Award, Search, Users, Star, Trophy, Sparkles, Filter, Plane, ArrowRight } from 'lucide-react';
import { SQUAD_PLAYERS } from '../data/mockData';

export default function SquadShowcase({ players = SQUAD_PLAYERS }) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [cohortFilter, setCohortFilter] = useState('ALL'); // 'ALL' | 'CURRENT' | 'LEGENDS' | 'OVERSEAS'
  const [searchQuery, setSearchQuery] = useState('');

  const roles = [
    { id: 'ALL', label: 'All Roles' },
    { id: 'Batter', label: 'Batters' },
    { id: 'All-Rounder', label: 'All-Rounders' },
    { id: 'Bowler', label: 'Bowlers' },
    { id: 'WK', label: 'Wicketkeepers' }
  ];

  const sourcePlayers = players || SQUAD_PLAYERS;

  const currentCount = sourcePlayers.filter(p => p.isCurrent).length;
  const legendsCount = sourcePlayers.filter(p => p.isLegend).length;
  const overseasCount = sourcePlayers.filter(p => p.country && p.country.toLowerCase() !== 'india').length;

  const filteredPlayers = sourcePlayers.filter((p) => {
    // Cohort filter
    if (cohortFilter === 'CURRENT' && !p.isCurrent) return false;
    if (cohortFilter === 'LEGENDS' && !p.isLegend) return false;
    if (cohortFilter === 'OVERSEAS' && p.country && p.country.toLowerCase() === 'india') return false;

    // Role filter
    if (roleFilter !== 'ALL' && p.category !== roleFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchRole = (p.role || '').toLowerCase().includes(q);
      const matchSpecialty = (p.specialty || '').toLowerCase().includes(q);
      const matchCountry = (p.country || '').toLowerCase().includes(q);
      return matchName || matchRole || matchSpecialty || matchCountry;
    }

    return true;
  });

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Super Kings Roster &amp; Legends
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
              The icons who wore the yellow jersey &bull; Showing {filteredPlayers.length} of {sourcePlayers.length} Players
            </p>
          </div>
        </div>

        {/* Cohort Switcher: All / Current / Legends / Overseas */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 self-start md:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setCohortFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              cohortFilter === 'ALL'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Players ({sourcePlayers.length})
          </button>
          <button
            onClick={() => setCohortFilter('CURRENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              cohortFilter === 'CURRENT'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Current Squad ({currentCount})</span>
          </button>
          <button
            onClick={() => setCohortFilter('LEGENDS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              cohortFilter === 'LEGENDS'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Legends ({legendsCount})</span>
          </button>
          <button
            onClick={() => setCohortFilter('OVERSEAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              cohortFilter === 'OVERSEAS'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5 rotate-[-45deg]" />
            <span>Overseas ({overseasCount})</span>
          </button>
        </div>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player by name, role, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-csk-yellow transition"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                roleFilter === r.id
                  ? 'bg-csk-yellow text-csk-darkNavy shadow-xs font-black'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-csk-yellow hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            No players found matching "{searchQuery}"
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your search query or cohort filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setCohortFilter('ALL'); }}
            className="px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlayers.map((player) => {
            const isCaptain = (player.role || '').toLowerCase().includes('captain');
            const playerTag = player.tag || (isCaptain && player.isCurrent ? 'Captain' : null);
            const isOverseas = player.country && player.country.toLowerCase() !== 'india';
            const playerUrl = `/${player.slug || player.id}/`;

            return (
              <Link
                key={player.id}
                href={playerUrl}
                className={`sports-card group relative rounded-2xl overflow-hidden border flex flex-col justify-between transition-all duration-300 bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                  player.isCurrent
                    ? 'border-emerald-500/30 dark:border-emerald-500/20 hover:border-csk-yellow'
                    : 'border-slate-200 dark:border-csk-borderNavy hover:border-amber-400'
                }`}
              >
                {/* Standardized Hero Portrait Container */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-gradient-to-b from-amber-500/5 via-slate-100/60 to-white dark:from-csk-navy/60 dark:via-slate-900/60 dark:to-slate-900 flex items-end justify-center border-b border-slate-100 dark:border-white/5">
                  {/* Subtle Studio Lighting Glow */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at 50% 65%, rgba(253, 185, 19, 0.25) 0%, rgba(253, 185, 19, 0.05) 55%, transparent 75%)'
                    }}
                  />

                  {/* Top Status & Role Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 gap-1.5">
                    <div>
                      {!player.isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-xs backdrop-blur-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span>CSK Legend</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Tag / Captain / Category Badge */}
                      {playerTag ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1 tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" /> {playerTag}
                        </span>
                      ) : isCaptain ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-csk-yellow text-csk-darkNavy shadow-xs tracking-wider">
                          Captain
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-950/80 border border-slate-200/60 dark:border-white/10 backdrop-blur-xs">
                          {player.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Player Studio Portrait Image or Regal CSK Monogram */}
                  <div className="relative z-5 w-full h-[90%] flex items-end justify-center px-4">
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="h-full w-auto max-w-[85%] object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`avatar-fallback w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/20 via-csk-yellow/15 to-amber-600/10 border-2 border-csk-yellow/40 flex flex-col items-center justify-center text-center shadow-lg shadow-amber-500/10 backdrop-blur-xs mb-3 group-hover:scale-105 transition-transform duration-300 ${player.avatar ? 'hidden' : 'flex'}`}>
                      <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-csk-yellow font-heading tracking-wider">
                        {(player.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                        #{player.jersey || 'CSK'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    {/* Player Name & Role */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-display mb-0.5 line-clamp-1">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-1">
                      {player.role}
                    </p>

                    {/* Specialty Tag */}
                    {player.specialty && (
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 mb-3">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Specialty</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">{player.specialty}</span>
                      </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 text-center mb-3">
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-bold block">Matches</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{player.matches || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-bold block">
                          {player.runs ? 'Runs' : 'Wickets'}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-csk-yellow tabular-nums">
                          {player.runs || player.wickets || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-bold block">
                          {player.strikeRate ? 'SR' : 'Econ'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                          {player.strikeRate || player.economy || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                        isOverseas ? 'bg-sky-500' : 'bg-emerald-500'
                      }`} />
                      {player.country}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-csk-yellow flex items-center group-hover:translate-x-1 transition-transform">
                      Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
