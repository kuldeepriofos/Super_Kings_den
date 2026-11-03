import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/mongodb';
import AdminUser from '../../../../models/AdminUser';
import { getAdminSession } from '../../../../lib/auth';

// Helper: default permissions per role
function getDefaultPermissions(role) {
  switch (role) {
    case 'superadmin':
      return {
        managePosts: true,
        managePlayers: true,
        manageMatches: true,
        manageMedia: true,
        manageRedirects: true,
        manageUsers: true,
      };
    case 'admin':
      return {
        managePosts: true,
        managePlayers: true,
        manageMatches: true,
        manageMedia: true,
        manageRedirects: true,
        manageUsers: false,
      };
    case 'editor':
      return {
        managePosts: true,
        managePlayers: true,
        manageMatches: true,
        manageMedia: true,
        manageRedirects: false,
        manageUsers: false,
      };
    case 'author':
      return {
        managePosts: true,
        managePlayers: false,
        manageMatches: false,
        manageMedia: true,
        manageRedirects: false,
        manageUsers: false,
      };
    case 'viewer':
    default:
      return {
        managePosts: false,
        managePlayers: false,
        manageMatches: false,
        manageMedia: false,
        manageRedirects: false,
        manageUsers: false,
      };
  }
}

/**
 * GET /api/admin/users/
 * Lists all admin users with metrics, search and role/status filtering.
 */
export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only superadmin or admin can access user management
    if (session.role !== 'superadmin' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to view user management data.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || 'all';
    const statusFilter = searchParams.get('status') || 'all';

    // Build filter query
    const query = {};
    if (search.trim()) {
      const q = search.trim();
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (roleFilter !== 'all') {
      query.role = roleFilter;
    }
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    // Fetch users excluding sensitive passwordHash
    const users = await AdminUser.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    // Summary Statistics
    const allUsers = await AdminUser.find({}).select('role status').lean();
    const stats = {
      total: allUsers.length,
      superadmin: allUsers.filter((u) => u.role === 'superadmin').length,
      admin: allUsers.filter((u) => u.role === 'admin').length,
      editor: allUsers.filter((u) => u.role === 'editor').length,
      author: allUsers.filter((u) => u.role === 'author').length,
      viewer: allUsers.filter((u) => u.role === 'viewer').length,
      active: allUsers.filter((u) => u.status === 'active' || !u.status).length,
      suspended: allUsers.filter((u) => u.status === 'suspended').length,
    };

    return NextResponse.json({
      success: true,
      users,
      stats,
      currentUser: {
        username: session.username,
        role: session.role || 'superadmin',
      },
    });
  } catch (err) {
    console.error('Fetch users error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users: ' + err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/
 * Creates a new user with hashed password and role permissions.
 */
export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only superadmin or admin can create users
    if (session.role !== 'superadmin' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to create users.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      username,
      name = '',
      email = '',
      password,
      role = 'editor',
      status = 'active',
      bio = '',
      permissions,
    } = body || {};

    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, error: 'Username is required.' },
        { status: 400 }
      );
    }

    if (!password || String(password).trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check username uniqueness
    const existing = await AdminUser.findOne({ username: cleanUsername });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Username "${cleanUsername}" is already taken.` },
        { status: 400 }
      );
    }

    // Hash password with salt 10
    const passwordHash = await bcrypt.hash(String(password).trim(), 10);

    // Merge default permissions with any custom overrides
    const defaultPerms = getDefaultPermissions(role);
    const finalPermissions = permissions ? { ...defaultPerms, ...permissions } : defaultPerms;

    const newUser = await AdminUser.create({
      username: cleanUsername,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role,
      status: status === 'suspended' ? 'suspended' : 'active',
      bio: String(bio).trim(),
      permissions: finalPermissions,
      createdBy: session.username || 'system',
    });

    const userObj = newUser.toObject();
    delete userObj.passwordHash;

    return NextResponse.json({
      success: true,
      message: `User "${cleanUsername}" created successfully.`,
      user: userObj,
    });
  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create user: ' + err.message },
      { status: 500 }
    );
  }
}
