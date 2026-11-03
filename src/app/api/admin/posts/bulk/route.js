import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Post from '../../../../../models/Post';
import { invalidatePostsCache } from '../../../../../services/api';

function syncBulkDeleteJson(deletedSlugs = [], deletedIds = []) {
  try {
    const slugSet = new Set(deletedSlugs.map((s) => String(s || '').toLowerCase()));
    const idSet = new Set(deletedIds.map((i) => String(i || '')));

    for (const file of ['src/data/postsData.json', 'src/data/postsIndex.json']) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const filtered = posts.filter(
          (p) =>
            !slugSet.has(String(p.slug || '').toLowerCase()) &&
            !idSet.has(String(p.id || '')) &&
            !idSet.has(String(p._id || ''))
        );
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.warn('Sync bulk delete failed:', e.message);
  }
}

function syncBulkUpdateJson(targetSlugs = [], targetIds = [], updateFields = {}) {
  try {
    const slugSet = new Set(targetSlugs.map((s) => String(s || '').toLowerCase()));
    const idSet = new Set(targetIds.map((i) => String(i || '')));

    for (const file of ['src/data/postsData.json', 'src/data/postsIndex.json']) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;
        for (let i = 0; i < posts.length; i++) {
          const p = posts[i];
          if (
            slugSet.has(String(p.slug || '').toLowerCase()) ||
            idSet.has(String(p.id || '')) ||
            idSet.has(String(p._id || ''))
          ) {
            posts[i] = {
              ...p,
              ...updateFields,
              modified: new Date().toISOString(),
            };
            modified = true;
          }
        }
        if (modified) {
          fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf8');
        }
      }
    }
  } catch (e) {
    console.warn('Sync bulk update failed:', e.message);
  }
}

function buildOrFilter(ids) {
  const objectIds = [];
  const numIds = [];
  const slugs = [];

  for (const id of ids) {
    const str = String(id).trim();
    if (mongoose.Types.ObjectId.isValid(str)) {
      objectIds.push(new mongoose.Types.ObjectId(str));
    }
    const num = Number(str);
    if (!isNaN(num)) {
      numIds.push(num);
    }
    slugs.push(str.toLowerCase());
  }

  const or = [];
  if (objectIds.length > 0) or.push({ _id: { $in: objectIds } });
  if (numIds.length > 0) or.push({ id: { $in: numIds } });
  if (slugs.length > 0) or.push({ slug: { $in: slugs } });
  return or.length > 0 ? { $or: or } : null;
}

// Bulk Edit / Update (WordPress style)
export async function PUT(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { ids, data } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No posts selected' }, { status: 400 });
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ success: false, error: 'No update data provided' }, { status: 400 });
    }

    const updateFields = {};

    // 1. Category
    if (data.category && data.category !== 'NO_CHANGE') {
      updateFields.category = data.category;
    }

    // 2. Author
    if (data.author && data.author.trim() && data.author !== 'NO_CHANGE') {
      updateFields.author = data.author.trim();
    }

    // 3. Status (Published vs Draft)
    if (data.status === 'publish') {
      updateFields.isPublished = true;
    } else if (data.status === 'draft') {
      updateFields.isPublished = false;
    }

    // 4. Franchise
    if (data.franchise && data.franchise !== 'NO_CHANGE') {
      updateFields.franchise = data.franchise;
    }

    // 5. Most Viewed
    if (data.isMostViewed === true || data.isMostViewed === 'true') {
      updateFields.isMostViewed = true;
    } else if (data.isMostViewed === false || data.isMostViewed === 'false') {
      updateFields.isMostViewed = false;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields were modified' }, { status: 400 });
    }

    updateFields.modified = new Date().toISOString();

    const query = buildOrFilter(ids);
    if (!query) {
      return NextResponse.json({ success: false, error: 'Invalid post IDs' }, { status: 400 });
    }

    // Find affected posts to sync their slugs/ids
    const affectedPosts = await Post.find(query).select('_id id slug').lean();
    const result = await Post.updateMany(query, { $set: updateFields });

    const targetSlugs = affectedPosts.map((p) => p.slug);
    const targetIds = affectedPosts.map((p) => String(p._id));

    // Sync JSON fallbacks and invalidate cache
    syncBulkUpdateJson(targetSlugs, targetIds, updateFields);
    invalidatePostsCache();

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount || affectedPosts.length} article(s).`,
      count: result.modifiedCount || affectedPosts.length,
    });
  } catch (err) {
    console.error('Bulk update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Bulk Delete
export async function DELETE(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No posts selected' }, { status: 400 });
    }

    const query = buildOrFilter(ids);
    if (!query) {
      return NextResponse.json({ success: false, error: 'Invalid post IDs' }, { status: 400 });
    }

    // Find affected posts first so we know which slugs/IDs to purge from JSON
    const affectedPosts = await Post.find(query).select('_id id slug').lean();
    const result = await Post.deleteMany(query);

    const deletedSlugs = affectedPosts.map((p) => p.slug);
    const deletedIds = affectedPosts.map((p) => String(p._id));

    // Sync JSON fallbacks and invalidate cache
    syncBulkDeleteJson(deletedSlugs, deletedIds);
    invalidatePostsCache();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount || affectedPosts.length} article(s).`,
      count: result.deletedCount || affectedPosts.length,
    });
  } catch (err) {
    console.error('Bulk delete error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
