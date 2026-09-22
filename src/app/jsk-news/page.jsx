import React from 'react';
import FranchiseNewsView from '../../components/FranchiseNewsView';
import { fetchLivePosts } from '../../services/api';

export const metadata = {
  title: 'Joburg Super Kings News (JSK) & SA20 Updates',
  description: 'Follow Joburg Super Kings (JSK) across SA20 tournaments. Latest squad announcements, Wanderers match previews, and Faf du Plessis press conferences.',
  alternates: {
    canonical: 'https://superkingsden.com/jsk-news',
  },
  openGraph: {
    title: 'Joburg Super Kings News (JSK) & SA20 Updates | Super Kings Den',
    description: 'Latest news, interviews, and match analysis for Joburg Super Kings in SA20.',
    url: 'https://superkingsden.com/jsk-news',
    siteName: 'Super Kings Den',
  },
};

export default async function JSKNewsPage() {
  const allPosts = await fetchLivePosts();
  return <FranchiseNewsView franchise="JSK" initialPosts={allPosts} />;
}

