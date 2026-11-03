import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import { getAdminSession } from '../../../../lib/auth';
import Post from '../../../../models/Post';
import Player from '../../../../models/Player';
import Category from '../../../../models/Category';
import Fixture from '../../../../models/Fixture';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [posts, players, categories, fixtures] = await Promise.all([
      Post.find().lean(),
      Player.find().lean(),
      Category.find().lean(),
      Fixture.find().lean(),
    ]);

    const backupData = {
      success: true,
      backupDate: new Date().toISOString(),
      version: '2.0.0',
      source: 'Super Kings Den Autonomous MongoDB',
      stats: {
        totalPosts: posts.length,
        totalPlayers: players.length,
        totalCategories: categories.length,
        totalFixtures: fixtures.length,
      },
      categories,
      players,
      fixtures,
      posts,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);

    return new Response(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="superkingsden_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
