import React from 'react';
import CSKNewsView from '../../components/CSKNewsView';
import { fetchLivePosts } from '../../services/api';
import { buildPageMetadata } from '../../lib/pagesManager';

export async function generateMetadata() {
  return buildPageMetadata('/csk-news', {
    title: 'CSK News & Official Chennai Super Kings Updates | Super Kings Den',
    description: 'Latest Chennai Super Kings (CSK) breaking news, match analysis, player interviews, squad updates, and Chepauk chronicles. Follow every Yellow Army move.',
    canonical: 'https://superkingsden.com/csk-news/',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  });
}

export default async function CSKNewsPage() {
  const allPosts = await fetchLivePosts();
  return <CSKNewsView initialPosts={allPosts} />;
}
