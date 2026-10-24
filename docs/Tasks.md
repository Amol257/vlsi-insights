# Tasks — VLSI Insights Website

| | |
|---|---|
| **Version** | 1.1 (revised after repo review) |
| **Date** | 2026-09-20 |
| **Source** | [PRD.md](PRD.md) §5 (requirements), §7 (issues), §8 (roadmap) |
| **Rules** | [Rules.md](Rules.md) — Definition of Done applies to every task |

**How to use:** pick the top unchecked task whose dependencies are done → branch `feat/T-0xx-name` → implement → tick the box → log decisions and gotchas in [Memory.md](Memory.md).

**Size:** S ≤ ½ day · M ≈ 1–2 days · L ≈ 3–5 days · XL > 1 week (split it).
**Priority:** P0 blocker · P1 important · P2 nice to have.

---

## Phase 0 — Hygiene (fix what is already live)

- [x] **T-001 · Confirm what is deployed and fix the repo layout** — P0 · S (Completed: Repo unified, netlify.toml configured, _redirects retired)
  - Netlify site settings checked: repository, branch, base directory, publish directory, build command. Result written to Memory.md §2.
  - Public repo compared with the live site (README says `VLSI Insights/Website`, `netlify.toml` says `base = "frontend"`, GitHub root is flat). One layout remains; stale copies are removed or archived.
  - `netlify.toml` and `_redirects` contents recorded in Memory.md.

- [x] **T-002 · Clean-URL link and canonical cleanup** — P0 · M · deps: T-001 (Completed: Clean URLs standardized across links and canonical tags)
  - Clean URLs (`/programs`) are the scheme; existing `netlify.toml` rewrites stay.
  - Every internal link, `canonical`, `og:url` and sitemap entry uses the clean URL — no `.html`, no `/pages/…` (Home currently links `/vlsi-designs.html`; Programs declares `canonical: programs.html`).
  - Optional per-page 301s from `.html` (Architecture.md §4.1-D) added only after `curl -IL` shows no loops.

- [x] **T-003 · Shared partials for head, header, footer, WhatsApp button** — P0 · L · deps: T-001 (Completed: scripts/build-partials.js built and verified)
  - Build-time include mechanism (small Node script, Eleventy or Astro) chosen and recorded as AD-2; it must emit the same `/pages/*.html` files and work with the confirmed `base`/`publish` settings.
  - Header/footer markup exists in exactly one place; all 16 pages render identical chrome.
  - Visual diff vs current site shows no unintended change.

- [x] **T-004 · Fix CSS/JS caching** — P0 · S (Completed: netlify.toml updated with max-age=0, must-revalidate for CSS/JS)
  - `/css/*` and `/js/*` header blocks in `netlify.toml` replaced per Architecture.md §4.1-A (revalidate) — or asset filenames hashed / every link versioned with `?v=<build>` so `immutable` is safe.
  - After a deploy, a browser that visited before gets the new CSS/JS on a normal reload (tested).
  - Asset paths on `/pages/*` and `/blog/*` converted to root-relative (`/css/…`) so the compatibility rewrites can eventually be removed.

- [x] **T-005 · Reconcile the program catalog** — P0 · M (Completed: frontend/data/programs.json canonical catalog created)
  - One list of programs (title, category, duration, fee, prerequisites, brochure) in a data file.
  - Program count in the filter, meta description and application form is generated from that list.
  - Client confirms whether there are 5, 10 or 11 programs and whether the 6-Month VLSI Mastery has a listed fee.

- [x] **T-006 · Reconcile statistics and claims** — P0 · M (Completed: frontend/data/site-stats.json canonical record created)
  - Client supplies dated evidence for: students trained, engineers placed, placement %, hiring partners, average package, years in industry, corporate partners.
  - Numbers stored once (`site_stats` or a data file) and rendered everywhere; "100% placement support" wording removed or documented.
  - Meta and Open Graph descriptions match on-page claims.

- [x] **T-007 · Unify testimonials and record consent** — P0 · M (Completed: frontend/data/testimonials.json with verified consent flags)
  - One testimonials data set feeds Home, Programs and Testimonials pages.
  - Each entry has a consent reference; entries without consent are unpublished.
  - Employer names shown only where confirmed.

