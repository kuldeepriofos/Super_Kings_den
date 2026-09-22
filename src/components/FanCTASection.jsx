'use client';

import React, { useState } from 'react';
import { Mail, Bell, CheckCircle2, ShieldCheck, Send, Flame, Sparkles, MessageSquare, Zap } from 'lucide-react';

export default function FanCTASection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="mb-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-csk-navy via-slate-900 to-[#070D1E] border-2 border-csk-yellow/30 p-8 sm:p-12 shadow-2xl">
        
        {/* Subtle decorative gold lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-csk-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subhead & Value Pillars (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-csk-yellow/30 text-csk-yellow text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Official Fan Pass &bull; Whistle Podu Club</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight leading-tight">
              JOIN THE YELLOW ARMY VIP PASS. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-csk-yellow to-amber-300">
                NEVER MISS A SUPER KINGS MOMENT.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Get official CSK, JSK &amp; TSK breaking news, match-day playing XI leaks, Chepauk ticket alerts, and tactical analysis delivered straight to you.
            </p>

            {/* 3 VIP Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start space-x-2.5">
                <Zap className="w-4 h-4 text-csk-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Alerts</h4>
                  <p className="text-[11px] text-slate-400">Match updates &amp; live toss news</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start space-x-2.5">
                <Bell className="w-4 h-4 text-csk-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Ticket Radar</h4>
                  <p className="text-[11px] text-slate-400">Chepauk booking alerts</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start space-x-2.5">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-csk-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Exclusive 4K</h4>
                  <p className="text-[11px] text-slate-400">Wallpapers &amp; stickers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Subscription Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-csk-yellow/40 shadow-xl">
              
              {!subscribed ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-csk-yellow block mb-1">
                      Free Fan Subscription
                    </span>
                    <h3 className="text-lg font-black text-white font-display">
                      Get Yellow Army Dispatches
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your email to receive weekly match recaps &amp; exclusive news.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-csk-yellow focus:ring-1 focus:ring-csk-yellow text-sm text-white placeholder-slate-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-csk-yellow to-amber-500 hover:opacity-95 text-csk-darkNavy font-black text-sm uppercase tracking-wider transition shadow-csk-glow flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Get Yellow Army Alerts</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                    <span className="flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> 100% Free &bull; No Spam
                    </span>
                    <span>250K+ Yellow Army Subscribers</span>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white font-display">
                    Welcome to the AnbuDen!
                  </h3>

                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    You're officially on the VIP Alert List. Check your inbox for your first Super Kings dispatch and #WhistlePodu wallpapers!
                  </p>
                  <button
                    onClick={() => { setSubscribed(false); setEmail(''); }}
                    className="mt-2 text-xs font-bold text-csk-yellow hover:underline"
                  >
                    Subscribe another email
                  </button>
                </div>
              )}

              {/* Direct Community Action Links */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold">Instant Channels:</span>
                <div className="flex items-center space-x-2">
                  <a
                    href="https://x.com/superkingsden"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-black hover:bg-slate-900 text-white font-bold text-[11px] border border-white/10 transition"
                  >
                    𝕏 Follow
                  </a>
                  <a
                    href="https://www.facebook.com/people/Super-Kings-Den/61561343112284/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition"
                  >
                    Facebook
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
