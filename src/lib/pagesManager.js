import fs from 'fs';
import path from 'path';
import connectToDatabase from './mongodb.js';
import Page from '../models/Page.js';
import Redirect from '../models/Redirect.js';
import { syncRedirectsJson } from './redirects.js';

const SEO_CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'staticPagesSeo.json');
const PAGES_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'pagesData.json');

export const CORE_STATIC_ROUTES = [
  {
    id: 'core-home',
    slug: 'home',
    title: 'Home',
    pageType: 'core_route',
    routePath: '/',
    seoTitle: 'Super Kings Den - Official Fan Portal | CSK, JSK & TSK News, Squads & Highlights',
    metaDescription: 'The premier independent fan destination celebrating Chennai Super Kings (IPL), Joburg Super Kings (SA20) & Texas Super Kings (MLC). News, stats, schedules & analysis.',
    canonicalUrl: 'https://superkingsden.com/',
    focusKeywords: 'CSK, Chennai Super Kings, JSK, TSK, IPL 2026, MS Dhoni, Whistle Podu',
    robots: 'index, follow',
    ogTitle: 'Super Kings Den - Official Fan Portal | CSK, JSK & TSK',
    ogDescription: 'Latest Chennai Super Kings, Joburg Super Kings & Texas Super Kings news, match analysis, player stats, and Chepauk chronicles.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-csk-trophies',
    slug: 'csk-trophies',
    title: 'Championship Trophies',
    pageType: 'core_route',
    routePath: '/csk-trophies',
    seoTitle: 'CSK Championship Trophies By Year | 7 Silverware Crowns | Super Kings Den',
    metaDescription: 'Explore CSK Championship Trophies By Year: all 5 IPL Championships (2010, 2011, 2018, 2021, 2023) and 2 Champions League T20 titles won by MS Dhoni and Chennai Super Kings.',
    canonicalUrl: 'https://superkingsden.com/csk-trophies/',
    focusKeywords: 'CSK trophies, how many trophies has CSK won, CSK IPL champions by year',
    robots: 'index, follow',
    ogTitle: 'CSK Championship Trophies By Year | Super Kings Den',
    ogDescription: 'A tribute to the golden dynasty: 5 IPL Trophies + 2 CLT20 Titles by year with match summaries and scorecards.',
    ogImage: '/ipl-trophy-gold.jpg',
  },
  {
    id: 'core-csk-team',
    slug: 'csk-team',
    title: 'CSK Team 2026',
    pageType: 'core_route',
    routePath: '/csk-team',
    seoTitle: 'CSK Team 2026 — Official Chennai Super Kings Player Squad | Super Kings Den',
    metaDescription: 'Complete Chennai Super Kings (CSK) 2026 player squad roster: Ruturaj Gaikwad (C), MS Dhoni, Sanju Samson, Ayush Mhatre, Shivam Dube, Khaleel Ahmed, and all domestic & overseas stars.',
    canonicalUrl: 'https://superkingsden.com/csk-team/',
    focusKeywords: 'CSK team 2026, Chennai Super Kings squad, CSK players, Ruturaj Gaikwad, MS Dhoni',
    robots: 'index, follow',
    ogTitle: 'CSK Team 2026 — Official Player Squad | Super Kings Den',
    ogDescription: 'Explore the full 29-member Chennai Super Kings 2026 squad, roles, statistics, specialties, and jersey numbers.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-jsk-team',
    slug: 'jsk-team',
    title: 'JSK Team 2026',
    pageType: 'core_route',
    routePath: '/jsk-team',
    seoTitle: 'JSK Team 2026 — Official Joburg Super Kings Player Squad | Super Kings Den',
    metaDescription: 'Complete Joburg Super Kings (JSK) 2026 player squad roster: Faf du Plessis (C), Devon Conway, Dian Forrester, Dewald Brevis, Lizaad Williams, Gerald Coetzee, and all South African & overseas stars.',
    canonicalUrl: 'https://superkingsden.com/jsk-team/',
    focusKeywords: 'JSK team 2026, Joburg Super Kings squad, JSK players, SA20 2026, Faf du Plessis',
    robots: 'index, follow',
    ogTitle: 'JSK Team 2026 — Official Player Squad | Super Kings Den',
    ogDescription: 'Explore the full 15-member Joburg Super Kings 2026 squad, roles, statistics, specialties, and jersey numbers.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-tsk-team',
    slug: 'tsk-team',
    title: 'TSK Team 2026',
    pageType: 'core_route',
    routePath: '/tsk-team',
    seoTitle: 'TSK Team 2026 — Official Texas Super Kings Player Squad | Super Kings Den',
    metaDescription: 'Complete Texas Super Kings (TSK) 2026 player squad roster: Faf du Plessis (C), Devon Conway, Noor Ahmad, Akeal Hosein, Marcus Stoinis, Dwayne Bravo, and all USA & international stars.',
    canonicalUrl: 'https://superkingsden.com/tsk-team/',
    focusKeywords: 'TSK team 2026, Texas Super Kings squad, TSK players, MLC 2026, Faf du Plessis',
    robots: 'index, follow',
    ogTitle: 'TSK Team 2026 — Official Player Squad | Super Kings Den',
    ogDescription: 'Explore the full 15-member Texas Super Kings 2026 squad, roles, statistics, specialties, and jersey numbers.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-csk-news',
    slug: 'csk-news',
    title: 'CSK News & Updates',
    pageType: 'core_route',
    routePath: '/csk-news',
    seoTitle: 'CSK News, Match Previews & WhistlePodu Updates | Super Kings Den',
    metaDescription: 'Latest Chennai Super Kings news, match previews, injury updates, press conferences, tactical analysis, and Chepauk chronicles.',
    canonicalUrl: 'https://superkingsden.com/csk-news/',
    focusKeywords: 'CSK news, Chennai Super Kings news today, IPL news',
    robots: 'index, follow',
    ogTitle: 'CSK News & Match Previews | Super Kings Den',
    ogDescription: 'Breaking news, match analysis, and exclusive insights from the Chennai Super Kings camp.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-quiz',
    slug: 'quiz',
    title: 'Fan Quiz & Trivia',
    pageType: 'core_route',
    routePath: '/quiz',
    seoTitle: 'Super Kings Fan Quiz & Trivia Challenge | Test Your Yellove Knowledge',
    metaDescription: 'Test your CSK knowledge with our interactive cricket fan quiz. Answer questions about MS Dhoni, IPL championships, and historic matches.',
    canonicalUrl: 'https://superkingsden.com/quiz/',
    focusKeywords: 'CSK quiz, Chennai Super Kings trivia, IPL quiz',
    robots: 'index, follow',
    ogTitle: 'Super Kings Fan Quiz Challenge | Super Kings Den',
    ogDescription: 'Are you a true WhistlePodu warrior? Take the CSK fan trivia challenge now.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-csk-fixtures',
    slug: 'csk-fixtures',
    title: 'CSK Fixtures & Match Results',
    pageType: 'core_route',
    routePath: '/csk-fixtures',
    seoTitle: 'CSK Fixtures & Match Results 2026 | Chennai Super Kings Schedules',
    metaDescription: 'Official Chennai Super Kings (CSK) IPL 2026 match schedule, live countdown timer, recent match results, historical match archive, and most runs & most wickets leaderboards.',
    canonicalUrl: 'https://superkingsden.com/csk-fixtures/',
    focusKeywords: 'CSK fixtures, Chennai Super Kings schedule, CSK match results, IPL 2026',
    robots: 'index, follow',
    ogTitle: 'CSK Fixtures & Match Results 2026 | Super Kings Den',
    ogDescription: 'Follow Chennai Super Kings schedule, match center, past match archives, and leaderboards.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-jsk-fixtures',
    slug: 'jsk-fixtures',
    title: 'JSK Fixtures & Match Results',
    pageType: 'core_route',
    routePath: '/jsk-fixtures',
    seoTitle: 'JSK Fixtures & Match Results 2026 | Joburg Super Kings Schedules',
    metaDescription: 'Official Joburg Super Kings (JSK) SA20 2026 match schedule, Wanderers live countdown timer, recent match results, historical match archive, and most runs & most wickets leaderboards.',
    canonicalUrl: 'https://superkingsden.com/jsk-fixtures/',
    focusKeywords: 'JSK fixtures, Joburg Super Kings schedule, JSK match results, SA20 2026',
    robots: 'index, follow',
    ogTitle: 'JSK Fixtures & Match Results 2026 | Super Kings Den',
    ogDescription: 'Follow Joburg Super Kings schedule, Wanderers match center, past match archives, and leaderboards.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-tsk-fixtures',
    slug: 'tsk-fixtures',
    title: 'TSK Fixtures & Match Results',
    pageType: 'core_route',
    routePath: '/tsk-fixtures',
    seoTitle: 'TSK Fixtures & Match Results 2026 | Texas Super Kings Schedules',
    metaDescription: 'Official Texas Super Kings (TSK) Major League Cricket (MLC) 2026 match schedule, Grand Prairie live countdown, match results, historical archive, and most runs & most wickets leaderboards.',
    canonicalUrl: 'https://superkingsden.com/tsk-fixtures/',
    focusKeywords: 'TSK fixtures, Texas Super Kings schedule, TSK match results, MLC 2026',
    robots: 'index, follow',
    ogTitle: 'TSK Fixtures & Match Results 2026 | Super Kings Den',
    ogDescription: 'Follow Texas Super Kings schedule, Grand Prairie match center, past match archives, and leaderboards.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-chennai-super-kings',
    slug: 'chennai-super-kings',
    title: 'Chennai Super Kings (CSK) Hub',
    pageType: 'core_route',
    routePath: '/chennai-super-kings',
    seoTitle: 'Chennai Super Kings (CSK) — Official IPL Franchise Hub | Super Kings Den',
    metaDescription: 'Official Chennai Super Kings franchise hub. Explore CSK news, 5 IPL championships and CLT20 trophies, active current squad players, and championship coaching staff.',
    canonicalUrl: 'https://superkingsden.com/chennai-super-kings/',
    focusKeywords: 'Chennai Super Kings, CSK hub, CSK franchise, MS Dhoni, Ruturaj Gaikwad',
    robots: 'index, follow',
    ogTitle: 'Chennai Super Kings (CSK) — Official IPL Franchise Hub | Super Kings Den',
    ogDescription: 'Explore CSK news updates, 7 trophies timeline, active player squad, and Stephen Fleming coaching staff.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-joburg-super-kings',
    slug: 'joburg-super-kings',
    title: 'Joburg Super Kings (JSK) Hub',
    pageType: 'core_route',
    routePath: '/joburg-super-kings',
    seoTitle: 'Joburg Super Kings (JSK) — Official SA20 Franchise Hub | Super Kings Den',
    metaDescription: 'Official Joburg Super Kings franchise hub. Explore JSK news, active squad stars, Bullring fortress records, and Stephen Fleming coaching staff.',
    canonicalUrl: 'https://superkingsden.com/joburg-super-kings/',
    focusKeywords: 'Joburg Super Kings, JSK hub, SA20, Faf du Plessis, Wanderers Stadium',
    robots: 'index, follow',
    ogTitle: 'Joburg Super Kings (JSK) — Official SA20 Franchise Hub | Super Kings Den',
    ogDescription: 'Explore JSK news updates, Wanderers stadium milestones, active squad roster, and coaching think tank.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-texas-super-kings',
    slug: 'texas-super-kings',
    title: 'Texas Super Kings (TSK) Hub',
    pageType: 'core_route',
    routePath: '/texas-super-kings',
    seoTitle: 'Texas Super Kings (TSK) — Official MLC Franchise Hub | Super Kings Den',
    metaDescription: 'Official Texas Super Kings franchise hub. Explore TSK news, active player squad, Grand Prairie stadium fortress, and Stephen Fleming coaching staff.',
    canonicalUrl: 'https://superkingsden.com/texas-super-kings/',
    focusKeywords: 'Texas Super Kings, TSK hub, MLC, Faf du Plessis, Grand Prairie Stadium',
    robots: 'index, follow',
    ogTitle: 'Texas Super Kings (TSK) — Official MLC Franchise Hub | Super Kings Den',
    ogDescription: 'Explore Texas Super Kings match schedules, Grand Prairie home fortress, active player squad, and Major League Cricket updates.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-jsk-news',
    slug: 'jsk-news',
    title: 'JSK News & Updates',
    pageType: 'core_route',
    routePath: '/jsk-news',
    seoTitle: 'Joburg Super Kings News, Match Previews & SA20 Updates | Super Kings Den',
    metaDescription: 'Latest Joburg Super Kings news, match previews, SA20 injury updates, press conferences, tactical analysis, and Wanderers chronicles.',
    canonicalUrl: 'https://superkingsden.com/jsk-news/',
    focusKeywords: 'JSK news, Joburg Super Kings news, SA20 news',
    robots: 'index, follow',
    ogTitle: 'JSK News & SA20 Match Previews | Super Kings Den',
    ogDescription: 'Breaking news, match analysis, and exclusive insights from the Joburg Super Kings camp in SA20.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
  {
    id: 'core-tsk-news',
    slug: 'tsk-news',
    title: 'TSK News & Updates',
    pageType: 'core_route',
    routePath: '/tsk-news',
    seoTitle: 'Texas Super Kings News, Match Previews & MLC Updates | Super Kings Den',
    metaDescription: 'Latest Texas Super Kings news, match previews, MLC injury updates, press conferences, tactical analysis, and Dallas chronicles.',
    canonicalUrl: 'https://superkingsden.com/tsk-news/',
    focusKeywords: 'TSK news, Texas Super Kings news, MLC news',
    robots: 'index, follow',
    ogTitle: 'TSK News & MLC Match Previews | Super Kings Den',
    ogDescription: 'Breaking news, match analysis, and exclusive insights from the Texas Super Kings camp in MLC.',
    ogImage: '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
  },
];

/**
 * Loads pages from pagesData.json safely.
 */
function getPagesDataJson() {
  try {
    if (fs.existsSync(PAGES_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(PAGES_DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('Failed to read pagesData.json:', err.message);
  }
  return [];
}

/**
 * Loads SEO cache map safely.
 */
export function getStaticPagesSeoCache() {
  try {
    if (fs.existsSync(SEO_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(SEO_CACHE_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('Failed to read staticPagesSeo.json:', err.message);
  }
  return {};
}

/**
 * Updates the local staticPagesSeo.json cache file.
 */
export function writeStaticPagesSeoCache(seoMap) {
  try {
    fs.writeFileSync(SEO_CACHE_FILE, JSON.stringify(seoMap, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write staticPagesSeo.json:', err.message);
  }
}

/**
 * Seeds default pages into MongoDB if empty, merging core routes and pagesData.json.
 */
export async function seedPagesIfEmpty() {
  await connectToDatabase();
  const count = await Page.countDocuments();
  if (count > 0) {
    return;
  }

  const rawPages = getPagesDataJson();
  const toInsert = [];
  const seoCache = {};

  // 1. Add Core System Routes
  for (const cr of CORE_STATIC_ROUTES) {
    toInsert.push({
      ...cr,
      isPublished: true,
      updatedBy: 'system',
    });
    seoCache[cr.slug] = {
      title: cr.title,
      slug: cr.slug,
      routePath: cr.routePath,
      seoTitle: cr.seoTitle,
      metaDescription: cr.metaDescription,
      canonicalUrl: cr.canonicalUrl,
      focusKeywords: cr.focusKeywords,
      robots: cr.robots,
      ogTitle: cr.ogTitle,
      ogDescription: cr.ogDescription,
      ogImage: cr.ogImage,
    };
    if (cr.routePath) {
      seoCache[cr.routePath] = seoCache[cr.slug];
    }
  }

  // 2. Add Content Pages from pagesData.json
  for (const p of rawPages) {
    const cleanSlug = String(p.slug || '').trim().toLowerCase();
    if (!cleanSlug || toInsert.some((x) => x.slug === cleanSlug)) continue;

    const pageTitle = typeof p.title === 'string' ? p.title : p.title?.rendered || cleanSlug;
    const rawContent = typeof p.content === 'string' ? p.content : p.content?.rendered || '';
    const rawExcerpt = typeof p.excerpt === 'string' ? p.excerpt : p.excerpt?.rendered || '';
    const cleanExcerpt = rawExcerpt.replace(/<[^>]+>/g, '').trim();

    const desc = cleanExcerpt.length > 160
      ? cleanExcerpt.slice(0, 157) + '...'
      : cleanExcerpt || `${pageTitle} — Official Super Kings Den policy and fan documentation.`;

    const pageDoc = {
      id: String(p.id || `page-${cleanSlug}`),
      slug: cleanSlug,
      title: pageTitle,
      pageType: 'content',
      routePath: `/${cleanSlug}`,
      content: rawContent,
      excerpt: cleanExcerpt,
      featuredMedia: p.featuredMedia || '',
      seoTitle: `${pageTitle} | Super Kings Den`,
      metaDescription: desc,
      canonicalUrl: `https://superkingsden.com/${cleanSlug}/`,
      focusKeywords: `${pageTitle}, CSK, Super Kings Den`,
      robots: 'index, follow',
      ogTitle: `${pageTitle} | Super Kings Den`,
      ogDescription: desc,
      ogImage: p.featuredMedia || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
      isPublished: true,
      updatedBy: 'system',
    };

    toInsert.push(pageDoc);
    seoCache[cleanSlug] = {
      title: pageDoc.title,
      slug: pageDoc.slug,
      routePath: pageDoc.routePath,
      seoTitle: pageDoc.seoTitle,
      metaDescription: pageDoc.metaDescription,
      canonicalUrl: pageDoc.canonicalUrl,
      focusKeywords: pageDoc.focusKeywords,
      robots: pageDoc.robots,
      ogTitle: pageDoc.ogTitle,
      ogDescription: pageDoc.ogDescription,
      ogImage: pageDoc.ogImage,
    };
    seoCache[`/${cleanSlug}`] = seoCache[cleanSlug];
  }

  if (toInsert.length > 0) {
    await Page.insertMany(toInsert);
  }

  writeStaticPagesSeoCache(seoCache);
}

/**
 * Re-synchronizes staticPagesSeo.json and pagesData.json from current MongoDB Page collection.
 */
export async function syncSeoCacheFromDatabase() {
  try {
    await connectToDatabase();
    const allPages = await Page.find({}).lean();
    if (!allPages || allPages.length === 0) return;

    const seoCache = {};
    const updatedPagesData = [];

    for (const page of allPages) {
      const entry = {
        id: page.id,
        slug: page.slug,
        title: page.title,
        pageType: page.pageType,
        routePath: page.routePath || `/${page.slug}`,
        seoTitle: page.seoTitle || page.title,
        metaDescription: page.metaDescription || '',
        canonicalUrl: page.canonicalUrl || `https://superkingsden.com/${page.slug}/`,
        focusKeywords: page.focusKeywords || '',
        robots: page.robots || 'index, follow',
        ogTitle: page.ogTitle || page.seoTitle || page.title,
        ogDescription: page.ogDescription || page.metaDescription || '',
        ogImage: page.ogImage || page.featuredMedia || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
        schemaType: page.schemaType || (page.slug === 'about-us' ? 'AboutPage' : page.slug === 'contact-us' ? 'ContactPage' : 'WebPage'),
        customSchema: page.customSchema || '',
      };

      if (page.isPublished !== false) {
        seoCache[page.slug] = entry;
        if (entry.routePath) {
          seoCache[entry.routePath] = entry;
        }
      }

      if (page.pageType === 'content') {
        updatedPagesData.push({
          id: page.id,
          slug: page.slug,
          title: page.title,
          content: page.content || '',
          excerpt: page.excerpt || '',
          featuredMedia: page.featuredMedia || '',
          link: `https://superkingsden.com/${page.slug}/`,
        });
      }
    }

    writeStaticPagesSeoCache(seoCache);

    if (updatedPagesData.length > 0) {
      try {
        fs.writeFileSync(PAGES_DATA_FILE, JSON.stringify(updatedPagesData, null, 2), 'utf8');
      } catch (e) {
        console.warn('Failed to update pagesData.json:', e.message);
      }
    }

    return seoCache;
  } catch (err) {
    console.warn('Error in syncSeoCacheFromDatabase:', err.message);
  }
}

/**
 * Retrieves SEO metadata for any static route or slug.
 * Instant lookup with local cache fallback.
 */
export function getStaticPageSeo(slugOrPath) {
  if (!slugOrPath) return null;
  const clean = String(slugOrPath).replace(/\/+$/, '').trim().toLowerCase();
  const withoutLeading = clean.startsWith('/') ? clean.slice(1) : clean;
  const withLeading = clean.startsWith('/') ? clean : `/${clean}`;

  const cache = getStaticPagesSeoCache();
  return cache[withoutLeading] || cache[withLeading] || cache[clean] || null;
}

/**
 * Handles Slug changes with automatic 301 Permanent Redirect.
 */
export async function handleSlugChangeRedirect(oldSlug, newSlug, username = 'admin') {
  if (!oldSlug || !newSlug || oldSlug.toLowerCase() === newSlug.toLowerCase()) {
    return;
  }

  const cleanOld = `/${oldSlug.replace(/^\/+|\/+$/g, '')}/`;
  const cleanNew = `/${newSlug.replace(/^\/+|\/+$/g, '')}/`;

  try {
    await connectToDatabase();

    // 1. Remove any rule redirecting FROM the new slug to prevent infinite loops
    await Redirect.deleteMany({ source: cleanNew });

    // 2. Update any existing redirect chained to the old slug destination
    await Redirect.updateMany(
      { destination: cleanOld },
      { $set: { destination: cleanNew } }
    );

    // 3. Upsert 301 permanent redirect from old slug to new slug
    await Redirect.findOneAndUpdate(
      { source: cleanOld },
      {
        source: cleanOld,
        destination: cleanNew,
        statusCode: 301,
        matchType: 'exact',
        isActive: true,
        description: `Auto-generated 301 redirect for slug change: ${oldSlug} -> ${newSlug}`,
        createdBy: username,
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 4. Re-sync redirectsData.json safely
    await syncRedirectsJson();
  } catch (err) {
    console.warn('Failed to create auto 301 redirect for slug change:', err.message);
  }
}

/**
 * Generates Next.js standard metadata for any core static route
 */
export function buildPageMetadata(slugOrPath, fallback = {}) {
  const seo = getStaticPageSeo(slugOrPath) || {};
  const title = seo.seoTitle || fallback.title || 'Super Kings Den - Official Fan Portal';
  const description = seo.metaDescription || fallback.description || '';
  const canonicalUrl = seo.canonicalUrl || fallback.canonical || `https://superkingsden.com${slugOrPath.startsWith('/') ? slugOrPath : '/' + slugOrPath}/`;
  const robots = seo.robots || fallback.robots || 'index, follow';
  const ogTitle = seo.ogTitle || fallback.ogTitle || title;
  const ogDescription = seo.ogDescription || fallback.ogDescription || description;
  const ogImage = seo.ogImage || fallback.ogImage || '/uploads/2026/06/Chennai-Super-Kings-2026.jpg';

  const fullImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `https://superkingsden.com${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  const finalTitle = title.includes('Super Kings Den') ? title : `${title} | Super Kings Den`;

  return {
    title: {
      absolute: finalTitle,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: 'Super Kings Den',
      locale: 'en_US',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      creator: '@superkingsden',
      images: [fullImageUrl],
    },
  };
}
