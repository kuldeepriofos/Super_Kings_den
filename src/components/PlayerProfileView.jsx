'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Award, 
  Trophy, 
  Calendar, 
  MapPin, 
  Share2, 
  ArrowLeft, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Plane, 
  Target, 
  Zap, 
  Activity, 
  Star 
} from 'lucide-react';

function sortTableDescending(tableHtml) {
  const tbodyMatch = tableHtml.match(/<tbody[\s\S]*?<\/tbody>/i);
  const bodyContent = tbodyMatch ? tbodyMatch[0] : tableHtml;
  
  const trMatches = bodyContent.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  if (trMatches.length <= 1) return tableHtml;
  
  const dataRows = [];
  const totalRows = [];
  
  for (const tr of trMatches) {
    if (tr.includes('<th') && !tr.includes('<td')) {
      continue;
    }
    
    const cleanText = tr.replace(/<[^>]+>/g, ' ').trim().toLowerCase();
    if (
      cleanText.startsWith('total') || 
      cleanText.startsWith('career') || 
      cleanText.startsWith('overall') ||
      cleanText.includes('career total') ||
      cleanText.includes('total&nbsp;')
    ) {
      totalRows.push(tr);
    } else {
      const cells = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      const firstCell = cells[0] ? cells[0].replace(/<[^>]+>/g, '').trim() : '';
      const yearMatch = firstCell.match(/\b(19\d\d|20\d\d)\b/);
      let yearVal = null;
      if (yearMatch) {
        yearVal = parseInt(yearMatch[1], 10);
      } else {
        const secondCell = cells[1] ? cells[1].replace(/<[^>]+>/g, '').trim() : '';
        const secondYearMatch = secondCell.match(/\b(19\d\d|20\d\d)\b/);
        if (secondYearMatch) {
          yearVal = parseInt(secondYearMatch[1], 10);
        }
      }
      dataRows.push({ tr, yearVal });
    }
  }
  
  const rowsWithYears = dataRows.filter(r => r.yearVal !== null);
  if (rowsWithYears.length >= 2) {
    dataRows.sort((a, b) => {
      if (a.yearVal !== null && b.yearVal !== null) {
        return b.yearVal - a.yearVal; // Latest year first
      }
      if (a.yearVal !== null) return -1;
      if (b.yearVal !== null) return 1;
      return 0;
    });
  }
  
  const sortedTrs = dataRows.map(r => r.tr).concat(totalRows).join('');
  
  if (tbodyMatch) {
    return tableHtml.replace(/<tbody[\s\S]*?<\/tbody>/i, `<tbody>${sortedTrs}</tbody>`);
  } else {
    return tableHtml.replace(/<tr[\s\S]*?<\/tr>[\s\S]*/i, sortedTrs + '</table>');
  }
}

