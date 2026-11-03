import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../../lib/mongodb.js';
import Standing from '../../../../models/Standing.js';
import { getAdminSession, requirePermission } from '../../../../lib/auth.js';
import { IPL_STANDINGS, SA20_STANDINGS, MLC_STANDINGS } from '../../../../data/franchiseStandingsData.js';

const STANDINGS_FILE = path.join(process.cwd(), 'src', 'data', 'standingsData.json');

function readFallbackStandings() {
  try {
    if (fs.existsSync(STANDINGS_FILE)) {
      return JSON.parse(fs.readFileSync(STANDINGS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading standingsData.json:', e);
  }
  return IPL_STANDINGS;
}

function writeFallbackStandings(data) {
  try {
    fs.writeFileSync(STANDINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing standingsData.json:', e);
  }
}

export async function GET(req) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const franchiseParam = (searchParams.get('franchise') || '').toUpperCase();
    const tournamentParam = searchParams.get('tournament') || '';

    let tournamentKeyword = 'IPL';
    let fallbackData = IPL_STANDINGS;

    if (franchiseParam === 'JSK' || /SA20/i.test(tournamentParam)) {
      tournamentKeyword = 'SA20';
      fallbackData = SA20_STANDINGS;
    } else if (franchiseParam === 'TSK' || /MLC/i.test(tournamentParam)) {
      tournamentKeyword = 'MLC';
      fallbackData = MLC_STANDINGS;
    }

    await connectToDatabase();
    let standings = await Standing.find({
      tournament: { $regex: new RegExp(tournamentKeyword, 'i') }
    }).sort({ pos: 1 }).lean();

    if (!standings || standings.length === 0) {
      standings = fallbackData;
    }

    return NextResponse.json({
      success: true,
      tournament: `${tournamentKeyword} 2026`,
      standings
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      standings: readFallbackStandings(),
      source: 'fallback'
    });
  }
}

export async function PUT(req) {
  try {
    const session = await requirePermission(req, 'manageMatches');
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { standings, tournament: specifiedTournament } = body;

    if (!Array.isArray(standings)) {
      return NextResponse.json({ success: false, error: 'Standings must be an array' }, { status: 400 });
    }

    const firstItemTournament = standings[0]?.tournament || '';
    const rawTournament = specifiedTournament || firstItemTournament || 'IPL 2026';

    // Normalize tournament keyword to prevent cross-tournament overwriting
    let tournamentKeyword = 'IPL';
    let canonicalTournament = 'IPL 2026';

    if (/SA20/i.test(rawTournament)) {
      tournamentKeyword = 'SA20';
      canonicalTournament = 'SA20 2026';
    } else if (/MLC/i.test(rawTournament)) {
      tournamentKeyword = 'MLC';
      canonicalTournament = 'MLC 2026';
    }

    // Always persist to local fallback JSON
    writeFallbackStandings(standings);

    // Persist to MongoDB - SCOPED TO THIS TOURNAMENT ONLY!
    try {
      await connectToDatabase();
      
      // Delete ONLY the records for this tournament (never wipe out other leagues!)
      await Standing.deleteMany({
        tournament: { $regex: new RegExp(tournamentKeyword, 'i') }
      });

      const docs = standings.map((item, idx) => ({
        pos: item.pos || idx + 1,
        team: item.team,
        shortName: item.shortName || '',
        played: Number(item.played) || 0,
        won: Number(item.won) || 0,
        lost: Number(item.lost) || 0,
        nrr: item.nrr || '+0.000',
        pts: Number(item.pts) || 0,
        isLeader: Boolean(item.isLeader || idx === 0),
        tournament: canonicalTournament,
      }));

      await Standing.insertMany(docs);
    } catch (dbErr) {
      console.warn('MongoDB save error in standings PUT, saved to JSON fallback:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `${canonicalTournament} standings updated successfully (${standings.length} teams)`,
      tournament: canonicalTournament,
      standings
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
