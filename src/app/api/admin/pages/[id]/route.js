import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Page from '../../../../../models/Page';
import Redirect from '../../../../../models/Redirect';
import {
  syncSeoCacheFromDatabase,
  handleSlugChangeRedirect,
} from '../../../../../lib/pagesManager';

async function findPage(idParam) {
  if (!idParam) return null;
  const decoded = decodeURIComponent(String(idParam)).trim();

  if (mongoose.Types.ObjectId.isValid(decoded)) {
    const p = await Page.findById(decoded);
    if (p) return p;
  }
  let page = await Page.findOne({ $or: [{ id: decoded }, { slug: decoded.toLowerCase() }] });
  if (page) return page;

  // Fallback: check if idParam was an old slug that was redirected
  try {
    const redirect = await Redirect.findOne({ source: `/${decoded.toLowerCase()}/` });
    if (redirect && redirect.destination) {
      const destSlug = redirect.destination.replace(/^\/+|\/+$/g, '');
      page = await Page.findOne({ $or: [{ id: destSlug }, { slug: destSlug.toLowerCase() }] });
      if (page) return page;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const page = await findPage(params.id);

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
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

    if (session.role === 'viewer') {
      return NextResponse.json(
        { success: false, error: 'Viewers cannot modify pages.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const page = await findPage(params.id);

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const body = await request.json();
    const oldSlug = page.slug;

    // Handle Slug Update
    if (body.slug && String(body.slug).trim()) {
      const cleanNewSlug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '')
        .replace(/\s+/g, '-');

      if (cleanNewSlug !== oldSlug) {
        const slugExists = await Page.findOne({
          slug: cleanNewSlug,
          _id: { $ne: page._id },
        });

        if (slugExists) {
          return NextResponse.json(
            { success: false, error: `Slug "${cleanNewSlug}" is already in use by another page.` },
            { status: 409 }
          );
        }

        page.slug = cleanNewSlug;
        if (page.pageType !== 'core_route' || (page.routePath && page.routePath !== '/')) {
          page.routePath = `/${cleanNewSlug}`;
        }
        if (!body.canonicalUrl || page.canonicalUrl === `https://superkingsden.com/${oldSlug}/`) {
          page.canonicalUrl = `https://superkingsden.com/${cleanNewSlug}/`;
        }
      }
    }

    // Update Basic & Content Fields
    if (body.title !== undefined) page.title = String(body.title).trim();
    if (body.content !== undefined) page.content = String(body.content);
    if (body.excerpt !== undefined) page.excerpt = String(body.excerpt).trim();
    if (body.featuredMedia !== undefined) page.featuredMedia = String(body.featuredMedia).trim();

    // Update SEO Meta Fields
    if (body.seoTitle !== undefined) page.seoTitle = String(body.seoTitle).trim();
    if (body.metaDescription !== undefined) page.metaDescription = String(body.metaDescription).trim();
    if (body.focusKeywords !== undefined) page.focusKeywords = String(body.focusKeywords).trim();
    if (body.canonicalUrl !== undefined) page.canonicalUrl = String(body.canonicalUrl).trim();
    if (body.robots !== undefined) page.robots = String(body.robots);

    // Update Social / OpenGraph Meta
    if (body.ogTitle !== undefined) page.ogTitle = String(body.ogTitle).trim();
    if (body.ogDescription !== undefined) page.ogDescription = String(body.ogDescription).trim();
    if (body.ogImage !== undefined) page.ogImage = String(body.ogImage).trim();

    // Update Schema.org Structured Data
    if (body.schemaType !== undefined) page.schemaType = String(body.schemaType).trim();
    if (body.customSchema !== undefined) page.customSchema = String(body.customSchema).trim();

    if (body.isPublished !== undefined) page.isPublished = Boolean(body.isPublished);

    page.updatedBy = session.username || 'admin';
    await page.save();

    // Re-sync local SEO cache and pagesData.json
    await syncSeoCacheFromDatabase();

    const isChanged = page.slug !== oldSlug;

    return NextResponse.json({
      success: true,
      message: `Page "${page.title}" and SEO settings updated successfully!`,
      page,
      slugChanged: isChanged,
      oldSlug,
      newSlug: page.slug,
    });
  } catch (err) {
    console.error('Update page API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'superadmin' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only administrators can delete static pages.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const page = await findPage(params.id);

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // Safety: Core routes cannot be deleted
    if (page.pageType === 'core_route') {
      return NextResponse.json(
        { success: false, error: 'Core system pages cannot be deleted. You can only edit their SEO and slug settings.' },
        { status: 400 }
      );
    }

    await Page.findByIdAndDelete(page._id);
    await syncSeoCacheFromDatabase();

    return NextResponse.json({
      success: true,
      message: `Page "${page.title}" deleted successfully.`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
