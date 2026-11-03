import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/auth';
import {
  getCustomCodeData,
  saveCustomCodeData,
  syncCustomCodeFromDB,
} from '../../../../lib/customCode';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await syncCustomCodeFromDB();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('Error fetching custom code settings:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch custom code settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role verification
    if (session.role === 'viewer') {
      return NextResponse.json(
        { success: false, error: 'Viewers cannot modify custom code snippets.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await saveCustomCodeData(body, session.username || 'admin');

    return NextResponse.json({
      success: true,
      message: 'Custom Head & Body snippets saved successfully!',
      data: updated,
    });
  } catch (err) {
    console.error('Error saving custom code settings:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save custom code settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  return POST(request);
}
