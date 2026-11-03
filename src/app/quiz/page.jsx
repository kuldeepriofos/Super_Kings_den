import React from 'react';
import { Brain } from 'lucide-react';
import QuizCard from '../../components/QuizCard';
import FanZone from '../../components/FanZone';
import { buildPageMetadata } from '../../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('/quiz', {
    title: 'CSK Fan Quiz & Super Kings Trivia Challenge | Super Kings Den',
    description: 'Test your Chennai Super Kings knowledge! Answer trivia questions about MS Dhoni, Chepauk records, IPL finals, and historic Super Kings milestones.',
    canonical: 'https://superkingsden.com/quiz/',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  });
}

export default function QuizPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-3.5 h-3.5" />
          <span>Test Your Knowledge</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          Super Fan Trivia Quiz
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Put your CSK, JSK, and TSK knowledge to the test. Answer questions crafted for true members of the Yellow Army!
        </p>
      </div>

      <QuizCard />
      <FanZone />
    </div>
  );
}
