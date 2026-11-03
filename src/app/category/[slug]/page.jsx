import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Folder } from 'lucide-react';
import HeroFeatured from '../../../components/HeroFeatured';
import NewsGrid from '../../../components/NewsGrid';
import CategoryHeader from '../../../components/CategoryHeader';
import { fetchLivePosts, fetchCategoryBySlug, fetchAllCategories } from '../../../services/api';

export async function generateStaticParams() {
  const categories = await fetchAllCategories();
  return (categories || []).map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }) {
  const cat = await fetchCategoryBySlug(params.slug);
  const categoryName = cat ? cat.name : params.slug.replace(/-/g, ' ').toUpperCase();
  const title = cat?.seoTitle || `${categoryName} News, Articles & Analysis | Super Kings Den`;

  const rawDescription = cat?.metaDescription || cat?.description || '';
  const cleanText = rawDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const description =
    cleanText.length > 160
      ? cleanText.slice(0, 157) + '...'
      : cleanText ||
        `Explore all news, analysis, and stories categorized under ${categoryName} on Super Kings Den.`;

  const canonicalUrl = cat?.canonicalUrl || `https://superkingsden.com/category/${params.slug}/`;
  const ogImage = cat?.ogImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';

  return {
    title: {
      absolute: title.includes('Super Kings Den') ? title : `${title} | Super Kings Den`,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Super Kings Den',
      locale: 'en_US',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `https://superkingsden.com${ogImage}`,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `https://superkingsden.com${ogImage}`],
      creator: '@superkingsden',
    },
  };
}

export default async function CategoryPage({ params }) {
  const cat = await fetchCategoryBySlug(params.slug);
  const allPosts = await fetchLivePosts();

  const cleanSlug = params.slug.toLowerCase().trim();

  // Helper to slugify category strings
  const slugify = (str) =>
    (str || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const targetCategoryName = cat ? cat.name.toLowerCase().trim() : cleanSlug.replace(/-/g, ' ');

  // Filter ONLY posts that strictly belong to this category
  const filtered = (allPosts || []).filter((p) => {
    if (!p) return false;

    // 1. Direct post.category match (slug or name)
    if (p.category) {
      const pCatName = p.category.toLowerCase().trim();
      const pCatSlug = slugify(p.category);

      if (pCatSlug === cleanSlug) return true;
      if (pCatName === targetCategoryName) return true;
      if (cat?.slug && pCatSlug === cat.slug.toLowerCase().trim()) return true;
    }

    // 2. Direct post.categorySlug match if present
    if (p.categorySlug) {
      const pSlug = p.categorySlug.toLowerCase().trim();
      if (pSlug === cleanSlug || (cat?.slug && pSlug === cat.slug.toLowerCase().trim())) {
        return true;
      }
    }

    // 3. If post.categories array exists
    if (Array.isArray(p.categories)) {
      for (const c of p.categories) {
        if (typeof c === 'string') {
          if (slugify(c) === cleanSlug || c.toLowerCase().trim() === targetCategoryName) {
            return true;
          }
        } else if (c && typeof c === 'object') {
          if (c.slug && slugify(c.slug) === cleanSlug) return true;
          if (c.name && c.name.toLowerCase().trim() === targetCategoryName) return true;
        }
      }
    }

    return false;
  });

  const displayPosts = filtered;
  const categoryName = cat ? cat.name : params.slug.replace(/-/g, ' ').toUpperCase();
  const pageUrl = cat?.canonicalUrl || `https://superkingsden.com/category/${params.slug}/`;

  // Schema.org Structured Data: CollectionPage + BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} Archive`,
    description: cat?.description
      ? cat.description.replace(/<[^>]+>/g, ' ').slice(0, 160)
      : `All articles in ${categoryName}`,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Super Kings Den',
      url: 'https://superkingsden.com',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://superkingsden.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'News',
          item: 'https://superkingsden.com/news',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryName,
          item: pageUrl,
        },
      ],
    },
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Schema.org JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* Hero Banner with Rich HTML / Expandable Overview */}
      <CategoryHeader
        categoryName={categoryName}
        articleCount={displayPosts.length}
        rawDescription={cat?.description}
      />

      {displayPosts.length > 0 ? (
        <>
          <HeroFeatured posts={displayPosts} />
          <NewsGrid
            posts={displayPosts}
            hideCategoryFilter={true}
            categoryName={categoryName}
            title={`${categoryName} Dispatches`}
            subtitle={`Showing ${displayPosts.length} Articles filed under ${categoryName}`}
          />
        </>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800 my-8">
          <Folder className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white mb-1">
            No articles in &quot;{categoryName}&quot; yet
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
            We haven&apos;t published any articles in this category yet. Check back soon for new updates!
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition"
          >
            Browse All News
          </Link>
        </div>
      )}
    </div>
  );
}
