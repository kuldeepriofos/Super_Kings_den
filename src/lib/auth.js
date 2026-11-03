import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'superkingsden_jwt_secret_fallback_key_2026';
export const AUTH_COOKIE_NAME = 'skd_admin_token';

/**
 * Sign JWT token for admin session (valid for 7 days)
 */
export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
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
