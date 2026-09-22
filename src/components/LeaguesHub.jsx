'use client';

import React, { useState } from 'react';
import { Trophy, Globe, Flame, Calendar, Users, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

/* ─── League Logo with graceful fallback ─── */
function LeagueLogo({ src, alt, accentColor, short }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center font-black font-sans text-white text-xs tracking-wider shadow-md`}>
        {short}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-md overflow-hidden p-0.5">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function LeaguesHub() {
  const leagues = [
    {
      id: 'IPL',
      name: 'Indian Premier League (IPL)',
      short: 'IPL',
      logo: '/ipl-logo.svg',
      franchise: 'Chennai Super Kings (CSK)',
      teamLogo: '/csk-logo.svg',
      tagline: "The World's Biggest & Most Prestigious T20 Championship",
      accentColor: 'from-amber-500 to-yellow-400',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-csk-yellow border-amber-500/30',
      founded: '2008',
      format: '10 Teams • 74 Matches',
      trophiesWon: '5 Titles (2010, 2011, 2018, 2021, 2023)',
      venue: 'MA Chidambaram Stadium (Chepauk), Chennai',
      highlights: [
        'CSK hold the legendary record of 10 IPL Finals appearances.',
        'Chepauk fortress has the highest home win percentage in tournament history.',
        'Captained by MS Dhoni & Ruturaj Gaikwad with 5 trophy triumphs.'
      ],
      hashtag: '#WhistlePodu'
    },
    {
      id: 'SA20',
      name: 'Betway SA20 (South Africa)',
      short: 'SA20',
      logo: '/sa20-logo.svg',
      franchise: 'Joburg Super Kings (JSK)',
      teamLogo: '/jsk-logo.svg',
      tagline: "South Africa's Electrifying Premier T20 League",
      accentColor: 'from-emerald-600 to-yellow-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      founded: '2023',
      format: '6 Teams • 34 Matches',
      trophiesWon: 'Consistent Semifinalists & Playoff Contenders',
      venue: 'The Wanderers Stadium (The Bullring), Johannesburg',
      highlights: [
        'JSK represents the golden spirit of Johannesburg at high altitude.',
        'Packed stadiums and passionate yellow army support across Gauteng.',
        'High-voltage rivalries with MI Cape Town & Sunrisers Eastern Cape.'
      ],
      hashtag: '#YellowArmy'
    },
    {
      id: 'MLC',
      name: 'Cognizant Major League Cricket (MLC)',
      short: 'MLC',
      logo: '/mlc-logo.png',
      franchise: 'Texas Super Kings (TSK)',
      teamLogo: '/tsk-logo.png',
      tagline: 'The American Cricket Revolution & Major League Dynasty',
      accentColor: 'from-blue-600 via-red-600 to-yellow-400',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      founded: '2023',
      format: '6 Teams • 25 Matches',
      trophiesWon: 'Inaugural Playoff Finalists & Title Contenders',
      venue: 'Grand Prairie Stadium, Dallas, Texas',
      highlights: [
        'Carrying the legendary Super Kings heritage into the United States.',
        'World-class stadium in Dallas packed with thousands of cricket fans.',
        'Global stars led by Faf du Plessis and mentored by Stephen Fleming.'
      ],
      hashtag: '#WhistleForTexas'
    }
  ];

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase font-display tracking-tight text-slate-900 dark:text-white flex items-center">
            Global Arenas • IPL • SA20 • MLC <Globe className="w-5 h-5 ml-2 text-csk-yellow" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The 3 World-Class Tournaments Where Super Kings Franchises Compete
          </p>
        </div>
      </div>

      {/* Grid of 3 Leagues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <div
            key={league.id}
            className="sports-card group relative rounded-2xl p-6 border border-slate-200 dark:border-csk-borderNavy hover:border-csk-yellow/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl"
          >
            {/* Top Row: League Logo & Badge */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <LeagueLogo src={league.logo} alt={league.name} accentColor={league.accentColor} short={league.short} />
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block">
                      League Showcase
                    </span>
                    <h3 className="text-lg font-semibold font-heading text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition">
                      {league.short}
                    </h3>
                  </div>
                </div>
                <LeagueLogo src={league.teamLogo} alt={league.franchise} accentColor={league.accentColor} short={league.franchise.split('(')[1].replace(')', '')} />
              </div>


              {/* Tagline */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                {league.tagline}
              </p>

              {/* Key Stats Pill */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center">
                    <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow" /> Super Kings Trophies:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">
                    {league.trophiesWon}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow" /> Home Ground:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-right truncate max-w-[170px]">
                    {league.venue.split('(')[0]}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow" /> Representative:
                  </span>
                  <span className="font-bold text-amber-700 dark:text-csk-yellow">
                    {league.franchise}
                  </span>
                </div>
              </div>

              {/* Tournament Highlights */}
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Tournament Highlights
                </span>
                <ul className="space-y-1.5">
                  {league.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-500 dark:text-csk-yellow flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400">
                Founded {league.founded}
              </span>
              <span className="font-black text-amber-700 dark:text-csk-yellow font-display">
                {league.hashtag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
