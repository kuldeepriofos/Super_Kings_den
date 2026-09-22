import React from 'react';
import FranchiseNewsView from '../../components/FranchiseNewsView';
import { fetchLivePosts } from '../../services/api';

export const metadata = {
  title: 'Texas Super Kings News (TSK) & Major League Cricket Updates',
  description: 'Follow Texas Super Kings (TSK) across Major League Cricket (MLC). Latest squad announcements, Grand Prairie Stadium previews, and match reviews.',
  alternates: {
    canonical: 'https://superkingsden.com/tsk-news',
  },
  openGraph: {
    title: 'Texas Super Kings News (TSK) & Major League Cricket Updates | Super Kings Den',
    description: 'Latest news, player rosters, and match analysis for Texas Super Kings in Major League Cricket.',
    url: 'https://superkingsden.com/tsk-news',
    siteName: 'Super Kings Den',
  },
};

export default async function TSKNewsPage() {
  const allPosts = await fetchLivePosts();
  return <FranchiseNewsView franchise="TSK" initialPosts={allPosts} />;
}