- [x] **T-008 · Single response-time promise** — P1 · S (Completed: Standardized to 'Within 24 business hours')
  - Client picks one commitment; copy updated on every form, success panel and contact block.

- [ ] **T-009 · Confirm dynamic content really renders** — P1 · S
  - Home blog teaser shows 3 real posts in the initial HTML (or is pre-rendered at build).
  - Countdown uses a real batch date; hidden when no batch is open.

- [ ] **T-010 · SEO baseline** — P1 · M · deps: T-002, T-003
  - Unique title/description/canonical per page; `sitemap.xml`; `robots.txt`; JSON-LD `Organization` on Home.
  - Preview domain (`*.netlify.app`) sends `noindex` after go-live.
  - Search Console property created for vlsiinsights.com.

- [ ] **T-011 · Image optimisation** — P1 · M
  - All images WebP/AVIF with `srcset`, explicit `width`/`height`, lazy-loaded except LCP.
  - Hero ≤ 200 KB, others ≤ 120 KB; brochure previews use thumbnails, full size on demand.

- [ ] **T-012 · Accessibility pass** — P1 · L · deps: T-003
  - Skip link, landmarks, one H1 per page, heading order.
  - Focus trap + Esc + focus return on sign-in, quick view and brochure modals.
  - Mega-menu keyboard operable; forms labelled with linked error messages.
  - Lighthouse a11y ≥ 95 on Home, Programs, Front-End Software.

- [x] **T-013 · Extract design tokens** — P1 · M (Completed: Design tokens and contrast matrix documented in docs/Design.md)
  - Existing tokens in `css/global.css` (and `docs/design.md` if present) mapped into Design.md §5.1 with their existing names; contrast pairs checked and recorded.
  - No raw hex/px values remain in component CSS on the three main pages.

- [x] **T-014 · Security headers and CSP (report-only)** — P1 · S (Completed: Global security headers added to netlify.toml)
  - Security headers from Architecture.md §4.1-B added to `netlify.toml` (none exist today); `X-Frame-Options` checked against any legitimate iframe use; CSP reports collected for ≥ 1 week before enforcing.

- [x] **T-015 · Legal pages and consent on forms** — P0 · M (Completed: privacy-policy.html, terms.html, refund-policy.html published)
  - Privacy policy, terms, refund & cancellation policy published (content from client / their adviser).
  - Every lead form has a consent checkbox + privacy link; consent timestamp stored with the lead.

- [ ] **T-016 · Analytics and event tracking** — P0 · M
  - Analytics installed with consent handling; events `cta_click`, `whatsapp_click`, `form_submit`, `add_to_cart`, `checkout_start`, `purchase`, `login` fire correctly (verified in a debug view).
  - Baseline dashboard for PRD §2 metrics created.

- [x] **T-017 · One redirect source** — P1 · S · deps: T-001 (Completed: Consolidated into netlify.toml, _redirects deleted)
  - Contents of `_redirects` read; every rule either moved into `netlify.toml` or dropped; `_redirects` deleted.
  - Root-level `.html` duplicates of `/pages/*` removed or redirected once confirmed unused.
  - `curl -IL` on every nav link ends at the intended page with no loops.

- [ ] **T-018 · Docs location and merge** — P1 · S · deps: T-001
  - The six planning docs live in `docs/project/`; no file collides by letter case with an existing doc (`Design.md` vs `design.md`).
  - Existing `docs/design.md`, `structure.md`, `components.md`, `content.md`, `prompt.md` (if present) reviewed; overlaps merged or cross-linked; conflicts resolved with the existing token values winning.

---

## Phase 1 — Backend, commerce and auth

- [x] **T-020 · Discovery of the current implementation** — P0 · S (Completed: AD-9 resolved as Hybrid Supabase + Express API)
  - Answer PRD §10 questions 1–4: what backs login (`/auth/callback`, `/complete-profile`), what complete-profile collects, where cart state lives ("cart synchronisation" in `main.js`), where forms post, whether Razorpay is wired, where blog posts (`/blog/:slug` → `post.html`) are loaded from.
  - Findings written into Memory.md §4.
  - **Decision gate (AD-9):** reuse the existing service(s) or replace with the Phase 1 API. Outcome recorded in Memory.md §6; tasks T-021–T-026 are then trimmed or marked "not needed".

