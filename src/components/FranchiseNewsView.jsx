'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle 
} from 'lucide-react';

const FRANCHISE_DATA = {
  JSK: {
    code: 'JSK',
    name: 'Joburg Super Kings',
    league: 'SA20 League (South Africa)',
    title: 'JSK News Coverage – Squad Updates, Match Analysis & Player Performances',
    subtitle: 'Everything yellow and green from the Bullring — refreshed daily.',
    activeTabClass: 'bg-[#FFD100] text-[#052614] font-black border-[#FFD100] shadow-md',
    badgeClass: 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    indicatorBg: 'bg-csk-yellow',
    cardBorderHover: 'hover:border-[#FFD100]/80',
    bannerGradient: 'from-amber-500/10 via-emerald-500/5 to-transparent border-amber-300/60 dark:border-emerald-500/30',
    editorialBorder: 'border-amber-200/50 dark:border-emerald-500/20',
    paragraphs: [
      (
        <span key="p1">
          Joburg Super Kings carry the Super Kings legacy into South Africa, thrilling crowds at Wanderers Stadium while forging their own identity in the SA20. <strong>Captain Faf du Plessis</strong>, <strong>coach Stephen Fleming</strong>, and a mix of global stars and local standouts drive a style of cricket that keeps scoreboards racing and whistles ringing. The team’s semi‑final debut in 2023 signaled immediate intent, and each new campaign feeds a fast‑growing appetite for <strong>JSK News</strong>.
        </span>
      ),
      (
        <span key="p2">
          The Bullring turns electric when Jonny Bairstow, Devon Conway, and Moeen Ali launch sixes or when Imran Tahir and Lizaad Williams plot spinning traps. Veterans blend with rising talents such as Donovan Ferreira, creating match‑ups that change in a heartbeat.
        </span>
      ),
      (
        <span key="p3">
          This page tracks every squad tweak, injury update, and tactical move so supporters stay ahead of the chatter. Fans also gain early notice on ticket sales and merchandise drops, all packaged within a steady stream of <strong>JSK News</strong>.
        </span>
      ),
    ],
    categories: [
      { id: 'all', label: 'All JSK Stories' },
      { id: 'sa20', label: 'SA20 League' },
      { id: 'squad', label: 'Squad & Players' },
      { id: 'matches', label: 'Match Previews' },
      { id: 'wanderers', label: 'The Bullring' },
    ],
    searchPlaceholder: 'Search JSK articles...',
    loadMoreText: 'Load More JSK Stories',
    faqs: [
      {
        q: 'Where can I find the latest Joburg Super Kings news?',
        a: 'You can find the latest Joburg Super Kings news on SuperKingsDen, including squad updates, player news, match previews, results, transfers, injuries, and SA20 developments.',
      },
      {
        q: 'Who are the Joburg Super Kings?',
        a: 'Joburg Super Kings are a South African T20 franchise that competes in the SA20 league. The team is part of the Super Kings franchise family associated with Chennai Super Kings.',
      },
      {
        q: 'Where can I get Joburg Super Kings player updates?',
        a: 'SuperKingsDen covers player performances, squad announcements, injuries, signings, contract updates, and other important Joburg Super Kings player news.',
      },
      {
        q: 'What are the latest Joburg Super Kings transfer news?',
        a: 'Joburg Super Kings transfer news includes new signings, player releases, retentions, replacements, and squad changes ahead of upcoming SA20 seasons.',
      },
      {
        q: 'Where can I find Joburg Super Kings match updates?',
        a: 'SuperKingsDen provides Joburg Super Kings match previews, live updates, results, key performances, score-related news, and post-match analysis.',
      },
      {
        q: 'Who is the captain of Joburg Super Kings?',
        a: 'The Joburg Super Kings captain can change between SA20 seasons. SuperKingsDen provides the latest captaincy and leadership updates whenever official announcements are made.',
      },
      {
        q: 'Who is the coach of Joburg Super Kings?',
        a: 'The Joburg Super Kings coaching staff can change over time. SuperKingsDen covers the latest head coach, support staff, and coaching-related developments.',
      },
      {
        q: 'When does Joburg Super Kings play their next match?',
        a: 'The next Joburg Super Kings match depends on the current SA20 schedule. SuperKingsDen covers upcoming fixtures, match timings, venues, and important pre-match updates.',
      },
      {
        q: 'Where can I find Joburg Super Kings squad news?',
        a: 'You can follow SuperKingsDen for the latest Joburg Super Kings squad news, including player additions, releases, replacements, injuries, and confirmed squad announcements.',
      },
      {
        q: 'Does SuperKingsDen cover Joburg Super Kings throughout the SA20 season?',
        a: 'Yes. SuperKingsDen covers Joburg Super Kings throughout the SA20 season with the latest news, fixtures, results, player updates, match analysis, and major team developments.',
      },
    ],
  },
  TSK: {
    code: 'TSK',
    name: 'Texas Super Kings',
    league: 'Major League Cricket (MLC - USA)',
    title: 'TSK News Coverage – Squad Updates, Match Analysis & MLC Journey',
    subtitle: 'Grand Prairie Stadium chronicles, player rosters, and match news from Major League Cricket.',
    activeTabClass: 'bg-[#00205B] text-white font-black border-red-500 shadow-md',
    badgeClass: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
    accentText: 'text-red-600 dark:text-red-400',
    indicatorBg: 'bg-csk-yellow',
    cardBorderHover: 'hover:border-red-500/80',
    bannerGradient: 'from-blue-600/10 via-red-500/5 to-transparent border-blue-400/50 dark:border-blue-500/20',
    editorialBorder: 'border-blue-200/50 dark:border-blue-500/20',
    paragraphs: [
      (
        <span key="p1">
          Welcome to the home of <strong>Texas Super Kings news</strong> — your daily source for everything happening across Major League Cricket (MLC). Carrying the proud Super Kings championship DNA to America, TSK has transformed Grand Prairie Stadium into a true fortress of cricket. Led by world-class international icons and premier domestic talent, we bring you all the breaking news, trade rumors, draft moves, and tactical insights.
        </span>
      ),
      (
        <span key="p2">
          From dramatic last-over thrillers against MI New York and Washington Freedom to bowling masterclasses by Dwayne Bravo and Noor Ahmad, Texas Super Kings are pioneering the future of American cricket. Bookmark this page — we track Texas Super Kings news daily so you never miss a moment of the Super Kings empire across the globe.
        </span>
      ),
    ],
    categories: [
      { id: 'all', label: 'All TSK Stories' },
      { id: 'mlc', label: 'MLC Tournament' },
      { id: 'squad', label: 'Squad & Roster' },
      { id: 'matches', label: 'Match Reviews' },
      { id: 'grand-prairie', label: 'Grand Prairie Stadium' },
    ],
    searchPlaceholder: 'Search TSK articles...',
    loadMoreText: 'Load More TSK Stories',
    faqs: [
      {
        q: 'Where can I find the latest Texas Super Kings news?',
        a: 'SuperKingsDen provides complete coverage of Texas Super Kings in Major League Cricket (MLC), including player rosters, match reports, draft updates, and injury news.',
      },
      {
        q: 'Where do Texas Super Kings play their home matches?',
        a: 'TSK plays at the world-class Grand Prairie Stadium located in the Dallas-Fort Worth metroplex in Texas, USA.',
      },
      {
        q: 'Which tournament do Texas Super Kings compete in?',
        a: 'Texas Super Kings compete in Major League Cricket (MLC), America’s premier professional Twenty20 cricket tournament sanctioned by the ICC.',
      },
      {
        q: 'Who coaches and leads Texas Super Kings?',
        a: 'Texas Super Kings feature world-class coaching and leadership drawn from the Chennai Super Kings ecosystem, bringing decades of IPL championship experience to the United States.',
      },
      {
        q: 'What are the biggest rivalries for TSK in MLC?',
        a: 'TSK’s fixtures against MI New York, Washington Freedom, and San Francisco Unicorns are among the most watched and fiercely contested fixtures in Major League Cricket.',
      },
      {
        q: 'How can I follow TSK player stats and match scores?',
        a: 'You can explore live match reports, seasonal statistics, and player profiles directly on SuperKingsDen’s dedicated franchise hub.',
      },
    ],
  },
  CSK: {
    code: 'CSK',
    name: 'Chennai Super Kings',
    league: 'Indian Premier League (IPL)',
    title: 'CSK News — Latest Chennai Super Kings Updates',
    subtitle: 'Trades, coaching changes, squad moves and match news — refreshed daily from Chepauk and beyond.',
    activeTabClass: 'bg-csk-yellow text-csk-darkNavy font-black border-csk-yellow shadow-md',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    accentText: 'text-amber-700 dark:text-csk-yellow',
    indicatorBg: 'bg-csk-yellow',
    cardBorderHover: 'hover:border-csk-yellow/80',
    bannerGradient: 'from-amber-500/10 via-yellow-500/5 to-transparent border-amber-300/60 dark:border-amber-500/20',
    editorialBorder: 'border-amber-200/50 dark:border-white/10',
    paragraphs: [
      (
        <span key="p1">
          Welcome to the home of <strong>Chennai Super Kings news</strong> — your daily stop for everything happening in and around the CSK camp. This hub is updated every single day with the latest <strong>CSK news</strong>, from trade rumours and player retentions to coaching reshuffles and Dhoni’s evolving role at the franchise.
        </span>
      ),
    ],
    categories: [
      { id: 'all', label: 'All CSK Stories' },
      { id: 'dhoni', label: 'MS Dhoni' },
      { id: 'auction', label: 'IPL Auction' },
      { id: 'squad', label: 'Squad & Players' },
      { id: 'matches', label: 'Match Previews' },
    ],
    searchPlaceholder: 'Search CSK articles...',
    loadMoreText: 'Load More CSK Stories',
    faqs: [
      {
        q: 'What makes Chennai Super Kings so successful in the IPL?',
        a: 'CSK’s sustained success is built on leadership continuity under MS Dhoni and Stephen Fleming, a deep-rooted trust in player roles, and unmatched home fortress advantage at Chepauk.',
      },
      {
        q: 'How many IPL trophies has CSK won?',
        a: 'Chennai Super Kings has won five IPL titles (2010, 2011, 2018, 2021, and 2023) alongside two Champions League T20 crowns (2010, 2014).',
      },
    ],
  },
};

