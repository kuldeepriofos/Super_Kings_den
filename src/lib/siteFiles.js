import fs from 'fs';
import path from 'path';
import connectToDatabase from './mongodb';
import ManagedFile from '../models/ManagedFile';

// JSON fallback so the files keep serving when MongoDB is unreachable.
const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'siteFiles.json');

// Where the physical .htaccess is written (Apache/LiteSpeed reads it from disk,
// not through Next). Override with HTACCESS_PATH if your doc root differs.
const HTACCESS_PATH = process.env.HTACCESS_PATH || path.join(process.cwd(), '.htaccess');

export const MANAGED_FILES = ['robots.txt', 'llms.txt', '.htaccess'];

const DEFAULTS = {
  'robots.txt': `# Super Kings Den — robots.txt (managed from /admin/site-files)
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-json/
Disallow: /xmlrpc.php
Disallow: /feed/
Disallow: /*/feed/
Disallow: *?replytocom=*

User-agent: Googlebot
Allow: /

Sitemap: https://superkingsden.com/sitemap.xml
`,
  'llms.txt': `# Super Kings Den

> The premier independent fan destination for Chennai Super Kings (IPL),
> Joburg Super Kings (SA20) and Texas Super Kings (MLC) — news, squads,
> fixtures, standings and player profiles. #WhistlePodu

## Primary pages
- [Latest News](https://superkingsden.com/news/): CSK, JSK & TSK coverage and analysis
- [CSK Team 2026](https://superkingsden.com/csk-team/): full Chennai Super Kings squad
- [Fixtures](https://superkingsden.com/csk-fixtures/): upcoming and recent matches
- [Standings](https://superkingsden.com/standings/): points tables across tournaments
- [Trophies](https://superkingsden.com/csk-trophies/): championship history

## Notes
- This is an independent fan portal, not affiliated with the official franchises.
- Content may be cited with attribution to Super Kings Den.
`,
  '.htaccess': `# Super Kings Den — .htaccess (managed from /admin/site-files)
# Applies only when the site is served behind Apache/LiteSpeed.

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
</IfModule>

# Deny access to dotfiles (except well-known)
<FilesMatch "^\\.(?!well-known)">
  Require all denied
</FilesMatch>
`,
};

export function getDefaultSiteFile(name) {
  return DEFAULTS[name] || '';
}

function readJsonFallback() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8')) || {};
    }
  } catch (err) {
    console.warn('Failed to read siteFiles.json:', err.message);
  }
  return {};
}

function writeJsonFallback(map) {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(map, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write siteFiles.json:', err.message);
  }
}

/**
 * Resolve a single file's content: MongoDB first, then JSON fallback, then the
 * built-in default. Used by the public robots.txt / llms.txt route handlers.
 */
export async function getSiteFileContent(name) {
  if (!MANAGED_FILES.includes(name)) return '';

  try {
    await connectToDatabase();
    const doc = await ManagedFile.findOne({ name }).lean().maxTimeMS(1500);
    if (doc && typeof doc.content === 'string') return doc.content;
  } catch (err) {
    // fall through to JSON / default
  }

  const fallback = readJsonFallback();
  if (typeof fallback[name] === 'string') return fallback[name];
  return getDefaultSiteFile(name);
}

/**
 * All managed files for the admin editor (DB first, JSON/default fallback).
 */
export async function getAllSiteFiles() {
  let dbMap = null;
  try {
    await connectToDatabase();
    const docs = await ManagedFile.find({ name: { $in: MANAGED_FILES } }).lean().maxTimeMS(2000);
    dbMap = {};
    for (const d of docs) dbMap[d.name] = d;
  } catch (err) {
    // ignore — use fallback
  }

  const fallback = readJsonFallback();

  return MANAGED_FILES.map((name) => {
    const doc = dbMap && dbMap[name];
    const content =
      doc && typeof doc.content === 'string'
        ? doc.content
        : typeof fallback[name] === 'string'
        ? fallback[name]
        : getDefaultSiteFile(name);
    return {
      name,
      content,
      updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
      updatedBy: doc?.updatedBy || null,
    };
  });
}

/**
 * Persist one managed file to MongoDB + JSON fallback. For .htaccess, also write
 * the physical file so the web server picks it up.
 */
export async function saveSiteFile(name, content, username = 'admin') {
  if (!MANAGED_FILES.includes(name)) {
    throw new Error(`Unknown managed file: ${name}`);
  }
  const safeContent = typeof content === 'string' ? content : '';

  // 1. JSON fallback (always, so reads work even if the DB is down)
  const map = readJsonFallback();
  map[name] = safeContent;
  writeJsonFallback(map);

  // 2. Physical .htaccess for Apache/LiteSpeed
  if (name === '.htaccess') {
    try {
      fs.writeFileSync(HTACCESS_PATH, safeContent, 'utf8');
    } catch (err) {
      console.warn('Failed to write .htaccess to disk:', err.message);
    }
  }

  // 3. MongoDB
  try {
    await connectToDatabase();
    await ManagedFile.findOneAndUpdate(
      { name },
      { name, content: safeContent, updatedBy: username },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn('MongoDB save warning in saveSiteFile:', err.message);
  }

  return { name, content: safeContent, updatedBy: username, updatedAt: new Date().toISOString() };
}
