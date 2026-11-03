import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Post from '../../../../models/Post';
import { invalidatePostsCache } from '../../../../services/api';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sync back to postsData.json and postsIndex.json so static generation / fallback data stays updated
function syncPostsDataJson(updatedPost, action = 'upsert') {
  setImmediate(() => {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'postsData.json');
    if (fs.existsSync(filePath)) {
      const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (action === 'delete') {
        const filtered = posts.filter(
          (p) => p.slug !== updatedPost.slug && String(p.id) !== String(updatedPost.id)
        );
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
      } else {
        const idx = posts.findIndex(
          (p) => p.slug === updatedPost.slug || (updatedPost.id && String(p.id) === String(updatedPost.id))
        );

        const postObj = {
          id: updatedPost.id || (idx !== -1 ? posts[idx].id : Date.now()),
          slug: updatedPost.slug,
          title: updatedPost.title,
          content: updatedPost.content || '',
          excerpt: updatedPost.excerpt || '',
          category: updatedPost.category || 'CSK News',
          franchise: updatedPost.franchise || 'CSK',
          author: updatedPost.author || 'Super Kings Den Team',
          date: updatedPost.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          modified: new Date().toISOString(),
          readingTime: updatedPost.readingTime || '3 min read',
          views: updatedPost.views || '1.2K',
          isMostViewed: Boolean(updatedPost.isMostViewed),
          featuredImage: updatedPost.featuredImage || '',
          remoteImage: updatedPost.remoteImage || '',
          canonicalUrl: `https://superkingsden.com/${updatedPost.slug}/`,
        };

        if (idx !== -1) {
          posts[idx] = { ...posts[idx], ...postObj };
        } else {
          posts.unshift(postObj);
        }

        fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf8');
      }
    }

    // Also sync postsIndex.json
    const indexPath = path.join(process.cwd(), 'src', 'data', 'postsIndex.json');
    if (fs.existsSync(indexPath)) {
      const indexPosts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

      if (action === 'delete') {
        const filteredIndex = indexPosts.filter(
          (p) => p.slug !== updatedPost.slug && String(p.id) !== String(updatedPost.id)
        );
        fs.writeFileSync(indexPath, JSON.stringify(filteredIndex, null, 2), 'utf8');
      } else {
        const idx = indexPosts.findIndex(
          (p) => p.slug === updatedPost.slug || (updatedPost.id && String(p.id) === String(updatedPost.id))
        );

        const indexObj = {
          id: updatedPost.id || (idx !== -1 ? indexPosts[idx].id : Date.now()),
          slug: updatedPost.slug,
          title: updatedPost.title,
          category: updatedPost.category || 'CSK News',
          franchise: updatedPost.franchise || 'CSK',
          date: updatedPost.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readingTime: updatedPost.readingTime || '3 min read',
          views: updatedPost.views || '',
          featuredImage: updatedPost.featuredImage || '',
          excerpt: updatedPost.excerpt || '',
        };

        if (idx !== -1) {
          indexPosts[idx] = { ...indexPosts[idx], ...indexObj };
        } else {
          indexPosts.unshift(indexObj);
        }

        fs.writeFileSync(indexPath, JSON.stringify(indexPosts, null, 2), 'utf8');
      }
    }
    invalidatePostsCache();
    } catch (e) {
      console.warn('Failed to sync posts JSON files:', e.message);
    }
  });
}

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '15', 10)));
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const franchise = (searchParams.get('franchise') || '').trim();
    const sortBy = (searchParams.get('sortBy') || 'newest').trim();

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (franchise && franchise !== 'All') {
      filter.franchise = franchise;
    }

    let sortObj = { publishedAt: -1, id: -1 };
    if (sortBy === 'oldest') {
      sortObj = { publishedAt: 1, id: 1 };
    } else if (sortBy === 'title') {
      sortObj = { title: 1 };
    }

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Posts GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const {
      title,
      slug: customSlug,
      content = '',
      excerpt = '',
      category = 'CSK News',
      franchise = 'CSK',
      author = 'Super Kings Den Team',
      featuredImage = '',
      readingTime = '3 min read',
      isPublished = true,
      isMostViewed = false,
      seoTitle = '',
      metaDescription = '',
      focusKeywords = '',
      canonicalUrl = '',
      robots = 'index, follow',
      ogTitle = '',
      ogDescription = '',
      ogImage = '',
      schemaType = 'NewsArticle',
      customSchema = '',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    let finalSlug = slugify(customSlug || title);
    // Ensure slug uniqueness
    let existing = await Post.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newPost = await Post.create({
      id: Date.now(),
      slug: finalSlug,
      title: title.trim(),
      content,
      excerpt: excerpt || content.replace(/<[^>]+>/g, '').slice(0, 160) + '...',
      category,
      franchise,
      author,
      date: dateStr,
      publishedAt: now,
      modified: now.toISOString(),
      readingTime,
      views: '0',
      featuredImage,
      canonicalUrl: canonicalUrl || `https://superkingsden.com/${finalSlug}/`,
      seoTitle: seoTitle || title.trim(),
      metaDescription: metaDescription || (excerpt || content.replace(/<[^>]+>/g, '').slice(0, 160)),
      focusKeywords,
      robots,
      ogTitle: ogTitle || seoTitle || title.trim(),
      ogDescription: ogDescription || metaDescription || excerpt,
      ogImage: ogImage || featuredImage,
      schemaType: schemaType || 'NewsArticle',
      customSchema,
      isPublished: Boolean(isPublished),
      isMostViewed: Boolean(isMostViewed),
    });

    // Sync to file
    syncPostsDataJson(newPost);

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (err) {
    console.error('Post POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
