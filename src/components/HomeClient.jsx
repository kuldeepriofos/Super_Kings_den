'use client';

import React from 'react';
import HeroFeatured from './HeroFeatured';
import FranchiseFamily from './FranchiseFamily';
import TournamentBanner from './TournamentBanner';
import ParallaxBanner from './ParallaxBanner';
import CSKTrophiesSection from './CSKTrophiesSection';
import SquadShowcase from './SquadShowcase';
import NewsGrid from './NewsGrid';
import FanCTASection from './FanCTASection';
import StandingsTable from './StandingsTable';
import FanZone from './FanZone';
import { useApp } from '../context/AppContext';

export default function HomeClient({ initialPosts, initialPlayers }) {
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

      {/* 1. Hero Featured Top Stories */}
      <HeroFeatured posts={displayedPosts} />

      {/* 2. Global Super Kings Franchises: CSK, JSK, TSK */}
      <FranchiseFamily 
        selectedFranchise={selectedFranchise} 
        onSelectFranchise={setSelectedFranchise} 
      />

      {/* 3. Tournament Banner: Chennai Super Kings Emotion */}
      <TournamentBanner />

      {/* 4. Cinematic Parallax Banner */}
      <ParallaxBanner />

      {/* 5. CSK Championship Trophies By Year (7 Trophies Timeline) */}
      <CSKTrophiesSection />

      {/* 6. Chennai Super Kings Squad (Players Roster) */}
      <SquadShowcase 
        players={initialPlayers} 
      />

      {/* 7. Latest Den Dispatches News Grid */}
      <NewsGrid 
        posts={displayedPosts} 
        selectedFranchise={selectedFranchise} 
      />

      {/* 8. High-Impact Yellow Army CTA & Fan Pass */}
      <FanCTASection />

      {/* 9. IPL Standings Table */}
      <StandingsTable />

      {/* 10. Whistle Podu Fan Zone */}
      <FanZone />
    </>
  );
}


