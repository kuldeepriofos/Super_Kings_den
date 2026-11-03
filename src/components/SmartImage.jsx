'use client';

import React, { useState } from 'react';
import Image from 'next/image';

/**
 * SmartImage — a thin wrapper over next/image used across the public site.
 *
 * Why: the project previously shipped raw <img> tags with image optimization
 * globally disabled. This component enables the Next.js optimizer (responsive
 * srcset + AVIF/WebP) while preserving the two behaviours the old tags relied on:
 *   1. object-cover "fill" images inside sized containers, and
 *   2. an onError fallback to a default banner.
 *
 * Usage:
 *   <SmartImage src={post.featuredImage} alt={post.title} fill
 *               className="object-cover" sizes="(max-width:768px) 100vw, 33vw"
 *               fallbackSrc="/uploads/2026/06/Chennai-Super-Kings-2026.jpg" />
 */
export default function SmartImage({
  src,
  alt = '',
  fallbackSrc = '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  fill = false,
  width,
  height,
  sizes,
  className = '',
  priority = false,
  ...rest
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
  };

  const commonProps = {
    src: imgSrc || fallbackSrc,
    alt,
    className,
    onError: handleError,
    priority,
    // Local uploads are already compressed; keep quality sensible.
    quality: 72,
    ...rest,
  };

  if (fill) {
    return <Image fill sizes={sizes || '100vw'} {...commonProps} />;
  }

  return <Image width={width} height={height} sizes={sizes} {...commonProps} />;
}
