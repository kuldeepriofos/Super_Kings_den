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
      const matchName = p.name.toLowerCase().includes(q);
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
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Super Kings Roster &amp; Legends
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The icons who wore the yellow jersey and made history &bull; {filteredPlayers.length} Players Listed
            </p>
          </div>
        </div>

        {/* Cohort Switcher: All / Current / Legends / Overseas */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 self-start md:self-auto">
          <button
            onClick={() => setCohortFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              cohortFilter === 'ALL'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Players ({sourcePlayers.length})
          </button>
          <button
            onClick={() => setCohortFilter('CURRENT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              cohortFilter === 'CURRENT'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Current Squad</span>
          </button>
          <button
            onClick={() => setCohortFilter('LEGENDS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              cohortFilter === 'LEGENDS'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Franchise Legends</span>
          </button>
          <button
            onClick={() => setCohortFilter('OVERSEAS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              cohortFilter === 'OVERSEAS'
                ? 'bg-csk-yellow text-csk-darkNavy shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5 rotate-[-45deg]" />
            <span>Overseas</span>
          </button>
        </div>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player by name, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-csk-yellow transition"
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
                  ? 'bg-csk-yellow text-csk-darkNavy shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 sports-card rounded-2xl border border-slate-200 dark:border-white/10">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No players found matching "{searchQuery}"
          </p>
          <button
            onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setCohortFilter('ALL'); }}
            className="mt-3 px-4 py-1.5 rounded-lg bg-csk-yellow text-csk-darkNavy font-semibold text-xs uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => {
            const isOverseas = player.country && player.country.toLowerCase() !== 'india';
            const playerUrl = `/players/${player.slug || player.id}`;

            return (
              <div
                key={player.id}
                className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy p-6 flex flex-col justify-between hover:border-csk-yellow/50 transition duration-300 shadow-xs hover:shadow-md bg-white dark:bg-slate-900/60"
              >
                {/* Jersey Number Background Watermark */}
                <span className="absolute -top-4 -right-2 text-8xl font-semibold text-slate-900/5 dark:text-white/5 select-none pointer-events-none font-heading group-hover:text-csk-yellow/10 transition">
                  #{player.jersey}
                </span>

                <div>
                  {/* Header: Franchise + Era + Overseas Flight Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-csk-yellow border border-amber-500/20">
                        {player.franchise} &bull; {player.country}
                      </span>

                      {isOverseas && (
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30" 
                          title={`Overseas Player (${player.country})`}
                        >
                          <Plane className="w-3 h-3 rotate-[-45deg]" />
                          <span>Overseas</span>
                        </span>
                      )}

                      {player.era && !isOverseas && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                          {player.era}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      #{player.jersey}
                    </span>
                  </div>

                  {/* Player Info Row */}
                  <Link href={playerUrl} className="flex items-center space-x-4 mb-4 group/link">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-csk-yellow shadow-csk-glow flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                      <img 
                        src={player.avatar} 
                        alt={player.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        onError={(e) => {
                          e.target.src = "https://superkingsden.com/wp-content/uploads/2024/02/MS-Dhoni.jpg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover/link:text-amber-600 dark:group-hover/link:text-csk-yellow transition font-heading truncate">
                        {player.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center mt-0.5 truncate">
                        <Award className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-csk-yellow flex-shrink-0" /> {player.role}
                      </p>
                    </div>
                  </Link>

                  {/* Specialty Tagline */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-4 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Specialty: </span>
                    <span className="font-semibold text-amber-700 dark:text-csk-yellow">{player.specialty}</span>
                  </div>
                </div>

                <div>
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-white/10 text-center mb-3">
                    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-200 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">Matches</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">{player.matches}</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-200 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">
                        {player.runs ? 'Runs' : 'Wickets'}
                      </span>
                      <span className="text-sm font-semibold text-amber-600 dark:text-csk-yellow tabular-nums">
                        {player.runs || player.wickets}
                      </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-200 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">
                        {player.strikeRate ? 'Strike Rate' : 'Economy'}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                        {player.strikeRate || player.economy}
                      </span>
                    </div>
                  </div>

                  {/* View Profile Action Link */}
                  <Link
                    href={playerUrl}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-csk-yellow text-slate-800 dark:text-slate-200 hover:text-csk-darkNavy text-xs font-semibold transition group/btn"
                  >
                    <span>View Full Stats &amp; Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
