import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../lib/mongodb.js';
import FranchiseStat from '../../../models/FranchiseStat.js';

const STATS_FILE = path.join(process.cwd(), 'src', 'data', 'franchiseStatsData.json');

export const dynamic = 'force-dynamic';

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

/**
 * Public, read-only franchise statistics endpoint.
 * Mirrors the admin GET but requires no session so public pages
 * (StatsHub, FranchiseFixturesView) can render without exposing admin APIs.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const franchise = searchParams.get('franchise')?.toUpperCase();

    await connectToDatabase();
    const stats = await FranchiseStat.find({}).lean().maxTimeMS(2000);

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
    const { searchParams } = new URL(req.url);
    const franchise = searchParams.get('franchise')?.toUpperCase();
    if (franchise) {
      return NextResponse.json({ success: true, data: fallback[franchise] || fallback.CSK, source: 'fallback' });
    }
    return NextResponse.json({ success: true, data: fallback, source: 'fallback' });
  }
}
