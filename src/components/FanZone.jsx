'use client';

import React, { useState } from 'react';
import { Volume2, CheckCircle2, Vote, Send, Sparkles, Heart } from 'lucide-react';
import { INITIAL_POLL } from '../data/mockData';


export default function FanZone() {
  const [poll, setPoll] = useState(INITIAL_POLL);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [whistlePlaying, setWhistlePlaying] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleVote = (optionId) => {
    if (hasVoted) return;
    
    setPoll(prev => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
    setSelectedOption(optionId);
    setHasVoted(true);
  };

  const handleWhistleRoar = () => {
    setWhistlePlaying(true);
    setTimeout(() => {
      setWhistlePlaying(false);
    }, 2000);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
            Whistle Podu Fan Zone
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive fan polls, trivia challenges, and passionate community debates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Fan Poll (7 cols) */}
        <div className="lg:col-span-7 sports-card rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-csk-borderNavy">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-csk-yellow border border-amber-500/30 flex items-center">
              <Vote className="w-3.5 h-3.5 mr-1" /> Fan Pulse
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {poll.totalVotes.toLocaleString()} Votes Recorded
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display mb-4">
            {poll.question}
          </h3>

          <div className="space-y-3">
            {poll.options.map((option) => {
              const percentage = Math.round((option.votes / poll.totalVotes) * 100);
              const isChosen = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  disabled={hasVoted}
                  onClick={() => handleVote(option.id)}
                  className={`w-full text-left p-3.5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                    isChosen
                      ? 'border-amber-500 dark:border-csk-yellow bg-amber-50 dark:bg-csk-yellow/10'
                      : 'border-slate-200 dark:border-white/10 hover:border-csk-yellow bg-slate-50 dark:bg-slate-900/80'
                  }`}
                >
                  {/* Progress Fill when voted */}
                  {hasVoted && (
                    <div 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ease-out ${
                        isChosen ? 'bg-amber-400/20 dark:bg-csk-yellow/25' : 'bg-slate-200/50 dark:bg-white/5'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-bold ${
                      isChosen ? 'text-amber-700 dark:text-csk-yellow' : 'text-slate-800 dark:text-white'
                    }`}>
                      {option.text}
                    </span>
                    {hasVoted && (
                      <span className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-csk-yellow ml-2">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {hasVoted && (
            <p className="text-xs text-amber-700 dark:text-csk-yellow font-bold text-center mt-4 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Your vote has been added to the Super Kings tally!
            </p>
          )}
        </div>

        {/* Fan Soundboard & Newsletter (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Whistle Podu Soundboard Trigger */}
          <div className="sports-card rounded-2xl p-6 border border-amber-500/30 dark:border-csk-yellow/30 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-csk-navy/90 dark:to-amber-950/20 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-csk-yellow text-csk-darkNavy flex items-center justify-center shadow-csk-glow">
              <Volume2 className={`w-7 h-7 ${whistlePlaying ? 'animate-ping' : ''}`} />
            </div>
            
            <h4 className="text-base font-black text-slate-900 dark:text-white font-display mb-1">
              Sound the Chepauk Whistle
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs mb-4">
              Feel the chills of 50,000 yellow shirts roaring in unison at the AnbuDen!
            </p>

            <button
              onClick={handleWhistleRoar}
              className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                whistlePlaying 
                  ? 'bg-amber-400 text-csk-darkNavy scale-95 shadow-inner'
                  : 'bg-gradient-to-r from-csk-yellow to-amber-500 text-csk-darkNavy hover:opacity-95 shadow-csk-glow'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${whistlePlaying ? 'animate-pulse text-amber-900' : ''}`} />
              <span>{whistlePlaying ? 'ROARING AT CHEPAUK!' : 'Play Whistle Podu Fan Roar'}</span>
            </button>
          </div>

          {/* Newsletter Signup */}
          <div className="sports-card rounded-2xl p-6 border border-slate-200 dark:border-csk-borderNavy">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Join Whistle Podu Army
              </h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-3">
              Get exclusive match previews, team updates, and Chepauk ticket alert notifications directly in your inbox.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-csk-yellow/10 border border-amber-300 dark:border-csk-yellow/30 text-amber-800 dark:text-csk-yellow text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Welcome to the Den! You are now on the official dispatch list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  required
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-csk-yellow transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-black text-xs uppercase transition shadow-csk-glow flex items-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
