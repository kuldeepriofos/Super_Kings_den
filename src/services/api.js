import { cache } from 'react';
import { unstable_cache, revalidateTag } from 'next/cache';
import { SQUAD_PLAYERS } from '../data/mockData';
import { JSK_ROSTER_PLAYERS, TSK_ROSTER_PLAYERS } from '../data/franchiseRosters';
import postsIndex from '../data/postsIndex.json';

// Cache tags for Next.js on-demand revalidation (shared across all instances,
// unlike the previous per-process module-memory caches).
export const CACHE_TAGS = {
  posts: 'skd-posts',
  fixtures: 'skd-fixtures',
  categories: 'skd-categories',
};

// Cached posts data for instant O(1) slug lookup on server
let _postsDataMap = null;

export function invalidatePostsCache() {
  _postsDataMap = null;
  try {
    revalidateTag(CACHE_TAGS.posts);
  } catch (e) {
    // revalidateTag is only valid inside route handlers / server actions
  }
}

export function invalidateFixturesCache() {
  try {
    revalidateTag(CACHE_TAGS.fixtures);
  } catch (e) {
    /* no-op outside request scope */
  }
}

export function invalidateCategoriesCache() {
  try {
    revalidateTag(CACHE_TAGS.categories);
  } catch (e) {
    /* no-op outside request scope */
  }
}

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
 * Internal: read published posts from MongoDB, wrapped in Next's data cache.
 * Returns null on any failure so the caller can fall back to the bundled index.
 * Cached across requests/instances and invalidated on edit via CACHE_TAGS.posts.
 */
const getPublishedPostsFromDb = unstable_cache(
  async () => {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Post = (await import('../models/Post')).default;
      await connectToDatabase();
      const dbPosts = await Post.find({ isPublished: { $ne: false } })
        .select('-content')
        .sort({ publishedAt: -1, id: -1 })
        .lean()
        .maxTimeMS(3500);

      if (dbPosts && dbPosts.length > 0) {
        return dbPosts.map((p) => ({
          ...p,
          id: p.id || String(p._id),
          _id: String(p._id),
          isMostViewed: Boolean(p.isMostViewed),
        }));
      }
    } catch (err) {
      // fall back
    }
    return null;
  },
  ['skd-live-posts'],
  { tags: [CACHE_TAGS.posts], revalidate: 300 }
);

/**
 * Fetch all published posts. Served from the Next data cache (shared, revalidated
 * on edit) with an instant static fallback when the DB is unavailable.
 */
export async function fetchLivePosts() {
  if (typeof window !== 'undefined') return postsIndex;
  const dbPosts = await getPublishedPostsFromDb();
  return dbPosts && dbPosts.length > 0 ? dbPosts : postsIndex;
}

/**
 * Fetch Squad Player Profiles with rich stats and local/official imagery.
 * Queries MongoDB dynamically on server team-wise, with static roster fallback.
 */
export async function fetchLivePlayerProfiles(franchise = 'ALL') {
  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Player = (await import('../models/Player')).default;
      await connectToDatabase();
      const query = {};
      if (franchise && franchise !== 'ALL') {
        const fUpper = franchise.toUpperCase();
        query.$or = [
          { franchise: fUpper },
          { franchises: fUpper },
          { franchise: franchise },
          { franchises: franchise }
        ];
      }
      const dbPlayers = await Player.find(query).sort({ isCurrent: -1, matches: -1 }).lean();
      if (dbPlayers && dbPlayers.length > 0) {
        return dbPlayers.map((p) => ({
          ...p,
          id: p.id || String(p._id),
          _id: String(p._id),
        }));
      }
    } catch (err) {
      console.warn('MongoDB live players fetch fallback:', err.message);
    }
  }
  if (franchise === 'JSK') return JSK_ROSTER_PLAYERS;
  if (franchise === 'TSK') return TSK_ROSTER_PLAYERS;
  return SQUAD_PLAYERS;
}

/**
 * Fetch single player profile by slug or ID.
 */
