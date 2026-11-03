import React from 'react';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import ArticleDetailView from '../../components/ArticleDetailView';
import StaticPageView from '../../components/StaticPageView';
import PlayerProfileView from '../../components/PlayerProfileView';
import { findMatchingRedirect } from '../../lib/redirects';
import { getStaticPageSeo } from '../../lib/pagesManager';
import { 
  fetchPostBySlug, 
  fetchLivePosts, 
  fetchPageBySlug, 
  fetchAllSlugs, 
  fetchAllPageSlugs,
  fetchPlayerBySlug,
  fetchAllPlayerSlugs,
  fetchPlayerArticle,
  fetchLivePlayerProfiles
} from '../../services/api';

const RESERVED_ROUTES = new Set([
  'news',
  'all-time-xi',
  'csk-trophies',
  'squad',
  'quiz',
  'standings',
  'api',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'players',
  'player',
  'category',
  'web-stories',
  'csk-news',
  'jsk-news',
  'tsk-news',
  'csk-team',
  'csk',
  'jsk',
  'tsk',
  'trophy',
  'search',
]);

export async function generateStaticParams() {
  const [postSlugs, pageSlugs, playerSlugs] = await Promise.all([
    fetchAllSlugs(),
    fetchAllPageSlugs(),
    fetchAllPlayerSlugs(),
  ]);
  const all = Array.from(new Set([...postSlugs, ...pageSlugs, ...playerSlugs])).filter(s => !RESERVED_ROUTES.has(s));
  return all.map(slug => ({ slug }));
}

