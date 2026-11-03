'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Flame,
  Target,
  Award,
  Zap,
  Shield,
  RotateCcw,
} from 'lucide-react';
import defaultStatsData from '../../../data/franchiseStatsData.json';

const FRANCHISES = [
  { code: 'CSK', name: 'Chennai Super Kings (IPL)', badge: 'bg-yellow-400 text-slate-950', border: 'border-yellow-400/40' },
  { code: 'JSK', name: 'Joburg Super Kings (SA20)', badge: 'bg-emerald-500 text-slate-950', border: 'border-emerald-500/40' },
  { code: 'TSK', name: 'Texas Super Kings (MLC)', badge: 'bg-blue-500 text-white', border: 'border-blue-500/40' },
];

export default function AdminFranchiseStatsManager() {
  const [selectedFranchise, setSelectedFranchise] = useState('CSK');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'batting' | 'bowling' | 'records'
  const [franchiseData, setFranchiseData] = useState(defaultStatsData[selectedFranchise] || {});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStats = async (franchiseCode) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/franchise-stats/?franchise=${franchiseCode}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      if (json.data) {
        setFranchiseData(json.data);
      } else {
        setFranchiseData(defaultStatsData[franchiseCode] || {});
      }
    } catch (err) {
      setFranchiseData(defaultStatsData[franchiseCode] || {});
      showToast('error', `Loaded fallback ${franchiseCode} stats`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedFranchise);
  }, [selectedFranchise]);

  // Overview change
  const handleOverviewChange = (field, val) => {
    setFranchiseData((prev) => ({
      ...prev,
      overview: {
        ...(prev.overview || {}),
        [field]: val,
      },
    }));
  };

  // Batting change
  const handleBattingChange = (idx, field, val) => {
    setFranchiseData((prev) => {
      const updated = [...(prev.batting || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, batting: updated };
    });
  };

  const handleAddBatter = () => {
    setFranchiseData((prev) => {
      const nextRank = (prev.batting?.length || 0) + 1;
      return {
        ...prev,
        batting: [
          ...(prev.batting || []),
          {
            rank: nextRank,
            player: 'Player Name',
            matches: 0,
            innings: 0,
            runs: 0,
            avg: '0.00',
            sr: '0.00',
            fifties: 0,
            hundreds: 0,
            high: '0',
          },
        ],
      };
    });
  };

  const handleRemoveBatter = (idx) => {
    setFranchiseData((prev) => {
      const filtered = (prev.batting || []).filter((_, i) => i !== idx);
      return { ...prev, batting: filtered.map((b, i) => ({ ...b, rank: i + 1 })) };
    });
  };

  // Bowling change
  const handleBowlingChange = (idx, field, val) => {
    setFranchiseData((prev) => {
      const updated = [...(prev.bowling || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, bowling: updated };
    });
  };

  const handleAddBowler = () => {
    setFranchiseData((prev) => {
      const nextRank = (prev.bowling?.length || 0) + 1;
      return {
        ...prev,
        bowling: [
          ...(prev.bowling || []),
          {
            rank: nextRank,
            player: 'Bowler Name',
            matches: 0,
            innings: 0,
            wickets: 0,
            avg: '0.00',
            econ: '0.00',
            best: '0/0',
            fourWkts: 0,
          },
        ],
      };
    });
  };

  const handleRemoveBowler = (idx) => {
    setFranchiseData((prev) => {
      const filtered = (prev.bowling || []).filter((_, i) => i !== idx);
      return { ...prev, bowling: filtered.map((b, i) => ({ ...b, rank: i + 1 })) };
    });
  };

  // Records change
  const handleRecordChange = (idx, field, val) => {
    setFranchiseData((prev) => {
      const updated = [...(prev.records || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, records: updated };
    });
  };

  const handleAddRecord = () => {
    setFranchiseData((prev) => ({
      ...prev,
      records: [
        ...(prev.records || []),
        {
          title: 'New Milestone',
          value: '0',
          details: 'Match and opponent details',
        },
      ],
    }));
  };

  const handleRemoveRecord = (idx) => {
    setFranchiseData((prev) => ({
      ...prev,
      records: (prev.records || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/franchise-stats/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchise: selectedFranchise,
          overview: franchiseData.overview,
          batting: franchiseData.batting,
          bowling: franchiseData.bowling,
          records: franchiseData.records,
          teamName: franchiseData.teamName,
          league: franchiseData.league,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save stats');
      }
      showToast('success', `${selectedFranchise} Statistics & Leaderboards updated!`);
    } catch (err) {
      showToast('error', err.message || 'Error saving stats');
    } finally {
      setSaving(false);
    }
  };

  const livePageHref =
    selectedFranchise === 'JSK'
      ? '/joburg-super-kings'
      : selectedFranchise === 'TSK'
      ? '/texas-super-kings'
      : '/chennai-super-kings';

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
            <TrendingUp className="w-4 h-4" />
            <span>Cricket Analytics &amp; Leaderboards</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Franchise Stats &amp; Records Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Update franchise all-time KPI records, batting leaderboards, bowling figures, and milestones for CSK, JSK, and TSK. Changes appear in the bottom section of each franchise hub.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={livePageHref}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View {selectedFranchise} Page</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-yellow-500/10 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : `Save ${selectedFranchise} Stats`}</span>
          </button>
        </div>
      </div>

      {/* Franchise Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FRANCHISES.map((f) => (
          <button
            key={f.code}
            type="button"
            onClick={() => setSelectedFranchise(f.code)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
              selectedFranchise === f.code
                ? `${f.badge} shadow-md`
                : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Section Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Overview KPI Cards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'batting'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Batting Leaderboard ({franchiseData.batting?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bowling')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'bowling'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bowling Leaderboard ({franchiseData.bowling?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'records'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Team Milestones ({franchiseData.records?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            {selectedFranchise} 6 Franchise Overview Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Total Matches</label>
              <input
                type="number"
                value={franchiseData.overview?.totalMatches ?? 0}
                onChange={(e) => handleOverviewChange('totalMatches', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-black"
              />
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Matches Won</label>
              <input
                type="number"
                value={franchiseData.overview?.wins ?? 0}
                onChange={(e) => handleOverviewChange('wins', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-emerald-400 font-black"
              />
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Titles / Silverware</label>
              <input
                type="text"
                value={franchiseData.overview?.titles || ''}
                onChange={(e) => handleOverviewChange('titles', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-yellow-400 font-black"
                placeholder="5x or 3x Semis"
              />
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Finals / Semis Played</label>
              <input
                type="text"
                value={franchiseData.overview?.finalsPlayed ?? ''}
                onChange={(e) => handleOverviewChange('finalsPlayed', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-black"
              />
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Win Rate</label>
              <input
                type="text"
                value={franchiseData.overview?.winRate || ''}
                onChange={(e) => handleOverviewChange('winRate', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-black"
                placeholder="58.4%"
              />
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Home Fortress Win Rate</label>
              <input
                type="text"
                value={franchiseData.overview?.fortressWinRate || ''}
                onChange={(e) => handleOverviewChange('fortressWinRate', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-yellow-400 font-black"
                placeholder="71.2%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Batting Leaderboard */}
      {activeTab === 'batting' && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {selectedFranchise} Batting Records &amp; Run Scorers
            </h2>
            <button
              type="button"
              onClick={handleAddBatter}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Batter</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-3 w-20 text-center">Matches</th>
                  <th className="py-3 px-3 w-20 text-center">Innings</th>
                  <th className="py-3 px-4 w-24 text-right text-yellow-400 font-bold">Runs</th>
                  <th className="py-3 px-3 w-20 text-right">Avg</th>
                  <th className="py-3 px-3 w-20 text-right">SR</th>
                  <th className="py-3 px-3 w-16 text-center">50s</th>
                  <th className="py-3 px-3 w-16 text-center">100s</th>
                  <th className="py-3 px-3 w-20 text-right">HS</th>
                  <th className="py-3 px-3 w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {(franchiseData.batting || []).map((b, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-bold">{b.rank || i + 1}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={b.player || ''}
                        onChange={(e) => handleBattingChange(i, 'player', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.matches ?? 0}
                        onChange={(e) => handleBattingChange(i, 'matches', parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.innings ?? 0}
                        onChange={(e) => handleBattingChange(i, 'innings', parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={b.runs ?? 0}
                        onChange={(e) => handleBattingChange(i, 'runs', parseInt(e.target.value, 10) || 0)}
                        className="w-20 bg-slate-950 border border-yellow-500/30 rounded px-2 py-1 text-right text-yellow-400 font-black"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={b.avg || '0.00'}
                        onChange={(e) => handleBattingChange(i, 'avg', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={b.sr || '0.00'}
                        onChange={(e) => handleBattingChange(i, 'sr', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.fifties ?? 0}
                        onChange={(e) => handleBattingChange(i, 'fifties', parseInt(e.target.value, 10) || 0)}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.hundreds ?? 0}
                        onChange={(e) => handleBattingChange(i, 'hundreds', parseInt(e.target.value, 10) || 0)}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={b.high || '0'}
                        onChange={(e) => handleBattingChange(i, 'high', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveBatter(i)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Bowling Leaderboard */}
      {activeTab === 'bowling' && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {selectedFranchise} Bowling Records &amp; Wicket Takers
            </h2>
            <button
              type="button"
              onClick={handleAddBowler}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bowler</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-4">Bowler Name</th>
                  <th className="py-3 px-3 w-20 text-center">Matches</th>
                  <th className="py-3 px-3 w-20 text-center">Innings</th>
                  <th className="py-3 px-4 w-24 text-right text-yellow-400 font-bold">Wickets</th>
                  <th className="py-3 px-3 w-20 text-right">Avg</th>
                  <th className="py-3 px-3 w-20 text-right">Econ</th>
                  <th className="py-3 px-3 w-20 text-center">Best</th>
                  <th className="py-3 px-3 w-16 text-center">4w Hauls</th>
                  <th className="py-3 px-3 w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {(franchiseData.bowling || []).map((b, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-bold">{b.rank || i + 1}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={b.player || ''}
                        onChange={(e) => handleBowlingChange(i, 'player', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.matches ?? 0}
                        onChange={(e) => handleBowlingChange(i, 'matches', parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.innings ?? 0}
                        onChange={(e) => handleBowlingChange(i, 'innings', parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={b.wickets ?? 0}
                        onChange={(e) => handleBowlingChange(i, 'wickets', parseInt(e.target.value, 10) || 0)}
                        className="w-20 bg-slate-950 border border-yellow-500/30 rounded px-2 py-1 text-right text-yellow-400 font-black"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={b.avg || '0.00'}
                        onChange={(e) => handleBowlingChange(i, 'avg', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={b.econ || '0.00'}
                        onChange={(e) => handleBowlingChange(i, 'econ', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={b.best || '0/0'}
                        onChange={(e) => handleBowlingChange(i, 'best', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={b.fourWkts ?? 0}
                        onChange={(e) => handleBowlingChange(i, 'fourWkts', parseInt(e.target.value, 10) || 0)}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-white"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveBowler(i)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Team Milestones */}
      {activeTab === 'records' && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {selectedFranchise} Milestones &amp; Records Cards
            </h2>
            <button
              type="button"
              onClick={handleAddRecord}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(franchiseData.records || []).map((rec, i) => (
              <div key={i} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveRecord(i)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Record Title</label>
                  <input
                    type="text"
                    value={rec.title || ''}
                    onChange={(e) => handleRecordChange(i, 'title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold"
                    placeholder="e.g. Highest Team Total"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Record Value</label>
                  <input
                    type="text"
                    value={rec.value || ''}
                    onChange={(e) => handleRecordChange(i, 'value', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-yellow-400 font-black"
                    placeholder="e.g. 246/5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Match Details / Opponent</label>
                  <input
                    type="text"
                    value={rec.details || ''}
                    onChange={(e) => handleRecordChange(i, 'details', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300"
                    placeholder="vs RR at Chepauk (2010)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
