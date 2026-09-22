import { SQUAD_PLAYERS } from '../data/mockData';
import postsIndex from '../data/postsIndex.json';

// Cached posts data for instant O(1) slug lookup on server
let _postsDataMap = null;

function getPostsDataMap() {
  if (_postsDataMap) return _postsDataMap;

  // In Node.js / Server Components, read postsData.json
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'src', 'data', 'postsData.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const list = JSON.parse(raw);
        _postsDataMap = new Map();
        for (const item of list) {
          if (item.slug) {
            _postsDataMap.set(item.slug.toLowerCase(), item);
          }
          if (item.id) {
            _postsDataMap.set(String(item.id), item);
          }
        }
        return _postsDataMap;
      }
    } catch (err) {
      console.warn('Error loading postsData.json on server:', err);
    }
  }

  // Fallback map from postsIndex
  _postsDataMap = new Map();
  for (const item of postsIndex) {
    if (item.slug) _postsDataMap.set(item.slug.toLowerCase(), item);
    if (item.id) _postsDataMap.set(String(item.id), item);
  }
  return _postsDataMap;
}

// Helper to decode HTML entities
export function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '');
}

/**
 * Fetch all published posts (all 814 articles exported from WordPress).
 * Zero external REST API calls — served instantly from local index.
 */
export async function fetchLivePosts() {
  return postsIndex;
}

/**
 * Fetch Squad Player Profiles with rich stats and local/official imagery.
 * Zero external REST API calls.
 */
export async function fetchLivePlayerProfiles() {
  return SQUAD_PLAYERS;
}

/**
 * Fetch single player profile by slug or ID.
 */
export async function fetchPlayerBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  return SQUAD_PLAYERS.find(p => 
    (p.slug && p.slug.toLowerCase() === cleanSlug) ||
    String(p.id) === cleanSlug ||
    p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === cleanSlug
  ) || null;
}

/**
 * Fetch all player slugs for generateStaticParams.
 */
export async function fetchAllPlayerSlugs() {
  return SQUAD_PLAYERS.map(p => p.slug || String(p.id));
}

import pagesData from '../data/pagesData.json';
import categoriesData from '../data/categoriesData.json';
import webStoriesData from '../data/webStoriesData.json';

/**
 * Fetch single post by slug with full HTML content.
 * Fast O(1) in-memory lookup from the parsed WordPress catalog.
 */
export async function fetchPostBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();

  const dataMap = getPostsDataMap();
  const post = dataMap.get(cleanSlug);
  if (post) {
    return post;
  }

  // Also check normalized slug matching
  for (const [key, val] of dataMap.entries()) {
    if (key === cleanSlug || key.replace(/-/g, '') === cleanSlug.replace(/-/g, '')) {
      return val;
    }
  }

  return null;
}

/**
 * Fetch all post slugs for sitemap generation and static parameters.
 * Returns all 814 unique article slugs.
 */
export async function fetchAllSlugs() {
  return postsIndex.map(p => p.slug);
}

/**
 * Fetch static WordPress page by slug (about-us, privacy-policy, terms, etc.).
 */
export async function fetchPageBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  return pagesData.find(p => p.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Fetch all static page slugs.
 */
export async function fetchAllPageSlugs() {
  return pagesData.map(p => p.slug);
}

/**
 * Fetch all categories.
 */
export async function fetchAllCategories() {
  return categoriesData;
}

/**
 * Fetch category by slug.
 */
export async function fetchCategoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  return categoriesData.find(c => c.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Fetch all web stories.
 */
export async function fetchWebStories() {
  return webStoriesData;
}

/**
 * Fetch single web story by slug.
 */
export async function fetchWebStoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  return webStoriesData.find(s => s.slug.toLowerCase() === cleanSlug) || null;
}




