import postsIndex from '../data/postsIndex.json';
import categoriesData from '../data/categoriesData.json';
import webStoriesData from '../data/webStoriesData.json';

const BASE_URL = 'https://superkingsden.com';

export default async function sitemap() {
  // 1. Core Feature Routes
  const coreRoutes = [
    '',
    '/seasons',
    '/players',
    '/rivalries',
    '/stats',
    '/trophies',
    '/standings',
    '/news',
    '/csk-news',
    '/jsk-news',
    '/tsk-news',
    '/all-time-xi',
    '/quiz',
    '/web-stories',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.85,
  }));

  // 2. Company & Legal Information Routes
  const legalRoutes = [
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/terms-and-conditions',
    '/disclaimer',
    '/copyright-notice',
    '/cookies-policy',
    '/gdpr-compliance-statement',
    '/collaborate-with-us',
    '/team',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date('2026-02-01'),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // 3. Category Archive Routes
  const categoryRoutes = categoriesData.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  // 4. Web Stories Routes
  const webStoryRoutes = webStoriesData.map((story) => ({
    url: `${BASE_URL}/web-stories/${story.slug}`,
    lastModified: new Date(story.modified || story.date || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 5. All 814 Article URLs matching exact WordPress permalink structure
  const articleRoutes = postsIndex.map((post) => {
    let date = new Date();
    try {
      const parsedDate = new Date(post.date);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      }
    } catch (e) {}

    return {
      url: `${BASE_URL}/${post.slug}/`,
      lastModified: date,
      changeFrequency: 'weekly',
      priority: 0.9,
    };
  });

  return [
    ...coreRoutes,
    ...legalRoutes,
    ...categoryRoutes,
    ...webStoryRoutes,
    ...articleRoutes,
  ];
}


