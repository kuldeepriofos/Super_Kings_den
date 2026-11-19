import { NextResponse } from 'next/server';
import { getAdminSession, AUTH_COOKIE_NAME } from '../../../../../lib/auth';
import connectToDatabase, { isDatabaseConnected } from '../../../../../lib/mongodb';
import AdminUser from '../../../../../models/AdminUser';
import { getPermissionsForRole } from '../../../../../lib/rolePermissions';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let dbConnected = false;
    let dbError = null;
    let liveUser = {
      username: session.username,
      role: session.role || 'superadmin',
      status: 'active',
    };

    try {
      await connectToDatabase();
      dbConnected = isDatabaseConnected();

      if (dbConnected) {
        const dbUser = await AdminUser.findOne({
          username: { $regex: new RegExp(`^${session.username}$`, 'i') },
        }).lean();

        if (dbUser) {
          // If user account is suspended by an administrator, immediately invalidate session
          if (dbUser.status === 'suspended') {
            const suspendedRes = NextResponse.json(
              {
                success: false,
                authenticated: false,
                error: 'Your account has been suspended by an administrator.',
              },
              { status: 403 }
            );
            suspendedRes.cookies.set({
              name: AUTH_COOKIE_NAME,
              value: '',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 0,
              path: '/',
            });
            return suspendedRes;
          }

          const rolePermissions = await getPermissionsForRole(dbUser.role || 'viewer');
          const userPerms = dbUser.permissions || {};
          const effectivePermissions = {
            ...rolePermissions,
            ...userPerms,
          };

          // Synchronize core flags with granular settings
          if (userPerms.articles_edit !== undefined || userPerms.categories_edit !== undefined || userPerms.pages_edit !== undefined) {
            effectivePermissions.managePosts = Boolean(userPerms.articles_edit || userPerms.categories_edit || userPerms.pages_edit);
          } else if (userPerms.managePosts !== undefined) {
            effectivePermissions.managePosts = Boolean(userPerms.managePosts);
          }

          if (userPerms.players_edit !== undefined) {
            effectivePermissions.managePlayers = Boolean(userPerms.players_edit);
          } else if (userPerms.managePlayers !== undefined) {
            effectivePermissions.managePlayers = Boolean(userPerms.managePlayers);
          }

          if (userPerms.matches_edit !== undefined || userPerms.standings_edit !== undefined || userPerms.stats_edit !== undefined) {
            effectivePermissions.manageMatches = Boolean(userPerms.matches_edit || userPerms.standings_edit || userPerms.stats_edit);
          } else if (userPerms.manageMatches !== undefined) {
            effectivePermissions.manageMatches = Boolean(userPerms.manageMatches);
          }

          if (userPerms.media_edit !== undefined || userPerms.media_delete !== undefined) {
            effectivePermissions.manageMedia = Boolean(userPerms.media_edit || userPerms.media_delete);
          } else if (userPerms.manageMedia !== undefined) {
            effectivePermissions.manageMedia = Boolean(userPerms.manageMedia);
          }

          if (userPerms.redirects_edit !== undefined) {
            effectivePermissions.manageRedirects = Boolean(userPerms.redirects_edit);
          } else if (userPerms.manageRedirects !== undefined) {
            effectivePermissions.manageRedirects = Boolean(userPerms.manageRedirects);
          }

          if (userPerms.users_edit !== undefined) {
            effectivePermissions.manageUsers = Boolean(userPerms.users_edit);
          } else if (userPerms.manageUsers !== undefined) {
            effectivePermissions.manageUsers = Boolean(userPerms.manageUsers);
          }

          liveUser = {
            username: dbUser.username,
            name: dbUser.name || dbUser.username,
            role: dbUser.role || 'viewer',
            status: dbUser.status || 'active',
            permissions: effectivePermissions,
          };
        }
      }
    } catch (e) {
      dbConnected = false;
      dbError = e.message || 'Database connection error';
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: liveUser,
      db: {
        connected: dbConnected,
        error: dbError,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Session check failed' },
      { status: 500 }
    );
  }
}
