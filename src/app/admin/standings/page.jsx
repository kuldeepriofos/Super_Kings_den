'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Shield,
  Sparkles,
  ArrowUp,
  ArrowDown,
  PlusCircle,
  Search,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { getTeamLogo, OFFICIAL_FRANCHISES } from '../../../lib/teamLogos';
import { IPL_STANDINGS, SA20_STANDINGS, MLC_STANDINGS } from '../../../data/franchiseStandingsData';

const TOURNAMENTS = [
  {
    id: 'IPL 2026',
    code: 'IPL',
    franchise: 'CSK',
    label: 'IPL 2026 (CSK)',
    subtitle: 'Indian Premier League • 10 Franchises',
    badge: 'bg-yellow-400 text-slate-950',
    border: 'border-yellow-400/40',
    accentText: 'text-yellow-400',
    defaultData: IPL_STANDINGS,
    liveUrl: '/csk-fixtures',
    targetCount: 10,
  },
  {
    id: 'SA20 2026',
    code: 'SA20',
    franchise: 'JSK',
    label: 'SA20 2026 (JSK)',
    subtitle: 'South Africa SA20 • 6 Franchises',
    badge: 'bg-emerald-500 text-slate-950',
    border: 'border-emerald-500/40',
    accentText: 'text-emerald-400',
    defaultData: SA20_STANDINGS,
    liveUrl: '/jsk-fixtures',
    targetCount: 6,
  },
  {
    id: 'MLC 2026',
    code: 'MLC',
    franchise: 'TSK',
    label: 'MLC 2026 (TSK)',
    subtitle: 'Major League Cricket • 6 Franchises',
    badge: 'bg-blue-500 text-white',
    border: 'border-blue-500/40',
    accentText: 'text-blue-400',
    defaultData: MLC_STANDINGS,
    liveUrl: '/tsk-fixtures',
    targetCount: 6,
  },
];

