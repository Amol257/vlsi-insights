# Rules — VLSI Insights Website

Binding rules for every contributor, human or AI coding tool. If a rule here conflicts with a request, follow the rule and say so.

| | |
|---|---|
| **Version** | 1.1 (revised after repo review) |
| **Date** | 2026-09-20 |
| **Read first** | [Memory.md](Memory.md) → [Tasks.md](Tasks.md) → this file |

---

## 1. Rules for AI coding tools

1. **Start every session** by reading `Memory.md` (state, decisions, gotchas) and the relevant task in `Tasks.md`.
2. **Work on one task at a time.** Reference its ID (`T-012`) in commits and PRs.
3. **Small diffs.** Change only what the task needs. No drive-by refactors, renames or reformatting of untouched files.
4. **Do not invent facts.** Prices, statistics, placement numbers, testimonials, dates and policies come from the data source or the client — never from your imagination. If missing, insert a clearly marked `TODO(client): …` and list it in `Memory.md → Open questions`.
5. **Do not add dependencies** without stating the package, why it is needed, its size and maintenance status in the PR description.
6. **Never commit secrets**, `.env` files, API keys, tokens or real customer data. Use `.env.example` with empty values.
7. **Run the checks** (lint, typecheck, tests, build) before declaring a task done. State what you ran and the result. If you could not run something, say so — do not claim it passed.
8. **Update the docs** you touched: tick the task in `Tasks.md`, add decisions/gotchas to `Memory.md`, adjust `Architecture.md`/`Design.md` if behaviour changed.
9. **Ask before** destructive actions: dropping tables, force-pushing, deleting files, changing pricing logic, changing auth or payment code paths.
10. **Payments and auth code require a second look:** explain the change, list the security assumptions, and add tests.
11. **Edit existing config in place.** Never replace or regenerate `netlify.toml`, `_redirects`, `css/global.css` or `js/main.js` wholesale — make targeted edits and show the diff. Redirects and headers live in `netlify.toml` only (`_redirects` is to be retired, T-017).
12. **Respect the existing layout.** Confirm the published folder (T-001) before creating files. Planning docs live in `docs/project/`. Never add a file whose name differs from an existing one only by case (`Design.md` vs `design.md` collide on Windows and macOS).
13. **Never resurrect decommissioned sections or items.** Once a section or asset has been removed (specifically `#flagship-work` / `.oval-showcase-section` Oval Flagship Courses Carousel, dead HTML redirect stubs, or retired scripts), never generate it back or re-introduce it during future prompts, refactors, or cross-repo synchronization.

---

## 2. Git & delivery

- **Branches:** `main` (production, protected) ← `feat/T-012-short-name`, `fix/T-020-…`, `chore/…`, `docs/…`.
- **Commits:** Conventional Commits — `feat(programs): add filter chips (T-012)`.
- **PRs:** one task per PR; description = what, why, screenshots (desktop + mobile), test evidence, risk/rollback.
- **Merge rules:** CI green, one review, no unresolved comments, Netlify deploy preview checked.
- **Migrations:** forward-only, reviewed separately, never edited after merge.
- **Releases:** merge to `main` deploys the site; API deploys via CI. Tag production releases `vYYYY.MM.DD`.

---

## 3. Code standards

### 3.1 HTML
- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`); exactly one `<h1>` per page; heading levels never skip.
- Each page has a unique `<title>`, meta description, canonical URL, Open Graph and Twitter tags.
- Internal links, `canonical`, `og:url` and sitemap entries use the **clean URL** (`/programs`) — never `.html`, never `/pages/…`, never a full `https://vlsi-insights.netlify.app/…` link. Clean URLs are served by rewrites in `netlify.toml`; add a rewrite there when you add a page.
- Assets are referenced root-relative (`/images/logo.webp`, `/css/global.css`) so they work from any route. Do not add new code that depends on the `/pages/{css,js,images}/*` or `/blog/{css,js,images}/*` compatibility rewrites; convert existing relative paths as you touch a page.
- New pages need: a rewrite in `netlify.toml`, a sitemap entry, unique title/description, and a link from the nav or footer.
- Header, footer, head meta and WhatsApp button come from **shared partials** — never paste them into a page.
- All images: `alt`, `width`, `height`, `loading="lazy"` (except the LCP image), modern format (WebP/AVIF).
- Buttons are `<button>`, navigation is `<a>`. No clickable `<div>`.

