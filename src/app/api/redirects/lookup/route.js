import { NextResponse } from 'next/server';
import { findMatchingRedirect, normalizePath } from '../../../../lib/redirects';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url') || searchParams.get('path');

    if (!rawUrl) {
      return NextResponse.json(
        { matched: false, error: 'Query parameter "url" is required' },
        { status: 400 }
      );
    }

    const testPath = normalizePath(rawUrl);
    const result = await findMatchingRedirect(testPath);

    if (result) {
      return NextResponse.json({
        matched: true,
        redirect: result,
      });
    }

    return NextResponse.json({
      matched: false,
      testedUrl: testPath,
      message: 'No active redirect rule matched this URL.',
    });
  } catch (err) {
    return NextResponse.json(
      { matched: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawUrl = body.url || body.path;

    if (!rawUrl) {
      return NextResponse.json(
        { matched: false, error: 'Request body must contain "url"' },
        { status: 400 }
      );
    }

    const testPath = normalizePath(rawUrl);
    const result = await findMatchingRedirect(testPath);

    if (result) {
      return NextResponse.json({
        matched: true,
        redirect: result,
      });
    }

    return NextResponse.json({
      matched: false,
      testedUrl: testPath,
      message: 'No active redirect rule matched this URL.',
    });
  } catch (err) {
    return NextResponse.json(
      { matched: false, error: err.message },
      { status: 500 }
    );
  }
}
