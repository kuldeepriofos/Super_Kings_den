'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Sparkles,
  BookOpen,
  User,
  Shield,
  Zap,
  Target,
  Trophy,
  Award,
  FileText,
  Plus,
  Check,
  X,
} from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';
import RichTextEditor from './RichTextEditor';

const EMPTY_PLAYER = {
  name: '',
  fullName: '',
  slug: '',
  tag: '',
  role: 'Batter',
  jersey: '',
  category: 'Indian Player',
  franchise: 'CSK',
  franchises: ['CSK'],
  country: 'India',
  born: '',
  iplDebut: '',
  era: '2026–present',
  specialty: '',
  battingStyle: 'Right-hand bat',
  bowlingStyle: '',
  matches: 0,
  innings: 0,
  runs: 0,
  highestScore: '0',
  average: 0,
  strikeRate: 0,
  fifties: 0,
  hundreds: 0,
  fours: 0,
  sixes: 0,
  wickets: 0,
  bestBowling: '',
  economy: 0,
  bowlingAverage: 0,
  fourWickets: 0,
  catches: 0,
  stumpings: 0,
  isLegend: false,
  isCurrent: true,
  avatar: '',
  trophies: [],
  honors: [],
  bio: '',
  content: '',
};

export default function PlayerEditorForm({ initialPlayer, isCreating = false }) {
  const router = useRouter();
  const [player, setPlayer] = useState(() => {
    const p = initialPlayer || { ...EMPTY_PLAYER, trophies: [], honors: [] };
    const franchises = Array.isArray(p.franchises) && p.franchises.length > 0
      ? p.franchises
      : [p.franchise || 'CSK'];
    return { ...p, franchises, franchise: p.franchise || franchises[0] || 'CSK' };
  });
  const [activeTab, setActiveTab] = useState('identity');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // New Trophy / Honor input states
  const [newTrophyInput, setNewTrophyInput] = useState('');
  const [newHonorInput, setNewHonorInput] = useState('');

  const handleAddTrophy = (customTitle = null) => {
    const t = (customTitle || newTrophyInput).trim();
    if (!t) return;
    const current = Array.isArray(player.trophies) ? player.trophies : [];
    if (!current.includes(t)) {
      setPlayer({ ...player, trophies: [...current, t] });
    }
    if (!customTitle) setNewTrophyInput('');
  };

  const handleRemoveTrophy = (index) => {
    const current = Array.isArray(player.trophies) ? player.trophies : [];
    setPlayer({ ...player, trophies: current.filter((_, i) => i !== index) });
  };

  const handleAddHonor = (customHonor = null) => {
    const h = (customHonor || newHonorInput).trim();
    if (!h) return;
    const current = Array.isArray(player.honors) ? player.honors : [];
    if (!current.includes(h)) {
      setPlayer({ ...player, honors: [...current, h] });
    }
    if (!customHonor) setNewHonorInput('');
  };

  const handleRemoveHonor = (index) => {
    const current = Array.isArray(player.honors) ? player.honors : [];
    setPlayer({ ...player, honors: current.filter((_, i) => i !== index) });
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!player.name || !player.name.trim()) {
      setMessage({ type: 'error', text: 'Player Display Name is required!' });
      setActiveTab('identity');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...player,
        name: player.name.trim(),
        fullName: (player.fullName || player.name).trim(),
        slug: (player.slug || player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim(),
        franchise: player.franchise || (Array.isArray(player.franchises) && player.franchises[0]) || 'CSK',
        franchises: Array.isArray(player.franchises) && player.franchises.length > 0 ? player.franchises : [player.franchise || 'CSK'],
        matches: Number(player.matches) || 0,
        innings: Number(player.innings) || 0,
        runs: Number(player.runs) || 0,
        average: Number(player.average) || 0,
        strikeRate: Number(player.strikeRate) || 0,
        fifties: Number(player.fifties) || 0,
        hundreds: Number(player.hundreds) || 0,
        fours: Number(player.fours) || 0,
        sixes: Number(player.sixes) || 0,
        wickets: Number(player.wickets) || 0,
        economy: Number(player.economy) || 0,
        bowlingAverage: Number(player.bowlingAverage) || 0,
        fourWickets: Number(player.fourWickets) || 0,
        catches: Number(player.catches) || 0,
        stumpings: Number(player.stumpings) || 0,
      };

      const url = isCreating
        ? '/api/admin/players/'
        : `/api/admin/players/${player._id || player.id || player.slug}/`;
      const method = isCreating ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save player');
      }

      setMessage({
        type: 'success',
        text: isCreating
          ? `Player "${payload.name}" successfully created!`
          : `Changes to "${payload.name}" saved successfully!`,
      });

      if (isCreating && (data.player?._id || data.player?.slug)) {
        setTimeout(() => {
          router.push(`/admin/players/${data.player.slug || data.player._id}/`);
        }, 800);
      } else if (data.player) {
        setPlayer(data.player);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error saving player' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!player._id && !player.id && !player.slug) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/players/${player._id || player.id || player.slug}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete player');
      }
      router.push('/admin/players/');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error deleting player' });
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ─── TOP ACTION BAR & BREADCRUMB ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              href="/admin/players/"
              className="text-slate-400 hover:text-yellow-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Roster Directory</span>
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold truncate max-w-xs">
              {isCreating ? 'New Player' : player.name || 'Edit Player'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight flex items-center gap-2">
              <span>{isCreating ? 'Add New Player to Squad' : `Edit: ${player.name}`}</span>
              {player.tag && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {player.tag}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isCreating && player.slug && (
            <Link
              href={`/${player.slug}/`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Open public profile in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">View Public Profile</span>
            </Link>
          )}

          {!isCreating && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold transition"
              title="Delete player from database"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isCreating ? 'Create Player' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* ─── NOTIFICATION TOAST ALERT ─── */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/70 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span className="font-semibold text-sm">{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── NAVIGATION TABS BAR ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'identity'
              ? 'bg-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Identity &amp; Photo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'story'
              ? 'bg-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Career Story &amp; Tables</span>
          {Boolean(player.content) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Has rich story and season tables" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roster'
              ? 'bg-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Roster &amp; Attributes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batting')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'batting'
              ? 'bg-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Batting &amp; Fielding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bowling')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bowling'
              ? 'bg-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Bowling Records</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('honors')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'honors'
              ? 'bg-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Trophies &amp; Honors</span>
          {((player.trophies?.length || 0) + (player.honors?.length || 0)) > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-mono">
              {(player.trophies?.length || 0) + (player.honors?.length || 0)}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB CONTENT PANELS ─── */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ──────── TAB 1: IDENTITY & PHOTO ──────── */}
        {activeTab === 'identity' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Cutout Photo Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-36 rounded-2xl bg-slate-950 border-2 border-slate-700/80 overflow-hidden flex items-end justify-center flex-shrink-0 p-1 relative shadow-inner">
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-auto h-full max-h-36 object-contain object-bottom filter drop-shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                    <User className="w-10 h-10 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 w-full text-center md:text-left">
                <div>
                  <h3 className="text-base font-bold text-white">Player Photo Cutout</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transparent PNG standing cutout or portrait used on the sports hero cards and squad showcase.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMediaModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow transition cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-950" />
                    <span>Select Photo from Media Library</span>
                  </button>
                  {player.avatar && (
                    <button
                      type="button"
                      onClick={() => setPlayer({ ...player, avatar: '' })}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-xs font-semibold transition cursor-pointer border border-slate-700"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={player.avatar || ''}
                  onChange={(e) => setPlayer({ ...player, avatar: e.target.value })}
                  placeholder="Direct image path e.g. /players/ms-dhoni.png or /uploads/2026/06/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Names & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={player.name || ''}
                  onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                  placeholder="e.g. MS Dhoni"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-bold outline-none focus:border-yellow-400"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  value={player.fullName || ''}
                  onChange={(e) => setPlayer({ ...player, fullName: e.target.value })}
                  placeholder="e.g. Mahendra Singh Dhoni"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">URL Slug (Permalink)</label>
                <input
                  type="text"
                  value={player.slug || ''}
                  onChange={(e) => setPlayer({ ...player, slug: e.target.value })}
                  placeholder="e.g. ms-dhoni"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-yellow-300 font-mono font-bold outline-none focus:border-yellow-400"
                />
                <div className="text-[11px] text-slate-500 mt-1 truncate">
                  superkingsden.com/{player.slug || 'player-slug'}/
                </div>
              </div>
            </div>

            {/* Tag, Era & Specialty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-bold text-yellow-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Special Dynamic Tag</span>
                </label>
                <input
                  type="text"
                  value={player.tag || ''}
                  onChange={(e) => setPlayer({ ...player, tag: e.target.value })}
                  placeholder="e.g. Thala, Chinna Thala, Captain, Sixer King"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-yellow-300 font-black outline-none focus:border-yellow-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Displayed across cards &amp; profile badge</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Franchise Era</label>
                <input
                  type="text"
                  value={player.era || ''}
                  onChange={(e) => setPlayer({ ...player, era: e.target.value })}
                  placeholder="e.g. 2008–present"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Signature Impact / Specialty</label>
                <input
                  type="text"
                  value={player.specialty || ''}
                  onChange={(e) => setPlayer({ ...player, specialty: e.target.value })}
                  placeholder="e.g. 5x IPL Champion Captain & Finisher"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Highlight Summary Quote */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Highlight Summary Quote (Golden Callout Box)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('story')}
                  className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Career Chronicles Editor &rarr;</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={player.bio || ''}
                onChange={(e) => setPlayer({ ...player, bio: e.target.value })}
                placeholder="Highlight quote shown in callout card e.g. MS Dhoni, affectionately known as 'Thala' by the legion of CSK fans..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-yellow-100 outline-none focus:border-yellow-400 resize-y leading-relaxed italic placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* ──────── TAB 2: CAREER STORY & TABLES ──────── */}
        {activeTab === 'story' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Full Story & Season Tables Editor */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <span>In-Depth Career Chronicles &amp; Season Stats Table</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Full biographical paragraphs, match-winning milestones, and year-by-year tournament stats tables shown on the player page.
                  </p>
                </div>
              </div>

              <RichTextEditor
                value={player.content || ''}
                onChange={(newHtml) => setPlayer({ ...player, content: newHtml })}
                onOpenMedia={() => setMediaModalOpen(true)}
                placeholder="Write player biography, paragraphs, records, and season-by-season tables..."
              />
            </div>
          </div>
        )}

        {/* ──────── TAB 3: ROSTER & ATTRIBUTES ──────── */}
        {activeTab === 'roster' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
              {/* Super Kings Teams Assignment (Multi-team capable) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider">
                      Super Kings Franchises (Team Assignment)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Select which Super Kings team(s) this player belongs to. A player can represent CSK, JSK, and TSK simultaneously.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Primary:</span>
                    <select
                      value={player.franchise || 'CSK'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const current = player.franchises || [player.franchise || 'CSK'];
                        const nextFranchises = current.includes(val) ? current : [...current, val];
                        setPlayer({ ...player, franchise: val, franchises: nextFranchises });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-yellow-400 outline-none focus:border-yellow-400 cursor-pointer"
                    >
                      <option value="CSK">CSK (Chennai)</option>
                      <option value="JSK">JSK (Joburg)</option>
                      <option value="TSK">TSK (Texas)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'CSK', label: 'Chennai Super Kings (IPL)', activeClass: 'border-yellow-400 bg-yellow-400/20 text-yellow-300 font-black' },
                    { id: 'JSK', label: 'Joburg Super Kings (SA20)', activeClass: 'border-emerald-400 bg-emerald-400/20 text-emerald-300 font-black' },
                    { id: 'TSK', label: 'Texas Super Kings (MLC)', activeClass: 'border-blue-400 bg-blue-400/20 text-blue-300 font-black' },
                  ].map((f) => {
                    const isSelected = (player.franchises || [player.franchise || 'CSK']).includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          const current = player.franchises || [player.franchise || 'CSK'];
                          const updated = isSelected
                            ? current.filter((x) => x !== f.id)
                            : [...current, f.id];
                          const finalFranchises = updated.length > 0 ? updated : [f.id];
                          setPlayer({
                            ...player,
                            franchises: finalFranchises,
                            franchise: finalFranchises.includes(player.franchise) ? player.franchise : finalFranchises[0],
                          });
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                          isSelected
                            ? f.activeClass
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : 'bg-slate-600'}`} />
                        <span>{f.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Playing Role</label>
                  <select
                    value={player.role || 'Batter'}
                    onChange={(e) => setPlayer({ ...player, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="Batter">Batter</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                    <option value="Wicketkeeper Batter">Wicketkeeper Batter</option>
                    <option value="Spin All-Rounder">Spin All-Rounder</option>
                    <option value="Pace All-Rounder">Pace All-Rounder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Category (Cohort)</label>
                  <select
                    value={player.category || 'Indian Player'}
                    onChange={(e) => setPlayer({ ...player, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="Indian Player">Indian Player</option>
                    <option value="Overseas Player">Overseas Player</option>
                    <option value="WK">WK</option>
                    <option value="Batter">Batter</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Jersey Number</label>
                  <input
                    type="text"
                    value={player.jersey ?? ''}
                    onChange={(e) => setPlayer({ ...player, jersey: e.target.value })}
                    placeholder="e.g. 7"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-yellow-300 font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Country / Nationality</label>
                  <input
                    type="text"
                    value={player.country || 'India'}
                    onChange={(e) => setPlayer({ ...player, country: e.target.value })}
                    placeholder="e.g. India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Batting Style</label>
                  <input
                    type="text"
                    value={player.battingStyle || ''}
                    onChange={(e) => setPlayer({ ...player, battingStyle: e.target.value })}
                    placeholder="e.g. Right-hand bat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Bowling Style</label>
                  <input
                    type="text"
                    value={player.bowlingStyle || ''}
                    onChange={(e) => setPlayer({ ...player, bowlingStyle: e.target.value })}
                    placeholder="e.g. Right-arm medium"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">IPL Debut Year</label>
                  <input
                    type="text"
                    value={player.iplDebut || ''}
                    onChange={(e) => setPlayer({ ...player, iplDebut: e.target.value })}
                    placeholder="e.g. 2008"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Birth Date &amp; Place</label>
                <input
                  type="text"
                  value={player.born || ''}
                  onChange={(e) => setPlayer({ ...player, born: e.target.value })}
                  placeholder="e.g. July 7, 1981 (Ranchi, Jharkhand)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                />
              </div>

              {/* Status Toggles */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Active Squad Placement &amp; Hall of Fame Status
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(player.isCurrent)}
                      onChange={(e) => setPlayer({ ...player, isCurrent: e.target.checked })}
                      className="w-5 h-5 mt-0.5 rounded bg-slate-950 border-slate-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black text-white block">Current Squad Member (Active Season)</span>
                      <span className="text-[11px] text-slate-400">
                        Player will appear in /csk-team and active roster showcases.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(player.isLegend)}
                      onChange={(e) => setPlayer({ ...player, isLegend: e.target.checked })}
                      className="w-5 h-5 mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-amber-400 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black text-amber-300 block">Franchise Legend (Hall of Fame)</span>
                      <span className="text-[11px] text-slate-400">
                        Player will appear with Legend banner in directory and legends showcases.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB 4: BATTING & FIELDING ──────── */}
        {activeTab === 'batting' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Batting &amp; Fielding Key Metrics</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Matches</label>
                  <input
                    type="number"
                    value={player.matches ?? 0}
                    onChange={(e) => setPlayer({ ...player, matches: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Innings Batted</label>
                  <input
                    type="number"
                    value={player.innings ?? 0}
                    onChange={(e) => setPlayer({ ...player, innings: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-yellow-400 mb-1">IPL Runs</label>
                  <input
                    type="number"
                    value={player.runs ?? 0}
                    onChange={(e) => setPlayer({ ...player, runs: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-yellow-300 font-mono font-black outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Highest Score</label>
                  <input
                    type="text"
                    value={player.highestScore || '0'}
                    onChange={(e) => setPlayer({ ...player, highestScore: e.target.value })}
                    placeholder="e.g. 84*"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Batting Average</label>
                  <input
                    type="number"
                    step="0.01"
                    value={player.average ?? 0}
                    onChange={(e) => setPlayer({ ...player, average: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Strike Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={player.strikeRate ?? 0}
                    onChange={(e) => setPlayer({ ...player, strikeRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Centuries (100s)</label>
                  <input
                    type="number"
                    value={player.hundreds ?? 0}
                    onChange={(e) => setPlayer({ ...player, hundreds: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Fifties (50s)</label>
                  <input
                    type="number"
                    value={player.fifties ?? 0}
                    onChange={(e) => setPlayer({ ...player, fifties: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Fours (4s)</label>
                  <input
                    type="number"
                    value={player.fours ?? 0}
                    onChange={(e) => setPlayer({ ...player, fours: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Sixes (6s)</label>
                  <input
                    type="number"
                    value={player.sixes ?? 0}
                    onChange={(e) => setPlayer({ ...player, sixes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Fielding Catches</label>
                  <input
                    type="number"
                    value={player.catches ?? 0}
                    onChange={(e) => setPlayer({ ...player, catches: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">WK Stumpings</label>
                  <input
                    type="number"
                    value={player.stumpings ?? 0}
                    onChange={(e) => setPlayer({ ...player, stumpings: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB 5: BOWLING RECORDS ──────── */}
        {activeTab === 'bowling' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Bowling &amp; Delivery Key Metrics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-emerald-400 mb-1.5">Total Wickets</label>
                  <input
                    type="number"
                    value={player.wickets ?? 0}
                    onChange={(e) => setPlayer({ ...player, wickets: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-base text-emerald-300 font-mono font-black outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Best Bowling in Innings (BBI)</label>
                  <input
                    type="text"
                    value={player.bestBowling || ''}
                    onChange={(e) => setPlayer({ ...player, bestBowling: e.target.value })}
                    placeholder="e.g. 5/16 or 4/10"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Economy Rate (RPO)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={player.economy ?? 0}
                    onChange={(e) => setPlayer({ ...player, economy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Bowling Average</label>
                  <input
                    type="number"
                    step="0.01"
                    value={player.bowlingAverage ?? 0}
                    onChange={(e) => setPlayer({ ...player, bowlingAverage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">4-Wicket Hauls</label>
                  <input
                    type="number"
                    value={player.fourWickets ?? 0}
                    onChange={(e) => setPlayer({ ...player, fourWickets: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB 6: TROPHIES & HONORS ──────── */}
        {activeTab === 'honors' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Trophies Shelf */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-base font-bold text-white">Championship Titles &amp; Trophies Won</h3>
                </div>
                <span className="text-xs text-yellow-400 font-mono font-bold">
                  {player.trophies?.length || 0} Titles
                </span>
              </div>

              {/* Badges List */}
              <div className="flex flex-wrap gap-2 min-h-10 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {player.trophies && player.trophies.length > 0 ? (
                  player.trophies.map((trophy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-yellow-300 border border-amber-500/30 text-xs font-bold shadow-xs"
                    >
                      <Trophy className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                      <span>{trophy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrophy(idx)}
                        className="w-4 h-4 rounded-full hover:bg-amber-400/30 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic my-auto">No trophies added yet for this player.</p>
                )}
              </div>

              {/* Add Custom Trophy */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTrophyInput}
                  onChange={(e) => setNewTrophyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTrophy();
                    }
                  }}
                  placeholder="Type title e.g. IPL 2023 Champion or CLT20 2014"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddTrophy()}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Trophy</span>
                </button>
              </div>

              {/* 1-Click CSK Presets */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">
                  1-Click CSK Championship Presets:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'IPL 2010 Champion',
                    'IPL 2011 Champion',
                    'IPL 2018 Champion',
                    'IPL 2021 Champion',
                    'IPL 2023 Champion',
                    'CLT20 2010 Champion',
                    'CLT20 2014 Champion',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddTrophy(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-yellow-300 border border-slate-800 text-xs font-medium transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Career Milestones & Honors */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-base font-bold text-white">Career Milestones &amp; Individual Honors</h3>
                </div>
                <span className="text-xs text-yellow-400 font-mono font-bold">
                  {player.honors?.length || 0} Milestones
                </span>
              </div>

              {/* Honors List */}
              <div className="space-y-2 min-h-10 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {player.honors && player.honors.length > 0 ? (
                  player.honors.map((honor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                        <span className="truncate">{honor}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHonor(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 flex-shrink-0 cursor-pointer"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic my-auto">No honors added yet for this player.</p>
                )}
              </div>

              {/* Add Custom Honor */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHonorInput}
                  onChange={(e) => setNewHonorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHonor();
                    }
                  }}
                  placeholder="Type milestone e.g. Fastest 50 for CSK (16 balls) or Most Dismissals in IPL history"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddHonor()}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Honor</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── BOTTOM STICKY SAVE BAR ─── */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl flex items-center justify-between gap-4">
          <Link
            href="/admin/players/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel &amp; Return</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Editing: <strong className="text-white">{player.name || 'New Player'}</strong>
            </span>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isCreating ? 'Create Player' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* ─── MEDIA LIBRARY MODAL PICKER ─── */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectMedia={(media) => {
          setPlayer((prev) => ({ ...prev, avatar: media.url }));
          setMediaModalOpen(false);
        }}
      />

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Player Profile</h3>
                <p className="text-xs text-slate-400">This action will remove the player permanently.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Are you sure you want to delete <strong className="text-white">{player.name}</strong> (#{player.jersey || '—'})? This will remove them from the squad roster, statistics tables, and directory.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50"
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
