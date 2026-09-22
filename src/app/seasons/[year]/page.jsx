import React from 'react';
import { notFound } from 'next/navigation';
import SingleSeasonView from '../../../components/SingleSeasonView';
import { SEASON_MATCHES_DATA } from '../../../data/seasonMatchesData';

const ALL_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008];

export function generateStaticParams() {
  return ALL_YEARS.map((year) => ({
    year: String(year),
  }));
}

export function generateMetadata({ params }) {
  const { year } = params;
  const season = SEASON_MATCHES_DATA[year];

  if (!season) {
    return {
      title: 'Season Not Found',
    };
  }

  const champTag = season.isChampion ? 'Champions' : season.cskPosition;

  return {
    title: `CSK IPL ${year} (${champTag}) — Match Results, Scorecards & Stats`,
    description: `Complete ${year} IPL season match-by-match results, scorecards, top batsmen, bowlers, and tournament archive for Chennai Super Kings.`,
    alternates: {
      canonical: `https://superkingsden.com/seasons/${year}`,
    },
    openGraph: {
      title: `CSK IPL ${year} Season Results & Archive | Super Kings Den`,
      description: `Explore Chennai Super Kings journey in IPL ${year} with full match details and player milestones.`,
      url: `https://superkingsden.com/seasons/${year}`,
      type: 'website',
    },
  };
}

export default function SingleSeasonPage({ params }) {
  const { year } = params;
  const seasonData = SEASON_MATCHES_DATA[year];

  if (!seasonData) {
    notFound();
  }

  return (
    <SingleSeasonView 
      seasonData={seasonData} 
      allYears={ALL_YEARS} 
    />
  );
}
