# PRD — VLSI Insights Website

| | |
|---|---|
| **Version** | 1.1 (draft) — revised after reviewing the public repo |
| **Date** | 2026-09-20 |
| **Live site** | https://vlsi-insights.netlify.app |
| **Production domain** | vlsiinsights.com (per canonical / Open Graph tags) |
| **Hosting** | Netlify |
| **Companion docs** | [Architecture.md](Architecture.md) · [Design.md](Design.md) · [Rules.md](Rules.md) · [Tasks.md](Tasks.md) · [Memory.md](Memory.md) |

> **Basis of this document:** review of the public pages Home, Programs and Front-End Software on 2026-09-20, plus the public repo `Amol257/vlsi-insights` (`netlify.toml`, file listing, README snippet). Items tagged **[Verify]** cannot be confirmed from public HTML (server behaviour, JS-rendered content) and must be checked against the codebase before being treated as fact.

---

## 1. Overview

VLSI Insights is a semiconductor training hub, engineering-services consultancy and digital agency based in Ghaziabad, Delhi NCR. The website is its main channel to:

1. Sell and enrol students into training programs (RTL, verification, FPGA, embedded).
2. Generate B2B leads for engineering services, college training and corporate training.
3. Give enrolled students gated access to the EDA software lab and learning resources.
4. Build authority through a technical blog and social proof.

**Positioning line (current copy):** *"Training Minds. Building Future. Growing Brands."* — bridging classroom theory and silicon tape-out.

---

## 2. Goals & success metrics

| # | Goal | Metric | Definition | Target |
|---|---|---|---|---|
| G1 | Capture demand | Enquiry conversion rate | (form submits + WhatsApp clicks) ÷ sessions | TBD after 30-day baseline |
| G2 | Enrol online | Cart → paid rate | paid orders ÷ carts created | TBD after baseline |
| G3 | Serve students | Gated-page activation | enrolled users who open the EDA lab within 7 days ÷ enrolled users | TBD |
| G4 | Respond fast | Lead response time | median time from submit to first human reply | Meet the single published SLA (see FR-5) |
| G5 | Be findable | Organic sessions | non-branded organic sessions / month | TBD after baseline |
| G6 | Be fast | Core Web Vitals (mobile, p75) | LCP / INP / CLS | ≤ 2.5 s / ≤ 200 ms / ≤ 0.1 |

Analytics must be live before any target is set (see T-016 in Tasks.md).

---

## 3. Users & personas

| ID | Persona | Needs | Primary pages |
|---|---|---|---|
| P1 | **Engineering student / fresher** (B.E./B.Tech, M.Tech) | Job-oriented program, price, syllabus, placement proof | Programs, Testimonials, Enquiry |
| P2 | **Working engineer / career transitioner** | Upskill in UVM, SVA, FPGA; flexible duration | Programs, Blog |
| P3 | **College placement cell / faculty** | Bulk training, lab provisioning | Technical Training, Front-End Software, Enquiry |
| P4 | **Corporate L&D / engineering manager** | Team upskilling, EDA-tool training | Technical Training, Enquiry |
| P5 | **Services client** | RTL, SoC verification, embedded, AI/edge, web, marketing | Service pages, About, Enquiry |
| P6 | **Owner / admin** | Manage programs, batches, leads, blog, enrolments | Admin (planned) |

---

## 4. Scope

### 4.1 Current pages (observed)

| Page | Route(s) seen | Purpose |
|---|---|---|
| Home | `/` | Hero, services, training tracks, stats, roadmap, testimonials, blog teaser, contact form |
| VLSI Related Services | `vlsi-designs` | RTL, physical design, synthesis, STA |
| SOC Verification | `soc-verification` | UVM 1.2, SVA, coverage |
| Embedded Systems | `embedded-systems` | ARM Cortex, FreeRTOS, RISC-V |
| AI Models | `ai-models` | TinyML, quantization, edge inference |
| Web Development | `web-development` | Portals, LMS, landing pages |
| Technical Training | `technical-training` | College / corporate training |
| Marketing Solutions | `marketing-solutions` | Digital marketing, IVR telephony |
| Programs | `programs` | Catalog, filters, brochures, quick view, cart, application form |
| Front-End Software | `front-end-software` | Gated EDA lab: EDA Playground, QuestaSim, ModelSim, tutorials, support form |
| Blog list | `/blog`, `/blogs` (`/technical-blogs` 301s here) | Technical notes |
| Blog post | `/blog/:slug`, `/post` | Single post template, content loaded at runtime **[Verify source]** |
| About Company / About Owner / Testimonials | `about-company`, `about-owner`, `testimonials` | Trust |
| Cart | `cart` | Enrolment basket |
| Login | `login` | Sign in, register, forgot password |
| Auth callback | `/auth/callback` | Landing route for the social-login redirect |
| Complete profile | `/complete-profile` | Collects missing profile fields after sign-up **[Verify fields]** |
| Aliases | `/about`, `/solutions`, `/contact`, `/software`, `/marketing-solution` | Redirect/rewrite to the pages above (`/contact` → Home `#contact`) |
| 404 | (any unknown URL) | `404.html` |

