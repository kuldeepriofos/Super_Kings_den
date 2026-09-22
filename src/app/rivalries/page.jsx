import React from 'react';
import { Swords } from 'lucide-react';
import RivalriesHub from '../../components/RivalriesHub';

export const metadata = {
  title: 'CSK Historic Rivalries & IPL Head-to-Head Records',
  description: 'Explore historic CSK rivalries vs Mumbai Indians (El Clásico), RCB (Southern Derby), KKR & DC. Comprehensive head-to-head records and iconic match moments.',
  alternates: {
    canonical: 'https://superkingsden.com/rivalries',
  },
  openGraph: {
    title: 'CSK Historic Rivalries & Head-to-Head Records | Super Kings Den',
    description: 'Detailed head-to-head records, win percentages, and unforgettable moments from CSK vs MI, RCB, KKR, and DC.',
    url: 'https://superkingsden.com/rivalries',
    siteName: 'Super Kings Den',
  },
};

export default function RivalriesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-red-400 mb-2 text-xs font-bold uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" />
          <span>Clashes of the Titans</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold text-white font-heading tracking-tight mb-2">
          High-Voltage Rivalries Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          From the legendary IPL El Clásico against Mumbai Indians to the fiery Southern Derby against Royal Challengers Bengaluru — relive the battlegrounds that defined T20 cricket.
        </p>
      </div>

      <RivalriesHub />
    </div>
  );
}
