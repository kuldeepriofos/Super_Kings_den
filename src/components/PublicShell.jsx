'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalSearchWrapper from './GlobalSearchWrapper';

export default function PublicShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin dashboard has its own dedicated executive sidebar and layout
    return <main className="min-h-screen bg-[#060c18]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-200px)]">{children}</main>
      <Footer />
      <GlobalSearchWrapper />
    </>
  );
}
