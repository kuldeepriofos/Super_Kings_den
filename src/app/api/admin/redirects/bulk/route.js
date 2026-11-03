import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Redirect from '../../../../../models/Redirect';
import { normalizePath, syncRedirectsJson } from '../../../../../lib/redirects';

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids, items } = body || {};

    await connectToDatabase();

    // 1. Bulk Import Rules
    if (action === 'import' && Array.isArray(items)) {
      let created = 0;
      let skipped = 0;

      for (const item of items) {
        if (!item.source || !item.destination) {
          skipped++;
          continue;
        }
        const cleanSource = normalizePath(item.source);
        const existing = await Redirect.findOne({ source: cleanSource });
        if (existing) {
          skipped++;
          continue;
        }

        await Redirect.create({
          source: cleanSource,
          destination: item.destination.trim(),
          statusCode: Number(item.statusCode) === 302 ? 302 : 301,
          matchType: ['exact', 'prefix', 'regex'].includes(item.matchType) ? item.matchType : 'exact',
          isActive: item.isActive !== false,
          description: item.description || 'Imported rule',
          createdBy: session.user?.username || 'admin',
        });
        created++;
      }

      const all = await Redirect.find().lean();
      syncRedirectsJson(all);

      return NextResponse.json({
        success: true,
        message: `Imported ${created} redirects (${skipped} skipped/duplicates).`,
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Array of "ids" is required for bulk actions.' },
        { status: 400 }
      );
    }

    // 2. Bulk Activate
    if (action === 'activate') {
      const res = await Redirect.updateMany({ _id: { $in: ids } }, { $set: { isActive: true } });
      const all = await Redirect.find().lean();
      syncRedirectsJson(all);
      return NextResponse.json({ success: true, message: `Activated ${res.modifiedCount} redirects.` });
    }

    // 3. Bulk Deactivate
    if (action === 'deactivate') {
      const res = await Redirect.updateMany({ _id: { $in: ids } }, { $set: { isActive: false } });
      const all = await Redirect.find().lean();
      syncRedirectsJson(all);
      return NextResponse.json({ success: true, message: `Paused ${res.modifiedCount} redirects.` });
    }

    // 4. Bulk Reset Hits
    if (action === 'reset_hits') {
      const res = await Redirect.updateMany({ _id: { $in: ids } }, { $set: { hitCount: 0 } });
      const all = await Redirect.find().lean();
      syncRedirectsJson(all);
      return NextResponse.json({ success: true, message: `Reset hit counters for ${res.modifiedCount} redirects.` });
    }

    // 5. Bulk Delete
    if (action === 'delete') {
      const res = await Redirect.deleteMany({ _id: { $in: ids } });
      const all = await Redirect.find().lean();
      syncRedirectsJson(all);
      return NextResponse.json({ success: true, message: `Deleted ${res.deletedCount} redirects.` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Bulk redirect error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