### 4.2 Program catalog (as displayed on 2026-09-20)

| Program | Category | Duration | Fee (shown as) |
|---|---|---|---|
| Digital + Verilog Training | Beginners | 8 weeks | 35,000/- |
| Core VLSI Verification (SystemVerilog + UVM) | Job-Oriented | 4 months | 40,000/- |
| Core VLSI Assertion Training (SVA & ABV) | Advance | 1 month | 25,000/- |
| FPGA Training on AMD Xilinx Artix-7 | FPGA | 3 months | 25,000/- |
| Raspberry Pi Embedded & IoT | Embedded | 2 months | 25,000/- |
| 6-Month VLSI Mastery (RTL Design & Verification) | Job-Oriented | 6 months | *not shown on page* |

The catalog is the single source of truth for pricing once moved to the database (see Architecture.md §6).

### 4.3 Out of scope (this PRD)

- The Android app (separate scope; it consumes the same API — see §8, Phase 3).
- Native iOS app.
- Live-class video conferencing (use external tooling).
- Multi-language content.

---

## 5. Functional requirements

Priority: **M** = must, **S** = should, **C** = could. Status: **Live** (seen working), **Verify**, **Planned**.

### FR-1 Navigation & layout
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-1.1 | Header with Services mega-menu (Engineering Services / Training & Growth), Programs, Front End Software, Blog, About menu, Contact, cart badge, Sign In / Sign Out | M | Live |
| FR-1.2 | Mobile drawer navigation with the same items | M | Live |
| FR-1.3 | Skip-to-content link on every page | M | Live |
| FR-1.4 | Floating WhatsApp button with prefilled, page-specific message | S | Live |
| FR-1.5 | Header/footer defined once (shared partial), not copy-pasted per page | M | Planned |

### FR-2 Programs catalog
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-2.1 | Filter chips: All, Internship, Mastery, Beginners, Advance, Embedded Systems, FPGAs | M | Live |
| FR-2.2 | Program cards show title, category, duration, fee, brochure preview | M | Live |
| FR-2.3 | Quick View modal: category, duration, fee, prerequisites, syllabus breakdown, brochure, Enroll | M | Live |
| FR-2.4 | Program count shown in filter, meta tags and application form is derived from data, never hand-typed | M | Planned |
| FR-2.5 | Next-batch banner and countdown driven by real batch start dates | S | Verify |
| FR-2.6 | Each program has its own indexable URL (`/programs/<slug>`) with Course structured data | S | Planned |

### FR-3 Cart, checkout & enrolment
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-3.1 | "Add to cart" requires sign-in; unauthenticated click opens sign-in modal and resumes the action after login | M | Live |
| FR-3.2 | Cart page lists items, subtotal, remove; badge count in header | M | Live |
| FR-3.3 | Checkout via **Razorpay** (client already has a Razorpay account/API); order amount computed server-side | M | Verify |
| FR-3.4 | Payment confirmed by signature verification **and** webhook; enrolment created only after verified capture | M | Planned |
| FR-3.5 | Email receipt / tax invoice after payment | M | Planned |
| FR-3.6 | Enrolment appears in the student's dashboard immediately | M | Planned |
| FR-3.7 | Coupon codes, EMI / instalments | C | Planned |

### FR-4 Accounts & authentication
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-4.1 | Register: name, email, password, confirm password, phone (with country code) | M | Live |
| FR-4.2 | Sign in with username/email + password; "Keep me signed in" | M | Live |
| FR-4.3 | Sign in with Google | M | Live |
| FR-4.4 | Forgot / reset password via emailed one-time link | M | Verify |
| FR-4.5 | `?redirect=` returns the user to the page they came from after login | M | Live |
| FR-4.8 | `/auth/callback` completes the social-login redirect; `/complete-profile` collects any required field still missing (e.g. phone) before the first purchase | M | Verify |
| FR-4.6 | Minimum password length raised from 6 to 8; breached-password check | S | Planned |
| FR-4.7 | Email verification before first purchase | S | Planned |

### FR-5 Lead capture
Four forms exist today: **Home enquiry**, **Programs application**, **Curriculum PDF download**, **Software support enquiry**.

| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-5.1 | All forms post to one lead endpoint and store: source form, name, email, phone, program (if any), message, UTM params, consent timestamp | M | Verify |
| FR-5.2 | Every submission emails `info@vlsiinsights.com` and shows an on-page confirmation state | M | Live (UI) / Verify (delivery) |
| FR-5.3 | Spam protection (honeypot + rate limit + CAPTCHA such as Cloudflare Turnstile) | M | Planned |
| FR-5.4 | Curriculum PDF is delivered only after a valid submission (PDF URL not exposed in page source) | S | Verify |
| FR-5.5 | **One** response-time promise used everywhere. Currently the site says "< 4 hrs", "< 24 h", and "within one business day" | M | Planned |
| FR-5.6 | Explicit consent checkbox + privacy-policy link on every form | M | Planned |

### FR-6 Front-End Software lab (gated)
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-6.1 | Page is visible to everyone as a marketing page; tool access, downloads and EDA Playground link require sign-in | M | Live |
| FR-6.2 | Access granted only to users with an **active enrolment** (server-checked), not merely a signed-in account | M | Verify |
| FR-6.3 | Tool cards: QuestaSim, ModelSim, EDA Playground; each with a YouTube walkthrough | M | Live |
| FR-6.4 | Support form: tool, issue type, OS, role, institution, description | M | Live |
| FR-6.5 | Licence terms displayed: academic / training use only, no commercial or tape-out use | M | Live |

### FR-7 Content
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-7.1 | Blog list at `/blog`, posts at `/blog/:slug` via one template; home page shows the latest 3 posts. Post title, description and body must be crawlable (pre-rendered or server-supplied), not JS-only | M | Verify (teaser cards empty in static HTML) |
| FR-7.2 | Testimonials page + home/program snippets sourced from one data set | M | Planned |
| FR-7.3 | Stats (students trained, placements, partners) sourced from one data set, each with a dated evidence source | M | Planned |

### FR-8 SEO & analytics
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-8.1 | Unique `<title>`, description, canonical, Open Graph and Twitter tags per page | M | Live |
| FR-8.2 | `sitemap.xml` (clean URLs only), `robots.txt`; canonical and `og:url` use the clean URL; the Netlify preview domain returns `noindex` once production is live | M | Planned |
| FR-8.3 | JSON-LD: `Organization`, `Course` (per program), `BlogPosting` | S | Planned |
| FR-8.4 | Analytics with events: `cta_click`, `whatsapp_click`, `form_submit`, `add_to_cart`, `checkout_start`, `purchase`, `login` | M | Planned |

### FR-9 Student dashboard & course content (Phase 2)
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-9.1 | "My courses": enrolled programs, progress | M | Planned |
| FR-9.2 | Course player: modules → lessons (video, PDF, link), progress tracking | M | Planned |
| FR-9.3 | Resources library (public and enrolled-only) | S | Planned |
| FR-9.4 | Batch info, schedule and announcements | S | Planned |
| FR-9.5 | Certificate on completion | C | Planned |

### FR-10 Admin (Phase 2)
| ID | Requirement | Pri | Status |
|---|---|---|---|
| FR-10.1 | CRUD for programs, batches, blog posts, testimonials, stats | M | Planned |
| FR-10.2 | Lead inbox with status (new → contacted → qualified → won/lost) and CSV export | M | Planned |
| FR-10.3 | Manual enrolment (for offline / bank-transfer payments) | S | Planned |

---

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| **Performance** | Mobile LCP ≤ 2.5 s on 4G; images in WebP/AVIF with explicit dimensions; total JS per page ≤ 150 KB gzip excluding third-party embeds |
| **Accessibility** | WCAG 2.2 AA: keyboard operable mega-menu and modals with focus trap, visible focus, labelled form fields, contrast ≥ 4.5:1, `prefers-reduced-motion` respected (marquee, countdown, carousel) |
| **Security** | HTTPS/HSTS, CSP, hashed passwords, server-side authorization on every gated route, no secrets in client code (see Rules.md §5) |
| **Privacy** | Compliant with India's Digital Personal Data Protection Act, 2023: notice + consent at collection, purpose limitation, retention policy, deletion on request |
| **Reliability** | Static front end on Netlify CDN; API health check + uptime monitor; daily DB backups with a tested restore |
| **Browsers** | Last 2 versions of Chrome, Edge, Safari, Firefox; Android Chrome and iOS Safari |
| **SEO** | Server-rendered / static HTML for all content pages (no content that exists only after JS runs) |
| **Maintainability** | Shared partials, one CSS token file, no duplicated page content (see Rules.md) |

---

## 7. Issues found in the current site (2026-09-20)

Each becomes a task in Tasks.md (Phase 0).

