'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Sparkles } from 'lucide-react';

const JSK_FEATURED_PLAYERS = [
  {
    id: 'jsk-faf',
    slug: 'faf-du-plessis',
    name: 'Faf du Plessis',
    role: 'Captain & Opening Batter',
    category: 'BAT',
    country: 'South Africa',
    jersey: '13',
    tag: 'Captain',
    specialty: 'Inaugural SA20 Centurion, Tactical Mastermind & Aggressive Opener',
    avatar: '/players/faf-du-plessis.png'
  },
  {
    id: 'jsk-ferreira',
    slug: 'donovan-ferreira',
    name: 'Donovan Ferreira',
    role: 'Wicketkeeper-Batter',
    category: 'WK',
    country: 'South Africa',
    jersey: '41',
    tag: 'Bullring Finisher',
    specialty: 'SA20 Record Fast Fifties, Powerful Boundary Clearer & Versatile Glovework',
    avatar: null
  },
  {
    id: 'jsk-forrester',
    slug: 'dian-forrester',
    name: 'Dian Forrester',
    role: 'Batting All-Rounder',
    category: 'ALL',
    country: 'South Africa',
    jersey: '27',
    tag: 'Impact Star',
    specialty: 'Explosive Death-Overs Finisher & Sharp Right-Arm Fast Seamer',
    avatar: '/players/dian-forrester.png'
  },
  {
    id: 'jsk-brevis',
    slug: 'dewald-brevis',
    name: 'Dewald Brevis',
    role: 'Explosive Top-Order Batter',
    category: 'BAT',
    country: 'South Africa',
    jersey: '17',
    tag: 'Power Hitter',
    specialty: '360-Degree Power Striking & Leg-Spin Variation',
    avatar: '/players/dewald-brevis.png'
  }
];

export default function JSKCurrentSquadSection({ className = "mb-8 sm:mb-10" }) {
  return (
    <section className={className}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              JSK Current Squad
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
              Active Joburg Super Kings 2026 Core Stars &bull; Official SA20 Squad
            </p>
          </div>
        </div>

        {/* View All Players Link -> /jsk-team */}
        <Link
          href="/jsk-team"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-csk-yellow hover:underline self-start sm:self-auto group"
        >
          <span>View All Players (Full Squad)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 4 Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {JSK_FEATURED_PLAYERS.map((player, idx) => {
          const isFourth = idx === 3;
          const playerUrl = isFourth ? '/jsk-team' : `/${player.slug}/`;

          return (
            <Link
              key={player.id}
              href={playerUrl}
              className="sports-card group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy flex flex-col justify-between hover:border-csk-yellow/80 transition-all duration-300 bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              {/* Card Inner Content (Blurred on 4th Player) */}
              <div className={`flex flex-col justify-between h-full ${
                isFourth ? 'filter blur-[5px] select-none pointer-events-none opacity-70 dark:opacity-60' : ''
              }`}>
                {/* Standardized Hero Portrait Container */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-gradient-to-b from-amber-500/5 via-slate-100/60 to-white dark:from-csk-navy/60 dark:via-slate-900/60 dark:to-slate-900 flex items-end justify-center border-b border-slate-100 dark:border-white/5">
                  {/* Subtle Studio Lighting Glow (Super Kings Gold) */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at 50% 65%, rgba(253, 185, 19, 0.25) 0%, rgba(253, 185, 19, 0.05) 55%, transparent 75%)'
                    }}
                  />

                  {/* Badges Floating on Top of Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-950/80 text-amber-700 dark:text-csk-yellow border border-amber-500/20 shadow-xs backdrop-blur-xs">
                      {player.category}
                    </span>

                    {player.tag ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 shadow-xs flex items-center tracking-wider">
                        <Sparkles className="w-2.5 h-2.5 mr-1" /> {player.tag}
                      </span>
                    ) : player.jersey ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-950/70 border border-slate-200/50 dark:border-white/5 backdrop-blur-xs">
                        #{player.jersey}
                      </span>
                    ) : null}
                  </div>

                  {/* Cutout Player Bust */}
                  <div className="relative z-5 w-full h-[90%] flex items-end justify-center px-4">
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="h-full w-auto max-w-[85%] object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-2xl font-display mb-4">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    {/* Player Name & Role */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-display mb-0.5 line-clamp-1">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                      {player.role}
                    </p>

                    {/* Specialty Pill */}
                    {player.specialty && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 mb-3">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Specialty</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">{player.specialty}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                      {player.country}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-csk-yellow flex items-center group-hover:translate-x-1 transition-transform">
                      Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </div>

              {/* 4th Card Centered Action Button Overlay (Super Kings Yellow) */}
              {isFourth && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/10 dark:bg-black/25">
                  <div className="px-5 py-3 rounded-full bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider shadow-2xl group-hover:scale-105 group-hover:bg-amber-300 transition-all duration-300 flex items-center gap-2 border border-amber-300 ring-4 ring-black/10 dark:ring-white/10">
                    <Users className="w-4 h-4" />
                    <span>See More Players</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA to /squad (Super Kings Yellow) */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-50 dark:via-slate-900 to-amber-500/10 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-csk-yellow/20 border border-csk-yellow/40 flex items-center justify-center shrink-0 text-amber-600 dark:text-csk-yellow font-black">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Want to explore the entire 2026 Joburg Super Kings squad?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore all official JSK cricketers, South African domestic talents, overseas stars, and full team roster.
            </p>
          </div>
        </div>

        <Link
          href="/jsk-team"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-black text-xs uppercase tracking-wider transition shadow-sm hover:shadow-md flex items-center gap-2 group"
        >
          <span>View All JSK Squad &bull; Squad Hub</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