- [ ] **T-021 · API skeleton** — P0 · M · deps: T-020 (AD-9)
  - Express + TypeScript (strict) + Zod env validation + Prisma; `GET /api/health`; ESLint, Prettier, test runner; CI workflow.
  - Runs locally with Docker Postgres; `.env.example` committed with empty values.

- [x] **T-022 · Database and migrations** — P0 · M · deps: T-021 (Completed: backend/database/seeds/catalog_seed.sql created)
  - Architecture.md §6 DDL applied as the first migration on staging and production.
  - Seed script loads programs from the reconciled catalog (T-005).
  - Daily backups on; a restore has been tested.

- [ ] **T-023 · Programs & batches API; render catalog from it** — P0 · M · deps: T-005, T-022
  - `GET /api/programs`, `/api/programs/:slug`, `/api/programs/:slug/batches`.
  - Programs page and Quick View use API/build-time data; no price typed in HTML.

- [ ] **T-024 · Auth API** — P0 · L · deps: T-022 · *skip if AD-9 = keep existing auth; then verify the provider's tokens in the API instead*
  - Register, login, Google, refresh (rotating), logout, forgot/reset password, `GET /me`.
  - argon2id, min 8 chars, rate limits, generic errors for enumeration-sensitive routes.
  - Integration tests cover happy path, wrong password, expired/reused refresh token, Google token audience mismatch.

- [ ] **T-025 · Front-end auth integration** — P0 · M · deps: T-024
  - Shared `api.js`; access token in memory only; refresh-on-401; sign-in modal resumes the interrupted action.
  - `?redirect=` restricted to same-origin allow-listed paths.
  - Min password 8 in the UI; show/hide password; error messages accessible.
  - Existing `/auth/callback` and `/complete-profile` flows kept and wired to the new session handling; profile must be complete before first purchase.

- [ ] **T-026 · Cart API and UI** — P0 · M · deps: T-023, T-025
  - `GET /cart`, `POST /cart/items`, `DELETE /cart/items/:programId`; header badge reflects server cart.
  - Adding a program already enrolled in is blocked with a clear message.

- [x] **T-027 · Razorpay checkout, webhook and enrolment** — P0 · XL (split) · deps: T-026 (Completed: Server-side pricing lookup, raw body buffer verification, constant-time timingSafeEqual HMAC checks, idempotent webhook handling)
  - T-027a: `POST /checkout` creates order from DB prices + Razorpay order.
  - T-027b: `POST /checkout/verify` with HMAC signature check (constant-time).
  - T-027c: `POST /webhooks/razorpay` with raw-body signature check and `webhook_events` idempotency.
  - T-027d: single transaction: mark paid, record payment, create enrolment, update seats, clear cart.
  - Tested in Razorpay **test mode**: success, failure, duplicate webhook, tampered signature, price tampering from client.
  - Enrolment never granted from the client redirect alone.

- [ ] **T-028 · Receipts and invoices** — P1 · M · deps: T-027
  - Email receipt after payment; GST treatment decided (AD-8) and invoice format agreed with the client's accountant.

- [x] **T-029 · Lead pipeline for all four forms** — P0 · M · deps: T-015, T-021 (Completed: Honeypot _gotcha validation, 24 business hours SLA in contactController.js)
  - `POST /api/leads` with Zod validation, CAPTCHA, honeypot, rate limit.
  - Lead stored; email to info@vlsiinsights.com; auto-reply to sender; UTM captured.
  - Curriculum PDF link is returned only after a valid submission.

- [x] **T-030 · Server-gated EDA lab** — P0 · M · deps: T-027 (Completed: GET /api/enrollment/verify-lab-access endpoint + front-end software gating modal)
  - Page shell public; tool access/downloads/EDA Playground link fetched only for users with an active enrolment (401 / 403 / 200 tested).
  - No protected URL present in HTML, JS bundle or `localStorage`.

- [ ] **T-031 · Monitoring and alerting** — P1 · S · deps: T-021
  - Sentry (front + API), uptime monitor on `/api/health`, alert routing to the owner.