export const fetchPlayerBySlug = cache(async (slug) => {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  const stripped = cleanSlug.replace(/-?1$/, '');

  // 1. Try live MongoDB on server
  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Player = (await import('../models/Player')).default;
      await connectToDatabase();
      const queryOr = [
        { slug: cleanSlug },
        { slug: stripped },
      ];
      const numId = Number(cleanSlug);
      if (!isNaN(numId)) queryOr.push({ id: numId });
      const numStripped = Number(stripped);
      if (!isNaN(numStripped)) queryOr.push({ id: numStripped });

      const p = await Player.findOne({ $or: queryOr }).lean();
      if (p) {
        return {
          ...p,
          id: p.id || String(p._id),
          _id: String(p._id),
        };
      }
    } catch (err) {
      console.warn('MongoDB player by slug fetch fallback:', err.message);
    }
  }

  // 2. Direct match with player.slug
  let player = SQUAD_PLAYERS.find(p => p.slug && p.slug.toLowerCase() === cleanSlug);
  if (player) return player;

  // 3. Match with '-1' or '1' suffix variation (e.g. ms-dhoni-1 or ms-dhoni1)
  player = SQUAD_PLAYERS.find(p => {
    const pBase = (p.slug || '').toLowerCase().replace(/-?1$/, '');
    return pBase === stripped;
  });
  if (player) return player;

  // 4. Fallback match by ID or normalized name
  return SQUAD_PLAYERS.find(p => 
    String(p.id) === cleanSlug ||
    p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === cleanSlug ||
    p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === stripped
  ) || null;
});

/**
 * Fetch all player slugs for generateStaticParams.
 */
export async function fetchAllPlayerSlugs() {
  const slugs = new Set();
  const players = await fetchLivePlayerProfiles();
  for (const p of players) {
    if (p.slug) {
      slugs.add(p.slug);
      slugs.add(`${p.slug}-1`);
      slugs.add(`${p.slug}1`);
    }
    if (p.id) slugs.add(String(p.id));
  }
  return Array.from(slugs);
}

function sortTableDescending(tableHtml) {
  const tbodyMatch = tableHtml.match(/<tbody[\s\S]*?<\/tbody>/i);
  const bodyContent = tbodyMatch ? tbodyMatch[0] : tableHtml;
  
  const trMatches = bodyContent.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  if (trMatches.length <= 1) return tableHtml;
  
  const dataRows = [];
  const totalRows = [];
  
  for (const tr of trMatches) {
    if (tr.includes('<th') && !tr.includes('<td')) {
      continue;
    }
    
    const cleanText = tr.replace(/<[^>]+>/g, ' ').trim().toLowerCase();
    if (
      cleanText.startsWith('total') || 
      cleanText.startsWith('career') || 
      cleanText.startsWith('overall') ||
      cleanText.includes('career total') ||
      cleanText.includes('total&nbsp;')
    ) {
      totalRows.push(tr);
    } else {
      const cells = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      const firstCell = cells[0] ? cells[0].replace(/<[^>]+>/g, '').trim() : '';
      const yearMatch = firstCell.match(/\b(19\d\d|20\d\d)\b/);
      let yearVal = null;
      if (yearMatch) {
        yearVal = parseInt(yearMatch[1], 10);
      } else {
        const secondCell = cells[1] ? cells[1].replace(/<[^>]+>/g, '').trim() : '';
        const secondYearMatch = secondCell.match(/\b(19\d\d|20\d\d)\b/);
        if (secondYearMatch) {
          yearVal = parseInt(secondYearMatch[1], 10);
        }
      }
      dataRows.push({ tr, yearVal });
    }
  }
  
  const rowsWithYears = dataRows.filter(r => r.yearVal !== null);
  if (rowsWithYears.length >= 2) {
    dataRows.sort((a, b) => {
      if (a.yearVal !== null && b.yearVal !== null) {
        return b.yearVal - a.yearVal; // Latest year first
      }
      if (a.yearVal !== null) return -1;
      if (b.yearVal !== null) return 1;
      return 0;
    });
  }
  
  const sortedTrs = dataRows.map(r => r.tr).concat(totalRows).join('');
  
  if (tbodyMatch) {
    return tableHtml.replace(/<tbody[\s\S]*?<\/tbody>/i, `<tbody>${sortedTrs}</tbody>`);
  } else {
    return tableHtml.replace(/<tr[\s\S]*?<\/tr>[\s\S]*/i, sortedTrs + '</table>');
  }
}

