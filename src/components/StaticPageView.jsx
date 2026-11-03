'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  FileText, 
  Mail, 
  Users, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Send, 
  Handshake, 
  Lock, 
  Eye,
  Info
} from 'lucide-react';

const LEGAL_NAV_LINKS = [
  { href: '/about-us', label: 'About Us', icon: Info },
  { href: '/contact-us', label: 'Contact Us', icon: Mail },
  { href: '/team', label: 'Our Team', icon: Users },
  { href: '/collaborate-with-us', label: 'Collaborate', icon: Handshake },
  { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
  { href: '/terms-and-conditions', label: 'Terms & Conditions', icon: FileText },
  { href: '/disclaimer', label: 'Disclaimer', icon: AlertCircle },
  { href: '/copyright-notice', label: 'Copyright Notice', icon: Lock },
  { href: '/cookies-policy', label: 'Cookies Policy', icon: Eye },
  { href: '/gdpr-compliance-statement', label: 'GDPR Compliance', icon: Shield },
];

export default function StaticPageView({ page }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  if (!page) return null;

  const isContactPage = page.slug === 'contact-us';
  const isCollaboratePage = page.slug === 'collaborate-with-us';
  const isAboutPage = page.slug === 'about-us';

  // Schema.org Structured Data for WebPages & Information Pages
  const schemaType = page.schemaType || (isAboutPage ? 'AboutPage' : isContactPage ? 'ContactPage' : 'WebPage');
  const pageUrl = `https://superkingsden.com/${page.slug}/`;
  const cleanExcerpt = (page.excerpt || '').replace(/<[^>]+>/g, '').trim();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    'name': page.seoTitle || page.title,
    'description': page.metaDescription || cleanExcerpt || `${page.title} - Super Kings Den Official Portal`,
    'url': pageUrl,
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Super Kings Den',
      'url': 'https://superkingsden.com',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Super Kings Den',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://superkingsden.com/superkingsden-1.png',
      },
    },
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://superkingsden.com',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': page.title,
          'item': pageUrl,
        },
      ],
    },
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {page.customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: page.customSchema }}
        />
      )}
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400 dark:text-slate-500">Information</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold truncate">
          {page.title}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-2 text-amber-400 mb-2 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4 text-csk-yellow" />
          <span>Official Information & Legal Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold text-white font-heading tracking-tight mb-2">
          {page.title}
        </h1>
        {page.modified && (
          <p className="text-xs text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-csk-yellow" />
            <span>Last Updated: {new Date(page.modified).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8">
          <div className="sports-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 mb-8 bg-white dark:bg-[#0D1E47]">
            {/* Rendered WP HTML Content */}
            {page.content ? (
              <div 
                className="sports-article-content text-slate-700 dark:text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="text-slate-500">No content available.</p>
            )}

            {/* Interactive Contact Form (Only on Contact Us page) */}
            {isContactPage && (
              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-heading mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-500 dark:text-csk-yellow" />
                  <span>Send Us a Direct Message</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Have a breaking CSK lead, scoop, correction, or question? Fill out the form below.
                </p>

                {formSubmitted ? (
                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Thank you for reaching out!</h3>
                      <p className="text-xs mt-1">Our editorial desk has received your message and will review it promptly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                          placeholder="Ruturaj Fan"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                          placeholder="fan@superkingsden.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                      <input 
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                        placeholder="Editorial tip / Fan inquiry"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message *</label>
                      <textarea 
                        rows={4} 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                        placeholder="Write your message here..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition flex items-center gap-2 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Collaboration CTA (Only on Collaborate page) */}
            {isCollaboratePage && (
              <div className="mt-8 p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-bold text-amber-800 dark:text-csk-yellow text-sm mb-1">
                  Ready to partner with Super Kings Den?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                  For brand partnerships, media appearances, or sponsored fan campaigns, write directly to our partnerships team.
                </p>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition"
                >
                  <span>Contact Partnerships Team</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Navigation & Links (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sports-card rounded-2xl p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1E47]">
            <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="w-2 h-5 bg-csk-yellow rounded-full flex-shrink-0"></div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white font-heading">
                Company &amp; Legal Documentation
              </h2>
            </div>
            <div className="space-y-1">
              {LEGAL_NAV_LINKS.map((item) => {
                const IconComponent = item.icon;
                const isActive = page.slug === item.href.replace('/', '');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-800 dark:text-csk-yellow font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-3.5 h-3.5 text-amber-600 dark:text-csk-yellow" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CSK Community Box */}
          <div className="sports-card rounded-2xl p-6 border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-csk-yellow block mb-1">
              #WhistlePodu Community
            </span>
            <h2 className="font-heading font-semibold text-slate-900 dark:text-white text-base mb-2">
              Super Kings Den
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Where Super Kings Fans Unite across CSK (IPL), JSK (SA20), and TSK (MLC). Dedicated to honest cricket journalism, stats archives, and fan culture.
            </p>
            <div className="flex items-center gap-3 text-xs font-bold text-amber-700 dark:text-csk-yellow">
              <span>5x IPL Champions</span>
              <span>&bull;</span>
              <span>2x CLT20 Titles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
