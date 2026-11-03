'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Search, Award, Activity, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

const OFFICIAL_STAFF = [
  {
    id: 26,
    slug: 'stephen-fleming',
    name: 'Stephen Fleming',
    role: 'Head Coach',
    department: 'Coaching',
    country: 'New Zealand',
    flag: '🇳🇿',
    avatar: '/staff/stephen-fleming.png',
    highlight: '5× IPL & 2× CLT20 Champion Coach',
    tenure: 'Head Coach since 2009',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: "Stephen Fleming serves as the head coach of Chennai Super Kings. The longest-serving and most successful head coach in IPL history, guiding CSK to 5 IPL titles and 2 Champions League T20 crowns."
  },
  {
    id: 27,
    slug: 'michael-hussey',
    name: 'Michael Hussey',
    role: 'Batting Coach',
    department: 'Coaching',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: '/staff/michael-hussey.png',
    highlight: 'Mr. Cricket • Orange Cap Legend',
    tenure: 'Batting Coach since 2018',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: "Michael Hussey is a former Australian batting great and Orange Cap winner who serves as the batting coach of CSK, instilling technical discipline, composure, and tactical gameplans."
  },
  {
    id: 29,
    slug: 'eric-simons',
    name: 'Eric Simons',
    role: 'Bowling Coach',
    department: 'Coaching',
    country: 'South Africa',
    flag: '🇿🇦',
    avatar: '/staff/eric-simons.png',
    highlight: 'Pace & Chepauk Spin Mastermind',
    tenure: 'Bowling Mentor since 2010',
    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    bio: "Eric Simons currently serves as the bowling coach of the Chennai Super Kings. A mastermind of bowling strategy, he crafts Chepauk-specific lines, variations, and matchup execution for both pacers and spinners."
  },
  {
    id: 30,
    slug: 'rajiv-kumar',
    name: 'Rajiv Kumar',
    role: 'Assistant Batting Coach',
    department: 'Coaching',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/rajiv-kumar.png',
    highlight: 'Domestic Batting Tactician',
    tenure: 'Long-standing CSK Coaching Staff',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    bio: "Rajiv Kumar is the Assistant Batting Coach and trusted domestic mentor who prepares top-order and middle-order batters with customized matchup training and shot selection."
  },
  {
    id: 47,
    slug: 'sridharan-sriram',
    name: 'Sridharan Sriram',
    role: 'Assistant Bowling Coach',
    department: 'Coaching',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/sridharan-sriram.png',
    highlight: 'International Spin Specialist',
    tenure: 'CSK Bowling Think Tank',
    badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    bio: "Sridharan Sriram is the assistant bowling coach at CSK. A highly respected international spin strategist who has worked extensively across global T20 leagues and international setups."
  },
  {
    id: 37,
    slug: 'james-foster',
    name: 'James Foster',
    role: 'Fielding Coach',
    department: 'Coaching',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    avatar: '/staff/james-foster.png',
    highlight: 'Elite Gloveman & Agility Coach',
    tenure: 'Fielding Specialist',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    bio: "Former England international wicketkeeper-batter who directs high-intensity fielding drills, reflex training, and boundary-saving tactics as the Fielding Coach for CSK."
  },
  {
    id: 31,
    slug: 'taifun-simsek',
    name: 'Taifun Simsek',
    role: 'Head Physiotherapist',
    department: 'Medical & Performance',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: '/staff/taifun-simsek.png',
    highlight: 'Sports Medicine & Recovery Lead',
    tenure: 'Head Physio',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    bio: "Taifun Simsek serves as the head physiotherapist of Chennai Super Kings, managing sports medicine, advanced muscle recovery, and injury rehabilitation throughout the tournament."
  },
  {
    id: 32,
    slug: 'gregory-king',
    name: 'Gregory King',
    role: 'Strength & Conditioning Coach',
    department: 'Medical & Performance',
    country: 'South Africa',
    flag: '🇿🇦',
    avatar: '/staff/gregory-king.png',
    highlight: 'Elite Athletic Conditioning',
    tenure: 'Strength & Conditioning Lead',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    bio: "Gregory Allen King serves as the Strength and Conditioning Coach of CSK. Former trainer of the South African national team and Indian national team, engineering elite athletic fitness."
  },
  {
    id: 34,
    slug: 'dr-madhu-thottappillil',
    name: 'Dr. Madhu Thottappillil',
    role: 'Team Doctor',
    department: 'Medical & Performance',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/dr-madhu-thottappillil.png',
    highlight: 'Pillar Since 2008 Inception',
    tenure: 'Chief Medical Officer since 2008',
    badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    bio: "Dr. Madhu Thottappillil has served as the official Team Doctor for Chennai Super Kings since the inaugural IPL edition in 2008, managing emergency medical protocol and player wellbeing."
  },
  {
    id: 48,
    slug: 'david-reid',
    name: 'David Reid',
    role: 'Sports Psychologist',
    department: 'Medical & Performance',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: '/staff/david-reid.png',
    highlight: 'Mental Conditioning & Resilience',
    tenure: 'Team Psychologist',
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
    bio: "David Reid is the high-performance mental conditioning coach and sports psychologist at CSK, cultivating mental resilience, focus under pressure, and championship composure."
  },
  {
    id: 33,
    slug: 'russell-radhakrishnan',
    name: 'Russell Radhakrishnan',
    role: 'Team Manager',
    department: 'Management & Operations',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/russell-radhakrishnan.png',
    highlight: 'Foundational CSK Pillar Since 2008',
    tenure: 'Team Manager since 2008',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    bio: "Russell Radhakrishnan has been serving as the Team Manager of Chennai Super Kings since the inception of the IPL in 2008, orchestrating all squad logistics, operations, and team coordination."
  },
  {
    id: 36,
    slug: 'sanjay-natarajan',
    name: 'Sanjay Natarajan',
    role: 'Logistics Manager',
    department: 'Management & Operations',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/sanjay-natarajan.png',
    highlight: 'Global Travel & Gear Operations',
    tenure: 'Logistics Manager',
    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    bio: "Sanjay Natarajan is the Logistics Manager of Chennai Super Kings, orchestrating seamless player travel, kit management, hotel logistics, and ground operations across all venues."
  },
  {
    id: 60,
    slug: 'ar-srikkanth',
    name: 'AR Srikkanth',
    role: 'Lead Team Analyst',
    department: 'Management & Operations',
    country: 'India',
    flag: '🇮🇳',
    avatar: '/staff/ar-srikkanth.png',
    highlight: 'Big Data, Matchups & Strategy',
    tenure: 'Lead Analyst',
    badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    bio: "AR Srikkanth serves as the Lead Analyst at Chennai Super Kings, decoding opposition matchups, field positioning data, and ball-by-ball analytics for the team think tank."
  }
];

