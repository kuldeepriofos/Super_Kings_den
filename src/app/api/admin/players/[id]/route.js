import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Player from '../../../../../models/Player';
import { syncMockDataSquad } from '../../../../../lib/syncSquad';

async function findPlayer(idParam) {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const p = await Player.findById(idParam);
    if (p) return p;
  }
  let p = await Player.findOne({ id: idParam });
  if (p) return p;
  return Player.findOne({ slug: idParam });
}

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const player = await findPlayer(params.id);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, player });
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
    const player = await findPlayer(params.id);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const body = await request.json();

    const allowedFields = [
      'name',
      'fullName',
      'slug',
      'tag',
      'role',
      'jersey',
      'category',
      'franchise',
      'franchises',
      'country',
      'born',
      'iplDebut',
      'battingStyle',
      'bowlingStyle',
      'matches',
      'innings',
      'runs',
      'highestScore',
      'average',
      'strikeRate',
      'fifties',
      'hundreds',
      'fours',
      'sixes',
      'wickets',
      'bestBowling',
      'economy',
      'bowlingAverage',
      'fourWickets',
      'catches',
      'stumpings',
      'specialty',
      'era',
      'isLegend',
      'isCurrent',
      'avatar',
      'trophies',
      'honors',
      'bio',
      'content',
      'stats',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === 'slug' && typeof body[field] === 'string') {
          player[field] = body[field]
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        } else {
          player[field] = body[field];
        }
      }
    });

    await player.save();

    // Keep mockData.js in sync with MongoDB
    await syncMockDataSquad(Player);

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      player,
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
    const player = await findPlayer(params.id);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    await Player.findByIdAndDelete(player._id);

    // Keep mockData.js in sync with MongoDB
    await syncMockDataSquad(Player);

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
