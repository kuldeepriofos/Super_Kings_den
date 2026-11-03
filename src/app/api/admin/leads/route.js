import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Lead from '../../../../models/Lead';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all'; // all | new | contacted | in_progress | resolved | archived
    const search = (searchParams.get('search') || '').trim();
    const inquiryType = (searchParams.get('type') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (inquiryType && inquiryType !== 'all') {
      query.inquiryType = inquiryType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [leads, filteredCount, totalCount, newCount, contactedCount, inProgressCount, resolvedCount, archivedCount] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(query),
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'contacted' }),
      Lead.countDocuments({ status: 'in_progress' }),
      Lead.countDocuments({ status: 'resolved' }),
      Lead.countDocuments({ status: 'archived' }),
    ]);

    return NextResponse.json({
      success: true,
      leads: leads.map(l => ({ ...l, _id: String(l._id) })),
      pagination: {
        page,
        limit,
        total: filteredCount,
        totalPages: Math.ceil(filteredCount / limit) || 1,
      },
      counts: {
        total: totalCount,
        new: newCount,
        contacted: contactedCount,
        in_progress: inProgressCount,
        resolved: resolvedCount,
        archived: archivedCount,
      },
    });
  } catch (err) {
    console.error('Admin Leads GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
