# Super Kings Den — Implementation Notes (Audit Fixes)

**By:** Riofos Technologies · **Date:** 3 November 2026
Companion to `AUDIT_REPORT.md`. This documents what was changed, how to run it, and how each change was verified locally.

---

## How to run & verify locally

```bash
npm install
```

Create `.env.local` (see the updated `.env.example`):

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/superkingsden
JWT_SECRET=run `openssl rand -base64 48` and paste the result here
# Optional first-run admin (both required to enable env login):
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-strong-password
```

Then:

```bash
npm run build
```

```bash
npm run start
```

> The app runs **without** MongoDB too — it falls back to the bundled JSON data for reads. Note: with no DB, **write** endpoints (contact form, admin saves) return `500` because the DB write fails; that is expected locally without Mongo.

### Verification performed on this build

- `npm run build` → **compiled successfully**, now **195 prerendered pages (was ~2,450)**.
- Public pages (`/`, `/news/`, `/csk-team/`) → `200`.
- Image optimizer: `/uploads/.../Chennai-Super-Kings-2026.jpg` (86 KB JPG) served as **11 KB AVIF (~87% smaller)**.
- `GET /api/admin/standings`, `/api/admin/franchise-stats`, `/api/admin/posts` with no token → **401**.
- `/admin/` with no token → **307 → /admin/login/**; with a **forged cookie** → **307 → /admin/login/** (previously a forged cookie passed the edge).
- `POST /api/leads` six times rapidly → 5 processed, 6th **429** (rate limit works).
- New `GET /api/franchise-stats/` and `GET /api/redirects/active/` → `200`.

---

## New dependency

- **`jose@5.9.6`** — Edge-runtime JWT verification in middleware (`jsonwebtoken` can't run on the Edge).

---

## Changes by area

### Security & auth
- **`src/lib/mongodb.js`** — fail-fast timeouts (`serverSelectionTimeoutMS: 1500`, `connectTimeoutMS`, `socketTimeoutMS`), `maxPoolSize: 10`, `heartbeatFrequencyMS`, and a 10 s "DB-down" backoff so requests fall back to static data instead of each blocking ~5 s.
- **`src/lib/auth.js`** — removed the hardcoded `JWT_SECRET` fallback (throws in production; dev-only labelled key in development); added `requirePermission(request, permission)` RBAC helper; JWT now carries `permissions`.
- **`src/lib/edgeAuth.js`** (new) — `jose`-based `verifyEdgeToken`.
- **`src/middleware.js`** — verifies the JWT **signature** for `/admin/*` and `/api/admin/*` (was presence-only); resolves redirects from the DB-backed `/api/redirects/active` endpoint with a 30 s per-instance TTL cache and bundled-JSON fallback.
- **`src/app/api/admin/auth/login/route.js`** — removed hardcoded default password; env login only works when `ADMIN_USERNAME` **and** `ADMIN_PASSWORD` are both set; token now includes `permissions`.
- **`.env.example`** — placeholders only; documents the generate-a-secret step.
- **`src/app/api/admin/standings/route.js`**, **`.../franchise-stats/route.js`** — added `getAdminSession`/`requirePermission` checks (were unprotected in-handler).
- **`src/app/api/leads/route.js`** — per-IP rate limiting (5 / 10 min).
- **`src/models/AdminUser.js`** — no longer recompiles its schema in production.
- **`src/lib/sanitizeHtml.js`** (new) + **`ArticleDetailView.jsx`**, **`StaticPageView.jsx`** — SSR-safe sanitization of article/page HTML (strips `<script>`/`<style>`/event handlers/`javascript:` URLs; keeps tables, images and YouTube iframes).

### Performance & load time
- **`next.config.mjs`** — removed `images.unoptimized: true`; enabled AVIF/WebP, responsive `deviceSizes`/`imageSizes`, 30-day cache TTL.
- **`src/components/SmartImage.jsx`** (new) — `next/image` wrapper with the old `onError` fallback behaviour. Applied in `Navbar`, `Footer`, `HeroFeatured`, `CSK/JSK/TSKNewsSection`, `SearchModal`, `AllTimeXI`.
  - *Intentionally left as `<img>`:* MatchCenter team logos (small, conditionally rendered — low value, high regression risk) and admin editor/RichTextEditor previews (dynamic/pasted content). Documented, not an oversight.
- **`src/services/api.js`** — replaced per-instance module caches + fire-and-forget sync with Next `unstable_cache` + `revalidateTag` for posts, fixtures and categories (shared across instances, revalidated on edit). `invalidate*` helpers now call `revalidateTag`.
- **`src/app/api/search/route.js`** — same shared-cache treatment; kept substring scoring (needed for partial/type-ahead search that a `$text` index can't do). Atlas Search noted as the scale path.
- **ISR instead of full SSG** — `export const revalidate = 300` + trimmed `generateStaticParams` on `[slug]`, `news/[slug]`, `players/[slug]`, `player/[slug]`, `category/[slug]`, `web-stories/[slug]`. Build dropped from ~2,450 to 195 pages; the long tail renders on demand and is cached.
- **`force-dynamic`** added to `search`, `standings`, `admin/leads`, `admin/stats` API routes (correctly marks them dynamic; silences build warnings).

### Backend dynamic / manageability
- **`src/app/api/redirects/active/route.js`** (new) — DB-backed active-redirects feed with bundled fallback; middleware reads it so redirect edits go live within ~30 s without a redeploy.
- **`src/app/api/franchise-stats/route.js`** (new, public read) — public pages (`StatsHub`, `FranchiseFixturesView`) now use this instead of the admin-gated endpoint (fixes a latent bug where public pages called an auth-protected API).
- **Fixture cache invalidation** wired into `admin/matches` POST/PUT/DELETE (was defined but never called).
- **Category cache invalidation** wired into `admin/categories` create/update/delete.

### Data model / misc
- **`src/models/Post.js`** — added numeric, indexed `viewCount`.
- **`src/app/api/posts/view/route.js`** (new) + `ArticleDetailView` — best-effort view counter, pinged once per session per article.
- **`package.json`** — `@types/react` aligned to `^18` (matches the React 18 runtime); added `jose`.
- **`.gitignore`** — ignores `public/uploads/` so new uploads don't bloat the repo.

---

## Deferred — needs your decision / infrastructure (not code-only)

1. **Move `public/uploads` (561 MB, 1,595 files) to a CDN/object store** and purge it from git history (`git filter-repo`). The code is CDN-ready via `next/image` + `remotePatterns`; the migration and history rewrite are destructive and need your go-ahead. Existing tracked files remain until then.
2. **Redis/Upstash** for shared rate-limit and cache state across multiple instances (current limiters are per-process).
3. **Next.js 15 / React 19** upgrade (better caching ergonomics) — a major-version bump to schedule deliberately.
4. **Replace remaining disk-file writes** (media uploads to `public/uploads`, page/SEO JSON) with object storage / DB for serverless/read-only hosting. Redirects are already handled.
5. **Optional:** flip `strict: true` on schemas and backfill `viewCount`/convert legacy `views` strings once you've reviewed existing data.

---

## Notes
- A local production server may still be running on **port 3100** from verification (separate from your dev server on 3000); stop it if you don't need it.
- No existing behaviour was intentionally removed; redirects, fallbacks and the approved UI/layout are preserved.
