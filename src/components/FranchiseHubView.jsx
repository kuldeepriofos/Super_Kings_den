'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Flame, 
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { FIXTURES } from '../data/mockData';
import postsIndex from '../data/postsIndex.json';

const FRANCHISES_DATA = {
  CSK: {
    id: 'CSK',
    short: 'CSK',
    name: 'Chennai Super Kings',
    league: 'Indian Premier League (IPL)',
    country: 'India',
    flag: '🇮🇳',
    logo: '/csk-logo.svg',
    founded: '2008',
    stadium: 'MA Chidambaram Stadium (Chepauk, Chennai)',
    capacity: '38,000+',
    captain: 'MS Dhoni / Ruturaj Gaikwad',
    coach: 'Stephen Fleming',
    titles: '5× IPL Titles (2010, 2011, 2018, 2021, 2023) + 2× CLT20 (2010, 2014)',
    slogan: '#WhistlePodu • AnbuDen Fortress',
    description: 'Chennai Super Kings is one of the most successful and revered franchises in T20 cricket history. Powered by the iconic leadership of MS Dhoni and the Yellow Army faithful, CSK represents consistency, composure, and championship pedigree at Chepauk.',
    colorGradient: 'from-[#1c63b7] via-[#1d418c] to-[#0a192f]',
    badgeClass: 'bg-amber-400/20 text-amber-900 dark:text-csk-yellow border-amber-400/30',
    accentColor: '#FFCB05',
    href: '/chennai-super-kings',
    newsHref: '/csk-news',
  },
  JSK: {
    id: 'JSK',
    short: 'JSK',
    name: 'Joburg Super Kings',
    league: 'SA20 League',
    country: 'South Africa',
    flag: '🇿🇦',
    logo: '/jsk-logo.svg',
    founded: '2022',
    stadium: 'The Wanderers Stadium (The Bullring, Johannesburg)',
    capacity: '34,000+',
    captain: 'Faf du Plessis / Donovan Ferreira',
    coach: 'Stephen Fleming / Albie Morkel',
    titles: 'SA20 Semifinalists & Contenders',
    slogan: '#WhistleForJoburg • Yellow & Green Bullring',
    description: 'Joburg Super Kings is the South African sibling in the Super Kings family. Based at the historic Wanderers Stadium in Johannesburg, JSK brings the trademark fighting spirit and yellow pride to Cricket South Africa’s premier SA20 tournament.',
    colorGradient: 'from-emerald-600 via-teal-800 to-csk-darkNavy',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    accentColor: '#10B981',
    href: '/joburg-super-kings',
    newsHref: '/jsk-news',
  },
  TSK: {
    id: 'TSK',
    short: 'TSK',
    name: 'Texas Super Kings',
    league: 'Major League Cricket (MLC)',
    country: 'United States',
    flag: '🇺🇸',
    logo: '/tsk-logo.png',
    founded: '2023',
    stadium: 'Grand Prairie Stadium (Dallas, Texas)',
    capacity: '15,000+',
    captain: 'Faf du Plessis',
    coach: 'Stephen Fleming / Dwayne Bravo',
    titles: 'MLC Inaugural Playoff Finalists',
    slogan: '#WhistleForTexas • Howdy Yellow Army',
    description: 'Texas Super Kings represents the global expansion of the Super Kings banner into North America. Playing at the premier Grand Prairie Stadium in Texas, TSK carries the roar of the lion into America’s fast-growing Major League Cricket.',
    colorGradient: 'from-blue-700 via-indigo-900 to-csk-darkNavy',
    badgeClass: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
    accentColor: '#3B82F6',
    href: '/texas-super-kings',
    newsHref: '/tsk-news',
  }
};

