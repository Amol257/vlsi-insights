# Memory — VLSI Insights Website

Living context for humans and AI coding tools. **Read this first. Update it last.**

| | |
|---|---|
| **Created** | 2026-09-20 |
| **Last updated** | 2026-09-20 (rev 1.1) |
| **Companion docs** | [PRD.md](PRD.md) · [Architecture.md](Architecture.md) · [Design.md](Design.md) · [Rules.md](Rules.md) · [Tasks.md](Tasks.md) |

---

## 1. Update protocol

1. **Start of session:** read this file, then the task you are about to do in `Tasks.md`.
2. **End of session:** add a dated entry to §11, tick finished tasks in `Tasks.md`, record new decisions in §6 and new gotchas in §8.
3. **Facts only.** Mark anything unconfirmed as **[Verify]**. Never write guesses as facts.
4. **No secrets, no personal customer data, no client financials** in this file.
5. Keep this file under ~400 lines: summarise old session-log entries into one line per month.
6. If this file contradicts the code, the code wins — fix this file in the same PR.
7. Keep the six planning docs in `docs/project/`. On Windows/macOS `Design.md` and an existing `design.md` are the same file — never place them side by side.

---

## 2. Project snapshot

| Item | Value |
|---|---|
| Product | Website for VLSI Insights — semiconductor training, engineering services, digital agency |
| Live URL | https://vlsi-insights.netlify.app |
| Production domain | vlsiinsights.com (used in canonical / OG tags) |
| Repo | github.com/Amol257/vlsi-insights (public). Layout **[Verify]** — see §4 |
| Hosting | Netlify. Publish settings per `netlify.toml`: `base = "frontend"`, `publish = "."` **[Verify against Netlify UI]** |
| Front end | Static multi-page HTML/CSS/JS; pages under `/pages/`, clean URLs via rewrites; `css/global.css`, `navbar.css`, `footer.css`, `js/main.js` |
| Backend | **Unknown.** `/auth/callback`, `/complete-profile`, runtime-loaded blog posts and "cart synchronisation" suggest a hosted service may exist (AD-9). Target if none: Node.js + Express + PostgreSQL |
| Payments | Razorpay (client already has an account/API) |
| Related deliverable | Android app on the same API (Expo/React Native) — separate scope |
| Current phase | Phase 0 (hygiene) — not started |

---

## 3. Business context

- **What the company does:** front-end VLSI training and services (RTL design, SoC/UVM verification, synthesis/STA), embedded systems, edge AI/TinyML, web development, marketing and IVR telephony.
- **Location:** Engineering Design Center, Ghaziabad, Delhi NCR, India.
- **Audiences:** students/freshers, working engineers, college placement cells, corporate teams, services clients.
- **Programs displayed:** Digital + Verilog (8 wks, 35,000/-) · Core VLSI Verification SV+UVM (4 mo, 40,000/-) · Core VLSI Assertion SVA & ABV (1 mo, 25,000/-) · FPGA on AMD Xilinx Artix-7 (3 mo, 25,000/-) · Raspberry Pi Embedded & IoT (2 mo, 25,000/-) · plus a 6-Month VLSI Mastery job-oriented track (fee not shown).
- **Public contact:** info@vlsiinsights.com · +91 98101 91592 (Mon–Sat) · WhatsApp wa.me/919810191592.
- **Social:** YouTube @VLSIInsights9 · LinkedIn `vlsi-insights` · Instagram `vlsiinsights`.

---

## 4. Current implementation (as observed 2026-09-20)

