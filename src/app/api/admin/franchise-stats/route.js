import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../../lib/mongodb.js';
import FranchiseStat from '../../../../models/FranchiseStat.js';
import { getAdminSession, requirePermission } from '../../../../lib/auth.js';

const STATS_FILE = path.join(process.cwd(), 'src', 'data', 'franchiseStatsData.json');

function readFallbackStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading franchiseStatsData.json:', e);
  }
  return {};
}

function writeFallbackStats(data) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing franchiseStatsData.json:', e);
  }
}

export async function GET(req) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const franchise = searchParams.get('franchise')?.toUpperCase();

    await connectToDatabase();
    let stats = await FranchiseStat.find({}).lean();

    if (!stats || stats.length === 0) {
      const fallback = readFallbackStats();
      if (franchise) {
        return NextResponse.json({ success: true, data: fallback[franchise] || fallback.CSK });
      }
      return NextResponse.json({ success: true, data: fallback });
    }

    const map = {};
    stats.forEach((s) => {
      map[s.franchise] = s;
    });

    if (franchise) {
      return NextResponse.json({ success: true, data: map[franchise] || map.CSK });
    }

    return NextResponse.json({ success: true, data: map });
  } catch (err) {
    const fallback = readFallbackStats();
    return NextResponse.json({ success: true, data: fallback, source: 'fallback' });
  }
}

export async function PUT(req) {
  try {
    const session = await requirePermission(req, 'manageMatches');
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { franchise, overview, batting, bowling, records, teamName, league } = body;

    if (!franchise) {
      return NextResponse.json({ success: false, error: 'Franchise code is required (CSK, JSK, or TSK)' }, { status: 400 });
    }

    const norm = franchise.toUpperCase();

    // 1. Update JSON Fallback
    const fallback = readFallbackStats();
    fallback[norm] = {
      ...(fallback[norm] || {}),
      franchise: norm,
      teamName: teamName || fallback[norm]?.teamName,
      league: league || fallback[norm]?.league,
      overview: overview || fallback[norm]?.overview,
      batting: batting || fallback[norm]?.batting,
      bowling: bowling || fallback[norm]?.bowling,
      records: records || fallback[norm]?.records,
    };
    writeFallbackStats(fallback);

    // 2. Update MongoDB
    try {
      await connectToDatabase();
      await FranchiseStat.findOneAndUpdate(
        { franchise: norm },
        {
          franchise: norm,
          teamName: teamName || fallback[norm]?.teamName,
          league: league || fallback[norm]?.league,
          overview: overview || fallback[norm]?.overview,
          batting: batting || fallback[norm]?.batting,
          bowling: bowling || fallback[norm]?.bowling,
          records: records || fallback[norm]?.records,
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (dbErr) {
      console.warn('MongoDB error updating FranchiseStat, saved to JSON fallback:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `${norm} Statistics & Leaderboards updated successfully`,
      data: fallback[norm],
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
