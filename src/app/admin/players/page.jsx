'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Edit,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
} from 'lucide-react';

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState([]);
  const [counts, setCounts] = useState({ total: 37, current: 28, legend: 10, csk: 37, jsk: 0, tsk: 0 });
  const [filterType, setFilterType] = useState('current'); // current | legend | all
  const [roleFilter, setRoleFilter] = useState('All');
  const [franchiseFilter, setFranchiseFilter] = useState('All');
  const [sortBy, setSortBy] = useState('matches');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [loading, setLoading] = useState(true);

  // Delete Confirmation state
  const [deleteConfirmPlayer, setDeleteConfirmPlayer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter: filterType,
        sort: sortBy,
      });
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'All') params.append('role', roleFilter);
      if (franchiseFilter !== 'All') params.append('franchise', franchiseFilter);

      const res = await fetch(`/api/admin/players/?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlayers(data.players || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Fetch players error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, roleFilter, franchiseFilter, sortBy, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlayers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchPlayers]);

  const handleDeletePlayer = async () => {
    if (!deleteConfirmPlayer) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/players/${deleteConfirmPlayer._id || deleteConfirmPlayer.id || deleteConfirmPlayer.slug}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Player "${deleteConfirmPlayer.name}" deleted successfully!`,
        });
        setDeleteConfirmPlayer(null);
        fetchPlayers();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to delete player' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const getRoleBadgeColor = (role = '') => {
    const r = role.toLowerCase();
    if (r.includes('wicket')) return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    if (r.includes('all-round') || r.includes('all round')) return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    if (r.includes('bowl')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    return 'bg-amber-500/15 text-yellow-300 border-yellow-500/30';
  };

  const renderFranchiseBadges = (player) => {
    const teams = Array.isArray(player.franchises) && player.franchises.length > 0
      ? player.franchises
      : [player.franchise || 'CSK'];

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {teams.map((t) => {
          let badgeStyle = 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30';
          if (t === 'JSK') badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          if (t === 'TSK') badgeStyle = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
          return (
            <span key={t} className={`text-[10px] font-black px-1.5 py-0.5 rounded border font-mono ${badgeStyle}`}>
              {t}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-yellow-400" />
            Players &amp; Legends Roster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage player profiles, career statistics, cutouts, jersey numbers, and franchise status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/csk-team"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
            <span>Public Directory</span>
          </Link>

          <Link
            href="/admin/players/new/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Player</span>
          </Link>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Flexible Control & Filter Suite */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        {/* Team-Wise Franchise Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Team Filter:</span>
            {[
              { id: 'All', label: 'All Teams', count: counts.total, color: 'text-slate-300 hover:text-white', activeColor: 'bg-yellow-400 text-slate-950 font-black shadow' },
              { id: 'CSK', label: 'CSK (Chennai)', count: counts.csk, color: 'text-amber-300 hover:bg-amber-500/15', activeColor: 'bg-amber-400 text-slate-950 font-black shadow' },
              { id: 'JSK', label: 'JSK (Joburg)', count: counts.jsk, color: 'text-emerald-300 hover:bg-emerald-500/15', activeColor: 'bg-emerald-500 text-white font-black shadow' },
              { id: 'TSK', label: 'TSK (Texas)', count: counts.tsk, color: 'text-blue-300 hover:bg-blue-500/15', activeColor: 'bg-blue-600 text-white font-black shadow' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFranchiseFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  franchiseFilter === tab.id
                    ? tab.activeColor
                    : `bg-slate-900 border border-slate-800 ${tab.color}`
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  franchiseFilter === tab.id ? 'bg-black/20 text-current' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Live:</span>
            <Link href="/csk-team" target="_blank" className="text-yellow-400 hover:underline font-bold text-xs">CSK</Link>
            <span className="text-slate-600">&bull;</span>
            <Link href="/jsk-team" target="_blank" className="text-emerald-400 hover:underline font-bold text-xs">JSK</Link>
            <span className="text-slate-600">&bull;</span>
            <Link href="/tsk-team" target="_blank" className="text-blue-400 hover:underline font-bold text-xs">TSK</Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 flex-wrap">
            <button
              onClick={() => setFilterType('current')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'current'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Current Squad</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${filterType === 'current' ? 'bg-slate-950 text-yellow-300' : 'bg-slate-800 text-slate-300'}`}>
                {counts.current}
              </span>
            </button>

            <button
              onClick={() => setFilterType('legend')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'legend'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Legends</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${filterType === 'legend' ? 'bg-slate-950 text-yellow-300' : 'bg-slate-800 text-slate-300'}`}>
                {counts.legend}
              </span>
            </button>

            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'all'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All Players</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${filterType === 'all' ? 'bg-slate-950 text-yellow-300' : 'bg-slate-800 text-slate-300'}`}>
                {counts.total}
              </span>
            </button>
          </div>

          {/* View Mode Toggle: Grid Cards vs Compact Table */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 self-start lg:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-yellow-400 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-yellow-400 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Spreadsheet Table View"
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table View</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns & Instant Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, jersey, role..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Batter">Batters</option>
            <option value="Bowler">Bowlers</option>
            <option value="All-Rounder">All-Rounders</option>
            <option value="Wicketkeeper">Wicketkeepers</option>
          </select>

          {/* Franchise Filter */}
          <select
            value={franchiseFilter}
            onChange={(e) => setFranchiseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
          >
            <option value="All">All Franchises</option>
            <option value="CSK">Chennai Super Kings (CSK)</option>
            <option value="JSK">Joburg Super Kings (JSK)</option>
            <option value="TSK">Texas Super Kings (TSK)</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-yellow-400 outline-none cursor-pointer"
            >
              <option value="matches">Sort: Most Matches</option>
              <option value="runs">Sort: Highest Runs</option>
              <option value="wickets">Sort: Most Wickets</option>
              <option value="jersey">Sort: Jersey Number</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Live Counter & Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-2 border-t border-slate-800/80">
          <div>
            Showing <strong className="text-white">{players.length}</strong> {filterType === 'current' ? 'Current Squad' : filterType === 'legend' ? 'Legend' : ''} players
            {(search || roleFilter !== 'All' || franchiseFilter !== 'All') && (
              <span className="text-yellow-400 ml-1.5 font-medium">
                (Filtered from {filterType === 'current' ? counts.current : filterType === 'legend' ? counts.legend : counts.total} total)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Roster: {counts.total} Players Total ({counts.current} Current • {counts.legend} Legends)
          </div>
        </div>
      </div>

      {/* Main Players Display Area: Cards View or Table View */}
      {viewMode === 'grid' ? (
        /* 🎴 Grid Cards Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))
          ) : players.length > 0 ? (
            players.map((player) => (
              <div
                key={player._id || player.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-yellow-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all group relative overflow-hidden shadow-lg hover:shadow-yellow-500/5"
              >
                {/* Top Strip */}
                <div className="flex items-center justify-between mb-3 z-10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-6 h-6 rounded-md bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                      #{player.jersey || '—'}
                    </span>
                    {player.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {player.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderFranchiseBadges(player)}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        player.isCurrent
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {player.isCurrent ? 'Squad' : 'Legend'}
                    </span>
                  </div>
                </div>

                {/* Player Photo Cutout & Details */}
                <div className="flex items-center gap-3.5 my-2 z-10">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-yellow-500/50 transition-colors p-0.5">
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src="/superkingsden-1.png"
                        alt=""
                        className="w-8 h-8 object-contain opacity-40"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors truncate">
                      {player.name}
                    </h3>
                    <div className="text-[11px] text-slate-300 font-medium truncate">
                      {player.role || player.category || 'Player'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate flex items-center gap-1">
                      <span>{player.country && player.country.toLowerCase() !== 'india' ? `✈️ ${player.country}` : '🇮🇳 India'}</span>
                      {player.bowlingStyle && player.bowlingStyle !== 'NA' && player.bowlingStyle !== player.role && (
                        <>
                          <span>&bull;</span>
                          <span className="text-slate-400">{player.bowlingStyle}</span>
                        </>
                      )}
                      {(!player.bowlingStyle || player.bowlingStyle === 'NA') && player.battingStyle && player.battingStyle !== player.role && (
                        <>
                          <span>&bull;</span>
                          <span className="text-slate-400">{player.battingStyle}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Strip */}
                <div className="grid grid-cols-3 gap-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 text-center my-2 text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold">Matches</div>
                    <div className="font-black text-white">{player.matches || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold">Runs</div>
                    <div className="font-black text-yellow-400">{player.runs || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold">Wickets</div>
                    <div className="font-black text-emerald-400">{player.wickets || 0}</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2.5 flex items-center justify-between border-t border-slate-800/60 z-10 gap-2">
                  <Link
                    href={`/${player.slug}/`}
                    target="_blank"
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    title="View public profile"
                  >
                    <ExternalLink className="w-3 h-3 text-yellow-500" />
                    <span>Profile</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDeleteConfirmPlayer(player)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/admin/players/${player.slug || player._id || player.id}/`}
                      className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              No players found matching current filters.
            </div>
          )}
        </div>
      ) : (
        /* 📋 Table Spreadsheet Mode */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Jersey</th>
                  <th className="py-3 px-3">Franchise</th>
                  <th className="py-3 px-3 text-center">Matches</th>
                  <th className="py-3 px-3 text-center text-yellow-400">Runs</th>
                  <th className="py-3 px-3 text-center text-emerald-400">Wickets</th>
                  <th className="py-3 px-3 text-center">Avg / SR</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={10} className="py-4 px-4 h-12 bg-slate-900/40" />
                    </tr>
                  ))
                ) : players.length > 0 ? (
                  players.map((player) => (
                    <tr key={player._id || player.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {player.avatar ? (
                              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <img src="/superkingsden-1.png" alt="" className="w-6 h-6 object-contain opacity-40" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{player.name}</span>
                              {player.tag && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-yellow-400 text-slate-950">
                                  {player.tag}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{player.fullName || player.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(player.role)}`}>
                          {player.role}
                        </span>
                      </td>

                      {/* Jersey */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-300">
                        #{player.jersey || '—'}
                      </td>

                      {/* Franchise */}
                      <td className="py-3 px-3">
                        {renderFranchiseBadges(player)}
                      </td>

                      {/* Matches */}
                      <td className="py-3 px-3 text-center font-bold text-white">
                        {player.matches || 0}
                      </td>

                      {/* Runs */}
                      <td className="py-3 px-3 text-center font-black text-yellow-400">
                        {player.runs || 0}
                      </td>

                      {/* Wickets */}
                      <td className="py-3 px-3 text-center font-black text-emerald-400">
                        {player.wickets || 0}
                      </td>

                      {/* Avg / SR */}
                      <td className="py-3 px-3 text-center text-slate-300">
                        <div>{player.average ? Number(player.average).toFixed(2) : '—'}</div>
                        <div className="text-[10px] text-slate-500">{player.strikeRate ? Number(player.strikeRate).toFixed(1) : '—'} SR</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            player.isCurrent
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {player.isCurrent ? 'Current' : 'Legend'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/${player.slug}/`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Public Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/players/${player.slug || player._id || player.id}/`}
                            className="p-1.5 rounded-lg bg-yellow-400 text-slate-950 hover:bg-yellow-300 transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Edit Player"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmPlayer(player)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Player"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      No players found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      {deleteConfirmPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-full bg-red-950/80 border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Player Profile?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              Are you sure you want to permanently delete{' '}
              <strong className="text-yellow-400">{deleteConfirmPlayer.name}</strong> from MongoDB?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlayer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlayer}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition-all cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