### 3.2 CSS
- Design tokens only (`var(--space-4)`, `var(--color-brand)`); no hard-coded colours, spacing or font sizes in components.
- Mobile-first; breakpoints from `Design.md`.
- BEM-style class names (`.program-card__title`); no IDs for styling; avoid `!important`.
- Respect `prefers-reduced-motion` for the marquee, countdown, carousels and any animation.
- No layout shift: reserve space for images, embeds and async content.

### 3.3 JavaScript (front end)
- ES modules, no globals, no inline `onclick`. Strict mode.
- One `api.js` wrapper for all `fetch` calls (base URL, auth header, refresh-on-401, error normalisation).
- Never store access tokens or protected URLs in `localStorage`.
- Never trust client state for prices, enrolment or access — the server decides.
- Escape/encode any dynamic text inserted into the DOM; use `textContent`, not `innerHTML`, for user-supplied or API-supplied strings.
- Every async UI has loading, empty, error and success states.
- Third-party scripts (analytics, Razorpay, Google) are loaded only where needed, with `defer`/`async`.

### 3.4 Backend (Node / TypeScript)
- TypeScript `strict`. No `any` without a comment explaining why.
- Validate every input with Zod at the route boundary; return the standard error shape from `Architecture.md §7`.
- Parameterised queries / ORM only. No string-built SQL.
- Business logic in `services/`, not in route handlers.
- Money is integer paise. Never floats.
- All environment variables validated at boot.
- Errors are logged with a request id; responses never leak stack traces or internals.

### 3.5 Assets & caching

- Long-lived `immutable` caching is allowed **only** for files whose URL changes when content changes (content-hashed filename or a `?v=<build>` query on every reference).
- Until then `/css/*` and `/js/*` use `max-age=0, must-revalidate` (Architecture.md §4.1-A).
- Never edit a hashed/versioned file in place without changing its URL.
- Rename images when their content changes.

---

## 4. Content & claims

1. **Every number on the site has a source.** Students trained, placement %, hiring partners, average package, years in industry — each must map to a row in `site_stats` with `evidence_ref` and `as_of` date. No evidence → remove or soften ("many of our students…").
2. **One number, one value.** The same figure must be identical on every page and in every meta tag. Currently violated (see PRD §7, I-4).
3. **Placement language:** do not promise or imply guaranteed jobs or "100% placement" unless the client can document it and its terms. Describe *support* (interview prep, referrals) instead. Indian consumer-protection rules on misleading advertising apply to training/coaching claims — have the client confirm wording with their legal adviser. *(This is a project rule, not legal advice.)*
4. **Testimonials:** publish only with written consent from the person; store the consent reference in `testimonials.consent_ref`. Names, employers and roles must be accurate and current.
5. **Employer / partner logos and names** (e.g. Qualcomm, NXP, Synopsys) may appear only where the client has confirmation the reference is accurate and permitted.
6. **Fees:** rendered from the program record. State whether GST is included. Never hard-code a price in HTML, JS or a meta tag.
7. **One response-time promise** sitewide (pick after client confirms) — used on every form and contact block.
8. **Licences:** EDA tool access text must keep the "training and non-commercial use only" statement.
9. **Tone:** professional, specific, engineer-to-engineer. Prefer concrete outcomes (labs, projects, tools) over superlatives.
10. **Spelling:** US spelling, matching the existing copy ("program", "enroll", "enrollment", "optimization"). Do not mix in UK spellings.

---

## 5. Security & privacy

