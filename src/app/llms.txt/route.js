import { NextResponse } from 'next/server';
import { getSiteFileContent, getDefaultSiteFile } from '../../lib/siteFiles';

// Served dynamically so admin edits go live without a redeploy.
export const dynamic = 'force-dynamic';

export async function GET() {
  let content;
  try {
    content = await getSiteFileContent('llms.txt');
  } catch (err) {
    content = getDefaultSiteFile('llms.txt');
  }
  return new NextResponse(content || getDefaultSiteFile('llms.txt'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
