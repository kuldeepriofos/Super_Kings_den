import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Fixture from '../../../../models/Fixture';
import { syncMockDataFixtures } from '../../../../lib/syncFixtures';
import { invalidateFixturesCache } from '../../../../services/api';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const franchise = searchParams.get('franchise');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility') || 'all'; // 'all', 'active', 'inactive', 'deleted'

    const query = {};
    if (visibility === 'deleted') {
      query.isDeleted = true;
    } else if (visibility === 'active') {
      query.isActive = true;
      query.isDeleted = { $ne: true };
    } else if (visibility === 'inactive') {
      query.isActive = false;
      query.isDeleted = { $ne: true };
    } else {
      // 'all' non-deleted fixtures
      query.isDeleted = { $ne: true };
    }

    if (franchise && franchise !== 'All') {
      query.franchise = franchise;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    const yearParam = searchParams.get('year');
    if (yearParam && yearParam !== 'All' && yearParam !== 'ALL') {
      query.year = Number(yearParam);
    }

    const fixtures = await Fixture.find(query).sort({ isFeatured: -1, createdAt: -1, order: 1 }).lean();
    const totalCount = await Fixture.countDocuments({ isDeleted: { $ne: true } });
    const activeCount = await Fixture.countDocuments({ isActive: true, isDeleted: { $ne: true } });
    const inactiveCount = await Fixture.countDocuments({ isActive: false, isDeleted: { $ne: true } });
    const deletedCount = await Fixture.countDocuments({ isDeleted: true });

    const cskCount = await Fixture.countDocuments({ franchise: 'CSK', isDeleted: { $ne: true } });
    const jskCount = await Fixture.countDocuments({ franchise: 'JSK', isDeleted: { $ne: true } });
    const tskCount = await Fixture.countDocuments({ franchise: 'TSK', isDeleted: { $ne: true } });

    const distinctYears = await Fixture.distinct('year', { isDeleted: { $ne: true } });
    const availableYears = Array.from(
      new Set([2026, ...distinctYears.filter((y) => typeof y === 'number' && !isNaN(y))])
    ).sort((a, b) => b - a);

    return NextResponse.json({
      success: true,
      fixtures,
      availableYears,
      counts: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        deleted: deletedCount,
        csk: cskCount,
        jsk: jskCount,
        tsk: tskCount,
      },
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

    if (!body.homeTeam || !body.awayTeam) {
      return NextResponse.json({ success: false, error: 'Home and Away teams are required' }, { status: 400 });
    }

    const rawDate = body.date || body.completedDate || body.upcomingDate || '';
    const year = Number(body.year) || parseInt(String(rawDate).match(/\d{4}/)?.[0] || '2026') || 2026;
    const franchise = (body.franchise || 'CSK').toUpperCase();

    if (body.isFeatured) {
      await Fixture.updateMany({ franchise }, { isFeatured: false });
    }

    const uniqueSuffix = Date.now().toString().slice(-4);
    const id = body.id || `${(body.homeShort || 'team').toLowerCase()}-vs-${(body.awayShort || 'opp').toLowerCase()}-${year}-${uniqueSuffix}`;

    const newFixture = await Fixture.create({
      ...body,
      franchise,
      year,
      season: String(year),
      id,
      isActive: true,
      isDeleted: false,
    });

    invalidateFixturesCache();
    return NextResponse.json({
      success: true,
      message: `${franchise} match created successfully`,
      fixture: newFixture,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const franchise = (body.franchise || 'CSK').toUpperCase();

    let fixture = null;
    if (body._id) {
      fixture = await Fixture.findById(body._id);
    }
    if (!fixture && body.id) {
      fixture = await Fixture.findOne({ id: body.id });
    }
    if (!fixture) {
      fixture = await Fixture.findOne({ franchise, isDeleted: { $ne: true } }).sort({ order: 1, createdAt: 1 });
    }

    if (fixture) {
      if (body.isFeatured) {
        await Fixture.updateMany({ franchise, _id: { $ne: fixture._id } }, { isFeatured: false });
      }
      Object.keys(body).forEach((key) => {
        if (key !== '_id' && key !== '__v') {
          fixture[key] = body[key];
        }
      });
      const rawDate = body.date || body.completedDate || body.upcomingDate || fixture.date || '';
      const year = Number(body.year) || parseInt(String(rawDate).match(/\d{4}/)?.[0] || '2026') || fixture.year || 2026;
      fixture.year = year;
      fixture.season = String(year);
      fixture.isActive = true;
      fixture.isDeleted = false;
      await fixture.save();
    } else {
      const rawDate = body.date || body.completedDate || body.upcomingDate || '';
      const year = Number(body.year) || parseInt(String(rawDate).match(/\d{4}/)?.[0] || '2026') || 2026;
      const id = body.id || `${franchise.toLowerCase()}-primary-match-${Date.now().toString().slice(-4)}`;
      fixture = await Fixture.create({
        ...body,
        id,
        franchise,
        year,
        season: String(year),
        isActive: true,
        isDeleted: false,
      });
    }

    invalidateFixturesCache();
    return NextResponse.json({
      success: true,
      message: `${franchise} Match Center updated successfully`,
      fixture,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
