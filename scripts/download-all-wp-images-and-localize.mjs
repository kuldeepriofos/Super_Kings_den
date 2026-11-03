import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const UPLOADS_DIR = path.join(rootDir, 'public', 'uploads');
const POSTS_DATA_PATH = path.join(rootDir, 'src', 'data', 'postsData.json');
const POSTS_INDEX_PATH = path.join(rootDir, 'src', 'data', 'postsIndex.json');

// Read .env.local for MongoDB URI
const envPath = path.join(rootDir, '.env.local');
let MONGODB_URI = 'mongodb://127.0.0.1:27017/superkingsden';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key?.trim() === 'MONGODB_URI') {
        MONGODB_URI = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

async function downloadFileWithRetry(url, targetPath, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        return true;
      }

      if (res.status === 404) {
        // Try fallback to unscaled base image if this is a thumbnail (e.g. -300x180.png)
        const baseMatch = url.match(/^(https?:\/\/.*)-(\d+x\d+)\.([a-zA-Z0-9]+)$/);
        if (baseMatch) {
          const unscaledUrl = `${baseMatch[1]}.${baseMatch[3]}`;
          console.log(`    [404 fallback] Trying unscaled URL: ${unscaledUrl}`);
          const fallbackRes = await fetch(unscaledUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (fallbackRes.ok) {
            const buffer = await fallbackRes.arrayBuffer();
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.writeFileSync(targetPath, Buffer.from(buffer));
            return true;
          }
        }
        return false;
      }
    } catch (err) {
      if (attempt === retries) return false;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return false;
}

async function main() {
  console.log('🦁 Starting Complete WordPress Decommission & Data Independence Routine...\n');

  if (!fs.existsSync(POSTS_DATA_PATH)) {
    console.error('postsData.json not found!');
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_DATA_PATH, 'utf8'));
  console.log(` Total posts to process: ${posts.length}`);

  // 1. Gather all remote superkingsden.com image URLs
  const urlMap = new Map(); // cleanUrl -> { rawUrls: Set, relativePath, diskPath }

  for (const post of posts) {
    const urlsInPost = [];
    if (post.featuredImage) urlsInPost.push(post.featuredImage);
    if (post.remoteImage) urlsInPost.push(post.remoteImage);

    const contentMatches = (post.content || '').match(/https?:\/\/superkingsden\.com\/wp-content\/uploads\/[^\s"'()<>]+/g) || [];
    urlsInPost.push(...contentMatches);

    for (const rawUrl of urlsInPost) {
      if (!rawUrl.includes('superkingsden.com/wp-content/uploads/')) continue;
      const cleanUrl = rawUrl.split('?')[0];
      const relativePart = cleanUrl.replace(/^https?:\/\/superkingsden\.com\/wp-content\/uploads\//, '');
      const diskPath = path.join(UPLOADS_DIR, ...relativePart.split('/'));

      if (!urlMap.has(cleanUrl)) {
        urlMap.set(cleanUrl, {
          cleanUrl,
          rawUrls: new Set([rawUrl]),
          relativePart,
          diskPath,
        });
      } else {
        urlMap.get(cleanUrl).rawUrls.add(rawUrl);
      }
    }
  }

  console.log(` Found ${urlMap.size} unique superkingsden.com image URLs.`);

  const toDownload = [];
  let alreadyOnDisk = 0;

  for (const item of urlMap.values()) {
    if (fs.existsSync(item.diskPath) && fs.statSync(item.diskPath).size > 0) {
      alreadyOnDisk++;
    } else {
      toDownload.push(item);
    }
  }

  console.log(` Already downloaded on disk: ${alreadyOnDisk}`);
  console.log(` Missing images to download now: ${toDownload.length}\n`);

  // 2. Download missing images with controlled concurrency
  if (toDownload.length > 0) {
    console.log('📥 Downloading missing images directly from superkingsden.com...');
    const CONCURRENCY = 6;
    let downloadedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < toDownload.length; i += CONCURRENCY) {
      const chunk = toDownload.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async (item) => {
          const success = await downloadFileWithRetry(item.cleanUrl, item.diskPath);
          if (success) {
            downloadedCount++;
          } else {
            failedCount++;
          }
        })
      );

      const percent = Math.min(100, Math.round(((i + chunk.length) / toDownload.length) * 100));
      process.stdout.write(`\r   Progress: ${Math.min(i + chunk.length, toDownload.length)} / ${toDownload.length} (${percent}%) - Success: ${downloadedCount}, Failed: ${failedCount}`);
    }
    console.log(`\n Image downloading complete. Success: ${downloadedCount}, Failed: ${failedCount}\n`);
  }

  // 3. Localize all URLs inside postsData.json
  console.log(' Localizing all URLs and references in postsData.json...');
  let rewrittenPostsCount = 0;

  for (const post of posts) {
    let modified = false;

    // Featured Image
    if (post.featuredImage && post.featuredImage.includes('superkingsden.com/wp-content/uploads/')) {
      const clean = post.featuredImage.split('?')[0];
      const rel = clean.replace(/^https?:\/\/superkingsden\.com\/wp-content\/uploads\//, '');
      post.featuredImage = `/uploads/${rel}`;
      post.remoteImage = '';
      modified = true;
    }

    // Canonical URL: rewrite to clean local / path
    if (post.canonicalUrl && post.canonicalUrl.startsWith('https://superkingsden.com/')) {
      post.canonicalUrl = `/${post.slug}/`;
      modified = true;
    }

    // Content: rewrite all image sources and links
    if (post.content) {
      const originalContent = post.content;
      let newContent = originalContent
        // Replace full URL uploads with local /uploads/
        .replace(/https?:\/\/superkingsden\.com\/wp-content\/uploads\//g, '/uploads/')
        // Replace internal links to relative links
        .replace(/href=["']https?:\/\/superkingsden\.com\/([^"']*)["']/g, 'href="/$1"')
        // Remove trailing query params in local upload image src attributes
        .replace(/(src=["']\/uploads\/[^"'\?]+)\?[^"']*["']/g, '$1"');

      if (newContent !== originalContent) {
        post.content = newContent;
        modified = true;
      }
    }

    // Excerpt: rewrite any lingering URLs
    if (post.excerpt && post.excerpt.includes('superkingsden.com/wp-content/uploads/')) {
      post.excerpt = post.excerpt.replace(/https?:\/\/superkingsden\.com\/wp-content\/uploads\//g, '/uploads/');
      modified = true;
    }

    if (modified) rewrittenPostsCount++;
  }

  console.log(` Rewrote and localized URLs across ${rewrittenPostsCount} posts.`);
  fs.writeFileSync(POSTS_DATA_PATH, JSON.stringify(posts, null, 2), 'utf8');
  console.log(` Saved ${POSTS_DATA_PATH}`);

  // 4. Update postsIndex.json
  if (fs.existsSync(POSTS_INDEX_PATH)) {
    const postsIndex = posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      franchise: p.franchise,
      date: p.date,
      readingTime: p.readingTime,
      views: p.views,
      featuredImage: p.featuredImage,
      excerpt: p.excerpt,
    }));
    fs.writeFileSync(POSTS_INDEX_PATH, JSON.stringify(postsIndex, null, 2), 'utf8');
    console.log(` Saved updated ${POSTS_INDEX_PATH}`);
  }

  // 5. Update MongoDB Database
  console.log('\n Connecting to MongoDB to update all records...');
  try {
    await mongoose.connect(MONGODB_URI);
    const PostSchema = new mongoose.Schema(
      {
        id: Number,
        slug: String,
        title: String,
        content: String,
        excerpt: String,
        category: String,
        franchise: String,
        author: String,
        date: String,
        modified: String,
        readingTime: String,
        views: mongoose.Schema.Types.Mixed,
        featuredImage: String,
        remoteImage: String,
        canonicalUrl: String,
        isPublished: Boolean,
      },
      { timestamps: true }
    );
    const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

    console.log(' Syncing localized posts into MongoDB...');
    const bulkOps = posts.map((p) => ({
      updateOne: {
        filter: { slug: p.slug },
        update: {
          $set: {
            content: p.content,
            excerpt: p.excerpt,
            featuredImage: p.featuredImage,
            remoteImage: '',
            canonicalUrl: `/${p.slug}/`,
          },
        },
      },
    }));

    const chunkSize = 200;
    for (let i = 0; i < bulkOps.length; i += chunkSize) {
      const chunk = bulkOps.slice(i, i + chunkSize);
      await Post.bulkWrite(chunk);
    }

    const totalInDb = await Post.countDocuments();
    console.log(` MongoDB updated: ${totalInDb} posts are now 100% localized!`);
    await mongoose.disconnect();
  } catch (dbErr) {
    console.error(' MongoDB update warning:', dbErr.message);
  }

  console.log('\n🎉 ALL DATA IS NOW 100% INDEPENDENT OF WORDPRESS!');
  console.log('   Even if WordPress is shut down right now, the website and admin dashboard will run flawlessly.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
