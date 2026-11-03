import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../../lib/mongodb';
import AdminUser from '../../../../../models/AdminUser';
import { signAdminToken, AUTH_COOKIE_NAME } from '../../../../../lib/auth';

// Rate Limiting Map for Brute-force Login Protection (In-Memory)
const loginAttemptsMap = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown-ip';
}

function checkRateLimit(ipKey) {
  const record = loginAttemptsMap.get(ipKey);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMins = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Too many failed login attempts. Account temporarily locked. Please try again in ${remainingMins} minute(s).`,
    };
  }

  // Reset if window has elapsed
  if (record.firstAttempt && now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    loginAttemptsMap.delete(ipKey);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ipKey) {
  const now = Date.now();
  const record = loginAttemptsMap.get(ipKey) || { count: 0, firstAttempt: now };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_WINDOW_MS;
  }

  loginAttemptsMap.set(ipKey, record);
}

function clearRateLimit(ipKey) {
  loginAttemptsMap.delete(ipKey);
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: rateCheck.message }, { status: 429 });
    }

    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Env-based bootstrap admin. Only enabled when BOTH vars are explicitly set
    // (no hardcoded default password) — intended for first-run seeding only.
    const envUser = (process.env.ADMIN_USERNAME || '').toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD || '';

    let authenticated = false;
    let userRole = 'superadmin';
    let userPermissions = null;

    // 1. Try MongoDB AdminUser (by username or email)
    try {
      await connectToDatabase();
      const dbUser = await AdminUser.findOne({
        $or: [
          { username: cleanUsername },
          { email: cleanUsername }
        ]
      });
      if (dbUser && dbUser.passwordHash) {
        if (dbUser.status === 'suspended') {
          return NextResponse.json(
            { success: false, error: 'Your account has been suspended. Please contact the Super Admin.' },
            { status: 403 }
          );
        }
        const isMatch = await bcrypt.compare(cleanPassword, dbUser.passwordHash);
        if (isMatch) {
          authenticated = true;
          userRole = dbUser.role || 'superadmin';
          userPermissions = dbUser.permissions || null;
          dbUser.lastLogin = new Date();
          dbUser.lastLoginIp = clientIp;
          dbUser.loginCount = (dbUser.loginCount || 0) + 1;
          await dbUser.save();
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB check during login fallback to env:', dbErr.message);
    }

    // 2. Fallback check against env credentials (only when configured)
    if (!authenticated && envUser && envPass && cleanUsername === envUser && cleanPassword === envPass) {
      authenticated = true;
      userRole = 'superadmin';
    }

    if (!authenticated) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    clearRateLimit(clientIp);

    // Sign JWT
    const token = signAdminToken({
      username: cleanUsername,
      role: userRole,
      permissions: userPermissions || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        username: cleanUsername,
        role: userRole,
      },
    });

    // Set secure cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login API error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
}
