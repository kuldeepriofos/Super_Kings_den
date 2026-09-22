import React from 'react';
import { notFound } from 'next/navigation';
import PlayerProfileView from '../../../components/PlayerProfileView';
import { fetchPlayerBySlug, fetchAllPlayerSlugs, fetchLivePlayerProfiles } from '../../../services/api';

export async function generateStaticParams() {
  const slugs = await fetchAllPlayerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const player = await fetchPlayerBySlug(params.slug);

  if (!player) {
    return {
      title: 'Player Not Found | Super Kings Den',
      description: 'The requested Chennai Super Kings player profile could not be found.',
    };
  }

  const title = `${player.name} Stats, Records & Profile | CSK`;
  const statSnippet = player.runs 
    ? `${player.runs} runs, HS ${player.highestScore || 'N/A'}` 
    : `${player.wickets || 0} wickets, BBI ${player.bestBowling || 'N/A'}`;
  const description = `Explore ${player.name} (${player.role}, #${player.jersey}) career statistics: ${statSnippet}, strike rate ${player.strikeRate || player.economy || 'N/A'}, honors, and championship records on Super Kings Den.`;
  const canonicalUrl = `https://superkingsden.com/players/${player.slug}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Super Kings Den',
      images: [
        {
          url: player.avatar,
          width: 600,
          height: 600,
          alt: `${player.name} - Chennai Super Kings`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [player.avatar],
    },
  };
}

export default async function PlayerDetailPage({ params }) {
  const player = await fetchPlayerBySlug(params.slug);

  if (!player) {
    notFound();
  }

  const allPlayers = await fetchLivePlayerProfiles();
  const teammates = allPlayers.filter((p) => p.slug !== player.slug);

  return <PlayerProfileView player={player} teammates={teammates} />;
}