- Pages: Home, 5 engineering-service pages, Technical Training, Marketing Solutions, Programs, Front-End Software, Blog list, Blog post (`/blog/:slug` → one `post.html` template), About Company, About Owner, Testimonials, Cart, Login, Auth callback, Complete profile, 404.
- Routing (from `netlify.toml`): clean URLs are 200 rewrites to `/pages/<name>.html`; aliases `/about`, `/solutions`, `/contact` (302) and `/technical-blogs` (301); compatibility rewrites map `/pages/{css,js,images}/*` and `/blog/{css,js,images}/*` to the root asset folders.
- Caching (from `netlify.toml`): `/css/*`, `/js/*`, `/images/*` = `max-age=31536000, immutable`; HTML = `max-age=0, must-revalidate`. No security headers.
- Repo: root listing is flat (HTML at top level + `css/`, `images/`, `js/`, `_redirects`, `netlify.toml`, 1 commit); README describes `VLSI Insights/Website` with a `docs/` folder (`design.md`, `structure.md`, `components.md`, `content.md`, `prompt.md`).
- Header with mega-menu; footer; floating WhatsApp button with prefilled messages; cart badge; Sign In / Sign Out toggle.
- Programs: filter chips, brochure previews, Quick View modal, "Added to cart!" toast, sign-in modal (email/username + password, Register, Google login, Forgot password), curriculum-download lead form, application form, countdown banner.
- Front-End Software: sign-in gate, EDA Playground access, QuestaSim and ModelSim cards with YouTube tutorials, support form, FAQ.
- Forms with on-page success states: Home enquiry, Program application, Curriculum download, Software support.

**[Verify] before changing anything (T-001, T-020):** which folder/branch Netlify builds · contents of `_redirects` · auth provider and token storage · what `/complete-profile` collects · where blog posts load from · where cart state lives · where form submissions go · whether Razorpay is wired · whether the EDA lab gating is server-side · whether asset links carry a `?v=` version.

---

## 5. Target stack (summary — details in Architecture.md)

Static front end on Netlify (+ templating for shared partials) → Node.js/Express/TypeScript API → PostgreSQL (Prisma) → Razorpay, transactional email, signed-URL video host, object storage. Auth: argon2id + Google, short JWT + rotating refresh token. Monitoring: Sentry + uptime check.

---

## 6. Decisions

