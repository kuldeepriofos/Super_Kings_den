'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Shield,
  Timer,
  ChevronRight,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Eye,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Check,
  Pencil,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getTeamLogo } from '../../../lib/teamLogos';

const FRANCHISES = [
  {
    code: 'CSK',
    name: 'Chennai Super Kings',
    short: 'CSK',
    tournament: 'IPL 2026',
    venue: 'MA Chidambaram Stadium, Chepauk, Chennai',
    pitchTitle: 'Chepauk Pitch Insight:',
    defaultOpponent: 'Mumbai Indians',
    defaultOpponentShort: 'MI',
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-400/40',
    badgeBg: 'bg-yellow-400 text-slate-950 font-black',
    liveUrl: '/csk-fixtures',
    defaultScore1: '206/4',
    defaultOvers1: '20.0',
    defaultScore2: '186/6',
    defaultOvers2: '20.0',
    defaultWinner: 'CSK Won by 20 Runs',
    defaultPOTM: 'Matheesha Pathirana (4/28 in 4 ov)',
  },
  {
    code: 'JSK',
    name: 'Joburg Super Kings',
    short: 'JSK',
    tournament: 'SA20 2026',
    venue: 'The Wanderers Stadium, Johannesburg',
    pitchTitle: 'Wanderers Pitch Insight:',
    defaultOpponent: 'MI Cape Town',
    defaultOpponentShort: 'MICT',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500 text-slate-950 font-black',
    liveUrl: '/jsk-fixtures',
    defaultScore1: '176/4',
    defaultOvers1: '18.4',
    defaultScore2: '172/8',
    defaultOvers2: '20.0',
    defaultWinner: 'JSK Won by 6 Wickets',
    defaultPOTM: 'Faf du Plessis (64 off 38)',
  },
  {
    code: 'TSK',
    name: 'Texas Super Kings',
    short: 'TSK',
    tournament: 'MLC 2026',
    venue: 'Grand Prairie Stadium, Dallas, Texas',
    pitchTitle: 'Grand Prairie Pitch Insight:',
    defaultOpponent: 'MI New York',
    defaultOpponentShort: 'MINY',
    accentColor: 'text-red-400',
    borderColor: 'border-red-500/40',
    badgeBg: 'bg-red-600 text-white font-black',
    liveUrl: '/tsk-fixtures',
    defaultScore1: '181/5',
    defaultOvers1: '20.0',
    defaultScore2: '164/8',
    defaultOvers2: '20.0',
    defaultWinner: 'TSK Won by 17 Runs',
    defaultPOTM: 'Devon Conway (74 off 42)',
  },
];