function sanitizePlayerArticleContent(html) {
  if (!html) return '';
  const cleaned = html
    // 1. Remove entire ez-toc-container block (WordPress Table of Contents plugin)
    .replace(/<div[^>]*id=["']ez-toc-container["'][\s\S]*?<\/nav>\s*<\/div>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*ez-toc-container[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi, '')
    // 2. Remove leftover ez-toc spans in headings
    .replace(/<span[^>]*class=["']ez-toc-[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, '$1')
    // 3. Remove empty paragraphs
    .replace(/<p[^>]*>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
    // 4. Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // 5. Sort stats tables latest-year first
  return cleaned.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    return sortTableDescending(match);
  });
}

/**
 * Fetch matching in-depth editorial article for a player profile.
 * Merges rich long-form content, history, and SEO data directly into the player page.
 */
export async function fetchPlayerArticle(player) {
  if (!player || !player.slug) return null;
  const cleanSlug = player.slug.toLowerCase().trim();

  // 0. If player has customized content directly in MongoDB / model, use it as primary
  if (player.content && player.content.trim()) {
    return {
      id: player.id || `profile-${cleanSlug}`,
      slug: cleanSlug,
      title: `${player.name} Profile & Career Biography`,
      content: sanitizePlayerArticleContent(player.content),
    };
  }

  // 1. Try MongoDB Post collection on server first
  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Post = (await import('../models/Post')).default;
      await connectToDatabase();
      const alias = `who-is-${cleanSlug}`;
      const pName = (player.name || '').trim();
      let matched = await Post.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: alias }
        ]
      }).lean();

      if (!matched && pName) {
        matched = await Post.findOne({
          title: new RegExp(pName, 'i')
        }).lean();
      }

      if (matched) {
        return {
          ...matched,
          content: sanitizePlayerArticleContent(matched.content)
        };
      }
    } catch (err) {
      console.warn('MongoDB player article fetch fallback:', err.message);
    }
  }

  // 2. Fallback to local postsDataMap
  const dataMap = getPostsDataMap();
  let matchedPost = null;

  // Direct match with player.slug
  if (dataMap.has(cleanSlug)) {
    matchedPost = dataMap.get(cleanSlug);
  } else {
    // Profile alias like who-is-kartik-sharma or who-is-prashant-veer
    const alias = `who-is-${cleanSlug}`;
    if (dataMap.has(alias)) {
      matchedPost = dataMap.get(alias);
    } else {
      // Match post whose title specifically mentions the player name + ("profile" or "stats")
      const pName = (player.name || '').toLowerCase();
      for (const post of dataMap.values()) {
        const t = (post.title || '').toLowerCase();
        if (t.includes(pName) && (t.includes('profile') || t.includes('stats'))) {
          matchedPost = post;
          break;
        }
      }
    }
  }

  if (matchedPost) {
    return {
      ...matchedPost,
      content: sanitizePlayerArticleContent(matchedPost.content)
    };
  }

  return null;
}

import pagesData from '../data/pagesData.json';
import categoriesData from '../data/categoriesData.json';
import webStoriesData from '../data/webStoriesData.json';

/**
 * Fetch single post by slug with full HTML content.
 * Queries live MongoDB first, with instant O(1) in-memory fallback.
 */
export const fetchPostBySlug = cache(async (slug) => {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  const numId = Number(cleanSlug);

  // 1. Try live MongoDB on server first
  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Post = (await import('../models/Post')).default;
      await connectToDatabase();
      const queryOr = [{ slug: cleanSlug }];
      if (!isNaN(numId)) {
        queryOr.push({ id: numId });
      }
      const post = await Post.findOne({ $or: queryOr }).lean();
      if (post) {
        return {
          ...post,
          id: post.id || String(post._id),
          _id: String(post._id),
        };
      }
    } catch (err) {
      console.warn('MongoDB post by slug fetch fallback:', err.message);
    }
  }

  // 2. Fallback to postsDataMap
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
});

/**
 * Fetch all post slugs for sitemap generation and static parameters.
 * Queries MongoDB dynamically with fallback to local index.
 */
export async function fetchAllSlugs() {
  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Post = (await import('../models/Post')).default;
      await connectToDatabase();
      const slugs = await Post.distinct('slug', { isPublished: { $ne: false } });
      if (slugs && slugs.length > 0) {
        return slugs;
      }
    } catch (err) {
      console.warn('MongoDB all slugs fetch fallback:', err.message);
    }
  }
  return postsIndex.map(p => p.slug);
}

/**
 * Fetch static WordPress page by slug (about-us, privacy-policy, terms, etc.).
 * Checks MongoDB first, with instant fallback to static pagesData.
 */
export const CORE_RESERVED_SLUGS = [
  'chennai-super-kings',
  'joburg-super-kings',
  'texas-super-kings',
  'csk',
  'jsk',
  'tsk',
  'csk-fixtures',
  'jsk-fixtures',
  'tsk-fixtures',
  'csk-team',
  'jsk-team',
  'tsk-team',
  'csk-news',
  'jsk-news',
  'tsk-news',
  'csk-trophies',
  'news',
  'all-time-xi',
  'squad',
  'quiz',
  'standings',
  'stats',
  'contact-us',
  'search',
  'home',
  'trophy',
  'api',
  'admin',
  'player',
  'players',
  'category',
  'web-stories',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'llms.txt',
  'icon.png',
  'apple-icon.png',
];

