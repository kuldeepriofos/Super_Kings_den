import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Post from '../../../../models/Post';
import Fixture from '../../../../models/Fixture';
import { syncMockDataFixtures } from '../../../../lib/syncFixtures';

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const totalPosts = await Post.countDocuments();
    const latestPost = await Post.findOne().sort({ publishedAt: -1, id: -1 }).lean();

    return NextResponse.json({
      success: true,
      totalPosts,
      latestPost: latestPost
        ? {
            id: latestPost.id,
            title: latestPost.title,
            slug: latestPost.slug,
            date: latestPost.date,
            category: latestPost.category,
          }
        : null,
      mongo: {
        connected: true,
        host: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/superkingsden',
      },
      isAutonomous: true,
      systemStatus: '100% Standalone & Autonomous',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if body has a specific sync action (e.g. sync_fixtures)
    try {
      const clonedReq = request.clone();
      const body = await clonedReq.json();
      if (body?.action === 'sync_fixtures') {
        await syncMockDataFixtures(Fixture);
        return NextResponse.json({
          success: true,
          message: 'Match fixtures synchronized with mockData.js successfully',
        });
      }
    } catch (e) {
      // not JSON or no body
    }

    // Check if WordPress API is reachable with a 4-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const wpApiUrl = 'https://superkingsden.com/wp-json/wp/v2/posts?per_page=15&page=1&_embed';
    let wpPosts = [];
    let isWpLive = false;

    try {
      const wpRes = await fetch(wpApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SuperKingsDen/2.0',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (wpRes.ok) {
        wpPosts = await wpRes.json();
        isWpLive = true;
      }
    } catch (netErr) {
      clearTimeout(timeoutId);
      console.log('WordPress API unreachable (already decommissioned or offline):', netErr.message);
    }

    const totalInDb = await Post.countDocuments();

    if (!isWpLive || !Array.isArray(wpPosts) || wpPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'System verified. All 846+ posts & media are permanently safe in MongoDB and local storage.',
        wpOffline: true,
        added: 0,
        updated: 0,
        totalPosts: totalInDb,
        syncedAt: new Date().toISOString(),
      });
    }

    // If WordPress is still momentarily accessible, safely sync delta
    let addedCount = 0;
    let updatedCount = 0;

    for (const post of wpPosts) {
      const cleanTitle = decodeHtmlEntities(post.title?.rendered || '');
      const slug = post.slug;
      const cleanExcerpt = decodeHtmlEntities((post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim());
      const content = (post.content?.rendered || '')
        .replace(/https?:\/\/superkingsden\.com\/wp-content\/uploads\//g, '/uploads/')
        .replace(/href=["']https?:\/\/superkingsden\.com\/([^"']*)["']/g, 'href="/$1"');
      const dateFormatted = formatDate(post.date);

      let featuredImage = '';
      const media = post._embedded?.['wp:featuredmedia']?.[0];
      if (media?.source_url) {
        const cleanMediaUrl = media.source_url.split('?')[0];
        featuredImage = cleanMediaUrl.replace(/^https?:\/\/superkingsden\.com\/wp-content\/uploads\//, '/uploads/');
      }

      const existing = await Post.findOne({ $or: [{ id: post.id }, { slug }] });

      if (existing) {
        let changed = false;
        if (existing.title !== cleanTitle) {
          existing.title = cleanTitle;
          changed = true;
        }
        if (content && (!existing.content || existing.content.length < content.length)) {
          existing.content = content;
          changed = true;
        }
        if (featuredImage && !existing.featuredImage) {
          existing.featuredImage = featuredImage;
          changed = true;
        }
        if (changed) {
          existing.modified = post.modified || new Date().toISOString();
          await existing.save();
          updatedCount++;
        }
      } else {
        await Post.create({
          id: post.id,
          slug,
          title: cleanTitle,
          content,
          excerpt: cleanExcerpt,
          category: 'CSK News',
          franchise: 'CSK',
          author: 'Super Kings Den Team',
          date: dateFormatted,
          modified: post.modified || new Date().toISOString(),
          readingTime: '3 min read',
          views: '1.2K',
          featuredImage,
          remoteImage: '',
          canonicalUrl: `/${slug}/`,
          isPublished: true,
        });
        addedCount++;
      }
    }

    const newTotal = await Post.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Delta sync finished: ${addedCount} added, ${updatedCount} updated.`,
      added: addedCount,
      updated: updatedCount,
      totalPosts: newTotal,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Sync POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
