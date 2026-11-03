import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Fixture from '../../../models/Fixture';
import { FIXTURES } from '../../../data/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise = searchParams.get('franchise');
    const year = searchParams.get('year');

    await connectToDatabase();
    const query = { isActive: true, isDeleted: { $ne: true } };
    if (franchise && franchise !== 'ALL') {
      query.franchise = franchise;
    }
    if (year && year !== 'ALL') {
      query.year = Number(year);
    }

    const rawFixtures = await Fixture.find(query).sort({ isFeatured: -1, createdAt: -1, order: 1 }).lean();

    if (rawFixtures && rawFixtures.length > 0) {
      const now = Date.now();

      // Automatic Display Logic sorting:
      // 1. Manually pinned featured hero (isFeatured: true)
      // 2. Live Match (status: 'Live')
      // 3. Upcoming Match with future countdown (status: 'Upcoming' && countdownTarget in future)
      // 4. Completed Match (status: 'Completed')
      // 5. Rest by recency
      const sorted = [...rawFixtures].sort((a, b) => {
        // Pinned featured takes precedence if set
        if (Boolean(a.isFeatured) !== Boolean(b.isFeatured)) {
          return a.isFeatured ? -1 : 1;
        }

        const getPriorityScore = (m) => {
          if (m.status === 'Live') return 100;
          if (m.status === 'Upcoming') {
            const target = m.countdownTarget ? new Date(m.countdownTarget).getTime() : 0;
            if (target > now) return 80;
            return 40;
          }
          if (m.status === 'Completed') return 60;
          return 20;
        };

        const scoreA = getPriorityScore(a);
        const scoreB = getPriorityScore(b);
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        // Secondary sort: most recent createdAt or order
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      return NextResponse.json({
        success: true,
        fixtures: sorted.map((f) => ({
          ...f,
          _id: String(f._id),
        })),
      });
    }

    // Fallback to static mockData
    const fallback = (franchise && franchise !== 'ALL')
      ? FIXTURES.filter(f => f.franchise === franchise)
      : FIXTURES;

    return NextResponse.json({
      success: true,
      fixtures: fallback,
      isFallback: true,
    });
  } catch (err) {
    console.error('Public matches GET error:', err);
    return NextResponse.json({
      success: true,
      fixtures: FIXTURES,
      isFallback: true,
    });
  }
}