// Dynamic SEO Metadata for direct URLs matching the exact sitemap URLs
export async function generateMetadata({ params }) {
  if (RESERVED_ROUTES.has(params.slug)) {
    return {};
  }

  // 1. Check if it's a Static Page (About Us, Privacy Policy, Terms, etc.)
  const page = await fetchPageBySlug(params.slug);
  if (page) {
    const customSeo = getStaticPageSeo(params.slug) || {};
    const rawPageExcerpt = (page.excerpt || '').replace(/<[^>]+>/g, '').trim();
    const fallbackDescription = rawPageExcerpt.length > 160
      ? rawPageExcerpt.slice(0, 157) + '...'
      : (rawPageExcerpt || `${page.title} - Official Super Kings Den policy and fan documentation.`);

    const title = customSeo.seoTitle || page.title;
    const description = customSeo.metaDescription || fallbackDescription;
    const url = customSeo.canonicalUrl || `https://superkingsden.com/${page.slug}/`;
    const robots = customSeo.robots || 'index, follow';
    const ogTitle = customSeo.ogTitle || `${title} | Super Kings Den`;
    const ogDescription = customSeo.ogDescription || description;
    const ogImage = customSeo.ogImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
    const finalTitle = title.includes('Super Kings Den') ? title : `${title} | Super Kings Den`;

    return {
      title: {
        absolute: finalTitle,
      },
      description,
      alternates: {
        canonical: url,
      },
      robots,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url,
        siteName: 'Super Kings Den',
        locale: 'en_US',
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `https://superkingsden.com${ogImage}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        creator: '@superkingsden',
        images: [ogImage.startsWith('http') ? ogImage : `https://superkingsden.com${ogImage}`],
      },
    };
  }

  // 2. Check if it matches a Player Profile (e.g. /ms-dhoni/, /ravindra-jadeja/)
  const player = await fetchPlayerBySlug(params.slug);
  if (player) {
    const statSnippet = player.runs 
      ? `${player.runs} runs, HS ${player.highestScore || 'N/A'}` 
      : `${player.wickets || 0} wickets, BBI ${player.bestBowling || 'N/A'}`;
    
    const title = `${player.name} Profile - Career Stats, Records & Biography`;
    const description = `Explore ${player.name} (${player.role}, #${player.jersey}) official Chennai Super Kings profile: ${statSnippet}, career batting & bowling stats, championship honors, and biography on Super Kings Den.`;

    const canonicalUrl = `https://superkingsden.com/${player.slug}/`;
    const image = player.avatar || '/players/ms-dhoni.png';
    const imageUrl = image.startsWith('http') ? image : `https://superkingsden.com${image}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${player.name} Profile - Stats & Records | Chennai Super Kings`,
        description,
        url: canonicalUrl,
        siteName: 'Super Kings Den',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${player.name} - Chennai Super Kings`,
          },
        ],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${player.name} Profile - Stats & Records | CSK`,
        description,
        images: [imageUrl],
        creator: '@superkingsden',
      },
    };
  }

  // 3. Check if it's a Post / Article
  const post = await fetchPostBySlug(params.slug);
  if (post) {
    const rawExcerpt = (post.excerpt || post.description || '').replace(/<[^>]+>/g, '').trim();
    const fallbackDescription = rawExcerpt.length > 160
      ? rawExcerpt.slice(0, 157) + '...'
      : (rawExcerpt || 'Latest Chennai Super Kings news, tactical analysis, score updates, and match reports.');

    const title = post.seoTitle || post.title;
    const description = post.metaDescription || fallbackDescription;
    const url = post.canonicalUrl || `https://superkingsden.com/${post.slug}/`;
    const robots = post.robots || 'index, follow';
    const rawImage = post.ogImage || post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
    const imageUrl = rawImage.startsWith('http') ? rawImage : `https://superkingsden.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

    const ogTitle = post.ogTitle || `${title} | Super Kings Den`;
    const ogDescription = post.ogDescription || description;
    const finalTitle = title.includes('Super Kings Den') ? title : `${title} | Super Kings Den`;

    return {
      title: {
        absolute: finalTitle,
      },
      description,
      alternates: {
        canonical: url,
      },
      robots,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url,
        siteName: 'Super Kings Den',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.publishedAt || post.date,
        modifiedTime: post.modified || post.date,
        authors: [post.author || 'Super Kings Den Team'],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: [imageUrl],
        creator: '@superkingsden',
      },
    };
  }

  return {
    title: 'Not Found',
    description: 'The requested page could not be found on Super Kings Den.'
  };
}

export default async function DirectRoutePage({ params }) {
  if (RESERVED_ROUTES.has(params.slug)) {
    notFound();
  }

  // 1. Check if it matches a Static WordPress Page
  const page = await fetchPageBySlug(params.slug);
  if (page) {
    return <StaticPageView page={page} />;
  }

  // 2. Check if it matches a Player Profile (Clean root slug: e.g. /ms-dhoni/)
  const player = await fetchPlayerBySlug(params.slug);
  if (player) {
    // If user visited an alternate variant (e.g. ms-dhoni-1 or ms-dhoni1), redirect to clean root slug
    if (params.slug !== player.slug) {
      redirect(`/${player.slug}/`);
    }

    const [article, allPlayers] = await Promise.all([
      fetchPlayerArticle(player),
      fetchLivePlayerProfiles(),
    ]);
    const teammates = (allPlayers || []).filter(p => p.slug !== player.slug);
    return <PlayerProfileView player={player} article={article} teammates={teammates} />;
  }

  // 3. Check if it matches a Post / Article
  const post = await fetchPostBySlug(params.slug);
  if (post) {
    // Fetch related posts
    const allPosts = await fetchLivePosts();
    const relatedPosts = (allPosts || [])
      .filter(p => p.slug !== post.slug)
      .slice(0, 3);

    return <ArticleDetailView post={post} relatedPosts={relatedPosts} />;
  }

  // 4. Check dynamic 301/302 Redirection Rules in MongoDB before 404
  try {
    const redirectRule = await findMatchingRedirect(`/${params.slug}/`);
    if (redirectRule && redirectRule.destination) {
      if (redirectRule.statusCode === 301) {
        permanentRedirect(redirectRule.destination);
      } else {
        redirect(redirectRule.destination);
      }
    }
  } catch (redirectErr) {
    // If it's a Next.js redirect throw, let it bubble up
    if (redirectErr?.message === 'NEXT_REDIRECT') {
      throw redirectErr;
    }
  }

  notFound();
}