export default function FranchiseHubView({ franchiseId = 'CSK', posts = null }) {
  const data = FRANCHISES_DATA[franchiseId] || FRANCHISES_DATA.CSK;
  const [logoFailed, setLogoFailed] = useState(false);

  // Filter next fixture for this franchise
  const match = FIXTURES.find(f => f.franchise === data.id) || FIXTURES[0];

  // Filter latest 6 articles for this franchise from dynamic posts
  const sourcePosts = (posts && posts.length > 0) ? posts : postsIndex;
  const franchisePosts = (sourcePosts || []).filter(p => {
    if (p.franchise === data.id) return true;
    const title = (p.title || '').toLowerCase();
    const excerpt = (p.excerpt || '').toLowerCase();
    const slug = (p.slug || '').toLowerCase();
    if (data.id === 'CSK') {
      return title.includes('csk') || title.includes('chennai') || title.includes('dhoni') || title.includes('chepauk');
    } else if (data.id === 'JSK') {
      return title.includes('jsk') || title.includes('joburg') || title.includes('sa20') || title.includes('wanderers');
    } else if (data.id === 'TSK') {
      return title.includes('tsk') || title.includes('texas') || title.includes('mlc') || slug.includes('texas');
    }
    return false;
  }).slice(0, 6);

  // Other two franchises for quick switcher
  const otherFranchises = Object.values(FRANCHISES_DATA).filter(f => f.id !== data.id);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
      {/* ─── Breadcrumb & Navigation ─── */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">Global Family</span>
        <span>/</span>
        <span className="font-bold text-amber-600 dark:text-csk-yellow">{data.name}</span>
      </div>

      {/* ─── Hero Banner ─── */}
      <div className={`relative rounded-3xl p-6 sm:p-10 mb-10 overflow-hidden bg-gradient-to-br ${data.colorGradient} text-white shadow-xl border border-white/10`}>
        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {/* Team Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center shrink-0 border border-white/30">
              {logoFailed ? (
                <span className="text-2xl font-black text-slate-900 font-display">
                  {data.short}
                </span>
              ) : (
                <img
                  src={data.logo}
                  alt={data.name}
                  className="w-full h-full object-contain"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {data.flag} {data.country}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/30 backdrop-blur-md text-white border border-white/20">
                  {data.league}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-2">
                {data.name}
              </h1>

              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-2xl">
                {data.slogan}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href={data.newsHref}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-wider transition shadow-md inline-flex items-center"
            >
              <span>{data.short} News Hub</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Short Bio */}
        <p className="relative z-10 mt-6 pt-6 border-t border-white/15 text-xs sm:text-sm text-white/80 leading-relaxed max-w-4xl">
          {data.description}
        </p>
      </div>

      {/* ─── 4 Quick Facts Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Card 1: Stadium */}
        <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Home Fortress</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-csk-yellow">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
              {data.stadium}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Capacity: {data.capacity}
            </span>
          </div>
        </div>

        {/* Card 2: Leadership */}
        <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leadership</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
              {data.captain}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Head Coach: {data.coach}
            </span>
          </div>
        </div>

        {/* Card 3: Championships */}
        <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Championships</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-csk-yellow">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
              {data.titles}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Established: {data.founded}
            </span>
          </div>
        </div>

        {/* Card 4: Global Affiliation */}
        <div className="sports-card rounded-2xl p-5 border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Franchise Group</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
              Super Kings Family
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              CSK Cricket Limited
            </span>
          </div>
        </div>
      </div>

      {/* ─── Featured Marquee Matchday Card ─── */}
      {match && (
        <div className="sports-card rounded-2xl p-6 border border-slate-200 dark:border-csk-borderNavy mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-csk-yellow border border-amber-500/30 flex items-center">
                <Zap className="w-3 h-3 mr-1" /> Marquee Matchday
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {match.tournament}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3">
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-amber-500" /> {match.date}</span>
              <span>&bull;</span>
              <span>{match.time}</span>
            </div>
          </div>

          <div className="flex items-center justify-around py-3">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display block">
                {match.homeShort}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {match.homeTeam}
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-amber-700 dark:text-csk-yellow">
              VS
            </div>

            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display block">
                {match.awayShort}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {match.awayTeam}
              </span>
            </div>
          </div>

          <div className="text-center pt-3 text-xs text-slate-500 dark:text-slate-400">
            Venue: <strong className="text-slate-700 dark:text-slate-200">{match.venue}</strong>
          </div>
        </div>
      )}

      {/* ─── Latest Franchise Articles ─── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
                Latest {data.short} Dispatches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
                Exclusive updates, roster moves &amp; match analysis
              </p>
            </div>
          </div>

          <Link
            href={data.newsHref}
            className="text-xs font-bold text-amber-700 dark:text-csk-yellow hover:underline flex items-center"
          >
            <span>View All News</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {franchisePosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {franchisePosts.map((post) => (
              <Link
                key={post.id || post.slug}
                href={`/${post.slug}`}
                className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.target.src = "/uploads/2026/06/Chennai-Super-Kings-2026.jpg";
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950/80 text-csk-yellow border border-csk-yellow/30">
                      {data.short}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug mb-2 font-display">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{post.date}</span>
                  <span className="font-bold text-amber-600 dark:text-csk-yellow flex items-center group-hover:translate-x-0.5 transition">
                    Read Story <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="sports-card rounded-2xl p-8 text-center border border-slate-200 dark:border-csk-borderNavy text-slate-500 text-sm">
            No specific dispatches found. Check out the <Link href={data.newsHref} className="text-amber-600 dark:text-csk-yellow font-bold underline">full news feed</Link>.
          </div>
        )}
      </div>

      {/* ─── Switch To Other Global Franchises ─── */}
      <div className="pt-6 border-t border-slate-200 dark:border-white/10">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
          Explore Other Super Kings Franchises
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherFranchises.map((other) => (
            <Link
              key={other.id}
              href={other.href || `/${other.id.toLowerCase()}`}
              className="sports-card group p-5 rounded-2xl border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/60 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-2xl">{other.flag}</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition">
                    {other.name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {other.league}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-csk-yellow group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