function sanitizePlayerContent(html) {
  if (!html) return '';
  const cleaned = html
    // 1. Remove entire ez-toc-container block (WordPress Table of Contents plugin)
    .replace(/<div[^>]*id=["']ez-toc-container["'][\s\S]*?<\/nav>\s*<\/div>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*ez-toc-container[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi, '')
    // 2. Remove leftover ez-toc spans in headings
    .replace(/<span[^>]*class=["']ez-toc-[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, '$1')
    // 3. Remove empty paragraphs
    .replace(/<p[^>]*>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
    // 4. Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // 5. Ensure stats tables show latest data first
  return cleaned.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    return sortTableDescending(match);
  });
}

export default function PlayerProfileView({ player, article = null, teammates = [] }) {
  const [copied, setCopied] = useState(false);

  if (!player) return null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: `${player.name} - Chennai Super Kings Profile`,
          text: `Explore ${player.name}'s IPL career stats, championship honors, and records on Super Kings Den!`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const isBowler = player.category === 'Bowler';
  const isAllRounder = player.category === 'All-Rounder';
  const isWK = player.category === 'WK';
  const isOverseas = player.country && player.country.toLowerCase() !== 'india';
  const isCaptain = (player.role || '').toLowerCase().includes('captain');
  const playerTag = player.tag || (isCaptain && player.isCurrent ? 'Captain' : null);

  // Progressive Enhancement for Stats Tables: Hide older seasons and add interactive "View More / View Less" toggle
  useEffect(() => {
    const container = document.querySelector('.sports-article-content');
    if (!container) return;

    // Clean up any previously attached toggle wrappers to avoid duplication
    const oldWrappers = container.querySelectorAll('.csk-table-view-more-wrap');
    oldWrappers.forEach((w) => w.remove());

    const tables = container.querySelectorAll('table');
    tables.forEach((table, tableIndex) => {
      const tbody = table.querySelector('tbody') || table;
      const allRows = Array.from(tbody.querySelectorAll('tr'));

      // Filter out pure header rows (containing only th)
      const dataRows = [];
      let totalRow = null;

      allRows.forEach((tr) => {
        if (tr.querySelector('th') && !tr.querySelector('td')) return;
        const text = tr.textContent.trim().toLowerCase();
        if (
          text.startsWith('total') ||
          text.startsWith('career') ||
          text.startsWith('overall') ||
          text.includes('career total') ||
          text.includes('total&nbsp;')
        ) {
          totalRow = tr;
        } else {
          dataRows.push(tr);
        }
      });

      // If table has more than 5 data rows, apply collapsible view more
      if (dataRows.length > 5) {
        const initialLimit = 5;
        const hiddenRows = dataRows.slice(initialLimit);

        // Initially hide rows beyond top 5
        hiddenRows.forEach((tr) => {
          tr.style.display = 'none';
        });

        // Ensure total row has prominent highlight styling at bottom
        if (totalRow) {
          totalRow.classList.add('csk-total-row');
        }

        // Create sleek CSK View More button
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'csk-table-view-more-wrap flex items-center justify-center mt-3 mb-6';
        btnWrapper.setAttribute('data-table', String(tableIndex));

        let isExpanded = false;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 hover:bg-csk-yellow dark:bg-slate-800 dark:hover:bg-csk-yellow text-slate-800 hover:text-csk-darkNavy dark:text-slate-200 dark:hover:text-csk-darkNavy border border-slate-300 dark:border-white/10 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer';

        const updateBtnContent = () => {
          if (isExpanded) {
            button.innerHTML = `
              <span>Show Recent Seasons (View Less)</span>
              <svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
              </svg>
            `;
          } else {
            button.innerHTML = `
              <span>View All Statistics (${hiddenRows.length} More Seasons)</span>
              <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5 text-amber-500 group-hover:text-csk-darkNavy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
              </svg>
            `;
          }
        };

        updateBtnContent();

        button.addEventListener('click', () => {
          isExpanded = !isExpanded;
          hiddenRows.forEach((tr) => {
            tr.style.display = isExpanded ? '' : 'none';
          });
          updateBtnContent();
        });

        btnWrapper.appendChild(button);

        // Place button right below the table container (or figure if wrapped in figure)
        const mountTarget = table.closest('figure.wp-block-table') || table.closest('figure') || table;
        mountTarget.insertAdjacentElement('afterend', btnWrapper);
      }
    });

    return () => {
      const wrappers = document.querySelectorAll('.csk-table-view-more-wrap');
      wrappers.forEach((w) => w.remove());
    };
  }, [article?.content, player?.content, player?.slug]);

  return (
    <article className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-400" />
          <Link href="/csk-team" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
            CSK Team
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium truncate">
            {player.name}
          </span>
        </nav>

        {/* Hero Sports Card */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c63b7] via-[#1d418c] to-[#0a192f] text-white p-6 sm:p-8 md:p-10 shadow-2xl border border-blue-400/25 mb-10">
          {/* Ambient Stadium Lighting Glows */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#00adef]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#fff200]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 md:gap-10">
            {/* Left: Prominent Player Half-Body Cutout (Standing Hero) */}
            <div className="relative flex-shrink-0 w-full sm:w-auto flex justify-center">
              <div className="relative w-64 sm:w-72 md:w-80 h-80 sm:h-96 md:h-[400px] flex items-end justify-center">
                {/* Yellow Radial Glow behind the cutout */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-80"
                  style={{
                    background: 'radial-gradient(circle at 50% 65%, rgba(253, 185, 19, 0.35) 0%, rgba(253, 185, 19, 0.1) 55%, transparent 75%)'
                  }}
                />

                {/* Floating Jersey Number Pill */}
                <div className="absolute top-2 left-2 z-20 px-3 py-1 rounded-full bg-csk-yellow text-csk-darkNavy text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <span>#{player.jersey}</span>
                </div>

                {/* Full Transparent Player Cutout or Regal Monogram */}
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.fullName || player.name}
                    className="relative z-10 w-auto h-full max-h-[400px] object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.profile-avatar-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`profile-avatar-fallback w-44 h-44 rounded-full bg-gradient-to-br from-amber-500/20 via-csk-yellow/15 to-amber-600/10 border-2 border-csk-yellow/50 flex-col items-center justify-center text-center shadow-xl shadow-amber-500/15 backdrop-blur-xs relative z-10 my-auto ${player.avatar ? 'hidden' : 'flex'}`}>
                  <span className="text-5xl font-black text-amber-500 dark:text-csk-yellow font-heading tracking-wider">
                    {(player.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                    #{player.jersey || 'CSK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Player Bio & Details */}
            <div className="flex-1 w-full text-center lg:text-left">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-csk-yellow text-csk-darkNavy shadow-xs">
                  {player.franchise || 'CSK'} &bull; {player.country}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-white border border-white/20 backdrop-blur-md">
                  {player.category}
                </span>

                {playerTag && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{playerTag}</span>
                  </span>
                )}

                {isOverseas && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-400/20 text-sky-200 border border-sky-400/30 backdrop-blur-md">
                    <Plane className="w-3 h-3 rotate-[-45deg]" />
                    <span>Overseas</span>
                  </span>
                )}

                {player.isLegend && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/25 text-csk-yellow border border-amber-400/40 backdrop-blur-md">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Legend</span>
                  </span>
                )}

                {player.era && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/15 backdrop-blur-md">
                    {player.era}
                  </span>
                )}
              </div>

              {/* Player Name */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white mb-2">
                {player.name}
              </h1>

              {/* Full Name & Role */}
              <div className="text-sm sm:text-base text-yellow-300/90 mb-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                <span className="font-bold text-csk-yellow">{player.role}</span>
                {player.fullName && player.fullName !== player.name && (
                  <>
                    <span className="text-white/40 hidden sm:inline">&bull;</span>
                    <span className="text-white/80">Full Name: {player.fullName}</span>
                  </>
                )}
              </div>

              {/* Specialty Tagline */}
              {player.specialty && (
                <div className="inline-block p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 text-xs sm:text-sm text-white/90 mb-6 max-w-2xl">
                  <span className="text-csk-yellow font-bold mr-1">Signature Impact:</span>
                  <span>{player.specialty}</span>
                </div>
              )}

              {/* Player Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold block">Batting Style</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">
                    {player.battingStyle || 'Right-hand bat'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold block">Bowling Style</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">
                    {player.bowlingStyle || 'Right-arm medium'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold block">IPL Debut</span>
                  <span className="text-xs sm:text-sm font-bold text-csk-yellow block">
                    {player.iplDebut ? `${player.iplDebut} Season` : '2008'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold block">Birth Date / City</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block" title={player.born}>
                    {player.born || 'India'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/csk-team"
              className="inline-flex items-center text-xs font-semibold text-slate-300 hover:text-csk-yellow transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to CSK Team</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/10 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-300">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-csk-yellow" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Primary Impact Stats KPI Cards */}
        <section className="mb-10">
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
              Key Career Metrics &amp; Record Stats
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Matches */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Matches
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.matches}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">{player.innings || player.matches} Innings</span>
            </div>

            {/* Total Runs */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                IPL Runs
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-amber-600 dark:text-csk-yellow font-heading mt-2 tabular-nums">
                {player.runs || (player.wickets ? '0' : '—')}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">HS: {player.highestScore || '—'}</span>
            </div>

            {/* Strike Rate */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Strike Rate
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.strikeRate || '—'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Batting Pace</span>
            </div>

            {/* Average */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Batting Avg
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.average || '—'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Runs/Dismissal</span>
            </div>

            {/* Wickets */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Wickets
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-amber-600 dark:text-csk-yellow font-heading mt-2 tabular-nums">
                {player.wickets || 0}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">BBI: {player.bestBowling || '—'}</span>
            </div>

            {/* Economy / Catches */}
            <div className="sports-card p-4 rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {player.wickets > 0 ? 'Economy Rate' : isWK ? 'Dismissals' : 'Fielding Catches'}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-heading mt-2 tabular-nums">
                {player.wickets > 0 
                  ? player.economy || '—' 
                  : isWK 
                    ? (player.catches || 0) + (player.stumpings || 0)
                    : player.catches || 0}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                {player.wickets > 0 
                  ? 'Runs per over' 
                  : isWK 
                    ? `${player.catches || 0}c / ${player.stumpings || 0}st` 
                    : 'Outfield takes'}
              </span>
            </div>
          </div>
        </section>

        {/* Detailed Stats Breakdown Tables */}
        <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batting Performance Table */}
          <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
              <Zap className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                Batting &amp; Fielding Statistics
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Matches / Innings</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.matches} / {player.innings || player.matches}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Total Career Runs</td>
                    <td className="py-2.5 text-right font-semibold text-amber-600 dark:text-csk-yellow tabular-nums">
                      {player.runs || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Highest Individual Score</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.highestScore || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Batting Average</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.average || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Batting Strike Rate</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.strikeRate || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Centuries (100s) / Fifties (50s)</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.hundreds || 0} / {player.fifties || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Fours (4s) / Sixes (6s)</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.fours || 0} / {player.sixes || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Catches / Stumpings</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.catches || 0} / {player.stumpings || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Performance Table */}
          <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
              <Target className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                Bowling &amp; Wicketkeeping Records
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Total Career Wickets</td>
                    <td className="py-2.5 text-right font-semibold text-amber-600 dark:text-csk-yellow tabular-nums">
                      {player.wickets || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Best Bowling in an Innings (BBI)</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.bestBowling || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Bowling Economy Rate</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.economy ? `${player.economy} RPO` : '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Bowling Average</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.bowlingAverage || '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">4-Wicket Hauls</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                      {player.fourWickets || 0}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Primary Role Category</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {player.category}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Bowling Delivery Style</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {player.bowlingStyle || 'None'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Active Squad Status</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {player.isCurrent ? 'Current Squad (2026)' : 'Franchise Legend'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trophies & Honors Shelf */}
        <section className="mb-10">
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
              Trophies &amp; Championship Accolades
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trophies Card */}
            <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-6 shadow-xs">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                  Titles &amp; Silverware Won
                </h3>
              </div>

              {player.trophies && player.trophies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {player.trophies.map((trophy, idx) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-csk-yellow/10 border border-amber-500/20 dark:border-csk-yellow/20 text-xs font-semibold text-amber-800 dark:text-csk-yellow"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-csk-yellow flex-shrink-0" />
                      <span>{trophy}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aiming for championship glory with the Super Kings franchise.
                </p>
              )}
            </div>

            {/* Individual Honors & Milestones */}
            <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-6 shadow-xs">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                  Career Milestones &amp; Records
                </h3>
              </div>

              {player.honors && player.honors.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {player.honors.map((honor, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-csk-yellow mt-1.5 flex-shrink-0"></span>
                      <span className="font-medium">{honor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Key squad member contributing to Chennai Super Kings match victories.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Player Bio & Career Chronicles */}
        {(player.content || article?.content || player.bio) && (
          <section className="mb-12">
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
              <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
                Player Biography &amp; Career Journey
              </h2>
            </div>

            <div className="sports-card rounded-2xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/60 p-6 sm:p-8 md:p-10 shadow-xs">
              {/* Highlight summary overview */}
              {player.bio && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border-l-4 border-csk-yellow mb-8 text-slate-800 dark:text-slate-200 text-sm sm:text-base font-medium leading-relaxed">
                  {player.bio}
                </div>
              )}

              {/* In-Depth Player Biography & Career Chronicles (Cleaned of WordPress blog TOC & plugin artifacts) */}
              {(player.content || article?.content) ? (
                <div
                  className="sports-article-content text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base font-normal overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: sanitizePlayerContent(player.content || article.content) }}
                />
              ) : null}
            </div>
          </section>
        )}

        {/* Teammates & Squad Directory Carousel */}
        {teammates && teammates.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
                <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white">
                  More Super Kings Players
                </h2>
              </div>
              <Link
                href="/csk-team"
                className="text-xs font-semibold text-amber-600 dark:text-csk-yellow hover:underline"
              >
                View Full Team Roster &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teammates.slice(0, 4).map((tm) => (
                <Link
                  key={tm.id}
                  href={`/${tm.slug}/`}
                  className="sports-card group rounded-2xl border border-slate-200 dark:border-csk-borderNavy p-4 bg-white dark:bg-slate-900/60 hover:border-csk-yellow/60 transition shadow-xs flex items-center space-x-3"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-csk-yellow/70 flex-shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    {tm.avatar ? (
                      <img
                        src={tm.avatar}
                        alt={tm.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className={`text-xs font-black text-amber-600 dark:text-csk-yellow font-heading ${tm.avatar ? 'hidden' : 'block'}`}>
                      {(tm.name || '').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition truncate font-heading">
                      {tm.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      #{tm.jersey} &bull; {tm.role}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
