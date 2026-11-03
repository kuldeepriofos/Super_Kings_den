'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Search, Award, Activity, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

const TSK_OFFICIAL_STAFF = [
  {
    id: 'tsk-coach-1',
    name: 'Stephen Fleming',
    role: 'Head Coach',
    department: 'Coaching',
    country: 'New Zealand',
    flag: '🇳🇿',
    avatar: '/staff/stephen-fleming.png',
    highlight: 'Global Head Coach & Strategist',
    tenure: 'Head Coach',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: 'Stephen Fleming leads Texas Super Kings as Head Coach, replicating the calm authority, analytical excellence, and championship culture of Chennai in Major League Cricket.'
  },
  {
    id: 'tsk-coach-2',
    name: 'Dwayne Bravo',
    role: 'Assistant Coach & Mentor',
    department: 'Coaching',
    country: 'West Indies',
    flag: '🇹🇹',
    avatar: '/staff/michael-hussey.png',
    highlight: '5× T20 Champion & Death-Overs Icon',
    tenure: 'Assistant Coach',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: 'Legendary all-rounder and mentor who imparts death-overs mastery, slower-ball variations, athletic fielding drills, and championship mentality to the TSK dugout.'
  },
  {
    id: 'tsk-coach-3',
    name: 'Eric Simons',
    role: 'Bowling Consultant',
    department: 'Coaching',
    country: 'South Africa',
    flag: '🇿🇦',
    avatar: '/staff/eric-simons.png',
    highlight: 'International Seam Specialist',
    tenure: 'Bowling Consultant',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: 'Senior bowling coach who architects match-up strategies and customized length variations suited for American cricket venues like Grand Prairie Stadium in Dallas.'
  },
  {
    id: 'tsk-coach-4',
    name: 'Albie Morkel',
    role: 'White-Ball Consultant',
    department: 'Coaching',
    country: 'South Africa',
    flag: '🇿🇦',
    avatar: '/staff/eric-simons.png',
    highlight: 'Power Hitting & Seam Specialist',
    tenure: 'Consultant',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: 'Proteas and Super Kings icon who advises on middle-overs acceleration, situational gameplans, and dynamic lower-order hitting for American conditions.'
  },
  {
    id: 'tsk-coach-5',
    name: 'David Reid',
    role: 'High Performance Director',
    department: 'Medical & Performance',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: '/staff/david-reid.png',
    highlight: 'Mental Resilience & Performance',
    tenure: 'Performance Lead',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    bio: 'High-performance specialist cultivating mental toughness, recovery optimization, and razor-sharp composure under the unique tournament pressures of Major League Cricket.'
  },
  {
    id: 'tsk-coach-6',
    name: 'Tommy Simsek',
    role: 'Head Physiotherapist',
    department: 'Medical & Performance',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: '/staff/taifun-simsek.png',
    highlight: 'Elite Sports Physiotherapy Lead',
    tenure: 'Head Physio',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    bio: 'Senior sports physiotherapist managing acute injury mitigation, joint mobility, and climate-specific hydration and recovery across the Texas heat.'
  },
  {
    id: 'tsk-coach-7',
    name: 'AR Srikkanth',
    role: 'Team Strategic Analyst',
    department: 'Management & Operations',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/ar-srikkanth.png',
    highlight: 'Big Data & Matchup Specialist',
    tenure: 'Lead Analyst',
    badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    bio: 'Veteran cricket analytics lead who decodes opposition strengths, boundary size data, and ball-by-ball tactical scenarios for Texas Super Kings.'
  },
  {
    id: 'tsk-coach-8',
    name: 'Russell Radhakrishnan',
    role: 'Franchise Operations Director',
    department: 'Management & Operations',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/russell-radhakrishnan.png',
    highlight: 'Foundational Super Kings Pillar',
    tenure: 'Operations Director',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: 'Directs overall squad movement, domestic US coordination, team headquarters operations, and player travel throughout Major League Cricket.'
  }
];

