import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import SiteSettings from '../../../models/SiteSettings';
import defaultSettings from '../../../data/defaultSiteSettings.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SiteSettings.findOne({ key: 'global' }).lean();

    if (!settings) {
      settings = defaultSettings;
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err) {
    console.error('Error fetching public site settings:', err);
    return NextResponse.json({
      success: true,
      settings: defaultSettings,
      fallback: true,
    });
  }
}
