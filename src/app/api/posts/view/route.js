import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Post from '../../../../models/Post';

export const dynamic = 'force-dynamic';

/**
 * Public, best-effort article view counter. Increments a real numeric
 * `viewCount` so popularity can be queried/sorted (replacing the decorative
 * "1.2K" string). Clients call this at most once per session per article.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = (body.slug || '').toString().trim().toLowerCase();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    await connectToDatabase();
    await Post.updateOne({ slug }, { $inc: { viewCount: 1 } }).maxTimeMS(1500);

    return NextResponse.json({ success: true });
  } catch (err) {
    // Never fail the page over a view ping.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
