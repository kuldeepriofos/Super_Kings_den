import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Player from '../../../../models/Player';
import { syncMockDataSquad } from '../../../../lib/syncSquad';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filter') || 'all'; // all | current | legend
    const search = (searchParams.get('search') || '').trim();
    const role = (searchParams.get('role') || '').trim();
    const franchise = (searchParams.get('franchise') || '').trim();
    const sortBy = searchParams.get('sort') || 'matches';

    const query = {};

    if (filterType === 'current') {
      query.isCurrent = true;
    } else if (filterType === 'legend') {
      query.isLegend = true;
    }

    if (role && role !== 'All') {
      query.role = { $regex: role, $options: 'i' };
    }

    if (franchise && franchise !== 'All') {
      const fUpper = franchise.toUpperCase();
      const franchiseConditions = [
        { franchise: fUpper },
        { franchises: fUpper },
        { franchise: franchise },
        { franchises: franchise }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: franchiseConditions }];
        delete query.$or;
      } else {
        query.$or = franchiseConditions;
      }
    }

    let sortObj = { isCurrent: -1, matches: -1 };
    if (sortBy === 'runs') sortObj = { runs: -1 };
    else if (sortBy === 'wickets') sortObj = { wickets: -1 };
    else if (sortBy === 'name') sortObj = { name: 1 };
    else if (sortBy === 'jersey') sortObj = { jersey: 1 };
    else if (sortBy === 'matches') sortObj = { matches: -1 };

    const players = await Player.find(query).sort(sortObj).lean();

    const totalCount = await Player.countDocuments();
    const currentCount = await Player.countDocuments({ isCurrent: true });
    const legendCount = await Player.countDocuments({ isLegend: true });
    const cskCount = await Player.countDocuments({ $or: [{ franchise: 'CSK' }, { franchises: 'CSK' }] });
    const jskCount = await Player.countDocuments({ $or: [{ franchise: 'JSK' }, { franchises: 'JSK' }] });
    const tskCount = await Player.countDocuments({ $or: [{ franchise: 'TSK' }, { franchises: 'TSK' }] });

    return NextResponse.json({
      success: true,
      players,
      filteredCount: players.length,
      counts: {
        total: totalCount,
        current: currentCount,
        legend: legendCount,
        csk: cskCount,
        jsk: jskCount,
        tsk: tskCount,
      },
    });
  } catch (err) {
    console.error('Players GET error:', err);
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
      return NextResponse.json({ success: false, error: 'Player name is required' }, { status: 400 });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const id = body.id || `csk-${Date.now().toString().slice(-4)}`;

    const newPlayer = await Player.create({
      ...body,
      id,
      slug,
      name: body.name.trim(),
    });

    // Keep mockData.js in sync with MongoDB
    await syncMockDataSquad(Player);

    return NextResponse.json({
      success: true,
      message: 'Player added successfully',
      player: newPlayer,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
