'use client';

import React from 'react';
import SmartImage from './SmartImage';
import Link from 'next/link';
import { Flame, Twitter, Facebook, Instagram, Youtube, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer({ onSelectFranchise: propOnSelect }) {
  const context = useApp ? useApp() : {};
  const onSelectFranchise = propOnSelect || context.setSelectedFranchise || (() => {});
  const siteSettings = context.siteSettings || {};
  const social = siteSettings.social || {};
  const footerInfo = siteSettings.footer || {};

  const twitterUrl = social.twitter || "https://x.com/superkingsden";
  const facebookUrl = social.facebook || "https://www.facebook.com/people/Super-Kings-Den/61561343112284/";
  const instagramUrl = social.instagram || "https://www.instagram.com/superkingsden/";
  const youtubeUrl = social.youtube || "https://www.youtube.com/@SuperKingsDen";
  const aboutText = footerInfo.aboutText || "The premier independent fan destination celebrating the roaring spirit of Chennai Super Kings (IPL), Joburg Super Kings (SA20), and Texas Super Kings (MLC). Where Super Kings fans unite under one golden flag.";

  return (
    <footer className="bg-[#050A18] border-t border-slate-800 dark:border-csk-borderNavy text-slate-400 text-xs mt-8 sm:mt-10">
      {/* Upper Main Footer Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-14 px-3 py-1 bg-white rounded-xl shadow-md border border-amber-400/40 flex items-center justify-center">
                <SmartImage
                  src="/superkingsden-1.png"
                  alt="Super King's Den Official Logo"
                  width={300}
                  height={300}
                  className="h-11 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              {aboutText}
            </p>

            <div className="flex items-center space-x-3 pt-2 text-slate-300">
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noreferrer" title="Follow on X" className="p-2 rounded-lg bg-slate-900 hover:bg-csk-yellow hover:text-csk-darkNavy transition">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noreferrer" title="Follow on Facebook" className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white transition">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" title="Follow on Instagram" className="p-2 rounded-lg bg-slate-900 hover:bg-pink-600 hover:text-white transition">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noreferrer" title="Follow on YouTube" className="p-2 rounded-lg bg-slate-900 hover:bg-red-600 hover:text-white transition">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Super Kings Franchises */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider font-display mb-4 flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1.5 text-csk-yellow" /> Franchises
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/csk-news" className="hover:text-csk-yellow transition text-left flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#FFCB05] inline-block mr-2 flex-shrink-0" /> Chennai Super Kings (IPL)
                </Link>
              </li>
              <li>
                <Link href="/jsk-news" className="hover:text-csk-yellow transition text-left flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 flex-shrink-0" /> Joburg Super Kings (SA20)
                </Link>
              </li>
              <li>
                <Link href="/tsk-news" className="hover:text-csk-yellow transition text-left flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block mr-2 flex-shrink-0" /> Texas Super Kings (MLC)
                </Link>
              </li>

              <li>
                <span className="text-slate-500">Major League Cricket (MLC)</span>
              </li>
              <li>
                <span className="text-slate-500">SA20 League Coverage</span>
              </li>
            </ul>
          </div>

          {/* Key Topics & Hubs */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider font-display mb-4">
              Den Specials &amp; Hubs
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/csk-team" className="hover:text-csk-yellow transition">CSK Team &amp; Squad (IPL)</Link></li>
              <li><Link href="/jsk-team" className="hover:text-csk-yellow transition">JSK Team &amp; Squad (SA20)</Link></li>
              <li><Link href="/tsk-team" className="hover:text-csk-yellow transition">TSK Team &amp; Squad (MLC)</Link></li>
              <li><Link href="/chennai-super-kings" className="hover:text-csk-yellow transition">CSK Hub &amp; Franchise Stats</Link></li>
              <li><Link href="/csk-trophies" className="hover:text-csk-yellow transition">All 7 Trophies Showcase</Link></li>
              <li><Link href="/csk-fixtures" className="hover:text-csk-yellow transition">CSK Fixtures &amp; Results</Link></li>
              <li><Link href="/jsk-fixtures" className="hover:text-csk-yellow transition">JSK Fixtures &amp; Results</Link></li>
              <li><Link href="/tsk-fixtures" className="hover:text-csk-yellow transition">TSK Fixtures &amp; Results</Link></li>
              <li><Link href="/search" className="hover:text-csk-yellow transition">Search Hub &amp; Archives</Link></li>
            </ul>
          </div>

          {/* Legal & Contacts */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider font-display mb-4">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/about-us" className="hover:text-csk-yellow transition">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-csk-yellow transition">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-csk-yellow transition">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-csk-yellow transition">Terms &amp; Conditions</Link></li>
              <li><Link href="/disclaimer" className="hover:text-csk-yellow transition">Disclaimer</Link></li>
              <li><Link href="/cookies-policy" className="hover:text-csk-yellow transition">Cookies Policy</Link></li>
              <li><Link href="/gdpr-compliance-statement" className="hover:text-csk-yellow transition">GDPR Compliance</Link></li>
              <li><Link href="/collaborate-with-us" className="hover:text-csk-yellow transition">Collaborate With Us</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-white/5 bg-[#030712] py-4 px-4 text-center">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-400 text-[11px]">
            &copy; 2026 <strong className="text-white">SuperKingsDen.com</strong>. All rights reserved. Fan media portal built with Whistle Podu passion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span>Crafted for the Yellow Army</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
            <span className="text-csk-yellow font-bold">#WhistlePodu</span>
            <span className="opacity-40">&bull;</span>
            <span>
              Crafted by <span className="text-white hover:text-csk-yellow transition font-extrabold cursor-pointer">Riofos</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
