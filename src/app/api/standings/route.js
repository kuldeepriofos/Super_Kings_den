import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../lib/mongodb.js';
import Standing from '../../../models/Standing.js';
import { getFranchiseStandings, IPL_STANDINGS, SA20_STANDINGS, MLC_STANDINGS } from '../../../data/franchiseStandingsData.js';

export const dynamic = 'force-dynamic';

function getFallbackForFranchise(franchise = 'CSK') {
  const norm = (franchise || 'CSK').toUpperCase();
  if (norm === 'JSK') return SA20_STANDINGS;
  if (norm === 'TSK') return MLC_STANDINGS;
  return IPL_STANDINGS;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const franchiseParam = (searchParams.get('franchise') || '').toUpperCase();
    const tournamentParam = searchParams.get('tournament') || '';

    // Determine target tournament keywords
    let tournamentKeyword = 'IPL';
    let targetFranchise = 'CSK';

    if (franchiseParam === 'JSK' || /SA20/i.test(tournamentParam)) {
      tournamentKeyword = 'SA20';
      targetFranchise = 'JSK';
    } else if (franchiseParam === 'TSK' || /MLC/i.test(tournamentParam)) {
      tournamentKeyword = 'MLC';
      targetFranchise = 'TSK';
    } else {
      tournamentKeyword = 'IPL';
      targetFranchise = 'CSK';
    }

    await connectToDatabase();

    // Query standings scoped strictly to the requested tournament
    let standings = await Standing.find({
      tournament: { $regex: new RegExp(tournamentKeyword, 'i') }
    }).sort({ pos: 1 }).lean();

    // If no records in MongoDB for this tournament, return clean franchise fallback
    if (!standings || standings.length === 0) {
      standings = getFallbackForFranchise(targetFranchise);
    } else {
      // Safety verification: Ensure CSK never receives JSK/SA20 data, etc.
      if (targetFranchise === 'CSK') {
        const hasForeignTeam = standings.some(s => s.team?.toLowerCase().includes('joburg') || s.team?.toLowerCase().includes('paarl'));
        if (hasForeignTeam) {
          standings = IPL_STANDINGS;
        }
      } else if (targetFranchise === 'JSK') {
        const hasForeignTeam = standings.some(s => s.team?.toLowerCase().includes('chennai') || s.team?.toLowerCase().includes('texas'));
        if (hasForeignTeam) {
          standings = SA20_STANDINGS;
        }
      } else if (targetFranchise === 'TSK') {
        const hasForeignTeam = standings.some(s => s.team?.toLowerCase().includes('chennai') || s.team?.toLowerCase().includes('joburg'));
        if (hasForeignTeam) {
          standings = MLC_STANDINGS;
        }
      }
    }

    return NextResponse.json({
      success: true,
      franchise: targetFranchise,
      tournament: `${tournamentKeyword} 2026`,
      count: standings.length,
      standings
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    });
  } catch (err) {
    console.error('Error fetching standings:', err);
    return NextResponse.json({
      success: true,
      standings: IPL_STANDINGS,
      source: 'fallback'
    });
  }
}
