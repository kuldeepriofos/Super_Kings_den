import { NextResponse } from 'next/server';
import { getAdminSession, AUTH_COOKIE_NAME } from '../../../../../lib/auth';
import connectToDatabase, { isDatabaseConnected } from '../../../../../lib/mongodb';
import AdminUser from '../../../../../models/AdminUser';

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

          liveUser = {
            username: dbUser.username,
            name: dbUser.name || dbUser.username,
            role: dbUser.role || 'viewer',
            status: dbUser.status || 'active',
            permissions: dbUser.permissions || {},
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
