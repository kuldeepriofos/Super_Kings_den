const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const mongoose = require(path.join(ROOT_DIR, 'node_modules', 'mongoose'));

// Read MongoDB URI
const envPath = path.join(ROOT_DIR, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.*)/);
if (!match) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}
const uri = match[1].trim();

const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
const POSTS_DATA_PATH = path.join(ROOT_DIR, 'src', 'data', 'postsData.json');
const POSTS_INDEX_PATH = path.join(ROOT_DIR, 'src', 'data', 'postsIndex.json');

function decodeHtmlEntities(str) {
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
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateReadingTime(text) {
  const words = (text || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Download image helper
async function downloadImage(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const cleanUrl = url.split('?')[0];
    const match = cleanUrl.match(/\/wp-content\/uploads\/(.+)$/);
    if (!match) return '';

    const relPath = match[1]; // e.g. 2026/11/filename.png
    const targetFile = path.join(UPLOADS_DIR, ...relPath.split('/'));
    const targetDir = path.dirname(targetFile);

    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 0) {
      // Already downloaded
      return `/uploads/${relPath}`;
    }

    fs.mkdirSync(targetDir, { recursive: true });

    const res = await fetch(cleanUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SuperKingsDen/2.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`Failed to download ${cleanUrl}: HTTP ${res.status}`);
      return `/uploads/${relPath}`;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(targetFile, buffer);
    console.log(`Saved image: ${relPath} (${buffer.length} bytes)`);
    return `/uploads/${relPath}`;
  } catch (err) {
    console.warn(`Error downloading image ${url}:`, err.message);
    const m = url.match(/\/wp-content\/uploads\/(.+)$/);
    return m ? `/uploads/${m[1].split('?')[0]}` : '';
  }
}

// Determine category & franchise from WP categories array
const CATEGORY_MAP = {
  634: { name: 'CSK News', franchise: 'CSK' },
  636: { name: 'JSK News', franchise: 'JSK' },
  635: { name: 'TSK News', franchise: 'TSK' },
  108: { name: 'IPL', franchise: 'CSK' },
  659: { name: 'IPL 2024', franchise: 'CSK' },
  658: { name: 'IPL 2025', franchise: 'CSK' },
  25: { name: 'SA 20 League', franchise: 'JSK' },
  664: { name: 'SA 20 League 2025', franchise: 'JSK' },
  665: { name: 'SA 20 League 2024', franchise: 'JSK' },
  754: { name: 'SA 20 League 2025-26', franchise: 'JSK' },
  2: { name: 'Major League Cricket', franchise: 'TSK' },
  661: { name: 'MLC 2023', franchise: 'TSK' },
  662: { name: 'MLC 2024', franchise: 'TSK' },
  663: { name: 'MLC 2025', franchise: 'TSK' },
  14: { name: 'News', franchise: 'CSK' },
  386: { name: 'Players Profile', franchise: 'CSK' },
  21: { name: 'Statistics', franchise: 'CSK' },
  10: { name: 'Features', franchise: 'CSK' },
  783: { name: 'Frequently Search', franchise: 'CSK' },
};

function resolveCategoryAndFranchise(catIds) {
  if (Array.isArray(catIds)) {
    // Priority order: JSK / TSK first if present
    for (const id of catIds) {
      if (CATEGORY_MAP[id] && (CATEGORY_MAP[id].franchise === 'JSK' || CATEGORY_MAP[id].franchise === 'TSK')) {
        return CATEGORY_MAP[id];
      }
    }
    // Then CSK specific
    for (const id of catIds) {
      if (CATEGORY_MAP[id]) {
        return CATEGORY_MAP[id];
      }
    }
  }
  return { name: 'CSK News', franchise: 'CSK' };
}

async function syncAll() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const postsCollection = db.collection('posts');

  // Load existing posts from DB
  const existingDocs = await postsCollection.find({}).project({ id: 1, slug: 1, modified: 1 }).toArray();
  const existingById = new Map();
  const existingBySlug = new Map();
  for (const doc of existingDocs) {
    if (doc.id) existingById.set(Number(doc.id), doc);
    if (doc.slug) existingBySlug.set(doc.slug, doc);
  }
  console.log(`Current DB posts count: ${existingDocs.length}`);

  // Fetch WP posts
  let page = 1;
  const allWpPosts = [];
  while (true) {
    console.log(`Fetching WP posts page ${page}...`);
    const res = await fetch(`https://superkingsden.com/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SuperKingsDen/2.0' },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.log(`Page ${page} returned status ${res.status}. Finished fetching.`);
      break;
    }

    const posts = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) break;
    allWpPosts.push(...posts);
    console.log(`Received ${posts.length} posts from page ${page}. Total fetched so far: ${allWpPosts.length}`);

    let consecutiveOld = 0;
    for (const p of posts) {
      const match = existingById.get(p.id) || existingBySlug.get(p.slug);
      if (match && match.modified === p.modified) {
        consecutiveOld++;
      } else {
        consecutiveOld = 0;
      }
    }
    if (consecutiveOld >= 40) {
      console.log('Encountered 40 consecutive identical existing posts. Stopping fetch.');
      break;
    }

    page++;
    if (page > 10) break;
  }

  console.log(`\nTotal WP posts to process: ${allWpPosts.length}`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allWpPosts.length; i++) {
    const post = allWpPosts[i];
    const existing = existingById.get(post.id) || existingBySlug.get(post.slug);

    if (existing && existing.modified === post.modified && existing.featuredImage) {
      skippedCount++;
      continue;
    }

    const cleanTitle = decodeHtmlEntities(post.title?.rendered || '');
    const slug = post.slug;
    const cleanExcerpt = decodeHtmlEntities((post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim());
    const rawContent = post.content?.rendered || '';

    // Download featured image
    let featuredImage = '';
    const featMedia = post._embedded?.['wp:featuredmedia']?.[0];
    if (featMedia?.source_url) {
      featuredImage = await downloadImage(featMedia.source_url);

      const sizes = featMedia.media_details?.sizes || {};
      for (const s of ['medium', 'thumbnail']) {
        if (sizes[s]?.source_url) {
          await downloadImage(sizes[s].source_url);
        }
      }
    }

    // Download any embedded content images
    const contentImageMatches = rawContent.match(/https?:\/\/superkingsden\.com\/wp-content\/uploads\/[^\s"'<>)]+/g) || [];
    for (const imgUrl of contentImageMatches) {
      await downloadImage(imgUrl);
    }

    // Rewrite content image URLs to local /uploads/
    const cleanContent = rawContent
      .replace(/https?:\/\/superkingsden\.com\/wp-content\/uploads\//g, '/uploads/')
      .replace(/href=["']https?:\/\/superkingsden\.com\/([^"']*)["']/g, 'href="/$1"');

    const catInfo = resolveCategoryAndFranchise(post.categories);
    const dateFormatted = formatDate(post.date);
    const publishedAt = new Date(post.date_gmt || post.date);
    const readingTime = calculateReadingTime(cleanContent);

    // Yoast SEO / Meta
    const yoast = post.yoast_head_json || {};
    const seoTitle = yoast.title ? decodeHtmlEntities(yoast.title) : `${cleanTitle} | Super Kings Den`;
    const metaDescription = yoast.description ? decodeHtmlEntities(yoast.description) : cleanExcerpt;
    const ogTitle = yoast.og_title ? decodeHtmlEntities(yoast.og_title) : seoTitle;
    const ogDescription = yoast.og_description ? decodeHtmlEntities(yoast.og_description) : metaDescription;

    const postDoc = {
      id: post.id,
      slug,
      title: cleanTitle,
      content: cleanContent,
      excerpt: cleanExcerpt,
      category: catInfo.name,
      franchise: catInfo.franchise,
      author: 'Super Kings Den Team',
      date: dateFormatted,
      publishedAt,
      modified: post.modified || new Date().toISOString(),
      readingTime,
      views: '1.2K',
      viewCount: 1200,
      featuredImage,
      remoteImage: '',
      canonicalUrl: `https://superkingsden.com/${slug}/`,
      seoTitle,
      metaDescription,
      focusKeywords: `${catInfo.franchise}, ${cleanTitle}`,
      robots: 'index, follow',
      ogTitle,
      ogDescription,
      ogImage: featuredImage,
      schemaType: 'NewsArticle',
      customSchema: '',
      isPublished: true,
      isMostViewed: false,
      updatedAt: new Date(),
    };

    if (existing) {
      await postsCollection.updateOne(
        { _id: existing._id },
        { $set: postDoc }
      );
      updatedCount++;
      console.log(`[UPDATE] ${post.id}: ${cleanTitle}`);
    } else {
      postDoc.createdAt = new Date(post.date_gmt || post.date);
      await postsCollection.insertOne(postDoc);
      insertedCount++;
      console.log(`[INSERT] ${post.id}: ${cleanTitle}`);
    }
  }

  console.log(`\nSync Summary:`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (already identical): ${skippedCount}`);

  // Re-generate postsData.json and postsIndex.json from MongoDB
  console.log('\nRefreshing postsData.json & postsIndex.json from MongoDB...');
  const allDbPosts = await postsCollection
    .find({ isPublished: { $ne: false } })
    .sort({ publishedAt: -1, id: -1 })
    .toArray();

  const formattedPostsData = allDbPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content || '',
    excerpt: p.excerpt || '',
    category: p.category || 'CSK News',
    franchise: p.franchise || 'CSK',
    author: p.author || 'Super Kings Den Team',
    date: p.date,
    modified: p.modified || p.date,
    readingTime: p.readingTime || '3 min read',
    views: p.views || '1.2K',
    featuredImage: p.featuredImage || '',
    remoteImage: p.remoteImage || '',
    canonicalUrl: p.canonicalUrl || `https://superkingsden.com/${p.slug}/`,
    link: p.canonicalUrl || `https://superkingsden.com/${p.slug}/`,
    isMostViewed: Boolean(p.isMostViewed),
  }));

  const formattedPostsIndex = allDbPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category || 'CSK News',
    franchise: p.franchise || 'CSK',
    date: p.date,
    readingTime: p.readingTime || '3 min read',
    views: p.views || '1.2K',
    featuredImage: p.featuredImage || '',
    excerpt: p.excerpt || '',
    isMostViewed: Boolean(p.isMostViewed),
  }));

  fs.writeFileSync(POSTS_DATA_PATH, JSON.stringify(formattedPostsData, null, 2), 'utf8');
  fs.writeFileSync(POSTS_INDEX_PATH, JSON.stringify(formattedPostsIndex, null, 2), 'utf8');

  console.log(`Updated postsData.json: ${formattedPostsData.length} posts`);
  console.log(`Updated postsIndex.json: ${formattedPostsIndex.length} posts`);

  await mongoose.disconnect();
  console.log('MongoDB disconnected. Done!');
}

syncAll().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
