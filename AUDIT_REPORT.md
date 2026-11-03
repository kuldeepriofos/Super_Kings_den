# Super Kings Den — Technical Audit & Improvement Report

**Prepared by:** Riofos Technologies
**Date:** 3 November 2026
**Repository:** `kuldeepriofos/Super_Kings_den`
**Stack:** Next.js 14.2.35 (App Router) · React 18.3 · MongoDB/Mongoose 9 · Tailwind CSS 3 · JWT auth · TipTap editor · custom Node `server.js`

> Scope: cloned the repo, installed dependencies, ran a production build, and reviewed the full source (92 route dirs, 35 API routes, 12 Mongoose models, ~130 components/pages). UI/UX is already client-approved; recommendations below target **performance, load time, and keeping the backend fully dynamic & manageable**, plus correctness/security fixes found along the way.

---

## 1. Local test results

| Step | Result |
|---|---|
| `npm install` | ✅ Success (no fatal errors) |
| `npm run build` | ✅ **Compiled successfully** |
| Static generation | ⚠️ Generates **2,450 static pages**; extremely slow when MongoDB is unreachable |
| Runtime without DB | ✅ Degrades gracefully to bundled JSON/JS fallback data (good resilience) |

**Key runtime finding:** With no database reachable, every page's data call blocks for the full `serverSelectionTimeoutMS` window (5 s) before falling back — so SSG crawled (≈173/2450 pages after several minutes). The same behaviour means **a transient DB blip in production makes the whole site hang for ~5 s per request** instead of failing fast. See §3.1.

---

## 2. Executive summary

The project is functional and shows good instincts (graceful static fallbacks, rate-limited login, security headers, SEO metadata, DB indexes). However it carries a **WordPress-migration "hybrid" architecture** that undermines the "fully dynamic, manageable backend" goal and hurts performance:

- **561 MB of uploaded images (1,595 files) are committed to git** and served unoptimized.
- **Image optimization is globally disabled** (`images.unoptimized: true`) with 14 raw `<img>` tags — directly inflating LCP/load time.
- The backend writes **state to local JSON files on disk** (redirects, pages, SEO) that the public site/middleware then read — this is **not truly dynamic** and breaks on serverless/read-only hosting.
- **In-memory module caches + fire-and-forget DB sync** are per-instance and unreliable under horizontal scaling.
- Several **security and data-integrity issues** (hardcoded secret fallbacks, edge auth that only checks cookie *presence*, two admin routes with no in-handler auth, default admin password in `.env.example`).

Priorities: (1) fix image delivery, (2) make DB connection fail-fast + resilient, (3) move disk-file state fully into the DB, (4) close the auth gaps.

---

## 3. Performance & faster load times

### 3.1 Database connection blocks the whole app when the DB is slow/down — **High**
`src/lib/mongodb.js` sets `serverSelectionTimeoutMS: 5000` and, on failure, nulls the cached promise so **every subsequent call retries the full 5 s wait**. During the build this made SSG crawl; in production it turns a brief DB hiccup into a 5 s-per-request stall.
- Lower `serverSelectionTimeoutMS` to ~1500 ms and add `connectTimeoutMS`, `socketTimeoutMS`, and `maxPoolSize` (e.g. 10).
- Keep a short-lived "DB is down" flag so repeated requests fail fast to the static fallback instead of each re-attempting a slow connect.
- Add `heartbeatFrequencyMS` and retry/backoff rather than reconnecting on every call.

### 3.2 Image optimization disabled + 561 MB of images in-repo — **High (biggest load-time win)**
- `next.config.mjs` has `images.unoptimized: true`; 14 components use raw `<img>` (only 2 use `next/image`). Result: full-size WordPress JP/PNG originals ship to every visitor — poor LCP, wasted bandwidth, no responsive `srcset`, no AVIF/WebP.
- **Recommendations:**
  - Remove `unoptimized: true` and migrate `<img>` → `next/image` with explicit `sizes`/`width`/`height` (prevents layout shift, enables lazy-loading + modern formats). `sharp` is already a dependency.
  - Offload `public/uploads` (561 MB) to a CDN/object store (Cloudinary, S3+CloudFront, or Hostinger CDN) and stop committing binaries to git — the repo is enormous to clone and every deploy ships 561 MB.
  - Add `public/uploads` to `.gitignore` and purge history (`git filter-repo`) once migrated.
  - Convert the WordPress-era JPG/PNG originals to WebP/AVIF; add width-based variants.

