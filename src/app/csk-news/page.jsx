import React from 'react';
import FranchiseNewsView from '../../components/FranchiseNewsView';
import { fetchLivePosts } from '../../services/api';

export const metadata = {
  title: 'CSK News & Official Chennai Super Kings Updates',
  description: 'Latest Chennai Super Kings (CSK) breaking news, match analysis, player interviews, squad updates, and Chepauk chronicles. Follow every Yellow Army move.',
  alternates: {
    canonical: 'https://superkingsden.com/csk-news',
  },
  openGraph: {
    title: 'CSK News & Official Chennai Super Kings Updates | Super Kings Den',
    description: 'Comprehensive Chennai Super Kings news, match previews, player stats, and Chepauk chronicles.',
    url: 'https://superkingsden.com/csk-news',
    siteName: 'Super Kings Den',
  },
};

export default async function CSKNewsPage() {
  const allPosts = await fetchLivePosts();
  return <FranchiseNewsView franchise="CSK" initialPosts={allPosts} />;
}