1. Authorization is enforced **on the server** for every gated route. Hiding a button or page is not access control.
2. Passwords: argon2id; minimum 8 characters; never logged, never emailed.
3. Access tokens short-lived; refresh tokens rotated and stored hashed.
4. Payment flow follows `Architecture.md §8.2` exactly: server computes amount, verifies signature, webhook is the source of truth, everything idempotent.
5. Razorpay **test** keys in dev/preview, **live** keys only in production env vars.
6. Rate-limit login, register, forgot-password and lead endpoints. Add CAPTCHA to public forms.
7. CSP, HSTS and the other headers in `Architecture.md §4` are mandatory in production.
8. Personal data (name, email, phone, purchase history) is collected only with a stated purpose and consent, retained only as long as needed, and deletable on request (DPDP Act, 2023).
9. No personal data in URLs, analytics event properties, error messages or logs.
10. Dependency updates monthly; `npm audit` must show no high/critical issues on `main`.
11. Never expose signed-URL generation, admin routes or debug endpoints without auth.

---

## 6. Accessibility

- Target **WCAG 2.2 AA**.
- Every interactive element is keyboard reachable with a visible focus ring.
- Modals (sign-in, quick view, brochure): focus trap, `Esc` to close, restore focus on close, `aria-modal`, labelled title.
- Mega-menu and mobile drawer: `aria-expanded`, arrow-key/Tab behaviour documented in `Design.md`.
- Form fields: visible `<label>`, `autocomplete` attributes, inline error text linked with `aria-describedby`, errors announced (`role="alert"`).
- Colour contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components.
- Do not convey information with colour alone.
- Video embeds have titles; tutorials provide captions.

---

## 7. Performance budget (per page, mobile)

| Metric | Budget |
|---|---|
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| Own JS | ≤ 150 KB gzip |
| Own CSS | ≤ 60 KB gzip |
| Hero image | ≤ 200 KB |
| Any other image | ≤ 120 KB, sized for its display |

Lighthouse CI fails the PR when performance < 90 or accessibility < 95 on Home, Programs and Front-End Software.

---

## 8. Testing

- **Unit:** validators, price calculation, signature verification, enrolment logic.
- **Integration:** auth flow, checkout → webhook → enrolment (with Razorpay test mode / mocked signatures), gated endpoints (401 / 403 / 200 matrix).
- **E2E (Playwright):** home enquiry, program filter, sign-in → add to cart → checkout (test mode), EDA lab gating.
- **Manual before release:** iPhone Safari, Android Chrome, desktop Chrome/Edge/Firefox; keyboard-only pass; screen-reader spot check on forms.
- Bug fixes ship with a regression test.

---

## 9. Definition of done

A task is done only when:

- [ ] Acceptance criteria in `Tasks.md` are met
- [ ] Lint, typecheck, unit/integration tests and build pass
- [ ] Verified at 360 px, 768 px and 1280 px widths
- [ ] Keyboard and focus behaviour checked
- [ ] No new console errors or failed network requests
- [ ] Lighthouse budgets respected
- [ ] No secrets, TODOs without owners, or commented-out code
- [ ] Docs updated (`Tasks.md`, `Memory.md`, and `Architecture.md` / `Design.md` if affected)
- [ ] Deploy preview reviewed

---

## 10. Never do

- Hard-code prices, stats, dates or promo text in more than one place.
- Grant access based on client-side state.
- Trust a payment redirect without server-side verification.
- Put keys, tokens or protected URLs in front-end code, HTML, or `localStorage`.
- Use unlisted YouTube links for paid course content.
- Publish a testimonial, logo or statistic without evidence/consent.
- Copy header/footer markup into individual pages.
- Replace `netlify.toml` or `_redirects` wholesale, or add a catch-all `/pages/:slug` redirect.
- Serve `/css/*` or `/js/*` as `immutable` while filenames are unhashed and unversioned.
- Put planning docs next to an existing doc whose name differs only by letter case.
- Add a page without title, description, canonical, and a sitemap entry.
- Merge with failing CI or without a preview check.
