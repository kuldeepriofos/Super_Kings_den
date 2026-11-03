'use client';

import React, { useState, useMemo } from 'react';
import { Folder, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

/**
 * Sanitizes and cleans WordPress artifacts from category descriptions
 */
function sanitizeCategoryHtml(html) {
  if (!html) return '';
  return html
    // Remove data-start, data-end, data-section-id attributes
    .replace(/\s+data-[a-z0-9-]+="[^"]*"/gi, '')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/gi, '')
    // Ensure links open safely
    .replace(/<a\s+(?!.*?target=)/gi, '<a target="_blank" rel="noopener noreferrer" ')
    .trim();
}

export default function CategoryHeader({ categoryName, articleCount, rawDescription }) {
  const [expanded, setExpanded] = useState(false);

  const cleanHtml = useMemo(() => {
    return sanitizeCategoryHtml(rawDescription || '');
  }, [rawDescription]);

  const hasHtml = useMemo(() => {
    return /<[a-z][\s\S]*>/i.test(cleanHtml);
  }, [cleanHtml]);

  // Strip text for length check
  const textOnly = useMemo(() => {
    return cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [cleanHtml]);

  const isLong = textOnly.length > 280;

  return (
    <div className="csk-hero-banner relative overflow-hidden transition-all duration-300">
      {/* Category Archive Badge */}
      <div className="flex items-center space-x-2 text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
        <Folder className="w-4 h-4 text-csk-yellow flex-shrink-0" />
        <span>Category Archive &bull; {articleCount} Articles</span>
      </div>

      {/* Category Title */}
      <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-3">
        {categoryName}
      </h1>

      {/* Category Description */}
      {cleanHtml ? (
        <div className="space-y-3">
          <div
            className={`category-description-content text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl transition-all duration-300 relative ${
              !expanded && isLong ? 'max-h-28 overflow-hidden' : ''
            }`}
          >
            {hasHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
                className="category-rich-html prose prose-invert prose-yellow max-w-none space-y-2.5 text-slate-300 text-xs sm:text-sm [&>h2]:text-white [&>h2]:font-bold [&>h2]:text-base sm:[&>h2]:text-lg [&>h2]:mt-3 [&>h2]:mb-1.5 [&>h3]:text-yellow-400 [&>h3]:font-bold [&>h3]:text-sm sm:[&>h3]:text-base [&>h3]:mt-3 [&>h3]:mb-1.5 [&>p]:leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ul]:my-2 [&>li]:leading-relaxed [&>li>strong]:text-yellow-300 [&>a]:text-yellow-400 [&>a]:underline [&>a]:underline-offset-2 [&>a:hover]:text-yellow-300 [&>strong]:text-white"
              />
            ) : (
              <p className="leading-relaxed">{cleanHtml}</p>
            )}

            {/* Gradient overlay when collapsed */}
            {!expanded && isLong && (
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#00275B] via-[#00275B]/80 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Toggle Expand / Collapse Button */}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-400/15 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 border border-yellow-400/30 transition-all cursor-pointer shadow-sm group"
            >
              <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>{expanded ? 'Collapse Overview' : 'Read Full Category Guide'}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              )}
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Curated dispatches, statistics, and stories filed under {categoryName}.
        </p>
      )}
    </div>
  );
}