### 3.3 Heavy JSON bundled & parsed at runtime — **Medium**
`src/data/postsData.json` is **5.5 MB** (plus `postsIndex.json` 573 KB, `sitemapPosts.js` 532 KB, `mockData.js` 361 KB). `services/api.js` reads `postsData.json` from disk with `fs.readFileSync` and parses it on first access, and these files are imported into bundles.
- Make MongoDB the single source of truth and keep only a *small* seed/fallback (e.g. latest 20 posts) in the bundle.
- If a fallback index is needed, trim it to id/slug/title/excerpt only (no `content`).

### 3.4 Per-instance in-memory caches & background sync — **Medium**
`fetchLivePosts`, `fetchLiveFixtures`, and the search route use module-level variables (`_livePostsCache`, etc.) with a 60 s TTL and a fire-and-forget `syncDbPosts()`/`syncWithDb()`. Problems:
- Caches are **not shared across instances/serverless lambdas** — inconsistent data and cold-cache stalls per instance.
- Fire-and-forget promises can be **killed when a serverless function returns**, so the "background refresh" silently never runs.
- **Recommendation:** use Next's built-in data cache — `unstable_cache`/`revalidateTag` with `revalidatePath`/`revalidateTag` fired from the admin save handlers (true on-demand ISR). This gives shared, CDN-level caching and instant invalidation on edit, replacing the hand-rolled TTL maps.

### 3.5 Search does full in-memory linear scans, ignoring the text index — **Medium**
`src/app/api/search/route.js` loads all posts/players into memory and scores them with `String.includes` on every request. A `title/excerpt/content` **text index already exists** on the Post model but is unused. For ~800 posts it's tolerable today but won't scale and wastes memory.
- Use MongoDB `$text` search (or Atlas Search) with projection + limit; keep scoring server-side via `$meta: "textScore"`.

### 3.6 Everything is a client component where it needn't be — **Medium**
69 files are `'use client'`, including large view components (`StandingsTable`, `MatchCenter`, `StatsHub`, `FranchiseFixturesView`) that then `fetch('/api/...')` on the client — a render→fetch waterfall and extra JS shipped to the browser.
- Fetch in the Server Component and pass data down (the home page already does this well with `Promise.all`); keep `'use client'` only for truly interactive leaves.
- Add `loading.jsx`/Suspense boundaries beyond the single `search/loading.jsx` so navigation feels instant.

### 3.7 Middleware fires a self-fetch on every redirect — **Low/Medium**
The redirect branch does `fetch('/api/redirects/lookup?...')` (fire-and-forget hit counter) on each matched redirect. A network round-trip from the edge per redirect adds latency and load.
- Increment hit counts asynchronously via a queue/DB `$inc` outside the request path, or batch them.

### 3.8 Build generates 2,450 static pages — **Medium**
`generateStaticParams` enumerates every post/player/page/category slug (with `-1`/`1` variants added per player). That's a long, fragile build and a deploy that re-renders everything.
- Switch high-volume routes (news articles, players) to **ISR** (`export const revalidate = N` or on-demand revalidation) so pages render on first hit and refresh on edit — far faster builds and genuinely dynamic content.

---

## 4. Backend "fully dynamic & manageable" gaps

### 4.1 Admin writes to local JSON files on disk — **High (breaks the dynamic/manageable goal)**
- `src/lib/redirects.js` (`syncRedirectsJson`) writes `src/data/redirectsData.json`; `middleware.js` imports that JSON statically for edge redirect matching.
- `src/lib/pagesManager.js` writes `pagesData.json` / `staticPagesSeo.json`.
- The media library (`/api/admin/media`) writes uploads to `public/uploads` on the local filesystem.

