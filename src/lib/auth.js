import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'skd_admin_token';

/**
 * Resolve the JWT secret.
 * - Production: a real JWT_SECRET env var is mandatory; we throw if it is
 *   missing so the app never signs tokens with a public, hardcoded key.
 * - Development: fall back to a clearly-labelled dev key (with a warning) so
 *   the app still runs locally without a .env file.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start admin auth with an insecure fallback in production.'
    );
  }

  console.warn(
    '[auth] JWT_SECRET is not set — using an INSECURE development-only key. Set JWT_SECRET in .env.local.'
  );
  return 'dev-only-insecure-jwt-secret-do-not-use-in-production';
}

/**
 * Sign JWT token for admin session (valid for 7 days)
 */
export function signAdminToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

/**
 * Extract admin session from request or cookies
 */
export async function getAdminSession(request) {
  let token = null;

  // 1. Check cookies() in Next.js Server Components / Route Handlers
  try {
    const cookieStore = cookies();
    token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  } catch (e) {
    // If called outside Next request context
  }

  // 2. Check Authorization header or request cookie if passed
  if (!token && request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (!token) return null;

  return verifyAdminToken(token);
}

/**
 * Enforce that the current session holds a given permission (or role).
 * Returns the session on success, or null when access should be denied.
 *
 * `superadmin` always passes. Otherwise the AdminUser.permissions flag named
 * by `permission` must be truthy on the token (see signAdminToken payload).
 */
export async function requirePermission(request, permission) {
  const session = await getAdminSession(request);
  if (!session) return null;
  if (session.role === 'superadmin') return session;
  if (!permission) return session;
  const perms = session.permissions || {};
  return perms[permission] ? session : null;
}
