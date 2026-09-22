'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, ShieldAlert, Timer, ChevronRight, Zap } from 'lucide-react';
import { FIXTURES } from '../data/mockData';


export default function MatchCenter({ selectedFranchise }) {
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 9, minutes: 24, seconds: 12 });
  const [activeFixtureIndex, setActiveFixtureIndex] = useState(0);

  // Filter fixtures based on selected franchise
  const filteredFixtures = selectedFranchise === 'ALL'
    ? FIXTURES
    : FIXTURES.filter(f => f.franchise === selectedFranchise);

  const currentMatch = filteredFixtures[activeFixtureIndex] || FIXTURES[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Match Center &bull; Countdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next marquee fixture live timer &amp; franchise match schedules
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {filteredFixtures.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActiveFixtureIndex(i)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeFixtureIndex === i
                  ? 'bg-csk-yellow text-csk-darkNavy shadow-sm font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.homeShort} vs {f.awayShort}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Match Card */}
      <div className="rounded-2xl sports-card border border-slate-200 dark:border-csk-yellow/30 p-6 sm:p-8 relative overflow-hidden">
        {/* Glowing background gradient elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-csk-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Teams Faceoff & Countdown (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-csk-yellow border border-amber-500/30 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1" /> {currentMatch.tournament} &bull; Matchday
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-csk-yellow" /> {currentMatch.date} &bull; {currentMatch.time}
              </span>
            </div>

            {/* Teams Clashing Row */}
            <div className="flex items-center justify-around py-4 sm:py-6 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/5 px-4">
              {/* Home Team */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-csk-yellow to-amber-600 p-1 flex items-center justify-center shadow-csk-glow">
                  <div className="w-full h-full bg-white dark:bg-csk-darkNavy rounded-[12px] flex items-center justify-center shadow-inner">
                    <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-csk-yellow font-display">
                      {currentMatch.homeShort}
                    </span>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{currentMatch.homeTeam}</h3>
                <span className="text-xs text-amber-700 dark:text-csk-yellow font-bold uppercase">Hosts</span>
              </div>

              {/* VS Badge */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-csk-yellow/50 flex items-center justify-center shadow-md">
                  <span className="text-xs font-black text-amber-700 dark:text-csk-yellow italic">VS</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Chepauk</span>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 p-1 flex items-center justify-center shadow-blue-glow">
                  <div className="w-full h-full bg-white dark:bg-csk-darkNavy rounded-[12px] flex items-center justify-center shadow-inner">
                    <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
                      {currentMatch.awayShort}
                    </span>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{currentMatch.awayTeam}</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Challengers</span>
              </div>
            </div>

            {/* Countdown Grid */}
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold text-center mb-3">
                Countdown to Toss &amp; First Ball
              </p>
              <div className="grid grid-cols-4 gap-3 text-center max-w-md mx-auto">
                <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Days</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Hours</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mins</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-csk-borderNavy rounded-xl p-2.5 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-csk-yellow font-display block">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Venue & H2H Stats (4 cols) */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-700 dark:text-csk-yellow flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" /> Venue &amp; Pitch Preview
            </h4>

            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p className="font-semibold text-slate-900 dark:text-white">{currentMatch.venue}</p>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Chepauk Pitch Insight:</span>
                <span className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed block mt-0.5">
                  Dry surface offering assistance to spinners in the middle overs. Average 1st innings score is 172. Win toss &amp; bat first has 60% win rate.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                Head-To-Head Record
              </span>
              <p className="text-xs font-bold text-amber-700 dark:text-csk-yellow">
                {currentMatch.h2h}
              </p>
            </div>

            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-csk-yellow to-amber-500 text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-csk-glow flex items-center justify-center">
              View Match Preview &amp; Playing 11 <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