| # | Finding | Impact |
|---|---|---|
| I-1 | **Inconsistent link targets.** `netlify.toml` makes clean URLs (`/vlsi-designs`) the intended scheme (200 rewrites to `/pages/*.html`), but Home links to `/vlsi-designs.html` while inner pages link to `/pages/vlsi-designs` and `/index.html`; Programs declares `canonical: programs.html`. The same page is reachable at several URLs. | Duplicate content, split SEO signals, inconsistent navigation |
| I-2 | **Relative asset paths work only because of rewrites.** Pages use `images/…` and `index.html`; under `/pages/…` or `/blog/…` these resolve to `/pages/images/…` etc., which `netlify.toml` maps back to the root folders. | Fragile: removing a rewrite breaks images/CSS/JS on those routes |
| I-3 | **Program count mismatch.** Meta description and application form say "11 programs"; the filter says "All Programs (10)"; five brochures are shown. | Trust, conversion |
| I-4 | **Stats mismatch.** Home: 200+ students trained, 3 tracks, 10+ corporate partners, 5 years. Programs: 98% placement, 200+ engineers placed, 45+ hiring partners, 6 LPA average. Meta description says "100% placement support". | Credibility and advertising-claim risk |
| I-5 | **Testimonials differ per page** (different people/companies on Home vs Programs). | Consistency; consent evidence needed |
| I-6 | **Response-time promises differ** (< 4 hrs, < 24 h, one business day). | Unmet expectations |
| I-7 | **Canonical / OG URLs point to vlsiinsights.com** while the site is served from netlify.app; OG image URLs also point to the production domain. | Fine for production; preview must be `noindex` |
| I-8 | Home "Latest from the Lab" cards are empty in the static HTML and blog posts use one runtime-loaded template (`/blog/:slug` → `post.html`); countdown shows a static "48 Hours 00 Mins 00 Secs". | Posts may be invisible to search engines; credibility **[Verify]** |
| I-9 | Registration accepts 6-character passwords. | Weak credential policy |
| I-10 | The gated EDA page may be gated client-side only. | Unauthorised access to tools/downloads **[Verify]** |
| I-11 | **Immutable caching without hashed filenames.** `netlify.toml` sends `max-age=31536000, immutable` for `/css/*` and `/js/*`, but the files are named `global.css`, `main.js`, etc. | Returning visitors can keep stale CSS/JS after a deploy **[Verify]** whether links carry `?v=` |
| I-12 | **Repo layout drift.** README (`VLSI Insights/Website`), `netlify.toml` (`base = "frontend"`) and the GitHub root (flat) describe different layouts. | Unclear what is deployed; risk of editing the wrong copy |
| I-13 | **Two redirect sources** (`_redirects` and `netlify.toml`) and root-level `.html` files that duplicate `/pages/*`. | Conflicting rules (`_redirects` wins); duplicate content **[Verify]** |
| I-14 | **No security headers** in `netlify.toml`. | Missing HSTS, nosniff, frame and referrer protections **[Verify]** whether set in the Netlify UI |

---

## 8. Roadmap

| Phase | Theme | Outcome |
|---|---|---|
| **0** | Hygiene (1–2 wks) | Single URL scheme, shared header/footer, consistent numbers, SEO basics, analytics |
| **1** | Commerce & auth hardening | Backend-verified auth, Razorpay checkout with webhook, lead pipeline, server-gated EDA lab |
| **2** | Student experience & admin | Student dashboard, course content, resources, admin panel |
| **3** | Android app | Expo/React Native app on the same API (Play Store first, iOS later). Basic version first, phased upgrades |

The client wants a basic first release with slow, phased upgrades — each phase must ship independently.

---

## 9. Assumptions & dependencies

- Client provides: brand assets, real batch dates, evidence for every published statistic, written consent for each testimonial, GST / invoicing details.
- Razorpay account is already provisioned (keys held by the client, never committed to the repo).
- Domain `vlsiinsights.com` DNS is under the client's control.
- Transactional email provider and video host are chosen in Phase 1 (see Architecture.md §12).

## 10. Open questions

1. Is the cart stored client-side or server-side today? Is Razorpay already wired on the live site?
2. What backs login today (the `/auth/callback` + `/complete-profile` routes suggest a hosted provider)? What does complete-profile collect? Where do form submissions go?
3. Which folder and branch does Netlify actually build, and does the public repo match it? What does `_redirects` contain?
4. Where do blog posts come from (JSON, CMS, database, service)?
5. Which placement / partner / student figures are correct and documented?
6. Are fees inclusive or exclusive of GST? Who issues invoices?
7. Which video host for paid content?
8. Refund and cancellation policy — text and rules?
