'use client';

import React from 'react';
import HeroFeatured from './HeroFeatured';
import FranchiseFamily from './FranchiseFamily';
import MatchCenter from './MatchCenter';
import StandingsTable from './StandingsTable';
import NewsGrid from './NewsGrid';
import { useApp } from '../context/AppContext';

export default function HomeClient({ initialPosts, initialFixtures }) {
  const { selectedFranchise, setSelectedFranchise } = useApp();

  // Filter posts if specific franchise is selected
  const displayedPosts = (!selectedFranchise || selectedFranchise === 'ALL')
    ? initialPosts
    : initialPosts.filter(p => p.franchise === selectedFranchise);

  return (
    <>
      {/* Franchise Banner if specific franchise selected */}
      {selectedFranchise && selectedFranchise !== 'ALL' && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-csk-navy via-slate-900 to-csk-navy border border-csk-yellow/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <span className={`w-4 h-4 rounded-full inline-block shadow-md ${
              selectedFranchise === 'CSK' ? 'bg-[#FFCB05] ring-2 ring-[#FFCB05]/40' :
              selectedFranchise === 'JSK' ? 'bg-emerald-500 ring-2 ring-emerald-500/40' :
              'bg-red-600 ring-2 ring-red-600/40'
            }`} />

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display uppercase tracking-wide">
                {selectedFranchise === 'CSK' && 'Chennai Super Kings Hub (IPL)'}
                {selectedFranchise === 'JSK' && 'Joburg Super Kings Hub (SA20)'}
                {selectedFranchise === 'TSK' && 'Texas Super Kings Hub (MLC)'}
              </h2>
              <p className="text-xs text-slate-300">
                Filtering exclusive news, roster &amp; match schedules
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFranchise('ALL')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-white/10"
          >
            Reset to All Kings
          </button>
        </div>
      )}

      {/* 1. Top Headlines */}
      <HeroFeatured posts={displayedPosts} />

      {/* 2. The Super Kings Global Family */}
      <FranchiseFamily 
        selectedFranchise={selectedFranchise} 
        onSelectFranchise={setSelectedFranchise} 
      />

      {/* 3. Match Center • Countdown */}
      <MatchCenter selectedFranchise={selectedFranchise} initialFixtures={initialFixtures} />

      {/* 4. Points Table • Standings */}
      <StandingsTable selectedFranchise={selectedFranchise} />

      {/* 5. Latest Den Dispatches */}
      <NewsGrid 
        posts={displayedPosts} 
        selectedFranchise={selectedFranchise} 
      />
    </>
  );
}


