import { jwtVerify } from 'jose';

/**
 * Edge-runtime JWT verification for middleware.
 *
 * `jsonwebtoken` relies on Node crypto and cannot run in the Edge runtime,
 * so middleware uses `jose` to actually verify the token signature instead of
 * merely checking that a cookie is present.
 */
function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return new TextEncoder().encode(secret);

  if (process.env.NODE_ENV === 'production') {
    // No secret in production => treat every token as invalid.
    return null;
  }
  return new TextEncoder().encode('dev-only-insecure-jwt-secret-do-not-use-in-production');
}

export async function verifyEdgeToken(token) {
  if (!token) return null;
  const key = getSecretKey();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (err) {
    return null;
  }
}