### Decided
| Date | ID | Decision | Rationale |
|---|---|---|---|
| 2026-09-20 | D-001 | Maintain a six-file doc set (PRD, Architecture, Design, Rules, Tasks, Memory) as the source of truth for AI-assisted development | Consistent context across tools and sessions |
| Earlier | D-002 | Android app stack: Expo/React Native front end, Node.js + PostgreSQL backend, Razorpay payments | Chosen by the project owner |
| Earlier | D-003 | Android first (APK/AAB via EAS Build, developed on Windows); iOS later | No Mac available |
| Earlier | D-004 | App ships as a basic first version with phased upgrades; must be published on Play Store; core features: courses, course content, student dashboard, resources | Client request |
| Earlier | D-005 | Razorpay payments are included in the first app release, not deferred | Client already has Razorpay set up |
| 2026-09-20 | AD-1 | Keep Netlify Edge CDN hosting with multi-page static architecture | High performance, instant previews, zero maintenance |
| 2026-09-20 | AD-2 | Build-time partial injection via scripts/build-partials.js | Avoids runtime SSR overhead while eliminating 16-page header/footer drift |
| 2026-09-20 | AD-3 / AD-9 | Hybrid Decoupled Architecture: Supabase (Auth, RLS, Profiles) + Express API (Razorpay, Webhooks, Lab Gating) | Avoids duplicate Prisma auth layer, secures financial processing with timingSafeEqual and rawBody HMAC |
| 2026-09-20 | AD-4 | Strict clean URLs (/programs, /vlsi-designs) with netlify.toml 200 rewrites, _redirects deleted | Eliminates redirect drift, preserves clean search indexing |
| 2026-09-20 | AD-5 | Single source of truth data: programs.json, site-stats.json, testimonials.json | Prevents catalog and statistical discrepancy across pages |
| 2026-09-20 | AD-10 | Cache-Control: max-age=0, must-revalidate on CSS/JS; 1-yr immutable on images | Eliminates stale stylesheet caching without breaking asset delivery |
| 2026-09-22 | AD-11 | Decommission Flagship Oval Carousel (#flagship-work) | Permanently removed from index.html and technical-training.html. Cleaned JS and CSS. Do not regenerate in future sessions. |

### Proposed (awaiting confirmation)
| ID | Proposal | Where |
|---|---|---|
| AD-6 | Video host for paid content — Cloudflare Stream or Bunny.net | Architecture.md §12 |
| AD-7 | Transactional email provider — Resend / Brevo | Architecture.md §12 |
| AD-8 | GST treatment on display — ₹XX,XXX (Incl. 18% GST) | Architecture.md §12 |

---

## 7. Conventions (pointers — full text in Rules.md)

- Clean, root-relative internal links and asset paths. Shared partials only.
- Design tokens only; mobile-first; WCAG 2.2 AA.
- Money as integer **paise**. Server computes all prices.
- Server-side authorization for anything gated. No protected URLs in client code.
- Every published number, testimonial and logo has evidence/consent.
- Conventional Commits; one task per PR; branch `feat/T-0xx-name`.
- US spelling to match existing copy.

---

## 8. Gotchas & lessons

- **Never resurrect deleted components:** When synchronizing between VLSI Insights and VLSI Insights - Copy or responding to prompts, never restore `#flagship-work` (Oval Flagship Courses Carousel), dead redirect stubs, or legacy images. Refer to Rules.md Rule 13.
- **Clean URLs are rewrites, not files.** `/programs` is a 200 rewrite to `/pages/programs.html` in `netlify.toml`. Home links to `/vlsi-designs.html`, inner pages to `/pages/vlsi-designs` — both reach a page but neither is the clean URL. Programs declares `canonical: programs.html`.
- **Relative asset paths only work because of compatibility rewrites** (`/pages/{css,js,images}/*`, `/blog/{css,js,images}/*`). Do not remove them until every page uses root-relative asset paths. Do **not** add a catch-all `/pages/:slug` redirect.
- **`immutable` cache on unhashed CSS/JS** (`global.css`, `main.js`): visitors can keep old files after a deploy. Fix in T-004.
- **Two redirect sources.** `_redirects` is processed before `netlify.toml`; if a rule seems ignored, check `_redirects` first (T-017).
- **Repo layout drift.** README, `netlify.toml` and the GitHub root disagree; confirm the deployed folder before editing (T-001). An individual blob URL such as `login.html` may 404 even though it is in the root listing.
- **Docs name collision.** `Design.md` vs an existing `design.md` are the same file on Windows/macOS. Use `docs/project/`.
- **Meta tags point to production:** canonical/OG URLs and OG images use `vlsiinsights.com` even when served from netlify.app. Preview must be `noindex` after go-live.
- **Numbers disagree across the site** (program count 5/10/11; two different stats sets; different testimonial sets). See PRD §7.
- **JS-populated content:** blog teaser cards, blog posts (`post.html`) and the countdown look empty/static in raw HTML — check rendered DOM vs source before concluding anything, and confirm crawlers can see post content.
- **Razorpay webhook:** signature is computed over the **raw body**. Mount the webhook route before any JSON body parser, or use a raw-body parser on that route only.
- **Razorpay in React Native** needs native code → use an Expo custom dev client / EAS build, not Expo Go.
- **Google Sign-In:** add both `https://vlsiinsights.com` and `https://vlsi-insights.netlify.app` (and localhost) to authorised JavaScript origins; verify the ID token's audience on the server.
- **Netlify redirects:** order matters (first match wins, `_redirects` before `netlify.toml`); use `force = true` when a real file exists at the source path; test for loops with `curl -IL`.
- **CORS:** with the `/api/*` proxy the web app is same-origin; the mobile app is not — keep an explicit origin allow-list for anything that needs it.
- **Unlisted YouTube ≠ private.** Never host paid lessons there.

---

## 9. Glossary

| Term | Meaning |
|---|---|
| **RTL** | Register-Transfer Level — hardware described in Verilog/SystemVerilog |
| **UVM** | Universal Verification Methodology (SystemVerilog) |
| **SVA / ABV** | SystemVerilog Assertions / Assertion-Based Verification |
| **STA** | Static Timing Analysis |
| **DFT** | Design for Test (scan insertion) |
| **CDC** | Clock Domain Crossing |
| **SoC** | System on Chip |
| **AXI4 / AHB** | AMBA on-chip bus protocols |
| **PDK / FinFET** | Process Design Kit / transistor technology at 5 nm / 3 nm nodes |
| **EDA** | Electronic Design Automation (tools) |
| **QuestaSim / ModelSim** | HDL simulators |
| **Vivado / Artix-7** | AMD Xilinx FPGA toolchain / device family |
| **FPGA** | Field-Programmable Gate Array |
| **Tape-out** | Handing the final chip design to fabrication |
| **TinyML** | Machine learning on microcontrollers |
| **IVR** | Interactive Voice Response telephony |
| **Paise** | 1/100 rupee — integer unit used for all money values |

---

## 10. Open questions

1. Which folder and branch does Netlify build? Does the public repo match the deploy? What is in `_redirects`?
2. What backs login (`/auth/callback`, `/complete-profile`)? What does complete-profile collect?
3. Where do blog posts, cart state and form submissions come from / go? Is Razorpay live on the current site?
4. Reuse the existing service(s) or replace them (AD-9)?
5. Correct number of programs? Fee for the 6-Month VLSI Mastery?
6. Which placement / partner / student statistics are documented and current?
7. Are fees inclusive of GST? Who issues invoices?
8. Video host for paid content?
9. Refund and cancellation policy?
10. Do asset links carry a `?v=` version? Do `docs/design.md` and `css/global.css` hold the brand tokens (T-013)?
11. Which single response-time promise should the site make?

---

## 11. Session log

Format: `YYYY-MM-DD · who/tool · what changed · what to know next`.

- **2026-09-20 · Claude · Documentation baseline.** Reviewed the live Home, Programs and Front-End Software pages (public HTML only; stylesheet and server code not inspected). Produced the six docs. Logged issues I-1 to I-10 in PRD §7 and mapped them to Phase 0 tasks T-001–T-016. **No code changed.** Next: T-020 discovery (answer §10 Q1–2), then T-001/T-002 URL consolidation.
- **2026-09-20 · Claude · Revision 1.1 after repo review.** Read the public repo's `netlify.toml`, root listing and README snippet (JS/CSS folders and `_redirects` blocked). Corrected: clean URLs are intentional rewrites to `/pages/*.html` (Architecture §4 rewritten, no longer a replacement `netlify.toml`); asset-path issue is fragility, not breakage; repo layout is not `site/`+`server/`; added missing pages/routes (`post`, `auth-callback`, `complete-profile`, aliases, 404); added issues I-11 to I-14 (immutable cache on unhashed assets, repo drift, two redirect sources, no security headers); added AD-9/AD-10 and tasks T-004 (rewritten), T-017, T-018. Design tokens still `TODO(extract)`. **No code changed.** Next: T-001, T-020, T-004.
- **2026-09-20 · Antigravity · Usability Heuristics & LLM Council Master Plan.** Fixed all 13 usability heuristic issues on `index.html` (type scale, text colors, corner radii, 44px min-height buttons, Title Case labels, 12px min text, horizontal stats heading, chevron signifiers, 40px arrows, 44px dot touch target). Verified live via browser subagent. Conducted full 5-Advisor LLM Council review synthesizing `docs/CHANGES_AND_ADDITIONS_PLAN.md` with hybrid Supabase + Express architecture (resolving AD-9). Maintained 100% SHA256 parity with twin repo. Next: Execute Batch 1 (hygiene, partials, caching).
- **2026-09-20 · Antigravity · Execution of Batches 1–4 & EDA Software Lab Gating.** Executed all 4 batches from `docs/CHANGES_AND_ADDITIONS_PLAN.md`: (1) Hardened `netlify.toml` with strict security headers (HSTS, nosniff, frame deny, report-only CSP), revalidated CSS/JS caching, retired `_redirects`, and deployed build-time partials system (`scripts/build-partials.js`); (2) Created canonical JSON datasets (`programs.json`, `site-stats.json`, `testimonials.json`), PostgreSQL seed (`catalog_seed.sql`), and design token contrast table in `docs/Design.md`; (3) Hardened backend API: raw body buffer capture middleware (`rawBody.js`) mounted before JSON parser for Razorpay webhook HMAC verification, server-side pricing lookups in `razorpayService.js`, constant-time `crypto.timingSafeEqual` signature checks, idempotent webhook order processing, and honeypot (`_gotcha`) lead validation; (4) Added gated EDA lab authorization endpoint `GET /api/enrollment/verify-lab-access` with Supabase JWT auth, published DPDP-compliant Privacy Policy, Terms, and Refund Policy pages, and wired `front-end-software.html` client gating and upgrade modals. Verified 100% SHA256 file parity across twin repositories.

