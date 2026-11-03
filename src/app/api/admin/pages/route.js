import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Page from '../../../../models/Page';
import {
  seedPagesIfEmpty,
  syncSeoCacheFromDatabase,
  handleSlugChangeRedirect,
} from '../../../../lib/pagesManager';

/**
 * GET /api/admin/pages/
 * Lists all static pages with search, type filter, and summary counts.
 */
export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await seedPagesIfEmpty();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const typeFilter = searchParams.get('type') || 'all'; // 'all' | 'content' | 'core_route'

    const query = {};
    if (search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { seoTitle: { $regex: q, $options: 'i' } },
        { metaDescription: { $regex: q, $options: 'i' } },
      ];
    }

    if (typeFilter !== 'all') {
      query.pageType = typeFilter;
    }

    const pages = await Page.find(query).sort({ pageType: -1, slug: 1 }).lean();

    const totalCount = await Page.countDocuments();
    const contentCount = await Page.countDocuments({ pageType: 'content' });
    const coreCount = await Page.countDocuments({ pageType: 'core_route' });

    return NextResponse.json({
      success: true,
      pages,
      counts: {
        total: totalCount,
        content: contentCount,
        core: coreCount,
      },
    });
  } catch (err) {
    console.error('Fetch pages API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/pages/
 * Creates a new static page with SEO metadata.
 */
export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'viewer') {
      return NextResponse.json(
        { success: false, error: 'Viewers cannot create static pages.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Title and Slug are required.' },
        { status: 400 }
      );
    }

    const cleanSlug = String(body.slug)
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '')
      .replace(/\s+/g, '-');

    const existing = await Page.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A page with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    const newPage = await Page.create({
      ...body,
      id: body.id || `page-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      slug: cleanSlug,
      title: body.title.trim(),
      pageType: body.pageType || 'content',
      routePath: `/${cleanSlug}`,
      seoTitle: body.seoTitle || `${body.title.trim()} | Super Kings Den`,
      metaDescription: body.metaDescription || '',
      canonicalUrl: body.canonicalUrl || `https://superkingsden.com/${cleanSlug}/`,
      updatedBy: session.username || 'admin',
    });

    await syncSeoCacheFromDatabase();

    return NextResponse.json({
      success: true,
      message: `Page "${newPage.title}" created successfully!`,
      page: newPage,
    });
  } catch (err) {
    console.error('Create page API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
