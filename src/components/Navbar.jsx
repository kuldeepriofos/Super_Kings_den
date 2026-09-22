'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Moon, Sun, Menu, X, Flame, ChevronRight, Trophy, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import postsIndex from '../data/postsIndex.json';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [mobileNewsOpen, setMobileNewsOpen] = useState(true);
  const pathname = usePathname();
  const { 
    darkMode, 
    toggleDarkMode, 
    setSearchOpen,
    mounted 
  } = useApp();

  const recentPosts = (postsIndex || []).slice(0, 6);
  const [activeRecentIdx, setActiveRecentIdx] = useState(0);

  useEffect(() => {
    if (recentPosts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveRecentIdx((prev) => (prev + 1) % recentPosts.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [recentPosts.length]);

  const currentRecentPost = recentPosts[activeRecentIdx] || recentPosts[0];

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/seasons', label: 'Seasons' },
    { href: '/players', label: 'Players' },
    { href: '/rivalries', label: 'Rivalries' },
    { href: '/stats', label: 'Stats' },
    { href: '/trophies', label: 'Trophies' },
    { href: '/standings', label: 'Standings' },
  ];

  const newsItems = [
    {
      href: '/csk-news',
      title: 'CSK News (IPL)',
      subtitle: 'Chennai Super Kings • Chepauk',
      badge: 'IPL',
      color: '#FFCB05',
      badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow border-amber-500/30',
    },
    {
      href: '/jsk-news',
      title: 'JSK News (SA20)',
      subtitle: 'Joburg Super Kings • Wanderers',
      badge: 'SA20',
      color: '#10B981',
      badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      href: '/tsk-news',
      title: 'TSK News (MLC)',
      subtitle: 'Texas Super Kings • Grand Prairie',
      badge: 'MLC',
      color: '#EF4444',
      badgeClass: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
    },
    {
      href: '/news',
      title: 'All Dispatches',
      subtitle: 'Global updates across all leagues',
      badge: 'All',
      color: '#3B82F6',
      badgeClass: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
    },
  ];

  const isNewsActive = 
    pathname === '/news' || 
    pathname.startsWith('/news/') || 
    pathname === '/csk-news' || 
    pathname === '/jsk-news' || 
    pathname === '/tsk-news';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#081432]/95 border-b border-slate-200 dark:border-csk-navy/80 shadow-sm">
      
      {/* 1. Top Ticker Strip: Left Recent Blog Name (Clickable) | Right Social Links */}
      <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-csk-navy dark:via-slate-900 dark:to-csk-navy border-b border-slate-200 dark:border-white/5 py-1.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
        <div className="container mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Recent Blog Post (Clickable) */}
          <div className="flex items-center space-x-2 overflow-hidden flex-1 min-w-0">
            <span className="flex items-center text-amber-800 dark:text-csk-yellow font-bold uppercase tracking-wider text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Flame className="w-3 h-3 mr-1 animate-pulse text-amber-600 dark:text-csk-yellow shrink-0" />
              Recent Blog
            </span>
            {currentRecentPost && (
              <Link
                href={`/${currentRecentPost.slug}/`}
                className="truncate text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-csk-yellow transition font-medium text-xs flex items-center gap-1 group"
                title={currentRecentPost.title}
              >
                <span className="truncate group-hover:underline">{currentRecentPost.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-csk-yellow group-hover:translate-x-0.5 transition shrink-0 hidden sm:inline-block" />
              </Link>
            )}
          </div>

          {/* Right: Official Social Links with Brand Logos */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 hidden lg:inline-block mr-1">Follow:</span>
            
            {/* X / Twitter */}
            <a
              href="https://x.com/superkingsden"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow on X (Twitter)"
              aria-label="Follow on X (Twitter)"
              className="group flex items-center justify-center w-6 h-6 rounded-md bg-black hover:bg-slate-800 transition-all duration-200 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/superkingsden/"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow on Instagram"
              aria-label="Follow on Instagram"
              className="group flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 shadow-sm"
              style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
            >
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@SuperKingsDen"
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribe on YouTube"
              aria-label="Subscribe on YouTube"
              className="group flex items-center justify-center w-6 h-6 rounded-md bg-[#FF0000] hover:bg-[#CC0000] transition-all duration-200 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/people/Super-Kings-Den/61561343112284/"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow on Facebook"
              aria-label="Follow on Facebook"
              className="group flex items-center justify-center w-6 h-6 rounded-md bg-[#1877F2] hover:bg-[#1464CF] transition-all duration-200 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

        </div>
      </div>

      {/* 2. Main Brand & Navigation Row */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link 
            href="/"
            className="flex items-center cursor-pointer group flex-shrink-0"
          >
            <div className="h-11 sm:h-13 px-3 py-1 bg-white rounded-xl shadow-md border border-amber-400/40 hover:border-csk-yellow transition-all duration-300 flex items-center justify-center group-hover:scale-105">
              <img 
                src="https://superkingsden.com/wp-content/uploads/2025/05/superkingsden-1.png" 
                alt="Super King's Den Official Logo" 
                className="h-9 sm:h-11 w-auto object-contain"
                onError={(e) => {
                  e.target.src = "/superkingsden-1.png";
                }}
              />
            </div>
          </Link>

          {/* Desktop Navigation Menu Placed Directly In Center */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-amber-700 dark:text-csk-yellow bg-amber-500/10 dark:bg-csk-yellow/10 font-extrabold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 to-csk-yellow rounded-full shadow-sm" />
                  )}
                </Link>
              );
            })}

            {/* News Navigation Item with Floating Franchise Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setNewsDropdownOpen(true)}
              onMouseLeave={() => setNewsDropdownOpen(false)}
            >
              <Link
                href="/news"
                onClick={() => setNewsDropdownOpen(false)}
                className={`relative py-2 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
                  isNewsActive
                    ? 'text-amber-700 dark:text-csk-yellow bg-amber-500/10 dark:bg-csk-yellow/10 font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span>News</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    newsDropdownOpen ? 'rotate-180 text-amber-600 dark:text-csk-yellow' : 'opacity-70'
                  }`}
                />
                {isNewsActive && (
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 to-csk-yellow rounded-full shadow-sm" />
                )}
              </Link>

              {/* Floating Dropdown Menu */}
              {newsDropdownOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-1 w-64 rounded-2xl bg-white dark:bg-[#0D1E47] border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Franchise Hubs
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-csk-yellow">
                      3 Leagues
                    </span>
                  </div>

                  <div className="space-y-1">
                    {newsItems.map((item) => {
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setNewsDropdownOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl transition group ${
                            isItemActive
                              ? 'bg-amber-500/10 dark:bg-csk-yellow/10 text-amber-800 dark:text-csk-yellow font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <div className="text-xs font-bold leading-tight group-hover:text-amber-600 dark:group-hover:text-csk-yellow transition">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeClass}`}
                          >
                            {item.badge}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* CSK 7 Trophies CTA Button */}
            <Link
              href="/trophies"
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-csk-yellow to-amber-500 text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-csk-glow hover:-translate-y-0.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>7 Trophies</span>
            </Link>

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-csk-yellow border border-slate-200 dark:border-white/10 transition"
              title="Search stories (Ctrl + K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-csk-yellow border border-slate-200 dark:border-white/10 transition flex items-center justify-center shadow-sm"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {mounted && darkMode ? (
                <Sun className="w-4 h-4 text-csk-yellow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-800" />
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0A1226] border-b border-slate-200 dark:border-csk-borderNavy px-4 pt-3 pb-6 space-y-2 shadow-xl max-h-[85vh] overflow-y-auto">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 border-b border-slate-200 dark:border-white/10">
            Navigation Menu
          </p>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'text-csk-darkNavy dark:text-csk-yellow bg-csk-yellow/20 dark:bg-csk-yellow/10 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}

            {/* Mobile News Accordion with CSK, JSK, TSK */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setMobileNewsOpen(!mobileNewsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition ${
                  isNewsActive
                    ? 'text-amber-800 dark:text-csk-yellow bg-amber-500/10 dark:bg-csk-yellow/10'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>News &amp; Franchise Hubs</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-csk-yellow text-csk-darkNavy">
                    CSK &bull; JSK &bull; TSK
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileNewsOpen ? 'rotate-180 text-amber-600 dark:text-csk-yellow' : 'opacity-60'
                  }`}
                />
              </button>

              {mobileNewsOpen && (
                <div className="pl-3 pr-1 pt-1 pb-1 space-y-1 mt-1 border-l-2 border-csk-yellow ml-3">
                  {newsItems.map((item) => {
                    const isItemActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setNewsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          isItemActive
                            ? 'text-amber-800 dark:text-csk-yellow bg-amber-500/15 dark:bg-csk-yellow/15 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.title}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${item.badgeClass}`}
                        >
                          {item.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
