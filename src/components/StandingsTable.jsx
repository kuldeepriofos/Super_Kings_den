import React from 'react';
import { Trophy, ShieldCheck } from 'lucide-react';
import { STANDINGS_DATA } from '../data/mockData';

export default function StandingsTable() {
  return (
    <section className="mb-14">
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
            Points Table &bull; Standings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tournament standings, win margins, net run rates &amp; points table
          </p>
        </div>
      </div>

      <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-white/10">
                <th className="py-3.5 px-4">Pos</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-3 text-center">P</th>
                <th className="py-3.5 px-3 text-center">W</th>
                <th className="py-3.5 px-3 text-center">L</th>
                <th className="py-3.5 px-3 text-center">NRR</th>
                <th className="py-3.5 px-4 text-center font-extrabold text-amber-700 dark:text-csk-yellow">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
              {STANDINGS_DATA.map((row) => {
                const isCSK = row.team.includes('Chennai');
                return (
                  <tr 
                    key={row.pos}
                    className={`transition ${
                      isCSK 
                        ? 'bg-amber-50 dark:bg-csk-yellow/10 font-bold text-slate-900 dark:text-white' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        row.pos <= 4 ? 'bg-csk-yellow text-csk-darkNavy' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {row.pos}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-extrabold font-display">{row.team}</span>
                        {isCSK && (
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
                    <td className="py-3.5 px-4 text-center font-black text-amber-700 dark:text-csk-yellow text-sm sm:text-base">
                      {row.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-4">
          <span className="flex items-center text-amber-700 dark:text-csk-yellow font-bold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Top 4 qualify for IPL 2026 Playoffs
          </span>
          <span>Updated after every fixture</span>
        </div>
      </div>
    </section>
  );
}
