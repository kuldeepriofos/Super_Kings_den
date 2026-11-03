import { NextResponse } from 'next/server';
import fallbackRedirects from './data/redirectsData.json';

// Static assets pattern to bypass middleware execution
const PUBLIC_FILE = /\.(.*)$/;
const AUTH_COOKIE_NAME = 'skd_admin_token';

function applySecurityHeaders(res) {
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  return res;
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip Next.js internal paths and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 2. Strict Edge Protection for Admin Dashboard Pages (/admin/*)
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';

    if (isLoginPage) {
      // If already logged in, redirect directly to admin overview
      if (token) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin/', request.url)));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // Unauthenticated access to /admin/* immediately redirects to /admin/login/
    if (!token) {
      const loginUrl = new URL('/admin/login/', request.url);
      const redirectRes = NextResponse.redirect(loginUrl);
      redirectRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return applySecurityHeaders(redirectRes);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // 3. Strict Edge Protection for Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const isPublicAuthApi =
      pathname.startsWith('/api/admin/auth/login') ||
      pathname.startsWith('/api/admin/auth/logout');

    if (!isPublicAuthApi) {
      const authHeader = request.headers.get('authorization');
      const hasBearer = authHeader && authHeader.startsWith('Bearer ');

      if (!token && !hasBearer) {
        return applySecurityHeaders(
          NextResponse.json(
            { success: false, error: 'Unauthorized: Admin session required' },
            { status: 401 }
          )
        );
      }
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // 4. Skip other public APIs
  if (pathname.startsWith('/api')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 5. Normalize requested path (strip trailing slash for comparison)
  const cleanReq = pathname === '/' ? '/' : pathname.endsWith('/') ? pathname.slice(0, -1).toLowerCase() : pathname.toLowerCase();

  // 6. Match against active redirect rules
  const rules = Array.isArray(fallbackRedirects) ? fallbackRedirects : [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    const rawSource = rule.source || '';
    const matchType = rule.matchType || 'exact';
    let matched = false;
    let targetDest = rule.destination;

    if (matchType === 'exact') {
      const cleanSource = rawSource === '/' ? '/' : rawSource.endsWith('/') ? rawSource.slice(0, -1).toLowerCase() : rawSource.toLowerCase();
      if (cleanReq === cleanSource) {
        matched = true;
      }
    } else if (matchType === 'prefix') {
      const cleanPrefix = rawSource === '/' ? '/' : rawSource.endsWith('/') ? rawSource.slice(0, -1).toLowerCase() : rawSource.toLowerCase();
      if (cleanReq === cleanPrefix || cleanReq.startsWith(cleanPrefix + '/')) {
        matched = true;
        if (rule.appendRemainder === true) {
          const remainder = cleanReq.slice(cleanPrefix.length);
          if (remainder && !targetDest.startsWith('http://') && !targetDest.startsWith('https://')) {
            const base = targetDest.endsWith('/') ? targetDest.slice(0, -1) : targetDest;
            targetDest = `${base}${remainder}`;
          }
        }
      }
    } else if (matchType === 'regex') {
      try {
        const rx = new RegExp(rawSource, 'i');
        const match = pathname.match(rx);
        if (match) {
          matched = true;
          if (match.length > 1) {
            for (let i = 1; i < match.length; i++) {
              targetDest = targetDest.replace(new RegExp(`\\$${i}`, 'g'), match[i] || '');
            }
          }
        }
      } catch (e) {
        // Skip malformed regex
      }
    }

    if (matched && targetDest) {
      const statusCode = Number(rule.statusCode) === 302 ? 302 : 301;

      // Construct target URL
      let redirectUrl;
      try {
        if (targetDest.startsWith('http://') || targetDest.startsWith('https://')) {
          redirectUrl = new URL(targetDest);
        } else {
          // Internal relative redirect
          redirectUrl = new URL(targetDest, request.url);
        }

        // Preserve incoming query parameters if destination has none
        if (search && !redirectUrl.search) {
          redirectUrl.search = search;
        }
      } catch (err) {
        return NextResponse.next();
      }

      // Asynchronously trigger hit counter via fast public lookup endpoint (fire and forget)
      fetch(new URL(`/api/redirects/lookup/?url=${encodeURIComponent(pathname)}`, request.url).toString(), {
        method: 'GET',
        headers: { 'x-skd-internal': 'middleware-hit' },
      }).catch(() => {});

      const redirectResponse = NextResponse.redirect(redirectUrl, statusCode);
      // Prevent browser disk caching so toggle off / edits reflect instantly without clearing cache
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      redirectResponse.headers.set('Pragma', 'no-cache');
      redirectResponse.headers.set('Expires', '0');
      return applySecurityHeaders(redirectResponse);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
