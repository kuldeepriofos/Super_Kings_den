'use client';

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { STANDINGS_DATA } from '../data/mockData';
import { getFranchiseStandings, IPL_STANDINGS } from '../data/franchiseStandingsData';
import { getTeamLogo } from '../lib/teamLogos';

export default function StandingsTable({ className = "mb-8 sm:mb-10", selectedFranchise }) {
  const getInitial = (franchise) => {
    if (franchise && franchise !== 'ALL') {
      return getFranchiseStandings(franchise);
    }
    return STANDINGS_DATA && STANDINGS_DATA.length > 0 ? STANDINGS_DATA : IPL_STANDINGS;
  };

  const [standings, setStandings] = useState(() => getInitial(selectedFranchise));

  useEffect(() => {
    setStandings(getInitial(selectedFranchise));

    let isMounted = true;
    async function loadLiveStandings() {
      try {
        const query = selectedFranchise && selectedFranchise !== 'ALL' ? `?franchise=${selectedFranchise}` : '';
        const res = await fetch(`/api/standings/${query}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.standings && Array.isArray(data.standings) && data.standings.length > 0) {
          setStandings(data.standings);
        }
      } catch (err) {
        // Fallback to static mock data on error
      }
    }
    loadLiveStandings();
    return () => {
      isMounted = false;
    };
  }, [selectedFranchise]);

  const tournamentName = standings[0]?.tournament || (
    selectedFranchise === 'JSK' ? 'SA20 2026' :
    selectedFranchise === 'TSK' ? 'MLC 2026' :
    'IPL 2026'
  );

  return (
    <section className={className}>
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
            Points Table &bull; Standings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
            {tournamentName} standings, win margins, net run rates &amp; points table
          </p>
        </div>
      </div>

      <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-white/10">
                <th className="py-3.5 px-4 w-16 text-center">Pos</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-3 text-center">P</th>
                <th className="py-3.5 px-3 text-center">W</th>
                <th className="py-3.5 px-3 text-center">L</th>
                <th className="py-3.5 px-3 text-center">NRR</th>
                <th className="py-3.5 px-4 text-center font-extrabold text-amber-700 dark:text-csk-yellow">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
              {standings.map((row, idx) => {
                const isFavorite = row.team?.includes('Chennai') || 
                  (selectedFranchise === 'JSK' && row.team?.includes('Joburg')) ||
                  (selectedFranchise === 'TSK' && row.team?.includes('Texas'));
                const isLeader = row.isLeader || row.pos === 1;
                const isHighlighted = isFavorite || isLeader;

                return (
                  <tr 
                    key={row.pos || idx + 1}
                    className={`transition ${
                      isHighlighted 
                        ? 'bg-amber-50 dark:bg-csk-yellow/10 font-bold text-slate-900 dark:text-white' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black bg-csk-yellow text-csk-darkNavy shadow-xs">
                        {row.pos || idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        {getTeamLogo(row.team) && (
                          <img
                            src={getTeamLogo(row.team)}
                            alt={`${row.team} logo`}
                            className="w-6 h-6 object-contain flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <span className="font-extrabold font-display">{row.team}</span>
                        {isLeader && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-csk-yellow text-csk-darkNavy font-black uppercase">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">{row.played}</td>
                    <td className="py-3.5 px-3 text-center text-green-600 dark:text-green-400 font-bold">{row.won}</td>
                    <td className="py-3.5 px-3 text-center text-red-600 dark:text-red-400 font-bold">{row.lost}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{row.nrr}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {row.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-4">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            {tournamentName} Standings ({standings.length} Teams)
          </span>
          <span>Updated after every fixture</span>
        </div>
      </div>
    </section>
  );
}
