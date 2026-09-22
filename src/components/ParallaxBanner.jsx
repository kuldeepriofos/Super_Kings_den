'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Award, Users, ArrowRight, Sparkles, Shield } from 'lucide-react';

export default function ParallaxBanner() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative my-16 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30">
      {/* Parallax Background with Fixed Attachment & Smooth Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-fixed bg-cover bg-center transform scale-105 transition-transform duration-700"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&auto=format&fit=crop&q=80')`,
          transform: `translateY(${(scrollY % 500) * 0.08}px)`
        }}
      />

      {/* Multi-layered Sports Gradient Overlays for High Contrast & Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070D1E]/95 via-[#0B1B3D]/85 to-[#070D1E]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Decorative Golden Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-csk-yellow/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 px-6 py-16 sm:py-20 md:py-24 text-center max-w-4xl mx-auto">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/60 border border-csk-yellow/40 backdrop-blur-md mb-6 shadow-lg">
          <Flame className="w-4 h-4 text-csk-yellow animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-csk-yellow font-display">
            #WhistlePodu &bull; The Unshakable Yellow Empire
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Cinematic Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-display uppercase tracking-tight leading-tight sm:leading-none mb-6 drop-shadow-md">
          THE LION NEVER SLEEPS. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-csk-yellow to-amber-300">
            THE ROAR NEVER SILENCES.
          </span>
        </h2>

        {/* Narrative Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium mb-10 drop-shadow">
          Five-Time IPL Champions. Three Continents. From Chepauk's Fortress to the Bullring of Johannesburg and the Lone Star plains of Dallas — one heartbeat unites millions.
        </p>

        {/* 4 Golden Live Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-csk-yellow/30 text-center hover:border-csk-yellow transition group">
            <span className="block text-2xl sm:text-4xl font-black font-display text-csk-yellow group-hover:scale-110 transition duration-300">
              5×
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1 block">
              IPL Trophies
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-csk-yellow/30 text-center hover:border-csk-yellow transition group">
            <span className="block text-2xl sm:text-4xl font-black font-display text-white group-hover:scale-110 transition duration-300">
              10×
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1 block">
              IPL Finals Record
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-csk-yellow/30 text-center hover:border-csk-yellow transition group">
            <span className="block text-2xl sm:text-4xl font-black font-display text-csk-yellow group-hover:scale-110 transition duration-300">
              7
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1 block">
              Total Championships
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-csk-yellow/30 text-center hover:border-csk-yellow transition group">
            <span className="block text-2xl sm:text-4xl font-black font-display text-white group-hover:scale-110 transition duration-300">
              100M+
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1 block">
              Yellow Army Worldwide
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/trophies"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-csk-yellow to-amber-500 text-csk-darkNavy font-black text-sm uppercase tracking-wider hover:opacity-95 transition shadow-csk-glow hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Relive 7 Championship Trophies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/squad"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-black/60 hover:bg-black/80 text-white font-bold text-sm transition border border-white/20 hover:border-csk-yellow flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            <Shield className="w-4 h-4 text-csk-yellow" />
            <span>Explore CSK 2026 Squad</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
