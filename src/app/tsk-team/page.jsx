import React from 'react';
import Link from 'next/link';
import { Users, ChevronRight, Shield, Award, Sparkles, GraduationCap } from 'lucide-react';
import TSKTeamRoster from '../../components/TSKTeamRoster';
import TSKCoachesSection from '../../components/TSKCoachesSection';
import { fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'TSK Team 2026 — Official Texas Super Kings Player Squad | Super Kings Den',
  description: 'Complete Texas Super Kings (TSK) 2026 player squad roster: Marcus Stoinis (C), Devon Conway (WK), Noor Ahmad, Akeal Hosein, Dwayne Bravo, Mitchell Santner, and all USA & international stars.',
  alternates: {
    canonical: 'https://superkingsden.com/tsk-team',
  },
  openGraph: {
    title: 'TSK Team 2026 — Official Player Squad | Super Kings Den',
    description: 'Explore the full 15-member Texas Super Kings 2026 squad, roles, statistics, specialties, and jersey numbers.',
    url: 'https://superkingsden.com/tsk-team',
    siteName: 'Super Kings Den',
  },
};

export default async function TSKTeamPage() {
  const players = await fetchLivePlayerProfiles('TSK');
  const currentCount = players.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
        <Link href="/" className="hover:text-csk-yellow transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/texas-super-kings" className="hover:text-csk-yellow transition">Texas Super Kings</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-bold">2026 Team Squad</span>
      </nav>

      {/* ─── Header Banner ─── */}
      <div className="csk-hero-banner mb-8">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Official Lone Star Army Roster &bull; MLC Season 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          TSK Team 2026 &bull; Official Player Squad
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-4">
          Meet the {currentCount} Texas Super Kings defending Grand Prairie Stadium, Dallas in the 2026 Major League Cricket season. Commanded by captain Marcus Stoinis, prolific anchor Devon Conway, and wizard spinner Noor Ahmad.
        </p>

        {/* Quick Highlights Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-white font-bold backdrop-blur-xs border border-white/15">
            <Shield className="w-3 h-3 text-csk-yellow" />
            <span>{currentCount} Squad Members</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 text-csk-yellow font-bold backdrop-blur-xs border border-amber-500/30">
            <Award className="w-3 h-3 text-csk-yellow" />
            <span>Captain: Marcus Stoinis</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-white font-bold backdrop-blur-xs border border-white/15">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Master Anchor: Devon Conway (#88)</span>
          </span>
          <a
            href="#coaching-staff"
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-csk-yellow font-bold backdrop-blur-xs border border-white/15 transition cursor-pointer"
          >
            <GraduationCap className="w-3 h-3 text-csk-yellow" />
            <span>8 Support Staff &darr;</span>
          </a>
        </div>
      </div>

      {/* ─── Interactive Full Squad Showcase ─── */}
      <TSKTeamRoster players={players} />

      {/* ─── Section Divider ─── */}
      <div className="my-10 sm:my-14 border-t border-slate-200 dark:border-white/10" />

      {/* ─── Official Coaching & Support Staff Think Tank ─── */}
      <TSKCoachesSection featuredOnly={false} className="mb-6" />
    </div>
  );
}
