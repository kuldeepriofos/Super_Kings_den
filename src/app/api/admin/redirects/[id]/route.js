import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import { getAdminSession } from '../../../../../lib/auth';
import Redirect from '../../../../../models/Redirect';
import {
  normalizePath,
  stripTrailingSlash,
  syncRedirectsJson,
} from '../../../../../lib/redirects';

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const redirect = await Redirect.findById(id).lean();
    if (!redirect) {
      return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, redirect });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    await connectToDatabase();
    const existing = await Redirect.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    }

    // Handle Quick Toggle (only toggling isActive)
    if (body.isActive !== undefined && Object.keys(body).length <= 2) {
      existing.isActive = Boolean(body.isActive);
      await existing.save();

      const all = await Redirect.find().lean();
      syncRedirectsJson(all);

      return NextResponse.json({
        success: true,
        redirect: existing,
        message: `Redirect ${existing.isActive ? 'activated' : 'paused'} successfully.`,
      });
    }

    // Handle Full Edit
    let { source, destination, statusCode, matchType, isActive, description, hitCount } = body || {};

    if (source) existing.source = normalizePath(source);
    if (destination) {
      let cleanDest = String(destination).trim();
      if (!cleanDest.startsWith('http://') && !cleanDest.startsWith('https://')) {
        cleanDest = normalizePath(cleanDest);
      }
      existing.destination = cleanDest;
    }

    // Loop check
    if (stripTrailingSlash(existing.source.toLowerCase()) === stripTrailingSlash(existing.destination.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Redirect loop detected: Source and Destination cannot be identical.' },
        { status: 400 }
      );
    }

    if (statusCode !== undefined) {
      existing.statusCode = Number(statusCode) === 302 ? 302 : 301;
    }

    if (matchType && ['exact', 'prefix', 'regex'].includes(matchType)) {
      existing.matchType = matchType;
    }

    if (isActive !== undefined) {
      existing.isActive = Boolean(isActive);
    }

    if (description !== undefined) {
      existing.description = String(description).trim();
    }

    if (hitCount !== undefined && Number.isInteger(Number(hitCount))) {
      existing.hitCount = Math.max(0, Number(hitCount));
    }

    await existing.save();

    const all = await Redirect.find().lean();
    syncRedirectsJson(all);

    return NextResponse.json({
      success: true,
      redirect: existing,
      message: 'Redirect updated successfully.',
    });
  } catch (err) {
    console.error('Error updating redirect:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const deleted = await Redirect.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    }

    const all = await Redirect.find().lean();
    syncRedirectsJson(all);

    return NextResponse.json({
      success: true,
      message: `Deleted redirect for "${deleted.source}"`,
    });
  } catch (err) {
    console.error('Error deleting redirect:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
