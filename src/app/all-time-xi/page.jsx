import React from 'react';
import { Star } from 'lucide-react';
import AllTimeXI from '../../components/AllTimeXI';

export const metadata = {
  title: 'CSK All-Time Greatest Playing XI Fan Voter',
  description: 'Pick your ultimate Chennai Super Kings dream team! Vote for MS Dhoni, Suresh Raina, Ravindra Jadeja, Dwayne Bravo, and legendary CSK match-winners.',
  alternates: {
    canonical: 'https://superkingsden.com/all-time-xi',
  },
  openGraph: {
    title: 'CSK All-Time Greatest XI Squad Builder | Super Kings Den',
    description: 'Construct your dream Yellow Army lineup across 18 historic IPL seasons.',
    url: 'https://superkingsden.com/all-time-xi',
    siteName: 'Super Kings Den',
  },
};

export default function AllTimeXIPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-1.5 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 fill-current text-csk-yellow" />
          <span>Fan Dream Team</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          All-Time Greatest CSK Playing XI
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Step into the selector's shoes. Choose your starting XI from the most decorated champions in Chennai Super Kings history.
        </p>
      </div>

      <AllTimeXI />
    </div>
  );
}
