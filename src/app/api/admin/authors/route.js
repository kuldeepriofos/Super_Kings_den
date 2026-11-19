import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Post from '../../../../models/Post';
import AdminUser from '../../../../models/AdminUser';

export const dynamic = 'force-dynamic';

const DEFAULT_AUTHORS = [
  'Super Kings Den Team',
  'Super Kings Den Admin',
  'News Desk',
  'Ajay Nedungadi',
  'Divakar Jha',
  'Divyansh Mishra',
  'Hire and Hire',
  'Rati Agarwal',
  'Vaibhaw Tiwari',
  'Yash Soni',
];

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [postAuthors, adminUsers] = await Promise.all([
      Post.distinct('author'),
      AdminUser.find({ isActive: { $ne: false } }).select('name username').lean(),
    ]);

    const set = new Set(DEFAULT_AUTHORS);

    (postAuthors || []).forEach((a) => {
      if (a && typeof a === 'string' && a.trim()) {
        set.add(a.trim());
      }
    });

    (adminUsers || []).forEach((u) => {
      if (u.name && u.name.trim()) set.add(u.name.trim());
      else if (u.username && u.username.trim()) set.add(u.username.trim());
    });

    const authors = Array.from(set).sort((a, b) => {
      // Prioritize primary team authors at top
      if (a === 'Super Kings Den Team') return -1;
      if (b === 'Super Kings Den Team') return 1;
      if (a === 'Super Kings Den Admin') return -1;
      if (b === 'Super Kings Den Admin') return 1;
      return a.localeCompare(b);
    });

    return NextResponse.json({ success: true, authors });
  } catch (err) {
    console.error('Authors GET error:', err);
    return NextResponse.json({ success: true, authors: DEFAULT_AUTHORS });
  }
}
