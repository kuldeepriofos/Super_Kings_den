import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Share2, Layers } from 'lucide-react';
import { fetchWebStoryBySlug, fetchWebStories } from '../../../services/api';

export async function generateStaticParams() {
  const stories = await fetchWebStories();
  return (stories || []).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const story = await fetchWebStoryBySlug(params.slug);
  if (!story) return {};

  const title = `${story.title} | CSK Web Story | Super Kings Den`;
  const description = story.excerpt || 'Interactive visual web story on Super Kings Den.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://superkingsden.com/web-stories/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://superkingsden.com/web-stories/${params.slug}`,
      siteName: 'Super Kings Den',
      images: story.poster ? [{ url: story.poster }] : [],
    },
  };
}

export default async function WebStoryDetailPage({ params }) {
  const story = await fetchWebStoryBySlug(params.slug);

  if (!story) {
    notFound();
  }

  // Clean html content for iframe rendering
  const storyHtml = story.content || '';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-6 px-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <Link
          href="/web-stories"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Stories</span>
        </Link>
        <span className="text-xs text-csk-yellow font-bold uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Web Story</span>
        </span>
      </div>

      {/* Story Player Container (Mobile Form Factor 9:16 aspect ratio) */}
      <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <iframe
          srcDoc={storyHtml}
          title={story.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="mt-4 text-center max-w-sm">
        <h1 className="text-sm font-bold text-slate-200">
          {story.title}
        </h1>
      </div>
    </div>
  );
}