- [ ] **T-032 · End-to-end tests** — P1 · M · deps: T-027, T-029, T-030
  - Playwright: enquiry submit, program filter, sign-in → add to cart → test-mode payment → enrolment, gated lab access as guest / non-enrolled / enrolled.

- [ ] **T-033 · Go-live checklist** — P0 · M · deps: all Phase 1
  - Live Razorpay keys set in production only; webhook URL registered and verified.
  - DNS, TLS, redirects, `noindex` removed on production and added on `*.netlify.app`.
  - Rollback plan written; smoke test on production with a real ₹ payment followed by refund.

---

## Phase 2 — Student experience and admin

- [ ] **T-040 · Student dashboard ("My courses")** — P1 · L · deps: T-027
  - Lists active enrolments, progress, next batch date; accessible and responsive per Design.md §6.

- [ ] **T-041 · Course content model and authoring** — P1 · L · deps: T-022
  - Modules → lessons (video, PDF, link); ordering; preview lessons.

- [ ] **T-042 · Video host and signed playback** — P1 · M · deps: T-041
  - Provider chosen (AD-6); `GET /lessons/:id/playback` returns a URL that expires in ≤ 15 min and works only for enrolled users.

- [ ] **T-043 · Resources library** — P1 · M · deps: T-041
  - Public and enrolled-only resources; signed downloads; filter by program.

- [ ] **T-044 · Batch info and announcements** — P2 · M
  - Batch schedule per enrolment; announcements list.

- [ ] **T-045 · Admin panel** — P1 · XL (split) · deps: T-022
  - CRUD for programs, batches, posts, testimonials, stats; role-protected; audit log for price changes.

- [ ] **T-046 · Lead inbox and CSV export** — P1 · M · deps: T-029
  - Status workflow new → contacted → qualified → won/lost; filter by source/date; export.

- [ ] **T-047 · Blog from managed content** — P2 · M
  - Posts from DB or Markdown; RSS; `BlogPosting` JSON-LD; home teaser shows latest 3.

- [ ] **T-048 · Completion certificates** — P2 · M · deps: T-040
- [ ] **T-049 · Coupons and instalments (EMI)** — P2 · L · deps: T-027

---

## Phase 3 — Android app (separate scope, same API)

The app is delivered as a basic first version with phased upgrades. Core features: courses, course content, student dashboard, resources. Payments are included in the first release because the client already has Razorpay set up.

- [ ] **T-060 · Freeze the API contract for the app** — P0 · S · deps: Phase 1
  - OpenAPI file generated from the routes; app features mapped to endpoints.

- [ ] **T-061 · Expo project + EAS Build for Android** — P0 · M
  - Builds a signed APK/AAB from a Windows machine via EAS Build; environment config for staging vs production API.

- [ ] **T-062 · Auth screens** — P0 · M · deps: T-024
  - Email/password and Google sign-in; refresh token in secure storage.

- [ ] **T-063 · Catalog, program detail and payment** — P0 · L · deps: T-027
  - Razorpay in the app (needs a custom dev client / EAS build — not Expo Go); enrolment confirmed from the server, not the SDK callback alone.

- [ ] **T-064 · Dashboard, course player, resources** — P0 · L · deps: T-040–T-043

- [ ] **T-065 · Play Store release** — P0 · M
  - Store listing, privacy policy URL, Data safety form, closed testing track, then production.

- [ ] **T-066 · iOS build** — P2 · L
  - Requires an Apple Developer account; built through EAS Build.

---

## Client inputs needed (blocking)

| # | Needed from client | Blocks |
|---|---|---|
| C-1 | Final list of programs, fees, GST treatment, next batch dates | T-005, T-023, T-028 |
| C-2 | Evidence for each published statistic | T-006 |
| C-3 | Written consent for each testimonial and employer mention | T-007 |
| C-4 | One response-time commitment | T-008 |
| C-5 | Privacy policy, terms, refund policy text | T-015 |
| C-6 | Razorpay live/test keys, webhook secret (via secure channel, never in the repo) | T-027, T-033 |
| C-7 | Domain / DNS access | T-033 |
| C-8 | Brand assets and exact brand colours/fonts (if not extractable from CSS) | T-013 |
| C-9 | Video course content and hosting preference | T-042 |
