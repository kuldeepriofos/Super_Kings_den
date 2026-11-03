import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Post from '../../../../../models/Post';
import Redirect from '../../../../../models/Redirect';
import { handleSlugChangeRedirect } from '../../../../../lib/pagesManager';
import { invalidatePostsCache } from '../../../../../services/api';

function syncPostsDataJson(post, action = 'upsert', oldSlug = null) {
  setImmediate(() => {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'postsData.json');
    if (fs.existsSync(filePath)) {
      const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (action === 'delete') {
        const filtered = posts.filter(
          (p) =>
            p.slug !== post.slug &&
            (!oldSlug || p.slug !== oldSlug) &&
            String(p.id) !== String(post.id)
        );
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
      } else {
        const idx = posts.findIndex(
          (p) =>
            (oldSlug && p.slug === oldSlug) ||
            p.slug === post.slug ||
            (post.id && String(p.id) === String(post.id)) ||
            (post._id && String(p._id) === String(post._id))
        );
        if (idx !== -1) {
          posts[idx] = {
            ...posts[idx],
            slug: post.slug,
            link: `https://superkingsden.com/${post.slug}/`,
            canonicalUrl: post.canonicalUrl || `https://superkingsden.com/${post.slug}/`,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category,
            franchise: post.franchise,
            author: post.author,
            featuredImage: post.featuredImage,
            readingTime: post.readingTime,
            isMostViewed: Boolean(post.isMostViewed),
            modified: post.modified || new Date().toISOString(),
          };
          fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf8');
        } else {
          posts.unshift({
            id: post.id || Date.now(),
            slug: post.slug,
            link: `https://superkingsden.com/${post.slug}/`,
            canonicalUrl: post.canonicalUrl || `https://superkingsden.com/${post.slug}/`,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category,
            franchise: post.franchise,
            author: post.author,
            featuredImage: post.featuredImage,
            readingTime: post.readingTime,
            isMostViewed: Boolean(post.isMostViewed),
            modified: post.modified || new Date().toISOString(),
          });
          fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf8');
        }
      }
    }

    // Also sync postsIndex.json
    const indexPath = path.join(process.cwd(), 'src', 'data', 'postsIndex.json');
    if (fs.existsSync(indexPath)) {
      const indexPosts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

      if (action === 'delete') {
        const filteredIndex = indexPosts.filter(
          (p) =>
            p.slug !== post.slug &&
            (!oldSlug || p.slug !== oldSlug) &&
            String(p.id) !== String(post.id)
        );
        fs.writeFileSync(indexPath, JSON.stringify(filteredIndex, null, 2), 'utf8');
      } else {
        const idx = indexPosts.findIndex(
          (p) =>
            (oldSlug && p.slug === oldSlug) ||
            p.slug === post.slug ||
            (post.id && String(p.id) === String(post.id)) ||
            (post._id && String(p._id) === String(post._id))
        );
        if (idx !== -1) {
          indexPosts[idx] = {
            ...indexPosts[idx],
            slug: post.slug,
            title: post.title,
            category: post.category,
            franchise: post.franchise,
            featuredImage: post.featuredImage,
            readingTime: post.readingTime,
            isMostViewed: Boolean(post.isMostViewed),
            excerpt: post.excerpt,
          };
          fs.writeFileSync(indexPath, JSON.stringify(indexPosts, null, 2), 'utf8');
        } else {
          indexPosts.unshift({
            id: post.id || Date.now(),
            slug: post.slug,
            title: post.title,
            category: post.category,
            franchise: post.franchise,
            featuredImage: post.featuredImage,
            readingTime: post.readingTime,
            isMostViewed: Boolean(post.isMostViewed),
            excerpt: post.excerpt,
          });
          fs.writeFileSync(indexPath, JSON.stringify(indexPosts, null, 2), 'utf8');
        }
      }
    }
    invalidatePostsCache();
    } catch (e) {
      console.warn('Failed to sync posts JSON files:', e.message);
    }
  });
}

async function findPostByIdOrSlug(idParam) {
  if (!idParam) return null;
  const decoded = decodeURIComponent(String(idParam)).trim().replace(/^\/+|\/+$/g, '');

  if (mongoose.Types.ObjectId.isValid(decoded)) {
    const p = await Post.findById(decoded);
    if (p) return p;
  }
  if (!isNaN(decoded) && /^\d+$/.test(decoded)) {
    const p = await Post.findOne({ id: Number(decoded) });
    if (p) return p;
  }
  let p = await Post.findOne({ slug: decoded.toLowerCase() });
  if (p) return p;

  // Fallback 1: check if idParam was an old slug that was redirected
  try {
    const redirect = await Redirect.findOne({ source: `/${decoded.toLowerCase()}/` });
    if (redirect && redirect.destination) {
      const destSlug = redirect.destination.replace(/^\/+|\/+$/g, '');
      p = await Post.findOne({ slug: destSlug.toLowerCase() });
      if (p) return p;
    }
  } catch (e) {
    // ignore
  }

  // Fallback 2: Check case-insensitive
  p = await Post.findOne({ slug: { $regex: `^${decoded.toLowerCase()}$`, $options: 'i' } });
  if (p) return p;

  return null;
}

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const post = await findPostByIdOrSlug(params.id);

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const post = await findPostByIdOrSlug(params.id);

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const oldSlug = post.slug;

    // Handle Slug Update
    if (body.slug && String(body.slug).trim()) {
      const cleanNewSlug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-{2,}/g, '-');

      if (cleanNewSlug !== oldSlug) {
        const slugExists = await Post.findOne({
          slug: cleanNewSlug,
          _id: { $ne: post._id },
        });

        if (slugExists) {
          return NextResponse.json(
            { success: false, error: `Slug "${cleanNewSlug}" is already taken by another post.` },
            { status: 409 }
          );
        }

        post.slug = cleanNewSlug;
        post.canonicalUrl = `https://superkingsden.com/${cleanNewSlug}/`;
      }
    }

    const allowedFields = [
      'title',
      'content',
      'excerpt',
      'category',
      'franchise',
      'author',
      'featuredImage',
      'readingTime',
      'isPublished',
      'isMostViewed',
      'seoTitle',
      'metaDescription',
      'focusKeywords',
      'canonicalUrl',
      'robots',
      'ogTitle',
      'ogDescription',
      'ogImage',
      'schemaType',
      'customSchema',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        post[field] = body[field];
      }
    });

    post.modified = new Date().toISOString();
    await post.save();

    syncPostsDataJson(post, 'upsert', oldSlug);

    const isChanged = post.slug !== oldSlug;

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post,
      slugChanged: isChanged,
      oldSlug,
      newSlug: post.slug,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const post = await findPostByIdOrSlug(params.id);

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    await Post.findByIdAndDelete(post._id);
    syncPostsDataJson(post, 'delete');

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
