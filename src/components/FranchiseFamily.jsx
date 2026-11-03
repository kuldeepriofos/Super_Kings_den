'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ─── Team Logo with graceful fallback ─── */
function TeamLogo({ src, alt, color, short }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md shrink-0`}>
        {short}
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-md shrink-0 overflow-hidden p-1">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function FranchiseFamily({ selectedFranchise: propFranchise, onSelectFranchise: propOnSelect, className = "mb-8 sm:mb-10" }) {
  const context = useApp ? useApp() : {};
  const selectedFranchise = propFranchise || context.selectedFranchise || 'CSK';
  const onSelectFranchise = propOnSelect || context.setSelectedFranchise || (() => {});

  const franchises = [
    {
      id: 'CSK',
      name: 'Chennai Super Kings',
      short: 'CSK',
      logo: '/csk-logo.svg',
      league: 'Indian Premier League (IPL)',
      country: 'India',
      flag: '🇮🇳',
      dotClass: 'bg-[#FFCB05]',
      color: 'from-amber-500 to-csk-yellow',
      border: 'border-csk-yellow/50',
      stadium: 'MA Chidambaram Stadium (Chepauk)',
      titles: '5× IPL Titles (2010, 2011, 2018, 2021, 2023) + 2× CLT20',
      captain: 'MS Dhoni / Ruturaj Gaikwad',
      href: '/chennai-super-kings',
    },
    {
      id: 'JSK',
      name: 'Joburg Super Kings',
      short: 'JSK',
      logo: '/jsk-logo.svg',
      league: 'SA20 League',
      country: 'South Africa',
      flag: '🇿🇦',
      dotClass: 'bg-emerald-500',
      color: 'from-emerald-600 to-yellow-500',
      border: 'border-emerald-500/50',
      stadium: 'Wanderers Stadium, Johannesburg (The Bullring)',
      titles: 'SA20 Semifinalists & Contenders',
      captain: 'Faf du Plessis / Donovan Ferreira',
      href: '/joburg-super-kings',
    },
    {
      id: 'TSK',
      name: 'Texas Super Kings',
      short: 'TSK',
      logo: '/tsk-logo.png',
      league: 'Major League Cricket (MLC)',
      country: 'United States',
      flag: '🇺🇸',
      dotClass: 'bg-red-600',
      color: 'from-blue-700 via-red-600 to-csk-yellow',
      border: 'border-blue-500/50',
      stadium: 'Grand Prairie Stadium, Dallas, Texas',
      titles: 'MLC Playoff Contenders',
      captain: 'Faf du Plessis',
      href: '/texas-super-kings',
    }
  ];

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
            The Super Kings Global Family
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
            One Roar, Three Continents: India &bull; South Africa &bull; United States
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {franchises.map((f) => {
          return (
            <Link
              key={f.id}
              href={f.href}
              className="sports-card group relative rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/80 hover:shadow-csk-glow bg-white dark:bg-slate-900/60"
            >
              <div>
                {/* Team Logo + Country Badge */}
                <div className="flex items-center justify-between mb-5">
                  <TeamLogo src={f.logo} alt={f.name} color={f.color} short={f.short} />
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 block mb-1">
                      {f.league}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {f.flag} {f.country}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white font-heading group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition mb-1">
                  {f.name}
                </h3>

                <p className="text-xs font-semibold text-amber-700 dark:text-csk-yellow mb-4">
                  {f.titles}
                </p>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                  <p>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Home Fortress</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">{f.stadium}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Leadership</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">{f.captain}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-700 dark:text-csk-yellow uppercase tracking-wider text-[11px] font-bold group-hover:translate-x-0.5 transition transform flex items-center">
                  Explore {f.short} Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{f.country}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
