import React from 'react';
import Link from 'next/link';
import { Mail, ChevronRight, MessageSquare, Shield, Sparkles } from 'lucide-react';
import ContactForm from '../../components/ContactForm';
import connectToDatabase from '../../lib/mongodb';
import SiteSettings from '../../models/SiteSettings';
import defaultSettings from '../../data/defaultSiteSettings.json';

export const dynamic = 'force-dynamic';

async function getLiveSettings() {
  try {
    await connectToDatabase();
    const doc = await SiteSettings.findOne({ key: 'global' }).lean();
    if (doc) return JSON.parse(JSON.stringify(doc));
  } catch (e) {
    // fallback
  }
  return defaultSettings;
}

export const metadata = {
  title: 'Contact Us — Editorial Desk & Fan Inquiries | Super Kings Den',
  description: 'Get in touch with Super Kings Den. Submit editorial scoops, sponsorship proposals, advertising inquiries, or reach our fan desk covering CSK, JSK, and TSK.',
  alternates: {
    canonical: 'https://superkingsden.com/contact-us/',
  },
  openGraph: {
    title: 'Contact Us — Super Kings Den',
    description: 'Reach our editorial desk for breaking Super Kings cricket news, partnerships, corrections, and fan inquiries.',
    url: 'https://superkingsden.com/contact-us/',
    siteName: 'Super Kings Den',
  },
};

export default async function ContactUsPage() {
  const settings = await getLiveSettings();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
        <Link href="/" className="hover:text-csk-yellow transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-bold">Contact Us</span>
      </nav>

      {/* ─── Header Hero Banner ─── */}
      <div className="csk-hero-banner mb-8">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Super Kings Den Editorial Desk &bull; Worldwide Yellow Army</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          Get in Touch with Our Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Have an editorial tip, news scoop, sponsorship inquiry, or question about Chennai Super Kings, Joburg Super Kings, or Texas Super Kings? Fill out the form below or write directly to our desk.
        </p>
      </div>

      {/* ─── Premium Contact Form & Office Cards ─── */}
      <ContactForm initialSettings={settings} />
    </div>
  );
}
