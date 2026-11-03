import React from 'react';
import Link from 'next/link';
import { Users, ChevronRight, Shield, Award, Sparkles, GraduationCap } from 'lucide-react';
import JSKTeamRoster from '../../components/JSKTeamRoster';
import JSKCoachesSection from '../../components/JSKCoachesSection';
import { fetchLivePlayerProfiles } from '../../services/api';

export const metadata = {
  title: 'JSK Team 2026 — Official Joburg Super Kings Player Squad | Super Kings Den',
  description: 'Complete Joburg Super Kings (JSK) 2026 player squad roster: Faf du Plessis (C), Devon Conway, Dian Forrester, Dewald Brevis, Lizaad Williams, Gerald Coetzee, and all South African & overseas stars.',
  alternates: {
    canonical: 'https://superkingsden.com/jsk-team',
  },
  openGraph: {
    title: 'JSK Team 2026 — Official Player Squad | Super Kings Den',
    description: 'Explore the full 15-member Joburg Super Kings 2026 squad, roles, statistics, specialties, and jersey numbers.',
    url: 'https://superkingsden.com/jsk-team',
    siteName: 'Super Kings Den',
  },
};

export default async function JSKTeamPage() {
  const players = await fetchLivePlayerProfiles('JSK');
  const currentCount = players.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
        <Link href="/" className="hover:text-csk-yellow transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/joburg-super-kings" className="hover:text-csk-yellow transition">Joburg Super Kings</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-bold">2026 Team Squad</span>
      </nav>

      {/* ─── Header Banner ─── */}
      <div className="csk-hero-banner mb-8">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Official Bullring Army Roster &bull; SA20 Season 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          JSK Team 2026 &bull; Official Player Squad
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-4">
          Meet the {currentCount} Joburg Super Kings defending the Bullring Fortress at Wanderers in the 2026 SA20 campaign. Led by inspirational captain Faf du Plessis, world-class anchor Devon Conway, and rising sensation Dian Forrester.
        </p>

        {/* Quick Highlights Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-white font-bold backdrop-blur-xs border border-white/15">
            <Shield className="w-3 h-3 text-csk-yellow" />
            <span>{currentCount} Squad Members</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 text-csk-yellow font-bold backdrop-blur-xs border border-amber-500/30">
            <Award className="w-3 h-3 text-csk-yellow" />
            <span>Captain: Faf du Plessis</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-white font-bold backdrop-blur-xs border border-white/15">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Key Star: Dian Forrester (#27)</span>
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
      <JSKTeamRoster players={players} />

      {/* ─── Section Divider ─── */}
      <div className="my-10 sm:my-14 border-t border-slate-200 dark:border-white/10" />

      {/* ─── Official Coaching & Support Staff Think Tank ─── */}
      <JSKCoachesSection featuredOnly={false} className="mb-6" />
    </div>
  );
}
