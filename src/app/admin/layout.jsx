'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Folder,
  RotateCcw,
  ExternalLink,
  LogOut,
  Plus,
  Menu,
  X,
  Database,
  Shield,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  ChevronDown,
  ArrowRightLeft,
  UserCheck,
  Code,
  Globe,
  Mail,
  Share2,
  Trophy,
  TrendingUp,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: true, error: null });
  const [openMenus, setOpenMenus] = useState({ 'Articles': true });

  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';

  useEffect(() => {
    if (pathname.startsWith('/admin/posts') || pathname.startsWith('/admin/categories')) {
      setOpenMenus((prev) => ({ ...prev, 'Articles': true }));
    }
  }, [pathname]);

  const toggleSubmenu = (menuName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/me/');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
          if (data.db) {
            setDbStatus({
              connected: Boolean(data.db.connected),
              error: data.db.error || null,
            });
          }
          setCheckingAuth(false);
        } else {
          router.replace('/admin/login');
        }
      } catch (err) {
        router.replace('/admin/login');
      }
    }

    checkAuth();

    // Re-check live database health every 30 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/auth/me/');
        if (res.ok) {
          const data = await res.json();
          if (data.db) {
            setDbStatus({
              connected: Boolean(data.db.connected),
              error: data.db.error || null,
            });
          }
        }
      } catch (err) {
        setDbStatus({ connected: false, error: err.message || 'Connection lost' });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout/', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    // Hard refresh navigation ensures complete cleanup of React memory & tokens
    window.location.href = '/admin/login';
  };

  // If on login page, render clean container
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading barrier while verifying session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#070e1b] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Authenticating Super Kings Den Admin Session...</p>
      </div>
    );
  }

  const navSections = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      group: 'Articles & Content',
      items: [
        {
          name: 'Articles',
          href: '/admin/posts',
          icon: FileText,
          children: [
            { name: 'All Articles', href: '/admin/posts', icon: FileText, exact: true },
            { name: 'Categories', href: '/admin/categories', icon: Folder },
          ],
        },
        { name: 'Pages', href: '/admin/pages', icon: Globe },
        { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      group: 'Cricket & Players',
      items: [
        { name: 'Players', href: '/admin/players', icon: Users },
        { name: 'Match Center', href: '/admin/matches', icon: Calendar },
        { name: 'Points Table / Standings', href: '/admin/standings', icon: Trophy },
        { name: 'Franchise Stats & Records', href: '/admin/stats', icon: TrendingUp },
      ],
    },
    {
      group: 'CRM & Fan Desk',
      items: [
        { name: 'Leads & Inquiries', href: '/admin/leads', icon: Mail },
        { name: 'Contact & Social Links', href: '/admin/settings', icon: Share2 },
      ],
    },
    {
      group: 'Access & Control',
      items: [
        { name: 'User Control', href: '/admin/users', icon: UserCheck },
      ],
    },
    {
      group: 'System & Routing',
      items: [
        { name: 'Head & Body Code', href: '/admin/code-snippets', icon: Code },
        { name: '301/302 Redirects', href: '/admin/redirects', icon: ArrowRightLeft },
        { name: 'Database & Backups', href: '/admin/sync', icon: Database },
      ],
    },
  ];

  const isItemActive = (item) => {
    if (!item || !item.href) return false;
    if (item.exact) {
      return pathname === item.href || pathname === `${item.href}/`;
    }
    if (item.href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(item.href);
  };

  const isParentActive = (item) => {
    if (isItemActive(item)) return true;
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-yellow-400 selection:text-slate-950">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 px-1.5 py-0.5 bg-white rounded-lg border border-amber-400/40 flex items-center justify-center shadow-sm">
            <img
              src="/superkingsden-1.png"
              alt="Super King's Den Official Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
          <span className="font-black text-sm tracking-wide text-white">
            SUPER KINGS DEN
          </span>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Logout</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-gradient-to-b from-slate-950 via-[#0a1222] to-slate-950 border-r border-yellow-500/10 flex flex-col transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-11 px-2.5 py-1 bg-white rounded-xl shadow-md border border-amber-400/40 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src="/superkingsden-1.png"
                alt="Super King's Den Official Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm tracking-wider text-white truncate">
                SUPER KINGS DEN
              </div>
              <div className="text-[11px] text-yellow-400 font-semibold tracking-wide truncate">
                Official Fan Community
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items Organized by Logical Groups */}
        <nav className="flex-1 p-3.5 space-y-3 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1">
              <div className="px-3 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {section.group}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isOpen = openMenus[item.name] ?? true;
                  const parentActive = isParentActive(item);

                  if (hasChildren) {
                    return (
                      <div key={item.name} className="space-y-1">
                        <div
                          className={`flex items-center justify-between rounded-xl transition-all ${
                            parentActive
                              ? 'bg-slate-800/80 text-yellow-400 font-bold border border-yellow-500/20'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <Link
                            href={item.href}
                            onClick={() => {
                              setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
                              setMobileMenuOpen(false);
                            }}
                            className="flex-1 flex items-center gap-3 px-3 py-2 text-xs font-semibold"
                          >
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${
                                parentActive ? 'text-yellow-400' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => toggleSubmenu(item.name, e)}
                            className="p-2 text-slate-400 hover:text-yellow-400 cursor-pointer rounded-r-xl transition-colors"
                            title={isOpen ? 'Collapse' : 'Expand'}
                            aria-label={`Toggle ${item.name}`}
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-yellow-400' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {isOpen && (
                          <div className="ml-4 pl-3 border-l-2 border-yellow-500/30 space-y-1 py-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = isItemActive(child);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                    childActive
                                      ? 'bg-yellow-400 text-slate-950 font-bold shadow-md shadow-yellow-500/20'
                                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                                  }`}
                                >
                                  <ChildIcon
                                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                                      childActive ? 'text-slate-950' : 'text-slate-400'
                                    }`}
                                  />
                                  <span className="truncate">{child.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const active = isItemActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-slate-950' : 'text-yellow-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="pt-2 space-y-1 border-t border-slate-800/60">
            <div className="px-3 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Quick Actions
            </div>
            <div className="space-y-1.5 pt-0.5">
              <Link
                href="/admin/posts/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span>Write New Post</span>
              </Link>
              <Link
                href="/admin/players/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span>Add New Player</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Bottom Sidebar Info & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2">
          {/* Database Live Status Indicator */}
          <Link
            href="/admin/sync"
            className={`block px-3 py-2 rounded-xl border transition-all ${
              dbStatus.connected
                ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
                : 'bg-red-950/50 border-red-500/40 hover:border-red-500/60'
            }`}
            title={
              dbStatus.connected
                ? 'MongoDB is connected and healthy'
                : `Database Error: ${dbStatus.error || 'Connection failed'}`
            }
          >
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <Database
                  className={`w-3.5 h-3.5 ${dbStatus.connected ? 'text-emerald-400' : 'text-red-400'}`}
                />
                <span className={dbStatus.connected ? 'text-slate-300' : 'text-red-200 font-bold'}>
                  MongoDB
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    dbStatus.connected
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-red-400 ring-2 ring-red-400/50 animate-ping'
                  }`}
                />
                <span className={dbStatus.connected ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                  {dbStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            {!dbStatus.connected && (
              <div className="mt-1.5 pt-1.5 border-t border-red-500/30 text-[10px] text-red-300 leading-tight flex items-start gap-1">
                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="truncate">{dbStatus.error || 'Database connection error'}</span>
              </div>
            )}
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-yellow-500" />
              View Live Website
            </span>
            <span className="text-[10px] text-slate-500 font-mono">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer shadow-sm group active:scale-98"
          >
            <LogOut className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out / Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Header Bar */}
        <header className="hidden md:flex h-16 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">WhistlePodu Management Portal</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-yellow-400">
              {pathname === '/admin' || pathname === '/admin/'
                ? 'Overview'
                : pathname.startsWith('/admin/categories')
                ? 'Articles • Categories'
                : pathname.startsWith('/admin/posts/new')
                ? 'Articles • Write New Article'
                : pathname.startsWith('/admin/posts')
                ? 'Articles • All Articles'
                : pathname.startsWith('/admin/players/new')
                ? 'Players • Add New Player'
                : pathname.startsWith('/admin/players')
                ? 'Players • Roster & Legends'
                : pathname.startsWith('/admin/matches')
                ? 'Cricket • Match Center'
                : pathname.startsWith('/admin/media')
                ? 'Editorial • Media Library'
                : pathname.startsWith('/admin/users')
                ? 'Access & Control • User Management'
                : pathname.startsWith('/admin/redirects')
                ? 'SEO • 301/302 Redirects'
                : pathname.startsWith('/admin/pages')
                ? 'Pages • Routes & Content'
                : pathname.startsWith('/admin/code-snippets')
                ? 'System • Head & Body Code'
                : pathname.startsWith('/admin/sync')
                ? 'System • Database & Backups'
                : pathname.replace('/admin/', '').replace(/\/$/, '').replace('/', ' • ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold shadow-md shadow-yellow-500/10 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Article</span>
            </Link>

            {adminUser && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold flex items-center justify-center text-xs">
                  {adminUser.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="font-bold text-white leading-tight capitalize">{adminUser.username}</div>
                  <div className="text-[10px] text-yellow-400 font-medium">{adminUser.role || 'Super Admin'}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Sign out of Admin Dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm group active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
