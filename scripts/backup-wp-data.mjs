import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

async function fetchJson(url) {
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch ' + url + ': ' + res.status);
  }
  return res.json();
}

async function run() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Fetch All Static Pages
  console.log('--- 1. Fetching WP Pages ---');
  try {
    const rawPages = await fetchJson('https://superkingsden.com/wp-json/wp/v2/pages?per_page=100');
    const cleanedPages = rawPages.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title?.rendered || '',
      content: p.content?.rendered || '',
      excerpt: p.excerpt?.rendered || '',
      date: p.date,
      modified: p.modified,
      featuredMedia: p.featured_media,
      yoastHead: p.yoast_head || '',
      link: p.link
    }));
    fs.writeFileSync(path.join(DATA_DIR, 'pagesData.json'), JSON.stringify(cleanedPages, null, 2), 'utf8');
    console.log('Saved ' + cleanedPages.length + ' pages to pagesData.json');
  } catch (err) {
    console.error('Error fetching pages:', err.message);
  }

  // 2. Fetch All Categories
  console.log('--- 2. Fetching WP Categories ---');
  try {
    const rawCats = await fetchJson('https://superkingsden.com/wp-json/wp/v2/categories?per_page=100');
    const cleanedCats = rawCats.map(c => ({
      id: c.id,
      count: c.count,
      description: c.description,
      link: c.link,
      name: c.name,
      slug: c.slug,
      parent: c.parent
    }));
    fs.writeFileSync(path.join(DATA_DIR, 'categoriesData.json'), JSON.stringify(cleanedCats, null, 2), 'utf8');
    console.log('Saved ' + cleanedCats.length + ' categories to categoriesData.json');
  } catch (err) {
    console.error('Error fetching categories:', err.message);
  }

  // 3. Fetch All Web Stories
  console.log('--- 3. Fetching WP Web Stories ---');
  try {
    const rawStories = await fetchJson('https://superkingsden.com/wp-json/web-stories/v1/web-story?per_page=100');
    const cleanedStories = rawStories.map(s => ({
      id: s.id,
      slug: s.slug,
      title: s.title?.rendered || '',
      content: s.content?.rendered || '',
      excerpt: s.excerpt?.rendered || '',
      date: s.date,
      modified: s.modified,
      link: s.link,
      poster: s.story_poster?.url || '',
      colors: s.story_data?.colors || []
    }));
    fs.writeFileSync(path.join(DATA_DIR, 'webStoriesData.json'), JSON.stringify(cleanedStories, null, 2), 'utf8');
    console.log('Saved ' + cleanedStories.length + ' web stories to webStoriesData.json');
  } catch (err) {
    console.error('Error fetching web stories:', err.message);
  }

  // 4. Sync Missing Media Attachments
  console.log('--- 4. Syncing Media Attachments ---');
  const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
  let mediaPage = 1;
  let downloadedCount = 0;
  let skippedCount = 0;

  while (true) {
    console.log('Fetching media page ' + mediaPage + '...');
    try {
      const res = await fetch('https://superkingsden.com/wp-json/wp/v2/media?per_page=100&page=' + mediaPage);
      if (!res.ok) break;
      const items = await res.json();
      if (!items || items.length === 0) break;

      for (const item of items) {
        const sourceUrl = item.source_url;
        if (!sourceUrl || !sourceUrl.includes('/wp-content/uploads/')) continue;
        const relPath = sourceUrl.split('/wp-content/uploads/')[1];
        if (!relPath) continue;

        const localPath = path.join(UPLOADS_DIR, relPath.replace(/\//g, path.sep));
        if (fs.existsSync(localPath)) {
          skippedCount++;
        } else {
          try {
            const imgRes = await fetch(sourceUrl);
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              const dir = path.dirname(localPath);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
              downloadedCount++;
              console.log('Downloaded: ' + relPath);
            }
          } catch (e) {
            console.warn('Failed to download ' + relPath + ': ' + e.message);
          }
        }
      }

      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      if (mediaPage >= totalPages) break;
      mediaPage++;
    } catch (err) {
      console.error('Error on media page ' + mediaPage + ':', err.message);
      break;
    }
  }
  console.log('Media Sync: ' + downloadedCount + ' newly downloaded, ' + skippedCount + ' already existing.');

  console.log('Data backup completed successfully!');
}

run();
