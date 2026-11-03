import fs from 'fs';
import path from 'path';
import connectToDatabase from './mongodb.js';
import Redirect from '../models/Redirect.js';
const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'redirectsData.json');

function getFallbackRedirects() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    }
  } catch (e) {
    console.warn('[Redirects] Could not read fallback redirects:', e.message);
  }
  return [];
}

/**
 * Normalizes a URL path for consistent matching
 * - Trims whitespace
 * - Ensures leading slash
 * - Lowercases path for case-insensitive matching
 */
export function normalizePath(inputPath) {
  if (!inputPath) return '/';
  let p = String(inputPath).trim();
  if (!p.startsWith('/') && !p.startsWith('http://') && !p.startsWith('https://')) {
    p = '/' + p;
  }
  return p;
}

/**
 * Strips trailing slash except for root '/'
 */
export function stripTrailingSlash(p) {
  if (!p || p === '/') return '/';
  return p.endsWith('/') ? p.slice(0, -1) : p;
}

/**
 * Ensures trailing slash
 */
export function ensureTrailingSlash(p) {
  if (!p) return '/';
  if (p.includes('?') || p.includes('#') || p.startsWith('http://') || p.startsWith('https://')) {
    return p;
  }
  return p.endsWith('/') ? p : p + '/';
}

/**
 * Safely writes the current active redirects list to disk
 */
export async function syncRedirectsJson(redirectsList) {
  try {
    let list = redirectsList;
    if (!list || !Array.isArray(list)) {
      await connectToDatabase();
      list = await Redirect.find({}).lean();
    }
    if (!Array.isArray(list)) return;
    const cleanList = list.map((r) => ({
      id: r._id ? String(r._id) : r.id,
      source: r.source,
      destination: r.destination,
      statusCode: Number(r.statusCode) || 301,
      matchType: r.matchType || 'exact',
      isActive: Boolean(r.isActive),
      hitCount: Number(r.hitCount) || 0,
      lastHitAt: r.lastHitAt || null,
      description: r.description || '',
      createdBy: r.createdBy || 'admin',
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString(),
    }));
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(cleanList, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Redirects] Failed to sync redirectsData.json:', err.message);
  }
}

/**
 * Seeds initial redirects into MongoDB if collection is empty
 */
export async function seedRedirectsIfEmpty() {
  try {
    await connectToDatabase();
    const count = await Redirect.countDocuments();
    const fallbacks = getFallbackRedirects();
    if (count === 0 && Array.isArray(fallbacks) && fallbacks.length > 0) {
      console.log(`[Redirects] Seeding ${fallbacks.length} initial redirect rules into MongoDB...`);
      const docs = fallbacks.map((r) => ({
        source: normalizePath(r.source),
        destination: r.destination,
        statusCode: r.statusCode || 301,
        matchType: r.matchType || 'exact',
        isActive: r.isActive !== false,
        hitCount: r.hitCount || 0,
        description: r.description || '',
        createdBy: r.createdBy || 'system',
      }));
      await Redirect.insertMany(docs);
    }
  } catch (err) {
    console.warn('[Redirects] Seed check error:', err.message);
  }
}

/**
 * Pure match function: given a pathname and a list of active rules,
 * returns { rule, targetUrl } or null.
 */
export function evaluateRedirectRules(pathname, rules) {
  if (!pathname || !Array.isArray(rules) || rules.length === 0) return null;

  const cleanReq = stripTrailingSlash(pathname.toLowerCase());

  for (const rule of rules) {
    if (!rule.isActive) continue;

    const rawSource = rule.source;
    const matchType = rule.matchType || 'exact';

    // 1. Exact Match
    if (matchType === 'exact') {
      const cleanSource = stripTrailingSlash(rawSource.toLowerCase());
      if (cleanReq === cleanSource) {
        return {
          rule,
          targetUrl: rule.destination,
        };
      }
    }

    // 2. Prefix Match
    else if (matchType === 'prefix') {
      const prefix = stripTrailingSlash(rawSource.toLowerCase());
      if (cleanReq === prefix || cleanReq.startsWith(prefix + '/')) {
        const remaining = cleanReq.slice(prefix.length);
        let dest = rule.destination;
        if (remaining && !dest.startsWith('http://') && !dest.startsWith('https://')) {
          dest = stripTrailingSlash(dest) + remaining;
        }
        return {
          rule,
          targetUrl: dest,
        };
      }
    }

    // 3. Regex Match
    else if (matchType === 'regex') {
      try {
        const regex = new RegExp(rawSource, 'i');
        const match = pathname.match(regex);
        if (match) {
          let dest = rule.destination;
          // Replace capture groups $1, $2, etc.
          if (match.length > 1) {
            for (let i = 1; i < match.length; i++) {
              dest = dest.replace(new RegExp(`\\$${i}`, 'g'), match[i] || '');
            }
          }
          return {
            rule,
            targetUrl: dest,
          };
        }
      } catch (regexErr) {
        // Skip malformed regex
      }
    }
  }

  return null;
}

/**
 * Server-side lookup with automatic MongoDB hit counting
 */
export async function findMatchingRedirect(pathname) {
  if (!pathname) return null;

  let activeRules = [];
  let isMongo = false;

  try {
    await connectToDatabase();
    activeRules = await Redirect.find({ isActive: true }).lean();
    isMongo = true;
  } catch (err) {
    // Fallback to local JSON file
    try {
      const raw = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      activeRules = JSON.parse(raw).filter((r) => r.isActive);
    } catch (e) {
      activeRules = getFallbackRedirects().filter((r) => r.isActive);
    }
  }

  const match = evaluateRedirectRules(pathname, activeRules);
  if (!match) return null;

  const { rule, targetUrl } = match;

  // Asynchronously record hit
  if (isMongo && rule._id) {
    Redirect.updateOne(
      { _id: rule._id },
      {
        $inc: { hitCount: 1 },
        $set: { lastHitAt: new Date() },
      }
    ).catch(() => {});
  }

  return {
    source: rule.source,
    destination: targetUrl,
    statusCode: Number(rule.statusCode) || 301,
    matchType: rule.matchType || 'exact',
    id: rule._id || rule.id,
  };
}
