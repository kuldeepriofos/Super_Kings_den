import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Post from '../../../models/Post';
import Player from '../../../models/Player';
import postsIndex from '../../../data/postsIndex.json';
import { SQUAD_PLAYERS } from '../../../data/mockData';

// In-memory dataset cache for instant sub-10ms search results
let cachedPosts = null;
let cachedPlayers = null;
let lastSyncTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function getSearchDataset() {
  const now = Date.now();

  // If cache is fresh, return immediately (0ms)
  if (cachedPosts && cachedPlayers && (now - lastSyncTime < CACHE_TTL_MS)) {
    return { allPosts: cachedPosts, allPlayers: cachedPlayers };
  }

  // Initialize with local index immediately so response is NEVER blocked
  if (!cachedPosts) cachedPosts = postsIndex;
  if (!cachedPlayers) cachedPlayers = SQUAD_PLAYERS;

  // Background non-blocking sync from MongoDB Atlas
  const syncWithDb = async () => {
    try {
      await connectToDatabase();
      const [dbPosts, dbPlayers] = await Promise.all([
        Post.find({ isPublished: { $ne: false } })
          .select('title slug excerpt category franchise publishedAt date featuredImage id')
          .sort({ publishedAt: -1, id: -1 })
          .lean()
          .maxTimeMS(2500),
        Player.find()
          .select('name fullName role tag specialty slug bioQuote franchise avatarImage jerseyNumber photoUrl')
          .lean()
          .maxTimeMS(2500),
      ]);

      if (dbPosts && dbPosts.length > 0) {
        cachedPosts = dbPosts.map((p) => ({ ...p, id: p.id || String(p._id), _id: String(p._id) }));
      }
      if (dbPlayers && dbPlayers.length > 0) {
        cachedPlayers = dbPlayers.map((p) => ({ ...p, id: p.id || String(p._id), _id: String(p._id) }));
      }
      lastSyncTime = Date.now();
    } catch (e) {
      // Retain in-memory cache on any network/timeout error
    }
  };

  // Run DB sync in background; do not block search response!
  syncWithDb().catch(() => {});

  return { allPosts: cachedPosts, allPlayers: cachedPlayers };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || searchParams.get('query') || '';
    const q = rawQuery.trim().toLowerCase();
    const type = searchParams.get('type') || 'all'; // 'all' | 'articles' | 'players' | 'seasons'
    const franchise = searchParams.get('franchise') || 'all'; // 'all' | 'CSK' | 'JSK' | 'TSK'
    const sortBy = searchParams.get('sortBy') || 'relevant'; // 'relevant' | 'newest' | 'oldest'

    if (!q) {
      return NextResponse.json({
        success: true,
        query: '',
        counts: { all: 0, articles: 0, players: 0, seasons: 0 },
        results: { articles: [], players: [], seasons: [] },
      });
    }

    const terms = q.split(/\s+/).filter(Boolean);

    // Instant data retrieval from fast in-memory cache
    const { allPosts, allPlayers } = await getSearchDataset();

    // 3. Match Articles
    let matchedArticles = [];
    for (const post of allPosts) {
      if (franchise !== 'all') {
        const postFran = (post.franchise || 'CSK').toUpperCase();
        if (postFran !== franchise.toUpperCase()) continue;
      }

      const title = (post.title || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const category = (post.category || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      const slug = (post.slug || '').toLowerCase();

      let score = 0;

      // Exact phrase match
      if (title.includes(q)) score += 60;
      if (slug.includes(q)) score += 40;
      if (excerpt.includes(q)) score += 25;
      if (category.includes(q)) score += 20;

      // Individual terms match
      let termMatches = 0;
      for (const t of terms) {
        if (title.includes(t)) {
          score += 15;
          termMatches++;
        } else if (slug.includes(t)) {
          score += 10;
          termMatches++;
        } else if (excerpt.includes(t)) {
          score += 6;
          termMatches++;
        } else if (category.includes(t)) {
          score += 5;
          termMatches++;
        } else if (content.includes(t)) {
          score += 2;
          termMatches++;
        }
      }

      if (score > 0 || termMatches === terms.length) {
        matchedArticles.push({
          ...post,
          _score: score,
        });
      }
    }

    // Sort Articles
    if (sortBy === 'newest') {
      matchedArticles.sort((a, b) => new Date(b.date || b.publishedAt || 0) - new Date(a.date || a.publishedAt || 0));
    } else if (sortBy === 'oldest') {
      matchedArticles.sort((a, b) => new Date(a.date || a.publishedAt || 0) - new Date(b.date || b.publishedAt || 0));
    } else {
      // Relevant
      matchedArticles.sort((a, b) => b._score - a._score);
    }

    // 4. Match Players
    let matchedPlayers = [];
    for (const player of allPlayers) {
      if (franchise !== 'all') {
        const pFran = (player.franchise || 'CSK').toUpperCase();
        if (pFran !== franchise.toUpperCase()) continue;
      }

      const name = (player.name || '').toLowerCase();
      const fullName = (player.fullName || '').toLowerCase();
      const role = (player.role || '').toLowerCase();
      const tag = (player.tag || '').toLowerCase();
      const specialty = (player.specialty || '').toLowerCase();
      const slug = (player.slug || '').toLowerCase();
      const bioQuote = (player.bioQuote || '').toLowerCase();

      let score = 0;
      if (name.includes(q) || fullName.includes(q)) score += 70;
      if (slug.includes(q)) score += 50;
      if (tag.includes(q)) score += 35;
      if (role.includes(q) || specialty.includes(q)) score += 20;
      if (bioQuote.includes(q)) score += 10;

      for (const t of terms) {
        if (name.includes(t) || fullName.includes(t)) score += 20;
        else if (tag.includes(t)) score += 15;
        else if (role.includes(t) || specialty.includes(t)) score += 10;
        else if (bioQuote.includes(t)) score += 5;
      }

      if (score > 0) {
        matchedPlayers.push({
          ...player,
          _score: score,
        });
      }
    }
    matchedPlayers.sort((a, b) => b._score - a._score);

    const counts = {
      all: matchedArticles.length + matchedPlayers.length,
      articles: matchedArticles.length,
      players: matchedPlayers.length,
      seasons: 0,
    };

    return NextResponse.json({
      success: true,
      query: rawQuery,
      counts,
      results: {
        articles: type === 'players' ? [] : matchedArticles.slice(0, 100),
        players: type === 'articles' ? [] : matchedPlayers.slice(0, 50),
        seasons: [],
      },
    });
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
