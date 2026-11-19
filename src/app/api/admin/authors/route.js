import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import AdminUser from '../../../../models/AdminUser';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Authors must strictly be registered active admin/editor/author users
    const adminUsers = await AdminUser.find({
      status: { $ne: 'suspended' },
    })
      .select('name username role email')
      .sort({ role: 1, name: 1, username: 1 })
      .lean();

    const seen = new Set();
    const authors = [];

    (adminUsers || []).forEach((u) => {
      const displayName = (u.name && u.name.trim()) || (u.username && u.username.trim());
      if (displayName && !seen.has(displayName)) {
        seen.add(displayName);
        authors.push({
          id: String(u._id),
          name: displayName,
          username: u.username,
          role: u.role || 'author',
        });
      }
    });

    return NextResponse.json({
      success: true,
      authors,
      authorNames: authors.map((a) => a.name),
    });
  } catch (err) {
    console.error('Authors GET error:', err);
    return NextResponse.json(
      { success: false, error: err.message, authors: [], authorNames: [] },
      { status: 500 }
    );
  }
}
