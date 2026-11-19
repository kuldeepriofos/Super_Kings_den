import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/auth';
import connectToDatabase from '../../../../lib/mongodb';
import AdminUser from '../../../../models/AdminUser';
import {
  getAllRolePermissions,
  updateRolePermissions,
  DEFAULT_ROLE_DEFINITIONS,
} from '../../../../lib/rolePermissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/roles
 * Returns all system roles with configured permissions and user assignment counts.
 */
export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const roles = await getAllRolePermissions();

    // Count how many users have each role
    const userCounts = {
      superadmin: 0,
      admin: 0,
      editor: 0,
      author: 0,
      viewer: 0,
    };

    try {
      await connectToDatabase();
      const allUsers = await AdminUser.find({}).select('role').lean();
      for (const u of allUsers) {
        if (userCounts[u.role] !== undefined) {
          userCounts[u.role] += 1;
        }
      }
    } catch (countErr) {
      console.warn('Could not aggregate user counts per role:', countErr.message);
    }

    const rolesWithCounts = roles.map((r) => ({
      ...r,
      userCount: userCounts[r.role] || 0,
    }));

    return NextResponse.json({
      success: true,
      roles: rolesWithCounts,
    });
  } catch (err) {
    console.error('GET /api/admin/roles error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles: ' + err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/roles
 * Updates rights/permissions for a specific role and syncs all users assigned to that role.
 */
export async function PUT(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role rights management is restricted to Super Admin or users with manageUsers privilege
    if (session.role !== 'superadmin' && !session.permissions?.manageUsers) {
      return NextResponse.json(
        { success: false, error: 'Permission denied: Super Admin privilege required to modify role rights.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, permissions } = body || {};

    if (!role || !DEFAULT_ROLE_DEFINITIONS[role]) {
      return NextResponse.json(
        { success: false, error: `Invalid role: "${role}"` },
        { status: 400 }
      );
    }

    if (role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Super Admin permissions are root-locked and cannot be modified.' },
        { status: 400 }
      );
    }

    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Permissions object is required' },
        { status: 400 }
      );
    }

    const updated = await updateRolePermissions(role, permissions, session.username || 'admin');

    return NextResponse.json({
      success: true,
      message: `Permissions for role "${DEFAULT_ROLE_DEFINITIONS[role]?.label || role}" updated successfully. All assigned users now have these rights.`,
      role: updated,
    });
  } catch (err) {
    console.error('PUT /api/admin/roles error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update role permissions: ' + err.message },
      { status: 500 }
    );
  }
}
