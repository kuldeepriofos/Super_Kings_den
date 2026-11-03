'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import SearchModal from './SearchModal';
import postsIndex from '../data/postsIndex.json';

export default function GlobalSearchWrapper() {
  const { searchOpen, setSearchOpen } = useApp();
  const pathname = usePathname();

  // Close search modal when route changes
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname, setSearchOpen]);

  return (
    <SearchModal
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
      posts={postsIndex}
      onSelectPost={() => {
        setSearchOpen(false);
      }}
    />
  );
}