export default function AdminStandingsManager() {
  const [selectedTournament, setSelectedTournament] = useState('IPL 2026');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const currentTournamentMeta = useMemo(() => {
    return TOURNAMENTS.find((t) => t.id === selectedTournament) || TOURNAMENTS[0];
  }, [selectedTournament]);

  // Team Picker Modal State
  const [pickerModal, setPickerModal] = useState({
    isOpen: false,
    mode: 'edit', // 'edit' = changing a row, 'add' = adding a new team
    targetIndex: null,
    searchQuery: '',
    category: 'CURRENT', // 'CURRENT' | 'ALL' | 'IPL' | 'SA20' | 'MLC'
    customMode: false,
    customName: '',
    customShort: '',
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch standings strictly for the active tournament
  const fetchStandingsForTournament = async (tournamentId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/standings?tournament=${encodeURIComponent(tournamentId)}`);
      if (!res.ok) throw new Error('Failed to fetch standings');
      const data = await res.json();
      if (data.standings && Array.isArray(data.standings) && data.standings.length > 0) {
        setStandings(data.standings);
      } else {
        const fallback = TOURNAMENTS.find((t) => t.id === tournamentId)?.defaultData || IPL_STANDINGS;
        setStandings(fallback);
      }
    } catch (err) {
      const fallback = TOURNAMENTS.find((t) => t.id === tournamentId)?.defaultData || IPL_STANDINGS;
      setStandings(fallback);
      showToast('error', `Loaded fallback standings for ${tournamentId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandingsForTournament(selectedTournament);
  }, [selectedTournament]);

  const handleChange = (index, field, value) => {
    setStandings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto recalculate points if W changes: PTS = W * 2
      if (field === 'won') {
        const wonNum = parseInt(value, 10);
        if (!isNaN(wonNum)) {
          updated[index].pts = wonNum * 2;
        }
      }
      return updated;
    });
  };

  // Open modal to edit existing row's team
  const handleOpenEditTeam = (index) => {
    setPickerModal({
      isOpen: true,
      mode: 'edit',
      targetIndex: index,
      searchQuery: '',
      category: currentTournamentMeta.code, // default to current league
      customMode: false,
      customName: standings[index]?.team || '',
      customShort: standings[index]?.shortName || '',
    });
  };

  // Open modal to add a brand new team
  const handleOpenAddTeam = () => {
    setPickerModal({
      isOpen: true,
      mode: 'add',
      targetIndex: null,
      searchQuery: '',
      category: currentTournamentMeta.code,
      customMode: false,
      customName: '',
      customShort: '',
    });
  };

  // Choose a franchise from the modal
  const handleSelectFranchise = (franchise) => {
    if (pickerModal.mode === 'add') {
      const nextPos = standings.length + 1;
      setStandings((prev) => [
        ...prev,
        {
          pos: nextPos,
          team: franchise.name,
          shortName: franchise.short,
          played: selectedTournament.includes('IPL') ? 14 : 10,
          won: 0,
          lost: 0,
          nrr: '+0.000',
          pts: 0,
          isLeader: prev.length === 0,
          tournament: selectedTournament,
        },
      ]);
      showToast('success', `Added ${franchise.name} as Row #${nextPos}!`);
    } else if (pickerModal.mode === 'edit' && pickerModal.targetIndex !== null) {
      const idx = pickerModal.targetIndex;
      setStandings((prev) => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          team: franchise.name,
          shortName: franchise.short,
          tournament: selectedTournament,
        };
        return updated;
      });
      showToast('success', `Row #${idx + 1} updated to ${franchise.name}`);
    }

    setPickerModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Apply custom team name
  const handleApplyCustomTeam = (e) => {
    e.preventDefault();
    const name = pickerModal.customName.trim();
    if (!name) return;
    const shortCode = (pickerModal.customShort.trim() || name.slice(0, 3)).toUpperCase();

    if (pickerModal.mode === 'add') {
      const nextPos = standings.length + 1;
      setStandings((prev) => [
        ...prev,
        {
          pos: nextPos,
          team: name,
          shortName: shortCode,
          played: selectedTournament.includes('IPL') ? 14 : 10,
          won: 0,
          lost: 0,
          nrr: '+0.000',
          pts: 0,
          isLeader: false,
          tournament: selectedTournament,
        },
      ]);
      showToast('success', `Added custom team "${name}" as Row #${nextPos}`);
    } else if (pickerModal.targetIndex !== null) {
      const idx = pickerModal.targetIndex;
      setStandings((prev) => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          team: name,
          shortName: shortCode,
          tournament: selectedTournament,
        };
        return updated;
      });
      showToast('success', `Row #${idx + 1} updated to "${name}"`);
    }

    setPickerModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Move row Up or Down
  const handleMoveRow = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= standings.length) return;
    setStandings((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated.map((item, idx) => ({ ...item, pos: idx + 1 }));
    });
  };

  // Remove row
  const handleRemoveTeam = (index) => {
    const teamName = standings[index]?.team || `Row #${index + 1}`;
    if (window.confirm(`Delete ${teamName}?`)) {
      setStandings((prev) => {
        const filtered = prev.filter((_, i) => i !== index);
        return filtered.map((item, idx) => ({ ...item, pos: idx + 1 }));
      });
      showToast('info', `Removed ${teamName}`);
    }
  };

  // Auto-Sort all rows by Points & NRR
  const handleAutoSort = () => {
    setStandings((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const ptsA = Number(a.pts) || 0;
        const ptsB = Number(b.pts) || 0;
        if (ptsB !== ptsA) return ptsB - ptsA;

        const nrrA = parseFloat(String(a.nrr).replace('+', '')) || 0;
        const nrrB = parseFloat(String(b.nrr).replace('+', '')) || 0;
        if (nrrB !== nrrA) return nrrB - nrrA;

        const wonA = Number(a.won) || 0;
        const wonB = Number(b.won) || 0;
        return wonB - wonA;
      });

      return sorted.map((item, idx) => ({
        ...item,
        pos: idx + 1,
        isLeader: idx === 0,
      }));
    });
    showToast('success', 'Sorted table by Points (PTS) & NRR! Click "Save Points Table" to confirm.');
  };

  // Reset to official default teams for this tournament
  const handleResetToDefaults = () => {
    const defaults = currentTournamentMeta.defaultData;
    if (
      window.confirm(
        `Reset ${selectedTournament} to the ${defaults.length} official franchise teams? Any unsaved edits will be discarded.`
      )
    ) {
      setStandings(defaults);
      showToast('info', `Loaded official ${defaults.length} teams for ${selectedTournament}. Click Save to confirm.`);
    }
  };

  // Save changes to backend - Strictly saves to the active tournament without overwriting other leagues!
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/standings/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standings: standings.map((s, idx) => ({
            ...s,
            pos: idx + 1,
            tournament: selectedTournament,
          })),
          tournament: selectedTournament,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save standings');
      }
      showToast('success', `${selectedTournament} standings with ${standings.length} teams saved successfully!`);
    } catch (err) {
      showToast('error', err.message || 'Error saving standings');
    } finally {
      setSaving(false);
    }
  };

  // Filtered franchises for modal
  const filteredFranchises = useMemo(() => {
    const q = pickerModal.searchQuery.toLowerCase().trim();
    return OFFICIAL_FRANCHISES.filter((f) => {
      const matchesCat =
        pickerModal.category === 'ALL' || f.tournament === pickerModal.category;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.short.toLowerCase().includes(q) ||
        f.tournament.toLowerCase().includes(q)
      );
    });
  }, [pickerModal.searchQuery, pickerModal.category]);

  const existingTeamNames = useMemo(() => {
    return new Set(standings.map((s) => s.team?.toLowerCase().trim()));
  }, [standings]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
              : toast.type === 'error'
              ? 'bg-red-950/90 text-red-300 border-red-500/30'
              : 'bg-blue-950/90 text-blue-300 border-blue-500/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span>Cricket &amp; Standings Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Points Table &amp; Standings Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage league standings independently for IPL, SA20, and MLC. Editing one tournament will never overwrite the others.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={currentTournamentMeta.liveUrl}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View {currentTournamentMeta.code} Live Page</span>
          </Link>

          <button
            type="button"
            onClick={handleAutoSort}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-xs font-bold transition border border-blue-500/30 cursor-pointer"
            title="Auto sort teams by Points (PTS) and Net Run Rate (NRR)"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Auto-Sort by PTS &amp; NRR</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddTeam}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-400 rounded-xl text-xs font-bold transition border border-yellow-500/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Team</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-yellow-500/10 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : `Save ${currentTournamentMeta.code} Table (${standings.length})`}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOURNAMENT TABS SWITCHER (IPL, SA20, MLC)
          Ensures absolute isolation between CSK (IPL), JSK (SA20), and TSK (MLC)
         ========================================================================= */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
          <span>Select Tournament / Franchise to Manage</span>
          <span className="text-yellow-400">Independent League Data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TOURNAMENTS.map((t) => {
            const isActive = selectedTournament === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTournament(t.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-950 border-yellow-400/80 shadow-md shadow-yellow-500/5 ring-1 ring-yellow-400/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${t.badge}`}>
                    {t.code}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>{t.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{t.subtitle}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                    isActive ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isActive ? 'Active Tab' : 'Switch'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions & Reset Toolbar */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Quick Actions for <strong className="text-white">{selectedTournament}</strong>:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-500/30 font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Load Official {currentTournamentMeta.code} Franchises</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-400 text-slate-950 font-black">
              {currentTournamentMeta.targetCount}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddTeam}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-yellow-400" />
            <span>+ Add Extra Team (No 5-team limit)</span>
          </button>
        </div>
      </div>

      {/* Editor Table */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {selectedTournament} Standings Table Editor
            </span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px] font-black">
              {standings.length} Teams Configured
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAutoSort}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Auto-Sort by PTS</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Total Teams: <strong className="text-yellow-400 font-bold">{standings.length}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-yellow-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 text-center w-14">POS</th>
                <th className="py-3 px-4 min-w-[240px]">FRANCHISE / TEAM NAME</th>
                <th className="py-3 px-3 text-center w-20">PLAYED (P)</th>
                <th className="py-3 px-3 text-center w-20">WON (W)</th>
                <th className="py-3 px-3 text-center w-20">LOST (L)</th>
                <th className="py-3 px-3 text-center w-24">NRR</th>
                <th className="py-3 px-4 text-center w-24 font-black">POINTS</th>
                <th className="py-3 px-3 text-center w-24">LEADER BADGE</th>
                <th className="py-3 px-3 text-center w-20">ORDER</th>
                <th className="py-3 px-3 text-center w-14">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Loading {selectedTournament} standings...
                  </td>
                </tr>
              ) : standings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No teams in this table. Click "+ Add Team" or "Load Official Franchises" above.
                  </td>
                </tr>
              ) : (
                standings.map((row, idx) => {
                  const logo = getTeamLogo(row.team || row.shortName);
                  const isLeader = row.isLeader || idx === 0;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isLeader ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      {/* Position Badge (Yellow Circular Badge matching standard) */}
                      <td className="py-3 px-3 text-center">
                        <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black bg-yellow-400 text-slate-950 shadow-xs">
                          {row.pos || idx + 1}
                        </span>
                      </td>

                      {/* Team Selection: Sleek, Clickable Franchise Pill with Official Crest */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTeam(idx)}
                          className="w-full flex items-center justify-between gap-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-yellow-400/50 rounded-xl px-3 py-2 text-left group transition cursor-pointer"
                          title="Click to change team"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 p-1 group-hover:border-yellow-400/30">
                              {logo ? (
                                <img
                                  src={logo}
                                  alt={row.team}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Shield className="w-3.5 h-3.5 text-slate-600" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-white group-hover:text-yellow-400 transition truncate">
                                {row.team || 'Select Franchise...'}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className="px-1 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                                  {row.shortName || 'CODE'}
                                </span>
                                <span>&bull;</span>
                                <span className="text-yellow-400/80 font-medium group-hover:underline">
                                  Change Team
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition flex-shrink-0" />
                        </button>
                      </td>

                      {/* Played */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={row.played ?? 0}
                          onChange={(e) => handleChange(idx, 'played', parseInt(e.target.value, 10) || 0)}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-yellow-400/50"
                        />
                      </td>

                      {/* Won */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={row.won ?? 0}
                          onChange={(e) => handleChange(idx, 'won', parseInt(e.target.value, 10) || 0)}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-emerald-400 text-center font-bold focus:outline-none focus:border-yellow-400/50"
                        />
                      </td>

                      {/* Lost */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={row.lost ?? 0}
                          onChange={(e) => handleChange(idx, 'lost', parseInt(e.target.value, 10) || 0)}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-red-400 text-center font-bold focus:outline-none focus:border-yellow-400/50"
                        />
                      </td>

                      {/* NRR */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="text"
                          value={row.nrr || '+0.000'}
                          onChange={(e) => handleChange(idx, 'nrr', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 text-center font-mono focus:outline-none focus:border-yellow-400/50"
                          placeholder="+0.000"
                        />
                      </td>

                      {/* Points (PTS) */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          value={row.pts ?? 0}
                          onChange={(e) => handleChange(idx, 'pts', parseInt(e.target.value, 10) || 0)}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-yellow-400"
                        />
                      </td>

                      {/* Leader Badge */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleChange(idx, 'isLeader', !row.isLeader)}
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition cursor-pointer ${
                            row.isLeader
                              ? 'bg-yellow-400 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {row.isLeader ? 'Leader' : 'Set Leader'}
                        </button>
                      </td>

                      {/* Move Up / Down */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveRow(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRow(idx, 1)}
                            disabled={idx === standings.length - 1}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Delete Row */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                          title="Delete Team Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAddTeam}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shadow-yellow-500/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Team (Row #{standings.length + 1})</span>
            </button>

            <button
              type="button"
              onClick={handleAutoSort}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 text-xs font-bold transition cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Auto-Sort by PTS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition shadow-md shadow-yellow-500/10 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : `Save ${currentTournamentMeta.code} Points Table`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Site Preview Widget */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Preview (How it appears to website visitors on {currentTournamentMeta.liveUrl} &bull; {standings.length} Teams)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {selectedTournament}
          </span>
        </div>

        <div className="sports-card rounded-2xl border border-slate-700/60 overflow-hidden bg-slate-950/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-yellow-400 uppercase text-[11px] font-black tracking-wider border-b border-white/10">
                  <th className="py-3 px-4 w-16 text-center">POS</th>
                  <th className="py-3 px-4">TEAM</th>
                  <th className="py-3 px-3 text-center">P</th>
                  <th className="py-3 px-3 text-center">W</th>
                  <th className="py-3 px-3 text-center">L</th>
                  <th className="py-3 px-3 text-center">NRR</th>
                  <th className="py-3 px-4 text-center font-extrabold text-yellow-400">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                {standings.map((row, i) => {
                  const isLeader = row.isLeader || i === 0;
                  const logo = getTeamLogo(row.team);
                  return (
                    <tr
                      key={i}
                      className={isLeader ? 'bg-yellow-500/10 font-bold text-white' : ''}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black bg-yellow-400 text-slate-950 shadow-xs">
                          {row.pos || i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          {logo && (
                            <img
                              src={logo}
                              alt={row.team}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span>{row.team}</span>
                          {isLeader && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-yellow-400 text-slate-950">
                              LEADER
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{row.played}</td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-mono">{row.won}</td>
                      <td className="py-3 px-3 text-center text-red-400 font-mono">{row.lost}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{row.nrr}</td>
                      <td className="py-3 px-4 text-center font-bold text-yellow-400 font-mono">{row.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CUSTOM TEAM PICKER MODAL
          Resolves all franchise selection issues with clean searchable cards
         ========================================================================= */}
      {pickerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>
                    {pickerModal.mode === 'add' ? 'Add Team to Standings' : `Change Row #${pickerModal.targetIndex + 1} Franchise`}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select an official league franchise with high-resolution crest, or type a custom team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Controls: Search & Category Filter */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={pickerModal.searchQuery}
                  onChange={(e) =>
                    setPickerModal((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder="Search franchise (e.g. CSK, Mumbai, JSK, Royals, Knight Riders)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  {['IPL', 'SA20', 'MLC', 'ALL'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setPickerModal((prev) => ({ ...prev, category: cat, customMode: false }))
                      }
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                        pickerModal.category === cat && !pickerModal.customMode
                          ? 'bg-yellow-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Franchises (22)' : cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPickerModal((prev) => ({ ...prev, customMode: !prev.customMode }))
                  }
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer ${
                    pickerModal.customMode
                      ? 'bg-yellow-400 text-slate-950'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  + Enter Custom Name
                </button>
              </div>
            </div>

            {/* Modal Body: Custom Name Mode OR Franchises Grid */}
            <div className="p-4 overflow-y-auto flex-1">
              {pickerModal.customMode ? (
                <form onSubmit={handleApplyCustomTeam} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">
                      Enter Custom Team Details
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Use this for non-franchise teams, exhibition matches, or touring sides.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Full Team Name
                      </label>
                      <input
                        type="text"
                        required
                        value={pickerModal.customName}
                        onChange={(e) =>
                          setPickerModal((prev) => ({ ...prev, customName: e.target.value }))
                        }
                        placeholder="e.g. Tamil Nadu XI"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Short Code (2-4 letters)
                      </label>
                      <input
                        type="text"
                        value={pickerModal.customShort}
                        onChange={(e) =>
                          setPickerModal((prev) => ({ ...prev, customShort: e.target.value.toUpperCase() }))
                        }
                        placeholder="e.g. TN"
                        maxLength={5}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPickerModal((prev) => ({ ...prev, customMode: false }))}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-yellow-400 text-slate-950 text-xs font-bold hover:bg-yellow-300"
                    >
                      Apply Custom Team
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredFranchises.map((f) => {
                    const isAlreadyAdded = existingTeamNames.has(f.name.toLowerCase().trim());
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFranchise(f)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-yellow-400/50 transition cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-105 transition">
                            <img
                              src={f.logo}
                              alt={f.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-yellow-400 transition truncate">
                              {f.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span className="px-1 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                                {f.short}
                              </span>
                              <span>&bull;</span>
                              <span className="text-slate-400">{f.tournament}</span>
                            </div>
                          </div>
                        </div>

                        {isAlreadyAdded ? (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                            Added
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-yellow-400/80 group-hover:text-yellow-400">
                            Select &rarr;
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
