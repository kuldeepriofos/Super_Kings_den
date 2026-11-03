import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Fixture from '../../../../../models/Fixture';
import { syncMockDataFixtures } from '../../../../../lib/syncFixtures';
import { invalidateFixturesCache } from '../../../../../services/api';

async function findFixture(idParam) {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const f = await Fixture.findById(idParam);
    if (f) return f;
  }
  return Fixture.findOne({ id: idParam });
}

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const resolvedParams = await Promise.resolve(params);
    const fixture = await findFixture(resolvedParams.id);

    if (!fixture) {
      return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, fixture });
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
    const resolvedParams = await Promise.resolve(params);
    const fixture = await findFixture(resolvedParams.id);

    if (!fixture) {
      return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
    }

    const body = await request.json();

    const allowedFields = [
      'tournament',
      'matchdayTag',
      'franchise',
      'year',
      'season',
      'status',
      'homeTeam',
      'homeShort',
      'homeLogo',
      'homeRole',
      'awayTeam',
      'awayShort',
      'awayLogo',
      'awayRole',
      'vsLabel',
      'date',
      'time',
      'upcomingDate',
      'upcomingTime',
      'completedDate',
      'completedVenue',
      'completedMatchTitle',
      'countdownTarget',
      'venue',
      'pitchTitle',
      'pitchInsight',
      'h2h',
      'previewLink',
      'previewText',
      'homeScore',
      'homeOvers',
      'awayScore',
      'awayOvers',
      'resultText',
      'winner',
      'potm',
      'potmRole',
      'matchNote',
      'isFeatured',
      'displayMode',
      'order',
      'isActive',
      'isDeleted',
      'deletedAt',
    ];

    if (body.isFeatured && fixture.franchise) {
      await Fixture.updateMany(
        { franchise: fixture.franchise, _id: { $ne: fixture._id } },
        { isFeatured: false }
      );
    }

    if (body.restore || body.isDeleted === false) {
      fixture.isDeleted = false;
      fixture.deletedAt = null;
      fixture.isActive = true;
    }

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        fixture[field] = body[field];
      }
    });

    await fixture.save();
    invalidateFixturesCache();

    return NextResponse.json({
      success: true,
      message: 'Match fixture updated successfully',
      fixture,
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
    const resolvedParams = await Promise.resolve(params);
    const fixture = await findFixture(resolvedParams.id);

    if (!fixture) {
      return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const isPermanent = searchParams.get('permanent') === 'true' || searchParams.get('purge') === 'true';

    if (isPermanent) {
      // Permanent removal from MongoDB
      await Fixture.findByIdAndDelete(fixture._id);
    } else {
      // Soft-delete to Trash bin
      fixture.isDeleted = true;
      fixture.deletedAt = new Date();
      fixture.isActive = false;
      await fixture.save();
    }
    invalidateFixturesCache();

    return NextResponse.json({
      success: true,
      message: isPermanent
        ? 'Match fixture permanently deleted.'
        : 'Match fixture moved to Trash.',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
