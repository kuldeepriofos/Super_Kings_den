import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Folder } from 'lucide-react';
import HeroFeatured from '../../../components/HeroFeatured';
import NewsGrid from '../../../components/NewsGrid';
import { fetchLivePosts, fetchCategoryBySlug, fetchAllCategories } from '../../../services/api';

export async function generateStaticParams() {
  const categories = await fetchAllCategories();
  return (categories || []).map(cat => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }) {
  const cat = await fetchCategoryBySlug(params.slug);
  const title = cat ? `${cat.name} Articles & Analysis | Super Kings Den` : `Category: ${params.slug} | Super Kings Den`;
  const description = cat?.description || `Explore all news, analysis, and stories categorized under ${cat?.name || params.slug} on Super Kings Den.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://superkingsden.com/category/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://superkingsden.com/category/${params.slug}`,
      siteName: 'Super Kings Den',
    },
  };
}

export default async function CategoryPage({ params }) {
  const cat = await fetchCategoryBySlug(params.slug);
  const allPosts = await fetchLivePosts();

  const cleanSlug = params.slug.toLowerCase();

  // Filter posts matching this category
  const filtered = (allPosts || []).filter(p => {
    const postCat = (p.category || '').toLowerCase();
    const postTags = Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()) : [];
    const text = (p.title + ' ' + (p.excerpt || '')).toLowerCase();

    return (
      postCat.includes(cleanSlug) ||
      postTags.includes(cleanSlug) ||
      (cat && postCat.includes(cat.name.toLowerCase())) ||
      (cleanSlug === 'csk-news' && (text.includes('csk') || text.includes('chennai'))) ||
      (cleanSlug === 'jsk-news' && (text.includes('jsk') || text.includes('joburg') || text.includes('sa20'))) ||
      (cleanSlug === 'tsk-news' && (text.includes('tsk') || text.includes('texas') || text.includes('mlc'))) ||
      (cleanSlug === 'ipl' && text.includes('ipl'))
    );
  });

  const displayPosts = filtered.length > 0 ? filtered : allPosts.slice(0, 20);
  const categoryName = cat ? cat.name : params.slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/news" className="hover:text-amber-600 dark:hover:text-csk-yellow transition">
          News
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400">Category</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold truncate">
          {categoryName}
        </span>
      </nav>

      {/* Hero Banner */}
      <div className="csk-hero-banner">
        <div className="flex items-center space-x-2 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Folder className="w-4 h-4 text-csk-yellow" />
          <span>Category Archive &bull; {displayPosts.length} Articles</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
          {categoryName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          {cat?.description || `Curated dispatches, statistics, and stories filed under ${categoryName}.`}
        </p>
      </div>

      <HeroFeatured posts={displayPosts} />
      <NewsGrid posts={displayPosts} />
    </div>
  );
}

