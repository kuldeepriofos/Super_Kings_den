import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Redirect from '../../../../models/Redirect';
import fallbackRedirects from '../../../../data/redirectsData.json';

// Always compute fresh from the DB; the edge middleware keeps its own short
// in-memory TTL cache in front of this so DB edits go live within seconds
// without a per-request database round-trip.
export const dynamic = 'force-dynamic';

/**
 * Lightweight public endpoint returning the active redirect ruleset for the
 * edge middleware. Falls back to the bundled JSON seed when the DB is down so
 * redirects keep working during an outage.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const rules = await Redirect.find({ isActive: true })
      .select('source destination matchType statusCode appendRemainder isActive')
      .lean()
      .maxTimeMS(1500);

    if (rules && rules.length > 0) {
      return NextResponse.json({ source: 'db', rules });
    }
  } catch (err) {
    // fall through to bundled seed
  }

  const seed = Array.isArray(fallbackRedirects)
    ? fallbackRedirects.filter((r) => r && r.isActive)
    : [];
  return NextResponse.json({ source: 'fallback', rules: seed });
}