function StaffCard({ staff, isBlurred = false }) {
  return (
    <div
      className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between hover:border-csk-yellow/80 transition-all duration-300 bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-xl hover:-translate-y-1"
    >
      <div className={`flex flex-col justify-between h-full ${
        isBlurred ? 'filter blur-[5px] select-none pointer-events-none opacity-70 dark:opacity-60' : ''
      }`}>
        {/* Standardized Hero Portrait Container */}
        <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-gradient-to-b from-amber-500/5 via-slate-100/60 to-white dark:from-csk-navy/60 dark:via-slate-900/60 dark:to-slate-900 flex items-end justify-center border-b border-slate-100 dark:border-white/5">
          {/* Subtle Studio Lighting Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-90 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at 50% 65%, rgba(253, 185, 19, 0.22) 0%, rgba(253, 185, 19, 0.04) 55%, transparent 75%)'
            }}
          />

          {/* Department Watermark */}
          <span className="absolute top-2 right-3 text-5xl font-black text-slate-900/5 dark:text-white/5 select-none pointer-events-none font-heading group-hover:text-csk-yellow/15 transition-colors duration-300">
            TSK
          </span>

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-xs ${staff.badgeClass}`}>
              {staff.role}
            </span>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/10 shadow-2xs backdrop-blur-xs">
              {staff.flag} {staff.country}
            </span>
          </div>

          {/* Official Cutout Image */}
          <div className="relative z-5 w-full h-[92%] flex items-end justify-center px-4">
            <img
              src={staff.avatar}
              alt={staff.name}
              className="h-full w-auto max-w-[85%] object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-display">
                {staff.name}
              </h3>
            </div>

            <p className="text-xs font-black text-amber-700 dark:text-csk-yellow uppercase tracking-wider mb-2">
              {staff.role}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">
              {staff.bio}
            </p>
          </div>

          {/* Card Footer */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[65%]">
              {staff.highlight}
            </span>
            <span className="font-bold text-amber-600 dark:text-csk-yellow shrink-0">
              {staff.tenure}
            </span>
          </div>
        </div>
      </div>

      {/* Centered Button Overlay for 4th Blurred Coach */}
      {isBlurred && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/10 dark:bg-black/25">
          <Link
            href="/tsk-team#coaching-staff"
            className="px-5 py-3 rounded-full bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider shadow-2xl hover:scale-105 hover:bg-amber-300 transition-all duration-300 flex items-center gap-2 border border-amber-300 ring-4 ring-black/10 dark:ring-white/10"
          >
            <Shield className="w-4 h-4" />
            <span>See More Coaches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function TSKCoachesSection({ className = "mb-0", featuredOnly = true }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    { id: 'ALL', label: `All Staff (${TSK_OFFICIAL_STAFF.length})` },
    { id: 'Coaching', label: 'Coaching Think Tank' },
    { id: 'Medical & Performance', label: 'Medical & Fitness' },
    { id: 'Management & Operations', label: 'Operations & Strategy' }
  ];

  const filteredStaff = useMemo(() => {
    return TSK_OFFICIAL_STAFF.filter((staff) => {
      if (activeTab !== 'ALL' && staff.department !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = staff.name.toLowerCase().includes(q);
        const matchRole = staff.role.toLowerCase().includes(q);
        const matchCountry = staff.country.toLowerCase().includes(q);
        const matchBio = staff.bio.toLowerCase().includes(q);
        return matchName || matchRole || matchCountry || matchBio;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  // Featured Mode (for /texas-super-kings/ hub page: 3 visible + 4th blurred)
  if (featuredOnly) {
    const featuredCoaches = TSK_OFFICIAL_STAFF.slice(0, 4);

    return (
      <section className={className}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
                TSK Coaching &amp; Support Staff
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
                Official Head Coaches &bull; Strategic Masterminds behind the Grand Prairie campaign
              </p>
            </div>
          </div>

          {/* View All Support Staff Link -> /tsk-team#coaching-staff */}
          <Link
            href="/tsk-team#coaching-staff"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-csk-yellow hover:underline self-start sm:self-auto group"
          >
            <span>View All Support Staff ({TSK_OFFICIAL_STAFF.length} Members)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Coaches Grid: 3 Visible + 4th Blurred */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCoaches.map((staff, idx) => (
            <StaffCard key={staff.id} staff={staff} isBlurred={idx === 3} />
          ))}
        </div>
      </section>
    );
  }

  // Full Interactive Staff Hub (for /tsk-team/ page)
  return (
    <section id="coaching-staff" className={className}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              TSK Coaching &amp; Support Staff
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              The strategic masterminds and backroom specialists driving Texas Super Kings in Major League Cricket
            </p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-csk-yellow self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5" />
          <span>Official TSK Think Tank</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTab === d.id
                  ? 'bg-csk-yellow text-csk-darkNavy shadow-xs font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search coach or specialist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} />
        ))}
      </div>
    </section>
  );
}
