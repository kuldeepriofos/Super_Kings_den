import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../../lib/mongodb';
import AdminUser from '../../../../../models/AdminUser';
import { getAdminSession } from '../../../../../lib/auth';
import { getPermissionsForRole } from '../../../../../lib/rolePermissions';

/**
 * GET /api/admin/users/[id]/
 */
export async function GET(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    const user = await AdminUser.findById(id).select('-passwordHash').lean();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/[id]/
 * Updates user profile, role, status, permissions, or resets password.
 */
export async function PUT(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'superadmin' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to update users.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = params;

    const targetUser = await AdminUser.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role, status, bio, permissions, password, newPassword } = body || {};
    const passToUpdate = password || newPassword;

    // Safety: Normal admins cannot modify a superadmin
    if (session.role !== 'superadmin' && targetUser.role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Only Super Admins can modify Super Admin accounts.' },
        { status: 403 }
      );
    }

    // Safety: Prevent self-demotion or self-suspension of the current logged-in superadmin
    if (session.username.toLowerCase() === targetUser.username.toLowerCase()) {
      if (status === 'suspended') {
        return NextResponse.json(
          { success: false, error: 'You cannot suspend your own active account.' },
          { status: 400 }
        );
      }
      if (role && role !== 'superadmin' && targetUser.role === 'superadmin') {
        return NextResponse.json(
          { success: false, error: 'You cannot demote your own Super Admin role.' },
          { status: 400 }
        );
      }
    }

    // Update basic fields
    if (name !== undefined) targetUser.name = String(name).trim();
    if (email !== undefined) targetUser.email = String(email).trim().toLowerCase();
    if (bio !== undefined) targetUser.bio = String(bio).trim();

    // Update role & status if permitted
    if (role && ['superadmin', 'admin', 'editor', 'author', 'viewer'].includes(role)) {
      targetUser.role = role;
      if (!permissions) {
        targetUser.permissions = await getPermissionsForRole(role);
      }
    }
    if (status && ['active', 'suspended'].includes(status)) {
      targetUser.status = status;
    }

    // Update granular permissions if passed from user access management modal
    if (permissions && typeof permissions === 'object') {
      const merged = {
        ...(targetUser.permissions || {}),
        ...permissions,
      };

      // Ensure core system flags are accurately synchronized with granular module edit flags
      if (permissions.articles_edit !== undefined || permissions.categories_edit !== undefined || permissions.pages_edit !== undefined) {
        merged.managePosts = Boolean(permissions.articles_edit || permissions.categories_edit || permissions.pages_edit);
      } else if (permissions.managePosts !== undefined) {
        merged.managePosts = Boolean(permissions.managePosts);
      }

      if (permissions.players_edit !== undefined) {
        merged.managePlayers = Boolean(permissions.players_edit);
      } else if (permissions.managePlayers !== undefined) {
        merged.managePlayers = Boolean(permissions.managePlayers);
      }

      if (permissions.matches_edit !== undefined || permissions.standings_edit !== undefined || permissions.stats_edit !== undefined) {
        merged.manageMatches = Boolean(permissions.matches_edit || permissions.standings_edit || permissions.stats_edit);
      } else if (permissions.manageMatches !== undefined) {
        merged.manageMatches = Boolean(permissions.manageMatches);
      }

      if (permissions.media_edit !== undefined || permissions.media_delete !== undefined) {
        merged.manageMedia = Boolean(permissions.media_edit || permissions.media_delete);
      } else if (permissions.manageMedia !== undefined) {
        merged.manageMedia = Boolean(permissions.manageMedia);
      }

      if (permissions.redirects_edit !== undefined) {
        merged.manageRedirects = Boolean(permissions.redirects_edit);
      } else if (permissions.manageRedirects !== undefined) {
        merged.manageRedirects = Boolean(permissions.manageRedirects);
      }

      if (permissions.users_edit !== undefined) {
        merged.manageUsers = Boolean(permissions.users_edit);
      } else if (permissions.manageUsers !== undefined) {
        merged.manageUsers = Boolean(permissions.manageUsers);
      }

      targetUser.permissions = merged;
      targetUser.markModified('permissions');
    }

    // Password reset if new password provided
    if (passToUpdate && String(passToUpdate).trim().length >= 6) {
      targetUser.passwordHash = await bcrypt.hash(String(passToUpdate).trim(), 10);
    }

    await targetUser.save();

    const userObj = targetUser.toObject();
    delete userObj.passwordHash;

    return NextResponse.json({
      success: true,
      message: `User "${targetUser.username}" updated successfully.`,
      user: userObj,
    });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update user: ' + err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]/
 * Deletes user by ID with strict protection against self-deletion or deleting all superadmins.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only superadmin can delete users
    if (session.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Only Super Admins can delete user accounts.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = params;

    const targetUser = await AdminUser.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Safety 1: Cannot delete oneself
    if (session.username.toLowerCase() === targetUser.username.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own active account.' },
        { status: 400 }
      );
    }

    // Safety 2: Cannot delete the last remaining superadmin
    if (targetUser.role === 'superadmin') {
      const superAdminCount = await AdminUser.countDocuments({ role: 'superadmin' });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the only remaining Super Admin account.' },
          { status: 400 }
        );
      }
    }

    await AdminUser.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `User "${targetUser.username}" deleted successfully.`,
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user: ' + err.message },
      { status: 500 }
    );
  }
}
