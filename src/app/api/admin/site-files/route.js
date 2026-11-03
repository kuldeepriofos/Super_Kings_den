import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/auth';
import { getAllSiteFiles, saveSiteFile, MANAGED_FILES } from '../../../../lib/siteFiles';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const files = await getAllSiteFiles();
    return NextResponse.json({ success: true, files });
  } catch (err) {
    console.error('Error fetching site files:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch site files' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'viewer') {
      return NextResponse.json(
        { success: false, error: 'Viewers cannot modify site files.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = (body.name || '').toString();
    if (!MANAGED_FILES.includes(name)) {
      return NextResponse.json(
        { success: false, error: `Invalid file. Allowed: ${MANAGED_FILES.join(', ')}` },
        { status: 400 }
      );
    }

    const saved = await saveSiteFile(name, body.content, session.username || 'admin');
    return NextResponse.json({
      success: true,
      message: `${name} saved successfully`,
      file: saved,
    });
  } catch (err) {
    console.error('Error saving site file:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save site file' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return PUT(request);
}