export const LEAGUE_TEAMS = {
  CSK: [
    { name: 'Mumbai Indians', short: 'MI', logo: '/team-logos/mi.svg', venue: 'Wankhede Stadium, Mumbai', pitchInsight: 'True bounce and batting paradise with evening dew. High-scoring coastal venue.', h2h: 'CSK 17 - 21 MI (El Clásico Rivalry)' },
    { name: 'Royal Challengers Bengaluru', short: 'RCB', logo: '/team-logos/rcb.svg', venue: 'M. Chinnaswamy Stadium, Bengaluru', pitchInsight: 'High-altitude boundary haven. Fast outfield with true bounce and short boundaries.', h2h: 'CSK 21 - 11 RCB (Southern Derby)' },
    { name: 'Kolkata Knight Riders', short: 'KKR', logo: '/team-logos/kkr.svg', venue: 'Eden Gardens, Kolkata', pitchInsight: 'Sporting track with early seam assistance and sharp spin in middle overs.', h2h: 'CSK 19 - 11 KKR' },
    { name: 'Sunrisers Hyderabad', short: 'SRH', logo: '/team-logos/srh.svg', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad', pitchInsight: 'Flat batting surface offering massive totals and fast outfield.', h2h: 'CSK 15 - 6 SRH' },
    { name: 'Rajasthan Royals', short: 'RR', logo: '/team-logos/rr.svg', venue: 'Sawai Mansingh Stadium, Jaipur', pitchInsight: 'Large boundaries testing running between wickets, balanced pace and spin.', h2h: 'CSK 16 - 13 RR' },
    { name: 'Gujarat Titans', short: 'GT', logo: '/team-logos/gt.svg', venue: 'Narendra Modi Stadium, Ahmedabad', pitchInsight: 'World largest stadium wicket with consistent carry and true bounce.', h2h: 'CSK 4 - 4 GT (IPL 2023 Final Rematch)' },
    { name: 'Lucknow Super Giants', short: 'LSG', logo: '/team-logos/lsg.svg', venue: 'BRSABV Ekana Stadium, Lucknow', pitchInsight: 'Multi-pitch red & black soil venue offering grip to spinners.', h2h: 'CSK 2 - 3 LSG' },
    { name: 'Delhi Capitals', short: 'DC', logo: '/team-logos/dc.svg', venue: 'Arun Jaitley Stadium, Delhi', pitchInsight: 'Shorter boundaries favoring aggressive powerplay strokeplay.', h2h: 'CSK 19 - 11 DC' },
    { name: 'Punjab Kings', short: 'PBKS', logo: '/team-logos/pbks.svg', venue: 'PCA New Stadium, Mullanpur', pitchInsight: 'Fresh wicket offering bounce and lateral seam movement under lights.', h2h: 'CSK 16 - 14 PBKS' },
  ],
  JSK: [
    { name: 'MI Cape Town', short: 'MICT', logo: '/team-logos/mict.svg', venue: 'Newlands, Cape Town', pitchInsight: 'Scenic coastal ground with pace and bounce under Table Mountain.', h2h: 'JSK 3 - 1 MICT' },
    { name: 'Sunrisers Eastern Cape', short: 'SEC', logo: '/team-logos/sec.svg', venue: "St George's Park, Gqeberha", pitchInsight: 'Windy ground with true bounce and lively crowd brass band.', h2h: 'JSK 2 - 2 SEC' },
    { name: 'Paarl Royals', short: 'PR', logo: '/team-logos/pr.svg', venue: 'Boland Park, Paarl', pitchInsight: 'Hot dry surface offering grip to spinners in afternoon fixtures.', h2h: 'JSK 2 - 1 PR' },
    { name: "Durban's Super Giants", short: 'DSG', logo: '/team-logos/dsg.svg', venue: 'Kingsmead, Durban', pitchInsight: 'Subtropical coastal venue with evening swing and bounce.', h2h: 'JSK 3 - 1 DSG' },
    { name: 'Pretoria Capitals', short: 'PC', logo: '/team-logos/pc.svg', venue: 'Centurion Park, Pretoria', pitchInsight: 'High altitude and lightning quick outfield with extra carry.', h2h: 'JSK 2 - 2 PC' },
  ],
  TSK: [
    { name: 'MI New York', short: 'MINY', logo: '/team-logos/miny.svg', venue: 'Marine Park Cricket Stadium, NY', pitchInsight: 'High quality drop-in pitch with true carry.', h2h: 'TSK 2 - 1 MINY' },
    { name: 'Washington Freedom', short: 'WAF', logo: '/team-logos/waf.svg', venue: 'Church Street Park, Morrisville', pitchInsight: 'Natural turf ground with balanced bounce.', h2h: 'TSK 1 - 2 WAF' },
    { name: 'San Francisco Unicorns', short: 'SFU', logo: '/team-logos/sfu.svg', venue: 'Grand Prairie Stadium, Dallas', pitchInsight: 'Fast outfield under Texas lights with high scoring rate.', h2h: 'TSK 2 - 0 SFU' },
    { name: 'Seattle Orcas', short: 'SEO', logo: '/team-logos/seo.svg', venue: 'Grand Prairie Stadium, Dallas', pitchInsight: 'Texas wicket offering good bounce to pacers.', h2h: 'TSK 1 - 1 SEO' },
    { name: 'Los Angeles Knight Riders', short: 'LAKR', logo: '/team-logos/lakr.svg', venue: 'Grand Prairie Stadium, Dallas', pitchInsight: 'True batting wicket ideal for T20 power-hitting.', h2h: 'TSK 2 - 0 LAKR' },
  ],
};

function formatIsoToDatetimeLocal(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${y}-${m}-${day}T${h}:${min}`;
  } catch (e) {
    return '';
  }
}

export default function AdminMatchesManager() {
  const [selectedFranchise, setSelectedFranchise] = useState('CSK');
  const [activeModuleTab, setActiveModuleTab] = useState('upcoming'); // 'upcoming' | 'results' | 'live'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // All matches from DB across all franchises
  const [allFixtures, setAllFixtures] = useState([]);
  const [availableYears, setAvailableYears] = useState([2026]);

  const currentFranchiseMeta = useMemo(() => {
    return FRANCHISES.find((f) => f.code === selectedFranchise) || FRANCHISES[0];
  }, [selectedFranchise]);

  // Franchise matches
  const franchiseFixtures = useMemo(() => {
    return allFixtures.filter((f) => f.franchise === selectedFranchise);
  }, [allFixtures, selectedFranchise]);

  // Completed matches for Past Matches table
  const completedFixtures = useMemo(() => {
    return franchiseFixtures.filter(
      (f) => f.status === 'Completed' || (f.homeScore && f.resultText)
    );
  }, [franchiseFixtures]);

  // Active upcoming fixture for this franchise
  const upcomingFixture = useMemo(() => {
    return (
      franchiseFixtures.find(
        (f) =>
          (f.status === 'Upcoming' || f.displayMode === 'countdown') &&
          f.isActive !== false &&
          !f.isDeleted
      ) || null
    );
  }, [franchiseFixtures]);

  // Check if there is an active future countdown live on website
  const hasLiveCountdown = useMemo(() => {
    if (!upcomingFixture?.countdownTarget) return false;
    const target = new Date(upcomingFixture.countdownTarget).getTime();
    return !isNaN(target) && target > Date.now();
  }, [upcomingFixture]);

  // Active featured match on website
  const featuredFixture = useMemo(() => {
    return franchiseFixtures.find((f) => f.isFeatured) || franchiseFixtures[0] || null;
  }, [franchiseFixtures]);

  // Available opponent teams with flags for current franchise
  const currentOpponents = useMemo(() => {
    return LEAGUE_TEAMS[selectedFranchise] || LEAGUE_TEAMS.CSK;
  }, [selectedFranchise]);

  // =========================================================================
  // STATE 1: UPCOMING COUNTDOWN FORM
  // =========================================================================
  const [upcomingForm, setUpcomingForm] = useState({
    _id: '',
    id: '',
    franchise: 'CSK',
    tournament: 'IPL 2026',
    matchdayTag: 'MATCHDAY 1',
    status: 'Upcoming',
    displayMode: 'countdown',
    homeTeam: 'Chennai Super Kings',
    homeShort: 'CSK',
    homeRole: 'HOSTS',
    awayTeam: 'Mumbai Indians',
    awayShort: 'MI',
    awayRole: 'CHALLENGERS',
    date: 'March 28, 2026',
    time: '7:30 PM IST',
    countdownTarget: '2026-03-28T19:30',
    venue: 'MA Chidambaram Stadium, Chepauk, Chennai',
    pitchTitle: 'Chepauk Pitch Insight:',
    pitchInsight: 'Dry surface offering assistance to spinners in the middle overs. Average 1st innings score is 174.',
    h2h: 'CSK 17 - 20 MI (Last 5: CSK 4 - 1 MI)',
    isFeatured: true,
  });

  // =========================================================================
  // STATE 2: PAST MATCH RESULTS FORM (For adding or editing completed matches)
  // =========================================================================
  const [resultFormOpen, setResultFormOpen] = useState(false);
  const [resultFormMode, setResultFormMode] = useState('create'); // 'create' | 'edit'
  const [resultForm, setResultForm] = useState({
    _id: '',
    id: '',
    franchise: 'CSK',
    year: 2026,
    tournament: 'IPL 2026',
    matchdayTag: 'MATCHDAY 14',
    status: 'Completed',
    displayMode: 'result',
    homeTeam: 'Chennai Super Kings',
    homeShort: 'CSK',
    homeScore: '206/4',
    homeOvers: '20.0',
    awayTeam: 'Mumbai Indians',
    awayShort: 'MI',
    awayScore: '186/6',
    awayOvers: '20.0',
    resultText: 'CSK Won by 20 Runs',
    winner: 'Chennai Super Kings',
    potm: 'Matheesha Pathirana',
    potmRole: '4/28 in 4 ov',
    matchNote: 'Sensational death bowling sealed victory.',
    date: 'May 26, 2026',
    venue: 'MA Chidambaram Stadium, Chepauk, Chennai',
    isFeatured: false,
  });

  // Table filter for Past Matches
  const [pastYearFilter, setPastYearFilter] = useState('ALL');
  const [pastSearchQuery, setPastSearchQuery] = useState('');

  // Live countdown ticker for preview
  const [previewTimer, setPreviewTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load all matches from DB
  const loadAllMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/matches/?visibility=all');
      if (!res.ok) throw new Error('Failed to load fixtures');
      const data = await res.json();
      setAllFixtures(data.fixtures || []);
      if (data.availableYears && data.availableYears.length > 0) {
        setAvailableYears(data.availableYears);
      }
    } catch (err) {
      showToast('error', `Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllMatches();
  }, [loadAllMatches]);

  // When switching franchise or fixtures change, sync the Upcoming Countdown form
  useEffect(() => {
    const meta = FRANCHISES.find((f) => f.code === selectedFranchise) || FRANCHISES[0];
    const up =
      franchiseFixtures.find((f) => f.status === 'Upcoming') ||
      franchiseFixtures.find((f) => f.displayMode === 'countdown');

    if (up) {
      setUpcomingForm({
        _id: up._id || '',
        id: up.id || '',
        franchise: selectedFranchise,
        tournament: up.tournament || meta.tournament,
        matchdayTag: up.matchdayTag || 'MATCHDAY',
        status: 'Upcoming',
        displayMode: 'countdown',
        homeTeam: up.homeTeam || meta.name,
        homeShort: up.homeShort || meta.short,
        homeRole: up.homeRole || 'HOSTS',
        awayTeam: up.awayTeam || meta.defaultOpponent,
        awayShort: up.awayShort || meta.defaultOpponentShort,
        awayRole: up.awayRole || 'CHALLENGERS',
        date: up.date || 'March 28, 2026',
        time: up.time || '7:30 PM IST',
        countdownTarget: formatIsoToDatetimeLocal(up.countdownTarget) || '2026-03-28T19:30',
        venue: up.venue || meta.venue,
        pitchTitle: up.pitchTitle || meta.pitchTitle,
        pitchInsight: up.pitchInsight || `${meta.venue} dry surface with fast outfield under lights.`,
        h2h: up.h2h || `${meta.short} vs ${meta.defaultOpponentShort} rivalry clash`,
        isFeatured: Boolean(up.isFeatured),
      });
    } else {
      setUpcomingForm({
        _id: '',
        id: '',
        franchise: selectedFranchise,
        tournament: meta.tournament,
        matchdayTag: 'MATCHDAY 1',
        status: 'Upcoming',
        displayMode: 'countdown',
        homeTeam: meta.name,
        homeShort: meta.short,
        homeRole: 'HOSTS',
        awayTeam: meta.defaultOpponent,
        awayShort: meta.defaultOpponentShort,
        awayRole: 'CHALLENGERS',
        date: 'March 28, 2026',
        time: '7:30 PM IST',
        countdownTarget: '2026-03-28T19:30',
        venue: meta.venue,
        pitchTitle: meta.pitchTitle,
        pitchInsight: `${meta.venue} dry surface with fast outfield under lights.`,
        h2h: `${meta.short} vs ${meta.defaultOpponentShort} clash`,
        isFeatured: true,
      });
    }
  }, [selectedFranchise, franchiseFixtures]);

  // Live Countdown Ticker
  useEffect(() => {
    function tick() {
      if (!upcomingForm.countdownTarget) {
        setPreviewTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const targetTime = new Date(upcomingForm.countdownTarget).getTime();
      const diff = targetTime - Date.now();
      if (diff <= 0 || isNaN(diff)) {
        setPreviewTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setPreviewTimer({ days, hours, minutes, seconds });
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [upcomingForm.countdownTarget]);

  // =========================================================================
  // HANDLER: SAVE UPCOMING MATCH COUNTDOWN
  // =========================================================================
  const handleSaveUpcomingCountdown = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const targetId = upcomingForm._id || upcomingFixture?._id;
      const isCreate = !targetId;
      const url = isCreate ? '/api/admin/matches/' : `/api/admin/matches/${targetId}`;
      const method = isCreate ? 'POST' : 'PUT';

      const payload = {
        ...upcomingForm,
        franchise: selectedFranchise,
        status: 'Upcoming',
        displayMode: 'countdown',
        isFeatured: true, // Make upcoming countdown active on site
        isActive: true,
        isDeleted: false,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save');

      showToast(
        'success',
        `⏱ ${selectedFranchise} upcoming countdown activated! Website now displays ONLY the live timer.`
      );
      await loadAllMatches();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // HANDLER: REMOVE / TURN OFF UPCOMING MATCH COUNTDOWN
  // =========================================================================
  const handleRemoveUpcomingCountdown = async () => {
    const targetId = upcomingForm._id || upcomingFixture?._id || upcomingFixture?.id;
    if (!targetId) {
      showToast('info', `No active countdown fixture found for ${selectedFranchise}.`);
      return;
    }

    if (!confirm(`Are you sure you want to remove the upcoming match countdown for ${selectedFranchise}?\n\nOnce removed, the website will immediately switch to showing the Last Added Match Score instead.`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/matches/${targetId}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove countdown');
      }

      showToast(
        'success',
        `✅ Countdown removed! Website is now showing ONLY the Last Added Match Score for ${selectedFranchise}.`
      );

      const meta = FRANCHISES.find((f) => f.code === selectedFranchise) || FRANCHISES[0];
      setUpcomingForm({
        _id: '',
        id: '',
        franchise: selectedFranchise,
        tournament: meta.tournament,
        matchdayTag: 'MATCHDAY 1',
        status: 'Upcoming',
        displayMode: 'countdown',
        homeTeam: meta.name,
        homeShort: meta.short,
        homeRole: 'HOSTS',
        awayTeam: meta.defaultOpponent,
        awayShort: meta.defaultOpponentShort,
        awayRole: 'CHALLENGERS',
        date: '',
        time: '',
        countdownTarget: '',
        venue: meta.venue,
        pitchTitle: meta.pitchTitle,
        pitchInsight: '',
        h2h: '',
        isFeatured: false,
      });

      await loadAllMatches();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Quick select opponent for upcoming countdown with flag/logo, venue, and pitch insight
  const handleSelectUpcomingOpponent = (opp) => {
    setUpcomingForm((prev) => ({
      ...prev,
      awayTeam: opp.name,
      awayShort: opp.short,
      awayLogo: opp.logo || getTeamLogo(opp.short),
      venue: opp.venue || prev.venue,
      pitchInsight: opp.defaultVenueInsight || prev.pitchInsight,
      h2h: opp.h2h || `${prev.homeShort} vs ${opp.short} Rivalry Encounter`,
    }));
  };

  // Quick select opponent for past match result form
  const handleSelectResultOpponent = (opp) => {
    setResultForm((prev) => ({
      ...prev,
      awayTeam: opp.name,
      awayShort: opp.short,
      awayLogo: opp.logo || getTeamLogo(opp.short),
      venue: opp.venue || prev.venue,
    }));
  };

  // =========================================================================
  // HANDLERS: PAST MATCH RESULTS (ADD / EDIT / DELETE)
  // =========================================================================
  const handleOpenAddResult = () => {
    const meta = FRANCHISES.find((f) => f.code === selectedFranchise) || FRANCHISES[0];
    setResultFormMode('create');
    setResultForm({
      _id: '',
      id: '',
      franchise: selectedFranchise,
      year: 2026,
      tournament: meta.tournament,
      matchdayTag: 'MATCHDAY',
      status: 'Completed',
      displayMode: 'result',
      homeTeam: meta.name,
      homeShort: meta.short,
      homeScore: meta.defaultScore1,
      homeOvers: meta.defaultOvers1,
      awayTeam: meta.defaultOpponent,
      awayShort: meta.defaultOpponentShort,
      awayScore: meta.defaultScore2,
      awayOvers: meta.defaultOvers2,
      resultText: meta.defaultWinner,
      winner: meta.name,
      potm: meta.defaultPOTM,
      potmRole: 'Match Winner',
      matchNote: 'Comprehensive team victory.',
      date: 'May 26, 2026',
      venue: meta.venue,
      isFeatured: true,
    });
    setResultFormOpen(true);
  };

  const handleOpenEditResult = (fixture) => {
    const meta = FRANCHISES.find((f) => f.code === selectedFranchise) || FRANCHISES[0];
    setResultFormMode('edit');
    setResultForm({
      _id: fixture._id,
      id: fixture.id,
      franchise: fixture.franchise || selectedFranchise,
      year: Number(fixture.year) || 2026,
      tournament: fixture.tournament || meta.tournament,
      matchdayTag: fixture.matchdayTag || 'MATCHDAY',
      status: 'Completed',
      displayMode: 'result',
      homeTeam: fixture.homeTeam || meta.name,
      homeShort: fixture.homeShort || meta.short,
      homeScore: fixture.homeScore || '',
      homeOvers: fixture.homeOvers || '20.0',
      awayTeam: fixture.awayTeam || '',
      awayShort: fixture.awayShort || '',
      awayScore: fixture.awayScore || '',
      awayOvers: fixture.awayOvers || '20.0',
      resultText: fixture.resultText || '',
      winner: fixture.winner || '',
      potm: fixture.potm || '',
      potmRole: fixture.potmRole || '',
      matchNote: fixture.matchNote || '',
      date: fixture.date || '',
      venue: fixture.venue || meta.venue,
      isFeatured: Boolean(fixture.isFeatured),
    });
    setResultFormOpen(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleSaveResult = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const isCreate = resultFormMode === 'create' || !resultForm._id;
      const url = isCreate ? '/api/admin/matches/' : `/api/admin/matches/${resultForm._id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const payload = {
        ...resultForm,
        franchise: selectedFranchise,
        status: 'Completed',
        displayMode: 'result',
        year: Number(resultForm.year) || 2026,
        isActive: true,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save result');

      showToast(
        'success',
        isCreate
          ? `🏆 Match result added to ${selectedFranchise} Past Matches archive!`
          : `✅ Past match result updated successfully!`
      );
      setResultFormOpen(false);
      await loadAllMatches();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFixture = async (fixtureId) => {
    if (!window.confirm('Delete this match record from database?')) return;
    try {
      const res = await fetch(`/api/admin/matches/${fixtureId}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      showToast('info', 'Match deleted.');
      await loadAllMatches();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleMakeFeatured = async (fixtureId) => {
    try {
      const res = await fetch(`/api/admin/matches/${fixtureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: true, isActive: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update');
      showToast('success', 'Set as active featured card on website!');
      await loadAllMatches();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Filtered past matches list
  const filteredPastMatches = useMemo(() => {
    return completedFixtures.filter((f) => {
      if (pastYearFilter !== 'ALL' && Number(f.year) !== Number(pastYearFilter)) {
        return false;
      }
      if (pastSearchQuery.trim()) {
        const q = pastSearchQuery.toLowerCase();
        const opponent = (f.awayTeam || f.awayShort || '').toLowerCase();
        const venue = (f.venue || '').toLowerCase();
        const stage = (f.matchdayTag || '').toLowerCase();
        return opponent.includes(q) || venue.includes(q) || stage.includes(q);
      }
      return true;
    });
  }, [completedFixtures, pastYearFilter, pastSearchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-yellow-400 rounded-full" />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
              Match Center Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[11px] font-black">
              CSK • JSK • TSK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Easily manage upcoming match countdowns and past match scorecards for all 3 franchises in one clean module.
          </p>
        </div>

        <Link
          href={currentFranchiseMeta.liveUrl}
          target="_blank"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 self-start sm:self-auto cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-yellow-400" />
          <span>View {selectedFranchise} Live Page</span>
        </Link>
      </div>

      {/* Action Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : toast.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODULE STEP 1: SELECT FRANCHISE (CSK, JSK, TSK)
         ========================================================================= */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Step 1: Choose Franchise to Manage</span>
          <span className="text-yellow-400 font-semibold">3 Franchises in 1 Module</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FRANCHISES.map((f) => {
            const isActive = selectedFranchise === f.code;
            const franchiseCount = allFixtures.filter((fix) => fix.franchise === f.code).length;
            const pastCount = allFixtures.filter(
              (fix) => fix.franchise === f.code && fix.status === 'Completed'
            ).length;

            return (
              <button
                key={f.code}
                type="button"
                onClick={() => {
                  setSelectedFranchise(f.code);
                  setResultFormOpen(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-950 border-yellow-400 shadow-lg ring-2 ring-yellow-400/40'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs ${f.badgeBg}`}>
                    {f.code}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{f.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {f.tournament} &bull; {pastCount} Past Matches
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                    isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isActive ? 'Managing' : 'Select'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODULE STEP 2: CLEAR TWO-TAB MANAGER
          Tab A: ⏱ Upcoming Match Countdown (No scores here - purely countdown & venue!)
          Tab B: 🏆 Past Matches & Results (Enter scores, winner, POTM & see all past matches!)
         ========================================================================= */}
      <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveModuleTab('upcoming')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeModuleTab === 'upcoming'
              ? 'bg-yellow-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>⏱ Next Match Countdown Timer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('results')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeModuleTab === 'results'
              ? 'bg-yellow-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>🏆 Past Matches &amp; Scores ({completedFixtures.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1 CONTENT: NEXT MATCH COUNTDOWN MANAGER
          Dedicated strictly to the upcoming match timer. Zero score confusion!
         ========================================================================= */}
      {activeModuleTab === 'upcoming' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Status Indicator & Instant Toggle */}
          {hasLiveCountdown ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <div className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                    🟢 Live Countdown Active on Website
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Website is currently showing the countdown for <strong>{upcomingFixture?.homeShort || upcomingForm.homeShort} vs {upcomingFixture?.awayShort || upcomingForm.awayShort}</strong>. Past match scorecards are hidden.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveUpcomingCountdown}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50 shadow-lg shadow-rose-900/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Countdown (Show Last Score)</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-200">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold block">
                  ℹ️ No Active Countdown — Website is Displaying Last Added Match Score
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  To replace the past score with a countdown timer on the homepage, select opponent, set the toss date &amp; time below, and click &quot;Activate Countdown&quot;.
                </span>
              </div>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1836] via-[#091227] to-[#0c1836] border border-yellow-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-5 bg-yellow-400 rounded-full" />
                <span className="text-white font-black uppercase tracking-wider text-xs sm:text-sm">
                  {selectedFranchise} Live Countdown Preview on Website
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                Active Countdown
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-2">
              {/* Home */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1.5">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-yellow-400/40 flex items-center justify-center p-2 shadow-md">
                  {getTeamLogo(upcomingForm.homeTeam || upcomingForm.homeShort) ? (
                    <img
                      src={getTeamLogo(upcomingForm.homeTeam || upcomingForm.homeShort)}
                      alt={upcomingForm.homeTeam}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="font-black text-2xl text-yellow-400">{upcomingForm.homeShort}</span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">HOSTS</span>
                <h3 className="text-base font-black text-white">{upcomingForm.homeTeam}</h3>
              </div>

              {/* Countdown Clocks */}
              <div className="flex flex-col items-center justify-center space-y-3 py-3 border-y md:border-y-0 md:border-x border-white/10 px-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400 px-3 py-0.5 rounded-full bg-black/60 border border-yellow-400/30">
                  Countdown to Toss &amp; First Ball
                </span>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900/90 rounded-xl p-2 min-w-[54px] border border-white/10">
                    <div className="text-xl font-black text-yellow-400 font-mono">
                      {String(previewTimer.days).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-slate-400">Days</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-xl p-2 min-w-[54px] border border-white/10">
                    <div className="text-xl font-black text-yellow-400 font-mono">
                      {String(previewTimer.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-slate-400">Hours</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-xl p-2 min-w-[54px] border border-white/10">
                    <div className="text-xl font-black text-yellow-400 font-mono">
                      {String(previewTimer.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-slate-400">Mins</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-xl p-2 min-w-[54px] border border-white/10">
                    <div className="text-xl font-black text-yellow-400 font-mono">
                      {String(previewTimer.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-slate-400">Secs</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 text-center">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{upcomingForm.venue}</span>
                </div>
              </div>

              {/* Away */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-1.5">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-blue-400/40 flex items-center justify-center p-2 shadow-md">
                  {getTeamLogo(upcomingForm.awayTeam || upcomingForm.awayShort) ? (
                    <img
                      src={getTeamLogo(upcomingForm.awayTeam || upcomingForm.awayShort)}
                      alt={upcomingForm.awayTeam}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="font-black text-2xl text-blue-400">{upcomingForm.awayShort}</span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  CHALLENGERS
                </span>
                <h3 className="text-base font-black text-white">{upcomingForm.awayTeam}</h3>
              </div>
            </div>
          </div>

          {/* Form to Set Upcoming Match */}
          <form
            onSubmit={handleSaveUpcomingCountdown}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Set Upcoming Match &amp; Countdown for {selectedFranchise}
                </h3>
              </div>
              <span className="text-xs text-yellow-400 font-semibold">
                Saves directly without affecting Past Matches
              </span>
            </div>

            {/* Select Next Opponent Team (With Official Flags / Logos) */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-2">
                1. Select Next Opponent Team:
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                {currentOpponents.map((opp) => {
                  const isSelected = upcomingForm.awayShort === opp.short;
                  const logoUrl = opp.logo || getTeamLogo(opp.short);
                  return (
                    <button
                      key={opp.short}
                      type="button"
                      onClick={() => handleSelectUpcomingOpponent(opp)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border shadow-sm ${
                        isSelected
                          ? 'bg-yellow-400 text-slate-950 font-black border-yellow-400 ring-2 ring-yellow-400/40 shadow-md shadow-yellow-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md bg-slate-900/80 p-0.5 flex items-center justify-center shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt={opp.short} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-mono text-[9px] font-bold">{opp.short}</span>
                        )}
                      </div>
                      <span>{opp.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-950 font-extrabold' : 'text-slate-400'}`}>
                        ({opp.short})
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date, Time & Countdown Target */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  2. Countdown Target Date &amp; Time (Toss Time)
                </label>
                <input
                  type="datetime-local"
                  value={upcomingForm.countdownTarget}
                  onChange={(e) =>
                    setUpcomingForm((p) => ({ ...p, countdownTarget: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-yellow-400 font-mono font-bold focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Display Date Text
                </label>
                <input
                  type="text"
                  value={upcomingForm.date}
                  onChange={(e) => setUpcomingForm((p) => ({ ...p, date: e.target.value }))}
                  placeholder="e.g. March 28, 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Display Time Text
                </label>
                <input
                  type="text"
                  value={upcomingForm.time}
                  onChange={(e) => setUpcomingForm((p) => ({ ...p, time: e.target.value }))}
                  placeholder="e.g. 7:30 PM IST"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
            </div>

            {/* Venue & Pitch Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Match Venue / Stadium
                </label>
                <input
                  type="text"
                  value={upcomingForm.venue}
                  onChange={(e) => setUpcomingForm((p) => ({ ...p, venue: e.target.value }))}
                  placeholder="Stadium name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Pitch &amp; Surface Preview Note
                </label>
                <input
                  type="text"
                  value={upcomingForm.pitchInsight}
                  onChange={(e) =>
                    setUpcomingForm((p) => ({ ...p, pitchInsight: e.target.value }))
                  }
                  placeholder="Dry surface offering assistance to spinners in the middle overs."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Submit Button & Remove Countdown Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {hasLiveCountdown
                  ? 'To switch back to showing the Last Added Match Score on website, click Remove Countdown.'
                  : 'Activating will show ONLY the live countdown timer on website (past match scorecards will be hidden).'}
              </span>

              <div className="flex items-center gap-2.5">
                {(hasLiveCountdown || upcomingForm._id || upcomingFixture) && (
                  <button
                    type="button"
                    onClick={handleRemoveUpcomingCountdown}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Countdown</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-lg shadow-yellow-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Activating Countdown...' : `Activate Countdown for ${selectedFranchise}`}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2 CONTENT: PAST MATCHES & SCORECARDS MANAGER
          Add final scorecards, edit past matches, or delete. Zero countdown confusion!
         ========================================================================= */}
      {activeModuleTab === 'results' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar for Past Matches */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>{selectedFranchise} Past Matches Database ({completedFixtures.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every completed match saved here is permanently preserved in the Past Matches section on the website.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddResult}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log New Match Result</span>
            </button>
          </div>

          {/* ================= ADD OR EDIT SCORECARD FORM ================= */}
          {resultFormOpen && (
            <form
              onSubmit={handleSaveResult}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Trophy className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {resultFormMode === 'create'
                        ? `Log New Completed Match (${selectedFranchise})`
                        : `Edit Past Match: ${resultForm.homeShort} vs ${resultForm.awayShort}`}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Enter final scores, winner &amp; POTM. Will reflect in website Past Matches archive.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setResultFormOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Match Date, Year & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Match Date Played
                  </label>
                  <input
                    type="text"
                    value={resultForm.date}
                    onChange={(e) => setResultForm((p) => ({ ...p, date: e.target.value }))}
                    placeholder="e.g. May 26, 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Year / Season
                  </label>
                  <input
                    type="number"
                    value={resultForm.year || 2026}
                    onChange={(e) =>
                      setResultForm((p) => ({ ...p, year: Number(e.target.value) }))
                    }
                    placeholder="2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Tournament Stage
                  </label>
                  <input
                    type="text"
                    value={resultForm.matchdayTag}
                    onChange={(e) =>
                      setResultForm((p) => ({ ...p, matchdayTag: e.target.value }))
                    }
                    placeholder="e.g. IPL 2026 • Matchday 14"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Teams & Scores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Home Team */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-yellow-400">
                      {resultForm.homeTeam} (HOSTS)
                    </span>
                    <span className="text-xs font-mono text-slate-400">{resultForm.homeShort}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Final Score (Runs/Wkts)
                      </label>
                      <input
                        type="text"
                        value={resultForm.homeScore}
                        onChange={(e) =>
                          setResultForm((p) => ({ ...p, homeScore: e.target.value }))
                        }
                        placeholder="206/4"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Overs Bowled
                      </label>
                      <input
                        type="text"
                        value={resultForm.homeOvers}
                        onChange={(e) =>
                          setResultForm((p) => ({ ...p, homeOvers: e.target.value }))
                        }
                        placeholder="20.0"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-yellow-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Away Team */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  {/* Opponent Selection with Official Flags/Logos */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-yellow-400 block">
                      Select Opponent Team:
                    </label>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentOpponents.map((opp) => {
                        const isSelected = resultForm.awayShort === opp.short;
                        const logoUrl = opp.logo || getTeamLogo(opp.short);
                        return (
                          <button
                            key={opp.short}
                            type="button"
                            onClick={() => handleSelectResultOpponent(opp)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-yellow-400 text-slate-950 font-black border-yellow-400 ring-2 ring-yellow-400/40 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="w-4 h-4 rounded bg-slate-950 p-0.5 flex items-center justify-center shrink-0">
                              {logoUrl && <img src={logoUrl} alt={opp.short} className="w-full h-full object-contain" />}
                            </div>
                            <span>{opp.name}</span>
                            <span className="text-[10px] font-mono opacity-70">({opp.short})</span>
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Opponent Score
                      </label>
                      <input
                        type="text"
                        value={resultForm.awayScore}
                        onChange={(e) =>
                          setResultForm((p) => ({ ...p, awayScore: e.target.value }))
                        }
                        placeholder="186/6"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Overs Bowled
                      </label>
                      <input
                        type="text"
                        value={resultForm.awayOvers}
                        onChange={(e) =>
                          setResultForm((p) => ({ ...p, awayOvers: e.target.value }))
                        }
                        placeholder="20.0"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-yellow-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Winner & Result Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-400">
                      Match Outcome Banner (Shown with 🏆)
                    </label>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setResultForm((p) => ({
                            ...p,
                            winner: p.homeTeam,
                            resultText: `${p.homeShort} Won by 20 Runs`,
                          }));
                        }}
                        className="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-bold hover:bg-yellow-400/30 cursor-pointer"
                      >
                        {resultForm.homeShort} Win
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResultForm((p) => ({
                            ...p,
                            winner: p.awayTeam,
                            resultText: `${p.awayShort} Won by 4 Wickets`,
                          }));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30 cursor-pointer"
                      >
                        {resultForm.awayShort} Win
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={resultForm.resultText}
                    onChange={(e) =>
                      setResultForm((p) => ({ ...p, resultText: e.target.value }))
                    }
                    placeholder="e.g. CSK Won by 20 Runs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Player of the Match (POTM)
                    </label>
                    <input
                      type="text"
                      value={resultForm.potm}
                      onChange={(e) => setResultForm((p) => ({ ...p, potm: e.target.value }))}
                      placeholder="e.g. Matheesha Pathirana"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      POTM Role / Stat
                    </label>
                    <input
                      type="text"
                      value={resultForm.potmRole}
                      onChange={(e) =>
                        setResultForm((p) => ({ ...p, potmRole: e.target.value }))
                      }
                      placeholder="e.g. 4/28 in 4 ov"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Match Venue */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Match Venue / Stadium
                </label>
                <input
                  type="text"
                  value={resultForm.venue}
                  onChange={(e) => setResultForm((p) => ({ ...p, venue: e.target.value }))}
                  placeholder="MA Chidambaram Stadium, Chepauk, Chennai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Checkbox: Show as Featured on Website */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheckbox"
                  checked={Boolean(resultForm.isFeatured)}
                  onChange={(e) =>
                    setResultForm((p) => ({ ...p, isFeatured: e.target.checked }))
                  }
                  className="rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-yellow-400 cursor-pointer"
                />
                <label
                  htmlFor="featuredCheckbox"
                  className="text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Show this match scorecard as the main Match Center card on the website
                </label>
              </div>

              {/* Save & Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResultFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {saving
                      ? 'Saving...'
                      : resultFormMode === 'create'
                      ? 'Save to Past Matches'
                      : 'Update Past Match'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ================= PAST MATCHES ARCHIVE TABLE ================= */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>{selectedFranchise} Completed Matches Archive ({filteredPastMatches.length})</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Year Filter */}
                <select
                  value={pastYearFilter}
                  onChange={(e) => setPastYearFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
                >
                  <option value="ALL">All Years ({completedFixtures.length})</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={String(yr)}>
                      Year {yr}
                    </option>
                  ))}
                </select>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={pastSearchQuery}
                    onChange={(e) => setPastSearchQuery(e.target.value)}
                    placeholder="Search opponent..."
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredPastMatches.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <div>No completed past matches found for {selectedFranchise}.</div>
                <button
                  type="button"
                  onClick={handleOpenAddResult}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  + Click here to log a new match result
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-yellow-400 uppercase text-[11px] font-black border-b border-slate-800">
                      <th className="py-3 px-3">Year &amp; Date</th>
                      <th className="py-3 px-3">Matchup</th>
                      <th className="py-3 px-3">Final Scores</th>
                      <th className="py-3 px-3">Winner &amp; Margin</th>
                      <th className="py-3 px-3">POTM</th>
                      <th className="py-3 px-3 text-center">Hero on Site</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {filteredPastMatches.map((f, idx) => {
                      const isFeatured = Boolean(f.isFeatured);
                      const isHomeWin = Boolean(
                        f.winner &&
                          (f.winner.toLowerCase().includes((f.homeShort || '').toLowerCase()) ||
                            f.winner.toLowerCase().includes((f.homeTeam || '').toLowerCase()))
                      );
                      const isAwayWin = Boolean(
                        f.winner &&
                          (f.winner.toLowerCase().includes((f.awayShort || '').toLowerCase()) ||
                            f.winner.toLowerCase().includes((f.awayTeam || '').toLowerCase()))
                      );

                      return (
                        <tr
                          key={f._id || idx}
                          className={`hover:bg-slate-800/40 transition ${
                            isFeatured ? 'bg-yellow-500/5' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 mr-1.5">
                              {f.year || 2026}
                            </span>
                            <span className="font-bold text-white">{f.date || 'Date'}</span>
                          </td>

                          <td className="py-3 px-3 font-extrabold text-white">
                            {f.homeShort} vs {f.awayShort}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            <div className={isHomeWin ? 'text-emerald-400 font-bold' : ''}>
                              {f.homeShort}: <strong className="text-white">{f.homeScore}</strong>{' '}
                              {f.homeOvers ? `(${f.homeOvers})` : ''}
                            </div>
                            <div className={isAwayWin ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                              {f.awayShort}: {f.awayScore}{' '}
                              {f.awayOvers ? `(${f.awayOvers})` : ''}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-emerald-400 font-bold">
                            🏆 {f.resultText || `${f.winner || f.homeShort} Won`}
                          </td>

                          <td className="py-3 px-3 text-slate-300">
                            {f.potm ? (
                              <div>
                                <span className="font-bold text-white">{f.potm}</span>
                                {f.potmRole && (
                                  <span className="text-[10px] text-slate-400 block">
                                    {f.potmRole}
                                  </span>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isFeatured ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                                ★ Showing on Site
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMakeFeatured(f._id)}
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                                title="Show as the active match score on the website"
                              >
                                Show on Site
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditResult(f)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer"
                                title="Edit this past match scorecard"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFixture(f._id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                title="Delete match from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
