'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  ChevronRight, 
  Search, 
  ChevronDown, 
  HelpCircle, 
  Sparkles
} from 'lucide-react';

export default function CSKNewsView({ initialPosts = [] }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9); // Strictly 9 boxes initially
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Filter CSK relevant posts
  const cskPosts = useMemo(() => {
    return (initialPosts || []).filter(p => {
      if (p.franchise === 'CSK') return true;
      const text = ((p.title || '') + ' ' + (p.category || '') + ' ' + (p.excerpt || '')).toLowerCase();
      return text.includes('csk') || text.includes('chennai') || text.includes('dhoni') || text.includes('gaikwad') || text.includes('chepauk') || text.includes('super kings');
    });
  }, [initialPosts]);

  // Categories filter list
  const categories = [
    { id: 'ALL', label: 'All CSK News' },
    { id: 'IPL', label: 'IPL & Matches' },
    { id: 'Features', label: 'Features' },
    { id: 'Statistics', label: 'Statistics' },
    { id: 'Dhoni', label: 'MS Dhoni' },
    { id: 'Gaikwad', label: 'Ruturaj Gaikwad' },
  ];

  // Filter by category and search
  const filteredPosts = useMemo(() => {
    let result = cskPosts;

    if (activeCategory !== 'ALL') {
      if (activeCategory === 'Dhoni') {
        result = result.filter(p => ((p.title || '') + ' ' + (p.excerpt || '')).toLowerCase().includes('dhoni'));
      } else if (activeCategory === 'Gaikwad') {
        result = result.filter(p => ((p.title || '') + ' ' + (p.excerpt || '')).toLowerCase().includes('gaikwad') || ((p.title || '')).toLowerCase().includes('ruturaj'));
      } else if (activeCategory === 'IPL') {
        result = result.filter(p => (p.category || '').toLowerCase().includes('ipl'));
      } else {
        result = result.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => ((p.title || '') + ' ' + (p.excerpt || '')).toLowerCase().includes(q));
    }

    return result;
  }, [cskPosts, activeCategory, searchQuery]);

  // 9 boxes initially, incremented by 9 on Load More
  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  // 7 FAQs from live site (https://superkingsden.com/csk-news/)
  const faqs = [
    {
      q: 'Who is the current CSK head coach?',
      a: 'As of August 2026, Chennai Super Kings have not officially announced a permanent replacement for Stephen Fleming. CSK and Fleming mutually parted ways in July 2026 after an 18-year association.'
    },
    {
      q: 'What is the latest CSK news today?',
      a: 'The latest CSK news includes developments around the team’s post-Fleming coaching transition, squad planning, and potential player movements ahead of the next IPL season. Current reports also have CSK linked with discussions involving players such as Hardik Pandya, although such reports should be treated as developments rather than confirmed transfers.'
    },
    {
      q: 'Where can I follow Chennai Super Kings updates?',
      a: 'You can follow Chennai Super Kings through their official social media channels and the official IPL website. For regular CSK news, squad updates, player profiles, match reports, and analysis, SuperKingsDen can also be used as a dedicated CSK information source.'
    },
    {
      q: 'When is the IPL 2027 auction?',
      a: 'The IPL 2027 auction date has not been officially announced yet. The auction schedule will be confirmed by the BCCI/IPL Governing Council closer to the 2027 season.'
    },
    {
      q: 'Who is the captain of CSK in 2026?',
      a: 'Ruturaj Gaikwad is the captain of Chennai Super Kings. The official IPL team profile lists Gaikwad as CSK captain.'
    },
    {
      q: 'Will MS Dhoni play for CSK in IPL 2027?',
      a: 'MS Dhoni’s participation in IPL 2027 has not been officially confirmed. His future with CSK remains one of the biggest questions heading into the next season.'
    },
    {
      q: 'How many IPL trophies has CSK won?',
      a: 'Chennai Super Kings have won 5 IPL titles, in 2010, 2011, 2018, 2021 and 2023.'
    }
  ];


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ─── 1. Franchise Switcher Navigation Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Link
          href="/csk-news"
          className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-2 border bg-csk-yellow text-csk-darkNavy border-csk-yellow shadow-md"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFCB05]" />
          <span>CSK News (IPL)</span>
        </Link>

        <Link
          href="/jsk-news"
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-yellow-400"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>JSK News (SA20)</span>
        </Link>

        <Link
          href="/tsk-news"
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-500"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>TSK News (MLC)</span>
        </Link>
      </div>

      {/* ─── 2. Live Site Header & Editorial Welcome Intro ─── */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-300/60 dark:border-amber-500/20 p-6 sm:p-8">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-2.5 h-8 bg-csk-yellow rounded-full flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase font-heading tracking-tight text-slate-900 dark:text-white leading-tight">
              CSK News — Latest Chennai Super Kings Updates
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-csk-yellow mt-1">
              Trades, coaching changes, squad moves and match news — refreshed daily from Chepauk and beyond.
            </p>
          </div>
        </div>

        {/* Live Site Editorial Text as-is */}
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed w-full pt-2 border-t border-amber-200/50 dark:border-white/10">
          Welcome to the home of <strong>Chennai Super Kings news</strong> — your daily stop for everything happening in and around the CSK camp. This hub is updated every single day with the latest <strong>CSK news</strong>, from trade rumours and player retentions to coaching reshuffles and Dhoni’s evolving role at the franchise. Whether it’s breaking transfer news ahead of the IPL 2027 auction, a fresh squad announcement, or a match-day preview, you’ll find it here first. Bookmark this page — we track CSK news today so you don’t have to go looking for it elsewhere, across every format the Super Kings play: IPL, and beyond.
        </p>
      </div>

      {/* ─── 3. Toolbar: Filter Chips & Instant Search ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
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
                    ? 'bg-csk-yellow text-csk-darkNavy font-black shadow-xs'
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
            placeholder="Search CSK articles..."
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
                className="sports-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-[#0D1E47] p-5 flex flex-col justify-between hover:border-csk-yellow/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                      {post.category || 'CSK News'}
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
              <span>Load More CSK Stories</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Showing {displayedPosts.length} of {filteredPosts.length} total articles
            </p>
          </div>
        )}
      </div>

      {/* ─── 6. Extra Content From Live Site (As-Is): IPL News & CSK Central Role ─── */}
      <section className="mb-14 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-csk-borderNavy p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-5">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              IPL News &amp; The Chennai Super Kings Dynasty
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              The heartbeat of Indian Premier League cricket from 2008 to present
            </p>
          </div>
        </div>

        {/* Live Site Content Paragraphs verbatim */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
          <p>
            The Indian Premier League (IPL) changed how you watch T20 cricket. Packed schedules, high skill, big finishes, and global stars turn every April–May into a festival. Franchises fight for points and pride, while fans track trades, auctions, and mid-season tweaks that shape the table.
          </p>
          <p>
            Inside that story sits <strong>Chennai Super Kings</strong>. Few teams match CSK for pull or consistency. The yellow stands at Chepauk tell you why. The franchise blends calm leadership with clear roles, which keeps players trusted and fans loyal.
          </p>
          <p>
            CSK’s five IPL trophies speak for themselves: 2010, 2011, 2018, 2021, and 2023. From MS Dhoni’s street-smart calls to Ravindra Jadeja’s all-round impact and Suresh Raina’s run-machine years, the team has housed some of the game’s biggest names. New signings step in, young talent steps up, and the team stays in the mix year after year. Home games feel like events. Away games still pull massive crowds in yellow.
          </p>
        </div>

        {/* What Makes CSK Central to the IPL? (Exact 6 Bullets from live site) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-400/30 mb-6">
          <h3 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-csk-yellow" />
            <span>What Makes CSK Central to the IPL?</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-800 dark:text-slate-200">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-300/40 dark:border-white/5">
              <strong className="text-amber-800 dark:text-csk-yellow block mb-0.5">🏟️ Crowds:</strong>
              <span>Home and away, CSK draws full houses and loud away sections.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-300/40 dark:border-white/5">
              <strong className="text-amber-800 dark:text-csk-yellow block mb-0.5">⚡ Style:</strong>
              <span>Steady chases, bold death bowling, and cool finishes.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-300/40 dark:border-white/5">
              <strong className="text-amber-800 dark:text-csk-yellow block mb-0.5">⭐ Stars:</strong>
              <span>Dhoni, Raina, Jadeja, Bravo, Conway, Pathirana, and more.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-300/40 dark:border-white/5">
              <strong className="text-amber-800 dark:text-csk-yellow block mb-0.5">🦁 Culture:</strong>
              <span>Clear roles, faith in players, measured tactics.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-300/40 dark:border-white/5">
              <strong className="text-amber-800 dark:text-csk-yellow block mb-0.5">⚔️ Rivalries:</strong>
              <span>Duels with Mumbai, Kolkata, and Bengaluru that anchor every season.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-300/40 dark:border-white/5">
              <strong className="text-amber-800 dark:text-csk-yellow block mb-0.5">📊 Data:</strong>
              <span>Fixtures, points table, squad changes, and injury updates in one place.</span>
            </div>
          </div>
        </div>

        {/* Influence on Fans, Fantasy & Buzz */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
          <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white mb-1.5">
            CSK’s Influence on Fans, Fantasy &amp; IPL Buzz
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            For you, the IPL is the league; for many, CSK is the lens. News about CSK moves markets in fantasy teams and sets the tone for watch nights. When CSK clicks, the tournament feels bigger.
          </p>
        </div>
      </section>

      {/* ─── 7. Frequently Asked Questions (FAQ) From Live Site (Smooth Animated Accordion) ─── */}
      <section className="sports-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-csk-borderNavy bg-white dark:bg-slate-900/80 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              Verified answers to the most asked questions about Chennai Super Kings
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
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
