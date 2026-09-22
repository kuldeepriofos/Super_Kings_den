import React from 'react';
import { notFound } from 'next/navigation';
import ArticleDetailView from '../../../components/ArticleDetailView';
import { fetchPostBySlug, fetchLivePosts, fetchAllSlugs } from '../../../services/api';

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs();
  return slugs.map(slug => ({ slug }));
}

// Dynamic SEO Metadata generation for Google, Twitter & OpenGraph
export async function generateMetadata({ params }) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | Super Kings Den',
      description: 'The requested article could not be found on Super Kings Den.'
    };
  }

  const title = `${post.title} | Super Kings Den`;
  const description = post.excerpt || 'Latest Chennai Super Kings news, analysis, and match reports.';
  const url = `https://superkingsden.com/news/${post.slug}`;
  const rawImage = post.featuredImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';
  const imageUrl = rawImage.startsWith('http') ? rawImage : `https://superkingsden.com${rawImage}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://superkingsden.com/${post.slug}/`,
    },
    openGraph: {
      title,
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
      title,
      description,
      images: [imageUrl],
      creator: '@superkingsden',
    },
  };
}

export default async function ArticlePage({ params }) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts for sidebar and footer
  const allPosts = await fetchLivePosts();
  const relatedPosts = (allPosts || [])
    .filter(p => p.slug !== post.slug)
    .slice(0, 3);

  return <ArticleDetailView post={post} relatedPosts={relatedPosts} />;
}