function StaffCard({ staff, isBlurred = false }) {
  return (
    <Link
      href="/csk-team#coaching-staff"
      className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between hover:border-csk-yellow/80 transition-all duration-300 bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
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
            CSK
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
              {staff.tenure.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Centered Button Overlay for 4th Blurred Coach */}
      {isBlurred && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/10 dark:bg-black/25">
          <div className="px-5 py-3 rounded-full bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider shadow-2xl group-hover:scale-105 group-hover:bg-amber-300 transition-all duration-300 flex items-center gap-2 border border-amber-300 ring-4 ring-black/10 dark:ring-white/10">
            <Shield className="w-4 h-4" />
            <span>See More Coaches</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}
    </Link>
  );
}

export default function CSKCoachesSection({ className = "mb-0", featuredOnly = false }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    { id: 'ALL', label: 'All Staff (13)' },
    { id: 'Coaching', label: 'Coaching Think Tank' },
    { id: 'Medical & Performance', label: 'Medical & Fitness' },
    { id: 'Management & Operations', label: 'Operations & Analytics' }
  ];

  const filteredStaff = useMemo(() => {
    return OFFICIAL_STAFF.filter((staff) => {
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

  // Featured Coaches Mode (3 visible + 4th blurred)
  if (featuredOnly) {
    const featuredCoaches = OFFICIAL_STAFF.slice(0, 4);

    return (
      <section className={className}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
                CSK Coaching &amp; Support Staff
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
                Official Head Coaches &bull; Masterminds behind the 5-time championship dynasty
              </p>
            </div>
          </div>

          {/* View All Support Staff Link -> /csk-team#coaching-staff */}
          <Link
            href="/csk-team#coaching-staff"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-csk-yellow hover:underline self-start sm:self-auto group"
          >
            <span>View All Support Staff (13 Members)</span>
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

  // Full 13-Member Interactive Staff Hub
  return (
    <section id="coaching-staff" className={className}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              CSK Coaching &amp; Support Staff
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              The 13 official strategic masterminds and backroom specialists behind Chennai Super Kings' championship pedigree
            </p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-csk-yellow self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5" />
          <span>Official 13-Member Think Tank</span>
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

      {/* Staff Grid with Standardized Hero Portraits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} />
        ))}
      </div>
    </section>
  );
}
