import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Redirect from '../../../../models/Redirect';
import {
  normalizePath,
  stripTrailingSlash,
  syncRedirectsJson,
  seedRedirectsIfEmpty,
} from '../../../../lib/redirects';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await seedRedirectsIfEmpty();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type'); // '301', '302', or null
    const status = searchParams.get('status'); // 'active', 'inactive', or null
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));

    const query = {};

    if (search.trim()) {
      const q = search.trim();
      query.$or = [
        { source: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (type === '301') query.statusCode = 301;
    else if (type === '302') query.statusCode = 302;

    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    let sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    else if (sortBy === 'most_hits') sort = { hitCount: -1 };
    else if (sortBy === 'last_hit') sort = { lastHitAt: -1 };
    else if (sortBy === 'source') sort = { source: 1 };

    const total = await Redirect.countDocuments(query);
    const redirects = await Redirect.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate overall dashboard stats
    const [totalAll, total301, total302, totalActive, hitsAggregate] = await Promise.all([
      Redirect.countDocuments(),
      Redirect.countDocuments({ statusCode: 301 }),
      Redirect.countDocuments({ statusCode: 302 }),
      Redirect.countDocuments({ isActive: true }),
      Redirect.aggregate([
        { $group: { _id: null, totalHits: { $sum: '$hitCount' } } },
      ]),
    ]);

    const stats = {
      total: totalAll,
      permanent301: total301,
      temporary302: total302,
      active: totalActive,
      inactive: totalAll - totalActive,
      totalHits: hitsAggregate?.[0]?.totalHits || 0,
    };

    return NextResponse.json({
      success: true,
      redirects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats,
    });
  } catch (err) {
    console.error('Error fetching redirects:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { source, destination, statusCode, matchType, isActive, description } = body || {};

    if (!source || !destination) {
      return NextResponse.json(
        { success: false, error: 'Source URL and Destination URL are required' },
        { status: 400 }
      );
    }

    const cleanSource = normalizePath(source);
    let cleanDestination = String(destination).trim();
    if (!cleanDestination.startsWith('http://') && !cleanDestination.startsWith('https://')) {
      cleanDestination = normalizePath(cleanDestination);
    }

    // Loop detection: Source cannot be identical to destination
    if (stripTrailingSlash(cleanSource.toLowerCase()) === stripTrailingSlash(cleanDestination.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Redirect loop detected: Source and Destination cannot be the same URL.' },
        { status: 400 }
      );
    }

    const code = Number(statusCode) === 302 ? 302 : 301;
    const type = ['exact', 'prefix', 'regex'].includes(matchType) ? matchType : 'exact';

    await connectToDatabase();

    // Check for duplicate source with exact match
    const existing = await Redirect.findOne({
      source: cleanSource,
      matchType: type,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `A redirect rule for source "${cleanSource}" already exists (ID: ${existing._id}).` },
        { status: 409 }
      );
    }

    const newRedirect = await Redirect.create({
      source: cleanSource,
      destination: cleanDestination,
      statusCode: code,
      matchType: type,
      isActive: isActive !== false,
      hitCount: 0,
      description: description ? String(description).trim() : '',
      createdBy: session.user?.username || 'admin',
    });

    // Sync all active redirects to JSON file for Edge speed & offline backup
    const allActive = await Redirect.find().lean();
    syncRedirectsJson(allActive);

    return NextResponse.json({
      success: true,
      redirect: newRedirect,
      message: `Successfully created ${code} redirect: ${cleanSource} → ${cleanDestination}`,
    });
  } catch (err) {
    console.error('Error creating redirect:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