export const fetchPageBySlug = cache(async (slug) => {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();

  // If this slug belongs to a dedicated app route or core system route, never treat as static page
  if (CORE_RESERVED_SLUGS.includes(cleanSlug)) return null;

  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb.js')).default;
      const Page = (await import('../models/Page.js')).default;
      await connectToDatabase();
      const pageDoc = await Page.findOne({
        slug: cleanSlug,
        isPublished: { $ne: false },
        pageType: { $ne: 'core_route' },
      }).lean();

      if (pageDoc) {
        return {
          ...pageDoc,
          id: pageDoc.id || String(pageDoc._id),
          _id: String(pageDoc._id),
        };
      }
    } catch (err) {
      // fallback to local data
    }
  }

  const staticPage = pagesData.find(p => p.slug.toLowerCase() === cleanSlug);
  if (staticPage && !CORE_RESERVED_SLUGS.includes(cleanSlug)) {
    return staticPage;
  }
  return null;
});

/**
 * Fetch all static page slugs (excluding core system routes).
 */
export async function fetchAllPageSlugs() {
  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb.js')).default;
      const Page = (await import('../models/Page.js')).default;
      await connectToDatabase();
      const slugs = await Page.distinct('slug', {
        isPublished: { $ne: false },
        pageType: { $ne: 'core_route' },
      });
      if (slugs && slugs.length > 0) {
        return slugs.filter(s => s && !CORE_RESERVED_SLUGS.includes(s.toLowerCase()));
      }
    } catch (err) {
      // fallback
    }
  }
  return pagesData
    .map(p => p.slug)
    .filter(s => s && !CORE_RESERVED_SLUGS.includes(s.toLowerCase()));
}

/**
 * Fetch all categories.
 * Queries MongoDB live with fallback to static categoriesData.
 */
const getCategoriesFromDb = unstable_cache(
  async () => {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Category = (await import('../models/Category')).default;
      await connectToDatabase();
      const cats = await Category.find().sort({ count: -1 }).lean().maxTimeMS(2000);
      if (cats && cats.length > 0) {
        return cats.map((c) => ({
          ...c,
          id: c.id || String(c._id),
          _id: String(c._id),
        }));
      }
    } catch (err) {
      console.warn('MongoDB categories fetch fallback:', err.message);
    }
    return null;
  },
  ['skd-categories'],
  { tags: [CACHE_TAGS.categories], revalidate: 600 }
);

export async function fetchAllCategories() {
  if (typeof window !== 'undefined') return categoriesData;
  const cats = await getCategoriesFromDb();
  return cats && cats.length > 0 ? cats : categoriesData;
}

/**
 * Fetch category by slug.
 * Queries MongoDB live with fallback to static categoriesData.
 */
export async function fetchCategoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/\/+$/, '').trim().toLowerCase();
  const numId = Number(cleanSlug);

  if (typeof window === 'undefined') {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Category = (await import('../models/Category')).default;
      await connectToDatabase();
      const queryOr = [{ slug: cleanSlug }];
      if (!isNaN(numId)) queryOr.push({ id: numId });
      const cat = await Category.findOne({ $or: queryOr }).lean();
      if (cat) {
        return {
          ...cat,
          id: cat.id || String(cat._id),
          _id: String(cat._id),
        };
      }
    } catch (err) {
      console.warn('MongoDB category by slug fetch fallback:', err.message);
    }
  }

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

/**
 * Internal: read active fixtures from MongoDB via Next's data cache.
 * Invalidated on edit via CACHE_TAGS.fixtures.
 */
const getActiveFixturesFromDb = unstable_cache(
  async () => {
    try {
      const connectToDatabase = (await import('../lib/mongodb')).default;
      const Fixture = (await import('../models/Fixture')).default;
      await connectToDatabase();
      const raw = await Fixture.find({ isActive: true, isDeleted: { $ne: true } })
        .sort({ isFeatured: -1, createdAt: -1, order: 1 })
        .lean()
        .maxTimeMS(2500);

      if (raw && raw.length > 0) {
        return raw.map((f) => ({
          ...f,
          id: f.id || String(f._id),
          _id: String(f._id),
        }));
      }
    } catch (err) {
      console.warn('MongoDB live fixtures fetch fallback:', err.message);
    }
    return [];
  },
  ['skd-live-fixtures'],
  { tags: [CACHE_TAGS.fixtures], revalidate: 300 }
);

/**
 * Fetch fixtures from the shared data cache, filtered by franchise.
 */
export async function fetchLiveFixtures(franchise = 'ALL') {
  if (typeof window !== 'undefined') return [];
  const all = await getActiveFixturesFromDb();
  if (franchise && franchise !== 'ALL') {
    return all.filter((f) => f.franchise === franchise);
  }
  return all;
}





