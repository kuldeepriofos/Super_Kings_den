'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Search, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  MapPin, 
  HelpCircle, 
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

const FRANCHISE_CONFIG = {
  CSK: {
    code: 'CSK',
    name: 'Chennai Super Kings',
    tagline: 'CSK News & Den Dispatches',
    subtitle: 'Trades, coaching changes, squad moves and match news — refreshed daily from Chepauk and beyond.',
    league: 'Indian Premier League (IPL)',
    stadium: 'MA Chidambaram Stadium (Chepauk, Chennai)',
    primaryColor: '#FFCB05',
    accentClass: 'text-amber-600 dark:text-csk-yellow',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    borderClass: 'border-[#FFCB05]/50',
    heroGradient: 'from-[#001B44] via-[#00275B] to-[#081432]',
    topics: ['All', 'MS Dhoni', 'Ruturaj', 'Auction', 'Tactics', 'Chepauk', 'Bowling', 'Batting'],
    trendingGuides: [
      {
        title: 'Whistle Podu Meaning & Origin: CSK’s Iconic Fan Chant Explained',
        slug: 'whistle-podu-meaning',
        tag: 'Fan Culture'
      },
      {
        title: 'AnbuDen Meaning: Why CSK Uses the Hashtag for Chepauk',
        slug: 'anbuden-meaning',
        tag: 'Fortress Chepauk'
      },
      {
        title: 'CSK Home Ground: History & Records of MA Chidambaram Stadium',
        slug: 'csk-home-ground',
        tag: 'Venue Guide'
      },
      {
        title: 'Does MS Dhoni Own a Stake in CSK? Here’s What We Know',
        slug: 'ms-dhoni-csk-stakes',
        tag: 'Captain Cool'
      }
    ],
    faqs: [
      {
        q: 'What Makes CSK Central to the IPL?',
        a: 'With 5 IPL championships, 10 finals appearances, and the unparalleled legacy of MS Dhoni, Chennai Super Kings has built one of the most passionate and loyal fanbases in global franchise sports.'
      },
      {
        q: 'Why is Chepauk considered the AnbuDen fortress?',
        a: 'Chepauk (MA Chidambaram Stadium) has one of the highest home-win percentages in T20 history (over 70%). The dry, spin-friendly surface paired with deafening crowd support makes it one of the toughest away fixtures in cricket.'
      },
      {
        q: 'How can I view individual player stats and match records?',
        a: 'Visit our Players directory (/players) and Seasons archive (/seasons) to explore historical ball-by-ball summaries, head-to-head records, and career stats.'
      }
    ]
  },
  JSK: {
    code: 'JSK',
    name: 'Joburg Super Kings',
    tagline: 'Joburg Super Kings (JSK) News & SA20 Hub',
    subtitle: 'Everything yellow and green from the Bullring. Stay on top of SA20 fixtures, player auctions, and match reviews.',
    league: 'SA20 League (South Africa)',
    stadium: 'The Wanderers Stadium (Johannesburg)',
    primaryColor: '#FFD100',
    accentClass: 'text-yellow-600 dark:text-yellow-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    borderClass: 'border-yellow-400/50',
    heroGradient: 'from-[#052614] via-[#0B3D20] to-[#081432]',
    topics: ['All', 'Faf du Plessis', 'SA20', 'Wanderers', 'Auction', 'Squad', 'Playoffs'],
    trendingGuides: [
      {
        title: 'Joburg Super Kings Season 4 SA20 Journey & Schedule',
        slug: 'joburg-super-kings-season-4-sa20-league',
        tag: 'SA20 Fixtures'
      },
      {
        title: 'Joburg Super Kings Retained Players — SA20 Roster Build-up',
        slug: 'joburg-super-kings-retained-players-sa20-season-4',
        tag: 'Squad News'
      },
      {
        title: 'Wiaan Mulder Shock Release by JSK Headlines SA20 Build-up',
        slug: 'wiaan-mulders-shock-release-by-jsk-headlines-the-sa20-2027-auction-build-up',
        tag: 'Auction'
      },
      {
        title: 'Faf du Plessis Captaincy Profile & Wanderers Record',
        slug: 'all-time-xi',
        tag: 'Leader'
      }
    ],
    faqs: [
      {
        q: 'What is JSK’s relationship with Chennai Super Kings?',
        a: 'Joburg Super Kings is the South African sister franchise of CSK in Cricket South Africa’s SA20 tournament, owned by Chennai Super Kings Cricket Limited.'
      },
      {
        q: 'Who leads Joburg Super Kings in SA20?',
        a: 'Former CSK star and South African captain Faf du Plessis captains JSK, continuing the Super Kings attacking philosophy at the Bullring.'
      }
    ]
  },
  TSK: {
    code: 'TSK',
    name: 'Texas Super Kings',
    tagline: 'Texas Super Kings (TSK) News & Major League Cricket',
    subtitle: 'Grand Prairie Stadium chronicles, MLC championship quest, squad depth, and American cricket expansion.',
    league: 'Major League Cricket (MLC - USA)',
    stadium: 'Grand Prairie Stadium (Dallas, Texas)',
    primaryColor: '#00205B',
    accentClass: 'text-sky-600 dark:text-csk-yellow',
    badgeClass: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
    borderClass: 'border-blue-400/50',
    heroGradient: 'from-[#00205B] via-[#081432] to-[#1E000B]',
    topics: ['All', 'MLC Season', 'Grand Prairie', 'Bowling Attack', 'Squad Depth', 'Match Reports'],
    trendingGuides: [
      {
        title: 'The Inspiring Journey of Texas Super Kings in MLC',
        slug: 'the-inspiring-journey-of-texas-super-kings',
        tag: 'USA Cricket'
      },
      {
        title: 'TSK 2025 Bowling Attack: Pace, Spin & All-Round Depth',
        slug: 'tsk-2025-bowling-attack',
        tag: 'Tactics'
      },
      {
        title: 'Texas Super Kings Squad & Full Player Roster',
        slug: 'tsk-2025-squad',
        tag: 'Squad'
      },
      {
        title: 'Grand Prairie Stadium: America’s Premier Cricket Destination',
        slug: 'about-us',
        tag: 'Home Ground'
      }
    ],
    faqs: [
      {
        q: 'Where do Texas Super Kings play their home matches?',
        a: 'TSK plays at the state-of-the-art Grand Prairie Stadium in the Dallas-Fort Worth metroplex in Texas, USA.'
      },
      {
        q: 'How does TSK participate in the Super Kings family?',
        a: 'TSK brings the Super Kings brand and championship pedigree to North American sports, participating in Major League Cricket alongside global cricket icons.'
      }
    ]
  }
};

