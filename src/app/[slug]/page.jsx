import React from 'react';
import { notFound } from 'next/navigation';
import ArticleDetailView from '../../components/ArticleDetailView';
import StaticPageView from '../../components/StaticPageView';
import { fetchPostBySlug, fetchLivePosts, fetchPageBySlug, fetchAllSlugs, fetchAllPageSlugs } from '../../services/api';

const RESERVED_ROUTES = new Set([
  'news',
  'rivalries',
  'all-time-xi',
  'trophies',
  'squad',
  'quiz',
  'standings',
  'api',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'seasons',
  'players',
  'stats',
  'category',
  'web-stories',
  'csk-news',
  'jsk-news',
  'tsk-news',
]);

export async function generateStaticParams() {
  const [postSlugs, pageSlugs] = await Promise.all([
    fetchAllSlugs(),
    fetchAllPageSlugs()
  ]);
  const all = Array.from(new Set([...postSlugs, ...pageSlugs])).filter(s => !RESERVED_ROUTES.has(s));
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
    const rawPageExcerpt = (page.excerpt || '').replace(/<[^>]+>/g, '').trim();
    const description = rawPageExcerpt.length > 160
      ? rawPageExcerpt.slice(0, 157) + '...'
      : (rawPageExcerpt || `${page.title} - Official Super Kings Den policy and fan documentation.`);
    const url = `https://superkingsden.com/${page.slug}/`;

    return {
      title: page.title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `${page.title} | Super Kings Den`,
        description,
        url,
        siteName: 'Super Kings Den',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${page.title} | Super Kings Den`,
        description,
        creator: '@superkingsden',
      },
    };
  }

  // 2. Check if it's a Post / Article
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found on Super Kings Den.'
    };
  }

  const rawExcerpt = (post.excerpt || post.description || '').replace(/<[^>]+>/g, '').trim();
  const description = rawExcerpt.length > 160
    ? rawExcerpt.slice(0, 157) + '...'
    : (rawExcerpt || 'Latest Chennai Super Kings news, tactical analysis, score updates, and match reports.');
  const url = `https://superkingsden.com/${post.slug}/`;
  const rawImage = post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
  const imageUrl = rawImage.startsWith('http') ? rawImage : `https://superkingsden.com${rawImage}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | Super Kings Den`,
      description,
      url,
      siteName: 'Super Kings Den',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Super Kings Den`,
      description,
      images: [imageUrl],
      creator: '@superkingsden',
    },
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

  // 2. Check if it matches a Post / Article
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const allPosts = await fetchLivePosts();
  const relatedPosts = (allPosts || [])
    .filter(p => p.slug !== post.slug)
    .slice(0, 3);

  return <ArticleDetailView post={post} relatedPosts={relatedPosts} />;
}
