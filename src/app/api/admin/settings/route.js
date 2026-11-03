import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import SiteSettings from '../../../../models/SiteSettings';
import defaultSettings from '../../../../data/defaultSiteSettings.json';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let settings = await SiteSettings.findOne({ key: 'global' }).lean();

    if (!settings) {
      // Initialize default settings document in DB
      settings = await SiteSettings.create({
        key: 'global',
        ...defaultSettings,
        updatedBy: session.username || 'admin',
      });
      settings = settings.toObject();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err) {
    console.error('Error fetching admin site settings:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch site settings' },
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

    const body = await request.json();
    await connectToDatabase();

    const singleEmail = (body.email !== undefined ? body.email : (body.primaryEmail || '')).trim() || defaultSettings.email;

    const updateData = {
      siteName: body.siteName || defaultSettings.siteName,
      siteTagline: body.siteTagline || defaultSettings.siteTagline,
      email: singleEmail,
      primaryEmail: singleEmail,
      editorialEmail: singleEmail,
      partnershipsEmail: singleEmail,
      supportEmail: singleEmail,
      phone: body.phone !== undefined ? body.phone.trim() : defaultSettings.phone,
      whatsapp: body.whatsapp !== undefined ? body.whatsapp.trim() : defaultSettings.whatsapp,
      address: body.address !== undefined ? body.address.trim() : defaultSettings.address,
      deskHours: body.deskHours !== undefined ? body.deskHours.trim() : defaultSettings.deskHours,
      social: {
        twitter: body.social?.twitter !== undefined ? body.social.twitter.trim() : defaultSettings.social.twitter,
        facebook: body.social?.facebook !== undefined ? body.social.facebook.trim() : defaultSettings.social.facebook,
        instagram: body.social?.instagram !== undefined ? body.social.instagram.trim() : defaultSettings.social.instagram,
        youtube: body.social?.youtube !== undefined ? body.social.youtube.trim() : defaultSettings.social.youtube,
        whatsapp: body.social?.whatsapp !== undefined ? body.social.whatsapp.trim() : defaultSettings.social.whatsapp,
        telegram: body.social?.telegram !== undefined ? body.social.telegram.trim() : '',
        threads: body.social?.threads !== undefined ? body.social.threads.trim() : '',
        linkedin: body.social?.linkedin !== undefined ? body.social.linkedin.trim() : '',
      },
      footer: {
        aboutText: body.footer?.aboutText !== undefined ? body.footer.aboutText.trim() : defaultSettings.footer.aboutText,
        copyrightText: body.footer?.copyrightText !== undefined ? body.footer.copyrightText.trim() : defaultSettings.footer.copyrightText,
      },
      updatedBy: session.username || 'admin',
    };

    const updatedSettings = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: 'Contact details and social links updated successfully!',
      settings: updatedSettings,
    });
  } catch (err) {
    console.error('Error updating site settings:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