export default function FranchiseNewsView({ franchise = 'CSK', initialPosts = [] }) {
  const config = FRANCHISE_CONFIG[franchise] || FRANCHISE_CONFIG.CSK;

  const [activeTopic, setActiveTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [openFaq, setOpenFaq] = useState(0);

  // Filter posts matching this franchise
  const franchisePosts = useMemo(() => {
    return initialPosts.filter(p => {
      const text = (
        (p.title || '') + ' ' + 
        (p.excerpt || '') + ' ' + 
        (p.category || '') + ' ' + 
        (Array.isArray(p.tags) ? p.tags.join(' ') : '')
      ).toLowerCase();

      if (config.code === 'CSK') {
        return text.includes('csk') || text.includes('chennai') || text.includes('dhoni') || text.includes('gaikwad') || text.includes('chepauk') || text.includes('super kings');
      } else if (config.code === 'JSK') {
        return text.includes('jsk') || text.includes('joburg') || text.includes('sa20') || text.includes('wanderers') || text.includes('bullring');
      } else if (config.code === 'TSK') {
        return text.includes('tsk') || text.includes('texas') || text.includes('mlc') || text.includes('major league') || text.includes('grand prairie');
      }
      return true;
    });
  }, [initialPosts, config.code]);

  // Apply topic filter and search query
  const filteredPosts = useMemo(() => {
    let result = franchisePosts;

    if (activeTopic !== 'All') {
      const topicLower = activeTopic.toLowerCase();
      result = result.filter(p => {
        const text = ((p.title || '') + ' ' + (p.excerpt || '') + ' ' + (p.category || '')).toLowerCase();
        return text.includes(topicLower);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const text = ((p.title || '') + ' ' + (p.excerpt || '')).toLowerCase();
        return text.includes(q);
      });
    }

    return result;
  }, [franchisePosts, activeTopic, searchQuery]);

  // Lead spotlight story & secondary stories
  const leadPost = filteredPosts[0];
  const secondaryPosts = filteredPosts.slice(1, 3);
  const gridPosts = filteredPosts.slice(3, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. Franchise Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Link
          href="/csk-news"
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
            franchise === 'CSK'
              ? 'bg-csk-yellow text-csk-darkNavy font-black border-csk-yellow shadow-md'
              : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-csk-yellow'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFCB05]" />
          <span>CSK News (IPL)</span>
        </Link>

        <Link
          href="/jsk-news"
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
            franchise === 'JSK'
              ? 'bg-[#FFD100] text-[#052614] font-black border-[#FFD100] shadow-md'
              : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-yellow-400'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>JSK News (SA20)</span>
        </Link>

        <Link
          href="/tsk-news"
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
            franchise === 'TSK'
              ? 'bg-[#00205B] text-white font-black border-red-500 shadow-md'
              : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-red-500'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>TSK News (MLC)</span>
        </Link>

        <Link
          href="/news"
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:text-amber-600 dark:hover:text-csk-yellow"
        >
          <span>All Dispatches</span>
        </Link>
      </div>

      {/* 2. Hero Banner */}
      <div 
        className={`csk-hero-banner bg-gradient-to-r ${config.heroGradient} ${config.borderClass}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2 text-csk-yellow text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-csk-yellow inline-block animate-pulse" />
            <span>{config.league}</span>
          </div>

          <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${config.badgeClass} border`}>
            {franchisePosts.length} Stories Available
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-semibold text-white font-heading tracking-tight mb-2">
          {config.tagline}
        </h1>

        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mb-4 leading-relaxed">
          {config.subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-csk-yellow" />
            <span>{config.stadium}</span>
          </span>
          <span>&bull;</span>
          <span className="text-csk-yellow font-bold">#WhistlePodu</span>
        </div>
      </div>

      {/* 3. Search & Sub-topic Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-8">
        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {config.topics.map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTopic(t);
                setVisibleCount(12);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeTopic === t
                  ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-sm'
                  : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${config.code} stories...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(12);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:outline-none focus:border-csk-yellow shadow-xs"
          />
        </div>
      </div>

      {/* 4. Lead Spotlight Article */}
      <h2 className="sr-only">Featured {config.code} Spotlight Stories</h2>
      {leadPost && (
        <div className="mb-10">
          <div className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47] hover:border-csk-yellow/60 transition-all shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image Col (7 cols) */}
              <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={leadPost.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                  alt={leadPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-csk-yellow text-csk-darkNavy shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Lead Story</span>
                  </span>
                </div>
              </div>

              {/* Text Col (5 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="font-semibold text-amber-700 dark:text-csk-yellow uppercase text-[11px] tracking-wider">
                      {leadPost.category || config.code + ' News'}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(leadPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-heading leading-snug mb-3">
                    <Link href={`/${leadPost.slug}/`}>
                      {leadPost.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed mb-6">
                    {leadPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span>{leadPost.author || 'Super Kings Den'}</span>
                  </div>

                  <Link
                    href={`/${leadPost.slug}/`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition shadow-sm"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Secondary Spotlight Stories (2 cols) */}
      {secondaryPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {secondaryPosts.map((post) => (
            <div
              key={post.id || post.slug}
              className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47] p-5 flex flex-col justify-between hover:border-csk-yellow/60 transition shadow-sm"
            >
              <div>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-sm text-csk-yellow border border-white/20">
                    {post.category || config.code}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>&bull;</span>
                  <span>By {post.author || 'Super Kings Den'}</span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition font-heading line-clamp-2 leading-snug mb-2">
                  <Link href={`/${post.slug}/`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              </div>

              <Link
                href={`/${post.slug}/`}
                className="text-xs font-semibold text-amber-700 dark:text-csk-yellow hover:underline flex items-center gap-1 mt-2"
              >
                <span>Read Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 6. Chronological News Grid */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-tight">
                Latest {config.code} Dispatches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exclusive news, tactical analysis &amp; tournament updates
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Showing {Math.min(visibleCount, filteredPosts.length)} of {filteredPosts.length}
          </span>
        </div>

        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <article
                key={post.id || post.slug}
                className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47] p-5 flex flex-col justify-between hover:border-csk-yellow/60 transition shadow-sm"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-sm text-csk-yellow">
                      {post.category || config.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>&bull;</span>
                    <span>{post.author || 'Super Kings Den'}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug mb-2 font-heading">
                    <Link href={`/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <Link
                    href={`/${post.slug}/`}
                    className="font-bold text-amber-700 dark:text-csk-yellow flex items-center gap-1 hover:underline"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  <span className="text-slate-400 text-[10px]">3 min read</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47]">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No articles found matching your criteria. Try adjusting your search query or topic filter.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="px-8 py-3 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition shadow-md inline-flex items-center gap-2"
            >
              <span>Load More {config.code} Stories</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 7. Frequently Searched / Trending Guides (Matches live site!) */}
      {config.trendingGuides.length > 0 && (
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/30">
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-tight flex items-center">
                Frequently Searched {config.code} Topics &amp; Fan Guides
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                In-depth explainers, stadium histories, and iconic franchise moments referenced daily by fans.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.trendingGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/${guide.slug}/`}
                className="sports-card p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47] hover:border-csk-yellow transition flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-csk-yellow bg-amber-500/10 dark:bg-csk-yellow/10 px-2 py-0.5 rounded-full mb-2">
                    {guide.tag}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-3 leading-snug font-heading">
                    {guide.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-csk-yellow flex items-center gap-1 mt-3">
                  <span>Read Guide</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 8. Franchise Overview & FAQs Accordion */}
      {config.faqs.length > 0 && (
        <div className="sports-card p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47]">
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white font-heading uppercase tracking-tight flex items-center">
                {config.name} Overview &amp; FAQs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key insights regarding franchise milestones, home venue culture, and tournament coverage.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {config.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-amber-600 dark:text-csk-yellow shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#0D1E47] border-t border-slate-200 dark:border-white/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

