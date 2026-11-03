'use client';

import React, { useState } from 'react';
import { Trophy, CheckCircle2, UserCheck, Shield, Sparkles, Send, Plane } from 'lucide-react';
import { ALL_TIME_CANDIDATES } from '../data/rivalriesData';


export default function AllTimeXI() {
  const [candidates, setCandidates] = useState(ALL_TIME_CANDIDATES);
  const [selectedIds, setSelectedIds] = useState(['msd', 'raina', 'jadeja', 'bravo']);
  const [submitted, setSubmitted] = useState(false);

  const togglePlayer = (id) => {
    if (id === 'msd') return; // Dhoni is permanent captain
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      if (selectedIds.length < 11) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleSubmitXI = (e) => {
    e.preventDefault();
    if (selectedIds.length > 0) {
      // Increment votes locally for feedback
      setCandidates(prev => prev.map(p => 
        selectedIds.includes(p.id) ? { ...p, votes: p.votes + 1 } : p
      ));
      setSubmitted(true);
    }
  };

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Pick Your All-Time CSK XI &bull; Fan Voting
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              Select your legendary 11 players across 18 glorious years of Super Kings history
            </p>
          </div>
        </div>

        {/* Selected Counter Pill */}
        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-csk-yellow text-csk-darkNavy shadow-sm">
            {selectedIds.length} / 11 Selected
          </span>
          {submitted ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> XI Submitted
            </span>
          ) : (
            <button
              onClick={handleSubmitXI}
              disabled={selectedIds.length === 0}
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-csk-yellow text-csk-darkNavy hover:opacity-95 transition shadow-csk-glow flex items-center"
            >
              <Send className="w-3 h-3 mr-1" /> Submit Vote
            </button>
          )}
        </div>
      </div>

      {/* Grid of All-Time Candidates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {candidates.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          const isCaptain = player.id === 'msd';

          return (
            <div
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`sports-card group relative rounded-2xl p-4 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-csk-yellow bg-amber-50/50 dark:bg-csk-yellow/10 shadow-csk-glow'
                  : 'border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/50'
              }`}
            >
              {/* Top Row: Role + Status Check */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-csk-yellow px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {player.role}
                  </span>
                  {player.isOverseas && (
                    <span 
                      className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30"
                      title={`Overseas Player (${player.country})`}
                    >
                      <Plane className="w-2.5 h-2.5 rotate-[-45deg]" />
                      <span>Overseas</span>
                    </span>
                  )}
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                  isSelected 
                    ? 'bg-csk-yellow border-csk-yellow text-csk-darkNavy shadow-xs' 
                    : 'border-slate-300 dark:border-white/20 bg-transparent'
                }`}>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Player Avatar & Name */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-csk-yellow/50 shadow-sm flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-heading truncate">
                      {player.name}
                    </h3>
                  {isCaptain && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-csk-yellow flex items-center">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Permanent Captain
                    </span>
                  )}
                </div>
              </div>

              {/* Vote Percentage Progress */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Fan Approval</span>
                  <span className="text-amber-600 dark:text-csk-yellow font-semibold">{player.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-csk-yellow to-amber-500 rounded-full" 
                    style={{ width: `${player.pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block text-right mt-0.5">
                  {player.votes.toLocaleString()} votes
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
