'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function TSKHeroBanner({ className = "mb-8 sm:mb-10" }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className={className}>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">Global Family</span>
        <span>/</span>
        <span className="font-bold text-amber-600 dark:text-csk-yellow">Texas Super Kings</span>
      </div>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-[#002868] via-[#0d1f4d] to-[#040e24] text-white shadow-xl border border-blue-500/25">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#bf0a30]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-[#fff200]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {/* Team Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center shrink-0 border border-white/30">
              {logoFailed ? (
                <span className="text-2xl font-black text-slate-900 font-display">TSK</span>
              ) : (
                <img
                  src="/tsk-logo.png"
                  alt="Texas Super Kings"
                  className="w-full h-full object-contain"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur-md text-white border border-white/20">
                  🇺🇸 United States
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-csk-yellow/20 text-csk-yellow backdrop-blur-md border border-csk-yellow/30">
                  Major League Cricket (MLC)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-2">
                Texas <span className="text-csk-yellow">Super Kings</span>
              </h1>

              <p className="text-xs sm:text-sm text-yellow-300/90 font-medium max-w-2xl">
                #WhistleForTexas • Grand Prairie Stadium Fortress, Dallas
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/tsk-news"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-wider transition shadow-md inline-flex items-center"
            >
              <span>TSK News Hub</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Short Bio */}
        <p className="relative z-10 mt-6 pt-6 border-t border-white/15 text-xs sm:text-sm text-white/85 leading-relaxed max-w-4xl">
          Texas Super Kings leads the global roar of the Super Kings franchise into North America. Based at the world-class Grand Prairie Stadium in Dallas, Texas, TSK combines championship pedigree, international heavyweights, and passionate American cricket fandom.
        </p>
      </div>
    </div>
  );
}
