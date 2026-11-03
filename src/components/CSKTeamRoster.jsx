'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles, Users, Shield, Award } from 'lucide-react';
import { SQUAD_PLAYERS } from '../data/mockData';

export default function CSKTeamRoster({ players: initialPlayers = SQUAD_PLAYERS }) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPlayers = useMemo(() => {
    return (initialPlayers || SQUAD_PLAYERS).filter((p) => p.isCurrent);
  }, [initialPlayers]);

  const roles = [
    { id: 'ALL', label: 'All Players', count: currentPlayers.length },
    { id: 'Batter', label: 'Batters', count: currentPlayers.filter(p => p.category === 'Batter').length },
    { id: 'All-Rounder', label: 'All-Rounders', count: currentPlayers.filter(p => p.category === 'All-Rounder').length },
    { id: 'Bowler', label: 'Bowlers', count: currentPlayers.filter(p => p.category === 'Bowler').length },
    { id: 'WK', label: 'Wicketkeepers', count: currentPlayers.filter(p => p.category === 'WK').length },
  ];

  const filteredPlayers = useMemo(() => {
    return currentPlayers.filter((p) => {
      if (roleFilter !== 'ALL' && p.category !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchRole = (p.role || '').toLowerCase().includes(q);
        const matchCountry = (p.country || '').toLowerCase().includes(q);
        const matchSpecialty = (p.specialty || '').toLowerCase().includes(q);
        return matchName || matchRole || matchCountry || matchSpecialty;
      }
      return true;
    });
  }, [currentPlayers, roleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─── Filter and Search Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                roleFilter === r.id
                  ? 'bg-csk-yellow text-csk-darkNavy shadow-xs font-black'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-csk-yellow'
              }`}
            >
              <span>{r.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                roleFilter === r.id
                  ? 'bg-csk-darkNavy/15 text-csk-darkNavy'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {r.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by player, role, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400 transition"
          />
        </div>
      </div>

      {/* Showing Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong>{filteredPlayers.length}</strong> of {currentPlayers.length} Official CSK Players
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-amber-700 dark:text-csk-yellow hover:underline text-xs font-bold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* ─── 4-Column Responsive Grid of All Players ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => {
          const isCaptain = (player.role || '').toLowerCase().includes('captain');
          const playerTag = player.tag || (isCaptain && player.isCurrent ? 'Captain' : null);
          const playerUrl = `/${player.slug || player.id}/`;

          return (
            <Link
              key={player.id}
              href={playerUrl}
              className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between hover:border-csk-yellow/60 transition-all duration-300 bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-xl hover:-translate-y-1"
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

                {/* Badges Floating on Top of Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-950/80 text-amber-700 dark:text-csk-yellow border border-amber-500/20 shadow-xs backdrop-blur-xs">
                    {player.category}
                  </span>

                  {playerTag ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 shadow-xs flex items-center tracking-wider">
                      <Sparkles className="w-2.5 h-2.5 mr-1" /> {playerTag}
                    </span>
                  ) : player.jersey ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-950/70 border border-slate-200/50 dark:border-white/5 backdrop-blur-xs">
                      #{player.jersey}
                    </span>
                  ) : null}
                </div>

                {/* Official CSK Yellow Jersey Cutout Player Bust */}
                <div className="relative z-5 w-full h-[90%] flex items-end justify-center px-4">
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="h-full w-auto max-w-[85%] object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-2xl font-display mb-4">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details Body */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  {/* Player Name & Role */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-display mb-0.5 line-clamp-1">
                    {player.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                    {player.role}
                  </p>

                  {/* Specialty Pill */}
                  {player.specialty && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 mb-3">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Specialty</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">{player.specialty}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Meta */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
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

      {filteredPlayers.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No players found matching your criteria
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your role filter or search query.
          </p>
          <button
            onClick={() => { setRoleFilter('ALL'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
