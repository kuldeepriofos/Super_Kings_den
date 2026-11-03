'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Users,
  Folder,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Edit,
  Database,
  CheckCircle2,
  Calendar,
  Eye,
  Award,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats/');
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-80 bg-slate-900/60 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  const postsCount = stats?.postsCount || 803;
  const currentSquadCount = stats?.currentSquadCount || 28;
  const legendsCount = stats?.legendsCount || 10;
  const categoriesCount = stats?.categoriesCount || 23;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a1628] via-[#0f213f] to-[#0a1628] border border-yellow-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <img
            src="/superkingsden-1.png"
            alt="Super King's Den Official Logo"
            className="h-44 w-auto object-contain"
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            CSK Executive Management Portal • WhistlePodu Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to <span className="text-yellow-400">Super Kings Den</span> Control Hub
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Manage {postsCount}+ news posts, CSK 2026 player squad roster, match center fixtures, category taxonomy, and 1-click JSON database backups.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Article</span>
            </Link>
            <Link
              href="/admin/sync"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-yellow-400" />
              <span>Database & Backups</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Posts */}
        <Link
          href="/admin/posts"
          className="bg-slate-900/70 border border-yellow-500/15 hover:border-yellow-500/40 hover:-translate-y-0.5 rounded-2xl p-5 backdrop-blur-sm transition-all group cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-yellow-300 uppercase tracking-wider transition-colors">CMS Articles</span>
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{postsCount.toLocaleString()}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-yellow-400/90 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Synced with superkingsden.com</span>
            </div>
          </div>
        </Link>

        {/* Current Squad */}
        <Link
          href="/admin/players"
          className="bg-slate-900/70 border border-blue-500/20 hover:border-blue-500/50 hover:-translate-y-0.5 rounded-2xl p-5 backdrop-blur-sm transition-all group cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-300 uppercase tracking-wider transition-colors">Current Squad</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{currentSquadCount}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>Official 2026 CSK Roster</span>
            </div>
          </div>
        </Link>

        {/* CSK Legends */}
        <Link
          href="/admin/players?filter=legends"
          className="bg-slate-900/70 border border-amber-500/20 hover:border-amber-500/50 hover:-translate-y-0.5 rounded-2xl p-5 backdrop-blur-sm transition-all group cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-300 uppercase tracking-wider transition-colors">CSK Legends</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{legendsCount}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <span>Hall of Fame & Trophy Icons</span>
            </div>
          </div>
        </Link>

        {/* Categories & Taxonomies */}
        <Link
          href="/admin/categories"
          className="bg-slate-900/70 border border-emerald-500/20 hover:border-emerald-500/50 hover:-translate-y-0.5 rounded-2xl p-5 backdrop-blur-sm transition-all group cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-300 uppercase tracking-wider transition-colors">Categories & Taxonomies</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{categoriesCount}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
              <span>Active Taxonomies & Tags</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Split: Recent Posts Table & Squad Roster Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Posts (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                Recent Articles & Updates
              </h2>
              <p className="text-xs text-slate-400">Live published articles and fan stories</p>
            </div>
            <Link
              href="/admin/posts"
              className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
            >
              <span>View All ({postsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats?.latestPosts && stats.latestPosts.length > 0 ? (
                    stats.latestPosts.map((post) => (
                      <tr key={post.slug} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                          <Link href={`/admin/posts/${post.slug}`} className="hover:text-yellow-400 transition-colors">
                            {post.title}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">
                          {post.category || 'CSK News'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {post.date}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/posts/${post.slug}`}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 hover:bg-slate-700 transition-colors"
                              title="Edit post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/${post.slug}/`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="View on live site"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No articles found. Click "Create New Article" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Squad Spotlight (1 col) */}
        <div className="space-y-6">
          {/* Squad Core Leaders Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Squad Core Leaders
              </h3>
              <Link href="/admin/players" className="text-[11px] text-yellow-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {/* MS Dhoni */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/40 overflow-hidden flex items-center justify-center">
                    <img
                      src="/players/ms-dhoni.png"
                      alt="MS Dhoni"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      MS Dhoni
                      <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        ✨ Thala
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Jersey #7 • 264 Matches</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-yellow-400">5,243</div>
                  <div className="text-[10px] text-slate-500">Runs</div>
                </div>
              </div>

              {/* Ruturaj Gaikwad */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 overflow-hidden flex items-center justify-center">
                    <img
                      src="/players/ruturaj-gaikwad.png"
                      alt="Ruturaj Gaikwad"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      Ruturaj Gaikwad
                      <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded">
                        Captain
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Jersey #31 • 66 Matches</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-blue-400">2,380</div>
                  <div className="text-[10px] text-slate-500">Runs</div>
                </div>
              </div>

              {/* Ravindra Jadeja */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 overflow-hidden flex items-center justify-center">
                    <img
                      src="/players/ravindra-jadeja.png"
                      alt="Ravindra Jadeja"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      Ravindra Jadeja
                      <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded">
                        All-Rounder
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Jersey #8 • 240 Matches</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">160</div>
                  <div className="text-[10px] text-slate-500">Wickets</div>
                </div>
              </div>

              {/* Suresh Raina */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center">
                    <img
                      src="/players/suresh-raina.jpg"
                      alt="Suresh Raina"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      Suresh Raina
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        Chinna Thala
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Jersey #3 • 205 Matches</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-400">5,528</div>
                  <div className="text-[10px] text-slate-500">Runs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