Consequences: on serverless/containers/read-only FS these writes fail or are **ephemeral** (lost on redeploy/restart); the committed JSON drifts out of sync with the DB; and a statically-imported `redirectsData.json` only updates when the server process restarts/redeploys, so admin redirect edits are **not actually live**.
- **Recommendation:** read redirects from MongoDB in middleware via a tiny cached edge lookup (or `unstable_cache` with `revalidateTag('redirects')` on save). Store page/SEO data only in the DB. Move uploads to object storage with signed uploads. Treat bundled JSON strictly as read-only seed data.

### 4.2 Mongoose model cache is deleted on import — **Medium**
8 of 12 models call `delete mongoose.models.X` at import. `Post.js` guards it with `NODE_ENV !== 'production'`, but **`AdminUser.js` deletes unconditionally even in production**, forcing schema recompilation on every import and risking overwrite errors.
- Standardize on the canonical pattern: `export default mongoose.models.X || mongoose.model('X', schema)`. Never delete the cache in production.

### 4.3 Role/permission model exists but isn't enforced — **Medium**
`AdminUser` defines `role` and a granular `permissions` object, and the JWT carries `role` — but middleware only checks token **presence**, and routes generally don't gate on role/permission. An `author`/`viewer` can call superadmin endpoints.
- Add a `requirePermission()` helper used in each admin route (e.g. `manageUsers`, `manageRedirects`) and enforce it server-side.

### 4.4 "Views" are decorative strings, not real metrics — **Low/Medium**
`Post.views` is `Mixed` defaulting to `'1.2K'`; "most viewed" is a manual boolean (`isMostViewed`). There's no real view tracking, so the backend can't surface genuine popularity.
- Store `views` as a `Number`, increment on article load (debounced/queued), and derive "most viewed" by query. (GA4 is already connected for this site and could feed it.)

### 4.5 `strict: false` on Post schema — **Low**
Allows arbitrary undeclared fields to be persisted, weakening data integrity and making the admin UI harder to keep consistent. Prefer `strict: true` with explicit fields.

---

## 5. Security & correctness (mistakes / technical flaws)

### 5.1 Edge auth checks cookie *presence*, not validity — **High**
`middleware.js` gates `/admin/*` and `/api/admin/*` on whether the `skd_admin_token` cookie simply exists (or a `Bearer` header exists) — it never verifies the JWT. A forged/garbage cookie value passes the edge and loads the entire admin UI shell. Real verification only happens inside handlers that call `getAdminSession` (which does verify) — **and two mutating routes skip even that** (see 5.2).
- Verify the JWT in middleware (use `jose` for Edge-compatible verification) and reject invalid tokens there.

### 5.2 Two admin routes have no in-handler auth — **High**
`src/app/api/admin/standings/route.js` and `src/app/api/admin/franchise-stats/route.js` never call `getAdminSession`/`verifyAdminToken`. Combined with 5.1, these are effectively protected only by the presence of *any* cookie — i.e. forgeable.
- Add `getAdminSession` checks (and permission checks) to both.

### 5.3 Hardcoded secret & credential fallbacks — **High**
- `src/lib/auth.js`: `JWT_SECRET` falls back to a hardcoded literal — if the env var is unset in prod, **all tokens are signable by anyone who reads the repo**.
- `login/route.js`: admin password falls back to `'superkings2026'`; `.env.example` ships this real-looking default and `ADMIN_USERNAME=admin`.
- **Recommendation:** fail fast (throw) if `JWT_SECRET`/`ADMIN_PASSWORD` are missing; remove hardcoded fallbacks; replace `.env.example` values with obvious placeholders; rotate the secret before launch.

