'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SearchModal from './SearchModal';
import { MOCK_POSTS } from '../data/mockData';
import { fetchLivePosts } from '../services/api';
import { useRouter } from 'next/navigation';

export default function GlobalSearchWrapper() {
  const { searchOpen, setSearchOpen } = useApp();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const router = useRouter();

  useEffect(() => {
    fetchLivePosts().then(res => {
      if (res && res.length > 0) {
        setPosts(res);
      }
    });
  }, []);

  return (
    <SearchModal
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
      posts={posts}
      onSelectPost={(post) => {
        setSearchOpen(false);
        router.push(`/${post.slug}`);
      }}
    />
  );
}
