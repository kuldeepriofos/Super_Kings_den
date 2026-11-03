import { NextResponse } from 'next/server';
import connectToDatabase, { isDatabaseConnected } from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Post from '../../../../models/Post';
import Player from '../../../../models/Player';
import Category from '../../../../models/Category';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [
      postsCount,
      currentSquadCount,
      legendsCount,
      totalPlayersCount,
      categoriesCount,
      latestPosts,
    ] = await Promise.all([
      Post.countDocuments(),
      Player.countDocuments({ isCurrent: true }),
      Player.countDocuments({ isLegend: true }),
      Player.countDocuments(),
      Category.countDocuments(),
      Post.find().sort({ publishedAt: -1, id: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        postsCount,
        currentSquadCount,
        legendsCount,
        totalPlayersCount,
        categoriesCount,
        dbConnected: isDatabaseConnected(),
        dbHost: 'mongodb://127.0.0.1:27017/superkingsden',
        latestPosts: latestPosts.map((p) => ({
          _id: p._id,
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          franchise: p.franchise,
          date: p.date,
          views: p.views,
          featuredImage: p.featuredImage,
        })),
      },
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