### 5.4 Unsanitized `dangerouslySetInnerHTML` on article/page content — **Medium**
`ArticleDetailView.jsx` and `StaticPageView.jsx` render HTML via `dangerouslySetInnerHTML` **without** DOMPurify (which is used in `CategoryHeader`/`PlayerProfileView`/editor). Content is editor-controlled (lower risk), but defense-in-depth is cheap.
- Sanitize on the server at save time (store clean HTML) and/or sanitize on render.

### 5.5 Public lead endpoint has no rate limiting — **Medium**
`/api/leads` has a good honeypot + validation but (unlike login) no IP rate limit — open to spam/abuse flooding the DB.
- Add the same in-memory/Redis rate limiting used for login; consider a CAPTCHA/turnstile for the contact form.

### 5.6 In-memory rate-limit & cache state won't survive scaling — **Low/Medium**
Login rate limiting (`loginAttemptsMap`) and all caches live in a single process. Behind multiple instances, lockouts and caches are per-instance.
- Back these with Redis/Upstash for correctness across instances.

### 5.7 Dependency hygiene — **Low**
`@types/react@^19` is installed while runtime `react@18.3.1` — mismatched typings. Next.js 14.2 is a minor behind the 15 line (React 19, improved caching). Plan a controlled upgrade to Next 15 for the caching/`revalidateTag` ergonomics referenced above.

---

## 6. UI/UX enhancements (design approved — these are polish & perceived-speed)

1. **Perceived load speed:** add skeleton loaders / Suspense fallbacks for the news grid, standings, stats and match center (only `search` has one today). Reserve image dimensions to eliminate CLS.
2. **Font loading:** fonts load via a render-blocking `<link>` in `layout.jsx`. Use `next/font` (self-hosted, `display: swap`, preloaded) to cut a round-trip and remove FOUT.
3. **Theme flash:** the inline `localStorage` theme script is sound; keep it, but move the theme key handling into `next-themes` or document it to avoid regressions.
4. **Accessibility:** audit color contrast on the navy/yellow palette, ensure all `<img>` have meaningful `alt`, add visible focus states and `aria-current` on nav, and verify the search modal traps focus and closes on `Esc`.
5. **Core Web Vitals instrumentation:** the site already has GTM/GA4 injection — add `next/third-parties` for GTM and report Web Vitals so LCP/INP/CLS can be tracked post-launch.
6. **Error/empty states:** add `error.jsx` boundaries and friendly empty states (no results, DB-down fallback banner) so failures look intentional.
7. **Mobile:** verify the fixture/standings tables scroll gracefully and the hero image is appropriately sized per breakpoint once `next/image` is adopted.

---

## 7. Prioritized roadmap

### Quick wins (days)
- Lower DB timeouts + add fail-fast flag (§3.1).
- Remove `JWT_SECRET`/password fallbacks; sanitize `.env.example` (§5.3).
- Add auth to the two unprotected admin routes (§5.2).
- Add rate limiting to `/api/leads` (§5.5).
- Fix `AdminUser` unconditional model-cache delete (§4.2).

### High impact (1–2 weeks)
- Enable `next/image` + remove `unoptimized`; move `public/uploads` to a CDN and out of git (§3.2).
- Verify JWT in middleware (§5.1) and enforce roles/permissions (§4.3).
- Replace disk-JSON state (redirects/pages/SEO) with DB + `revalidateTag` (§4.1).

### Architectural (2–4 weeks)
- Replace module caches/fire-and-forget sync with `unstable_cache`/ISR on-demand revalidation (§3.4, §3.8).
- Make MongoDB the single source of truth; shrink bundled JSON to small seeds (§3.3).
- Move search to `$text`/Atlas Search; add real numeric view tracking (§3.5, §4.4).
- Plan Next.js 15 / React 19 upgrade and Redis-backed shared state (§5.6, §5.7).

---

*This audit is based on a static read of the codebase plus a local install/build. Runtime figures (LCP, build time, query latency) should be confirmed against a staging environment with the production MongoDB and real traffic before/after each change.*
