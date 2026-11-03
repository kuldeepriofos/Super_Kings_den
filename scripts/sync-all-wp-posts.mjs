import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const POSTS_DATA_PATH = path.join(DATA_DIR, 'postsData.json');
const POSTS_INDEX_PATH = path.join(DATA_DIR, 'postsIndex.json');

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

function cleanExcerpt(str) {
  if (!str) return '';
  const text = str.replace(/<[^>]+>/g, '').replace(/\[&hellip;\]/g, '...').trim();
  return decodeHtmlEntities(text);
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function calculateReadingTime(contentHtml) {
  if (!contentHtml) return '3 min read';
  const text = contentHtml.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function detectFranchise(post, categoryName) {
  const title = (post.title?.rendered || '').toLowerCase();
  const slug = (post.slug || '').toLowerCase();
  const cat = (categoryName || '').toLowerCase();
  const tags = (post._embedded?.['wp:term']?.[1] || []).map(t => (t.name || '').toLowerCase());

  const isJSK = cat.includes('jsk') ||
                cat.includes('sa20') ||
                cat.includes('sa 20') ||
                title.includes('jsk') ||
                title.includes('joburg super kings') ||
                slug.includes('jsk') ||
                tags.some(t => t.includes('joburg') || t.includes('jsk') || t.includes('sa20'));

  const isTSK = cat.includes('tsk') ||
                cat.includes('mlc') ||
                cat.includes('major league cricket') ||
                title.includes('tsk') ||
                title.includes('texas super kings') ||
                slug.includes('tsk') ||
                tags.some(t => t.includes('texas') || t.includes('tsk') || t.includes('mlc'));

  if (isJSK) return 'JSK';
  if (isTSK) return 'TSK';
  return 'CSK';
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

function sanitizePostContent(html) {
  if (!html) return '';
  return html
    .replace(/<div[^>]*id=["']ez-toc-container["'][\s\S]*?<\/nav>\s*<\/div>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*ez-toc-container[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<span[^>]*class=["']ez-toc-[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/<p[^>]*>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<table[\s\S]*?<\/table>/gi, match => sortTableDescending(match))
    .trim();
}

async function downloadImageIfMissing(sourceUrl) {
  if (!sourceUrl || !sourceUrl.includes('/wp-content/uploads/')) {
    return sourceUrl;
  }

  const relPath = sourceUrl.split('/wp-content/uploads/')[1];
  if (!relPath) return sourceUrl;

  const localFile = path.join(UPLOADS_DIR, relPath.replace(/\//g, path.sep));
  const publicPath = `/uploads/${relPath.replace(/\\/g, '/')}`;

  if (fs.existsSync(localFile)) {
    return publicPath;
  }

  try {
    const res = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const dir = path.dirname(localFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(localFile, buffer);
      console.log(`  Downloaded image: ${relPath}`);
      return publicPath;
    }
  } catch (err) {
    console.warn(`  Warning: failed to download image ${sourceUrl}: ${err.message}`);
  }

  return sourceUrl;
}

async function syncAllPosts() {
  console.log('=== Starting WordPress Post Sync ===');
  console.log(`Connecting to: https://superkingsden.com/wp-json/wp/v2/posts`);

  // Load existing posts
  let existingPostsData = [];
  if (fs.existsSync(POSTS_DATA_PATH)) {
    try {
      existingPostsData = JSON.parse(fs.readFileSync(POSTS_DATA_PATH, 'utf8'));
    } catch (e) {
      console.warn('Could not read existing postsData.json');
    }
  }
  const existingMap = new Map(existingPostsData.map(p => [p.slug, p]));
  console.log(`Currently stored locally: ${existingPostsData.length} posts.`);

  // 1. Fetch all posts page by page
  let page = 1;
  const allWpPosts = [];

  while (true) {
    console.log(`Fetching WP posts page ${page}...`);
    const url = `https://superkingsden.com/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=true`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          // Reached beyond last page
          break;
        }
        throw new Error(`HTTP error ${res.status}`);
      }

      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) break;

      allWpPosts.push(...posts);
      console.log(`  Page ${page}: got ${posts.length} posts (Total fetched so far: ${allWpPosts.length})`);

      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      if (page >= totalPages) break;
      page++;
    } catch (err) {
      console.error(`Error on page ${page}:`, err.message);
      break;
    }
  }

  console.log(`\nSuccessfully fetched ${allWpPosts.length} posts from WordPress REST API.`);

  // 2. Process each post, detect new vs updated
  const newlyAdded = [];
  const updatedExisting = [];
  const processedDataMap = new Map();

  for (const p of allWpPosts) {
    if (!p.slug) continue;

    // Filter out accidental drafts without title like '10238-2' if title is empty
    const rawTitle = p.title?.rendered || '';
    if (!rawTitle.trim() && p.slug.startsWith('10238')) {
      console.log(`Skipping empty draft post: ${p.slug}`);
      continue;
    }

    const cleanTitle = decodeHtmlEntities(rawTitle);
    const cleanContent = sanitizePostContent(p.content?.rendered || '');
    const excerpt = cleanExcerpt(p.excerpt?.rendered);
    const dateFormatted = formatDate(p.date);
    const readingTime = calculateReadingTime(cleanContent);

    // Categories: preserve existing curated category if present
    const existing = existingMap.get(p.slug);
    const catTerms = p._embedded?.['wp:term']?.[0] || [];
    let category = existing?.category || catTerms[0]?.name || 'CSK News';
    let franchise = existing?.franchise || detectFranchise(p, category);

    // Author
    const authorName = p.yoast_head_json?.author ||
                       p.yoast_head_json?.schema?.['@graph']?.find(g => g['@type'] === 'Person')?.name ||
                       'Super Kings Den Staff';

    // Featured Image
    const media = p._embedded?.['wp:featuredmedia']?.[0];
    const sourceUrl = media?.source_url ||
                      p.yoast_head_json?.og_image?.[0]?.url ||
                      'https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg';

    // Download image if new
    const localImageUrl = await downloadImageIfMissing(sourceUrl);

    const postObj = {
      id: p.id,
      slug: p.slug,
      title: cleanTitle,
      content: cleanContent,
      excerpt: excerpt,
      category: category,
      franchise: franchise,
      author: authorName,
      date: dateFormatted,
      readingTime: readingTime,
      views: '', // No dummy view counts
      featuredImage: localImageUrl,
      remoteImage: sourceUrl,
      canonicalUrl: `https://superkingsden.com/${p.slug}/`,
      modified: p.modified || p.date
    };

    if (!existing) {
      newlyAdded.push(postObj);
    } else {
      // Check if modified or needs content update
      if (p.modified && p.modified !== existing.modified) {
        updatedExisting.push(postObj);
      }
    }

    processedDataMap.set(p.slug, postObj);
  }

  // Also retain any existing historical local posts if they weren't in current WP query
  for (const oldPost of existingPostsData) {
    if (!processedDataMap.has(oldPost.slug)) {
      processedDataMap.set(oldPost.slug, oldPost);
    }
  }

  // Convert to array and sort chronologically (newest first)
  const finalPostsData = Array.from(processedDataMap.values()).sort((a, b) => {
    const timeB = new Date(b.date || 0).getTime();
    const timeA = new Date(a.date || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });

  // Create lightweight index (without full HTML content) for instant home & listing rendering
  const finalPostsIndex = finalPostsData.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    franchise: p.franchise,
    author: p.author,
    date: p.date,
    readingTime: p.readingTime,
    views: '',
    featuredImage: p.featuredImage,
    remoteImage: p.remoteImage
  }));

  // Save postsData.json
  fs.writeFileSync(POSTS_DATA_PATH, JSON.stringify(finalPostsData, null, 2), 'utf8');
  console.log(`Saved ${finalPostsData.length} full posts to ${POSTS_DATA_PATH}`);

  // Save postsIndex.json
  fs.writeFileSync(POSTS_INDEX_PATH, JSON.stringify(finalPostsIndex, null, 2), 'utf8');
  console.log(`Saved ${finalPostsIndex.length} indexed posts to ${POSTS_INDEX_PATH}`);

  console.log(`\n=== SYNC SUMMARY ===`);
  console.log(`- Newly Added Posts: ${newlyAdded.length}`);
  if (newlyAdded.length > 0) {
    newlyAdded.forEach((p, idx) => console.log(`  ${idx + 1}. [${p.date}] ${p.title} (${p.slug})`));
  }
  console.log(`- Updated Posts: ${updatedExisting.length}`);
  if (updatedExisting.length > 0) {
    console.log(`  Sample updated: ${updatedExisting.slice(0, 5).map(p => p.slug).join(', ')}`);
  }
  console.log(`- Final Total Posts: ${finalPostsData.length} (up from ${existingPostsData.length})`);
  console.log(`=== SYNC COMPLETE ===`);
}

syncAllPosts().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
