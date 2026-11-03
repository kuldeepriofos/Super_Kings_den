import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Category from '../../../../../models/Category';
import { handleSlugChangeRedirect } from '../../../../../lib/pagesManager';

function syncCategoriesJson(category, action = 'upsert') {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'categoriesData.json');
    if (!fs.existsSync(filePath)) return;
    const cats = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (action === 'delete') {
      const filtered = cats.filter(
        (c) => c.slug !== category.slug && String(c.id) !== String(category.id)
      );
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
      return;
    }

    const idx = cats.findIndex(
      (c) => c.slug === category.slug || (category.id && String(c.id) === String(category.id))
    );
    const catObj = {
      id: category.id || (idx !== -1 ? cats[idx].id : Date.now()),
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      franchise: category.franchise || 'CSK',
      count: category.count || 0,
      link: `https://superkingsden.com/category/${category.slug}/`,
      parent: 0,
      seoTitle: category.seoTitle || '',
      metaDescription: category.metaDescription || '',
      focusKeywords: category.focusKeywords || '',
      canonicalUrl: category.canonicalUrl || `https://superkingsden.com/category/${category.slug}/`,
      ogImage: category.ogImage || '',
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

async function findCategory(idParam) {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const c = await Category.findById(idParam);
    if (c) return c;
  }
  if (!isNaN(idParam)) {
    const c = await Category.findOne({ id: Number(idParam) });
    if (c) return c;
  }
  return Category.findOne({ slug: idParam });
}

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const category = await findCategory(params.id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
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
    const category = await findCategory(params.id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const oldSlug = category.slug;

    // Handle Slug change & auto 301 redirect
    if (body.slug !== undefined && String(body.slug).trim()) {
      const cleanNewSlug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '')
        .replace(/[\s_]+/g, '-');

      if (cleanNewSlug !== oldSlug) {
        const slugExists = await Category.findOne({
          slug: cleanNewSlug,
          _id: { $ne: category._id },
        });

        if (slugExists) {
          return NextResponse.json(
            { success: false, error: `Slug "${cleanNewSlug}" is already in use by another category.` },
            { status: 409 }
          );
        }

        // Automatic 301 redirect: /category/old/ -> /category/new/
        await handleSlugChangeRedirect(`category/${oldSlug}`, `category/${cleanNewSlug}`, session.username || 'admin');
        category.slug = cleanNewSlug;
      }
    }

    if (body.name !== undefined) category.name = body.name.trim();
    if (body.description !== undefined) category.description = body.description;
    if (body.franchise !== undefined) category.franchise = body.franchise;
    if (body.seoTitle !== undefined) category.seoTitle = String(body.seoTitle).trim();
    if (body.metaDescription !== undefined) category.metaDescription = String(body.metaDescription).trim();
    if (body.focusKeywords !== undefined) category.focusKeywords = String(body.focusKeywords).trim();
    if (body.canonicalUrl !== undefined) category.canonicalUrl = String(body.canonicalUrl).trim();
    if (body.ogImage !== undefined) category.ogImage = String(body.ogImage).trim();

    await category.save();
    syncCategoriesJson(category, 'upsert');

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category,
      slugChanged: category.slug !== oldSlug,
      oldSlug,
      newSlug: category.slug,
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
    const category = await findCategory(params.id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const deletedCopy = { ...category.toObject() };
    await category.deleteOne();
    syncCategoriesJson(deletedCopy, 'delete');

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
