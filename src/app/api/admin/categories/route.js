import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Category from '../../../../models/Category';
import Post from '../../../../models/Post';
import { invalidateCategoriesCache } from '../../../../services/api';

function syncCategoriesJson(category, action = 'upsert') {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'categoriesData.json');
    if (!fs.existsSync(filePath)) return;
    const cats = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (action === 'delete') {
      const filtered = cats.filter(c => c.slug !== category.slug && String(c.id) !== String(category.id));
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
      return;
    }

    const idx = cats.findIndex(c => c.slug === category.slug || (category.id && String(c.id) === String(category.id)));
    const catObj = {
      id: category.id || Date.now(),
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      franchise: category.franchise || 'CSK',
      count: category.count || 0,
      link: `https://superkingsden.com/category/${category.slug}/`,
      parent: 0,
    };

    if (idx !== -1) {
      cats[idx] = { ...cats[idx], ...catObj };
    } else {
      cats.push(catObj);
    }
    fs.writeFileSync(filePath, JSON.stringify(cats, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to sync categoriesData.json:', err.message);
  }
}

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const categories = await Category.find().lean();

    // Dynamically calculate accurate live counts from Post collection
    const postCounts = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    postCounts.forEach(pc => {
      if (pc._id) countMap[pc._id.toLowerCase()] = pc.count;
    });

    const enriched = categories.map(c => ({
      ...c,
      count: countMap[c.name.toLowerCase()] || countMap[c.slug.toLowerCase()] || c.count || 0,
    })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      categories: enriched,
    });
  } catch (err) {
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

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCategory = await Category.create({
      id: Date.now(),
      name: body.name.trim(),
      slug,
      description: body.description || '',
      franchise: body.franchise || 'CSK',
      count: 0,
      link: `https://superkingsden.com/category/${slug}/`,
      seoTitle: body.seoTitle ? String(body.seoTitle).trim() : '',
      metaDescription: body.metaDescription ? String(body.metaDescription).trim() : '',
      focusKeywords: body.focusKeywords ? String(body.focusKeywords).trim() : '',
      canonicalUrl: body.canonicalUrl ? String(body.canonicalUrl).trim() : `https://superkingsden.com/category/${slug}/`,
      ogImage: body.ogImage ? String(body.ogImage).trim() : '',
    });

    syncCategoriesJson(newCategory, 'upsert');
    invalidateCategoriesCache();

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: newCategory,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