export default function FranchiseNewsView({ franchise = 'JSK', initialPosts = [] }) {
  const config = FRANCHISE_DATA[franchise] || FRANCHISE_DATA.JSK;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9); // Initial 9 boxes
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // 1. Filter posts for this franchise
  const franchisePosts = useMemo(() => {
    const matched = initialPosts.filter((p) => {
      const text = (
        (p.title || '') + ' ' +
        (p.excerpt || '') + ' ' +
        (p.category || '') + ' ' +
        (Array.isArray(p.tags) ? p.tags.join(' ') : '')
      ).toLowerCase();

      if (config.code === 'JSK') {
        return (
          text.includes('jsk') ||
          text.includes('joburg') ||
          text.includes('sa20') ||
          text.includes('wanderers') ||
          text.includes('bullring') ||
          text.includes('south africa') ||
          text.includes('faf')
        );
      } else if (config.code === 'TSK') {
        return (
          text.includes('tsk') ||
          text.includes('texas') ||
          text.includes('mlc') ||
          text.includes('major league') ||
          text.includes('grand prairie') ||
          text.includes('dallas')
        );
      }
      return true;
    });

    // If matched is fewer than 9, supplement with other Super Kings articles so the 3-col 9-box grid stays rich
    if (matched.length < 9) {
      const matchedSlugs = new Set(matched.map((p) => p.slug || p.id));
      const remaining = initialPosts.filter((p) => !matchedSlugs.has(p.slug || p.id));
      return [...matched, ...remaining];
    }

    return matched;
  }, [initialPosts, config.code]);

  // 2. Filter by category & search query
  const filteredPosts = useMemo(() => {
    let result = franchisePosts;

    if (activeCategory !== 'all') {
      const catLower = activeCategory.toLowerCase();
      result = result.filter((p) => {
        const text = (
          (p.title || '') + ' ' +
          (p.excerpt || '') + ' ' +
          (p.category || '') + ' ' +
          (Array.isArray(p.tags) ? p.tags.join(' ') : '')
        ).toLowerCase();
        return text.includes(catLower);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const text = ((p.title || '') + ' ' + (p.excerpt || '')).toLowerCase();
        return text.includes(q);
      });
    }

    return result;
  }, [franchisePosts, activeCategory, searchQuery]);

  // 3. Paginate to visible count (9 initial)
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const hasMore = visibleCount < filteredPosts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ─── 1. Franchise Switcher Navigation Tabs ─── */}
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
      </div>

      {/* ─── 2. Header & Full-Width Editorial Welcome Intro (Verbatim from Old/Live Site) ─── */}
      <div className={`mb-8 rounded-3xl bg-gradient-to-br ${config.bannerGradient} p-6 sm:p-8`}>
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-2.5 h-8 bg-csk-yellow rounded-full flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase font-heading tracking-tight text-slate-900 dark:text-white leading-tight">
              {config.title}
            </h1>
            <p className={`text-xs sm:text-sm font-semibold ${config.accentText} mt-1 sm:mt-1.5`}>
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Editorial Text - Full Width (w-full) */}
        <div className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed w-full pt-2 border-t ${config.editorialBorder} space-y-3`}>
          {config.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      {/* ─── 3. Toolbar: Filter Chips & Instant Search ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {config.categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setVisibleCount(9); // Reset to 9 on filter change
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? franchise === 'TSK'
                      ? 'bg-[#00205B] text-white font-black shadow-xs'
                      : 'bg-csk-yellow text-csk-darkNavy font-black shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-csk-yellow'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(9);
            }}
            placeholder={config.searchPlaceholder}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-csk-yellow"
          />
        </div>
      </div>

      {/* ─── 4. Strict 3-Column Grid with Initial 9 Boxes ─── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Latest Articles ({filteredPosts.length})
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {Math.min(visibleCount, filteredPosts.length)} of {filteredPosts.length}
          </span>
        </div>

        {displayedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((post) => (
              <article
                key={post.id || post.slug}
                className={`sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-[#0D1E47] p-5 flex flex-col justify-between ${config.cardBorderHover} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div>
                  {/* Article Thumbnail */}
                  <Link href={`/${post.slug}/`} className="block relative aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-sm text-csk-yellow border border-csk-yellow/30">
                      {post.category || config.code + ' News'}
                    </span>
                  </Link>

                  {/* Date & Author Meta */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>&bull;</span>
                    <span>{post.author || 'Super Kings Den'}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition line-clamp-2 leading-snug mb-2 font-display">
                    <Link href={`/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px]">
                  <Link
                    href={`/${post.slug}/`}
                    className="font-bold text-amber-700 dark:text-csk-yellow flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Full Story</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-slate-400 text-[10px]">3 min read</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47]">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No articles found matching "{searchQuery}". Try a different keyword or category.
            </p>
          </div>
        )}

        {/* ─── 5. Load More Button ─── */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3.5 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 group"
            >
              <span>{config.loadMoreText}</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Showing {displayedPosts.length} of {filteredPosts.length} total articles
            </p>
          </div>
        )}
      </div>

      {/* ─── 6. Smooth Animated FAQ Accordion (Exact Old/Live Site FAQs) ─── */}
      <section className="sports-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/80 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              Verified answers to common queries regarding {config.name}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {config.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-white/5 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-xs sm:text-sm transition-colors duration-200 group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isOpen ? 'text-amber-600 dark:text-csk-yellow' : 'text-slate-400 group-hover:text-amber-500'}`} />
                    <span className="group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition-colors duration-200">{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ease-in-out ${
                      isOpen ? 'rotate-180 text-amber-600 dark:text-csk-yellow' : 'rotate-0'
                    }`}
                  />
                </button>

                {/* CSS Grid Animation Container for Butter-Smooth Height Transition */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-white/5">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
