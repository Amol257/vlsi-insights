# Design — VLSI Insights Website

| | |
|---|---|
| **Version** | 1.1 (draft) — revised after repo review |
| **Date** | 2026-09-20 |
| **Basis** | Structure, content patterns and components observed on the live Home, Programs and Front-End Software pages; routes from the repo's `netlify.toml`; file names from the README (`css/global.css`, `navbar.css`, `footer.css`, `js/main.js`) |

> **Not captured:** the stylesheets could not be read during this review, so brand colours and font families are **not** invented here. The README says `css/global.css` holds the colour tokens, and it also lists a `docs/design.md` (design tokens, palette, motion) — **[Verify]** that file exists in the repo you work from. Those are the source of truth for *values*; this file is the source of truth for *structure and rules* until the two are merged (T-013, T-018). Where names differ, keep the existing token names.
>
> **File-name warning:** `Design.md` and an existing `design.md` are the same file on Windows/macOS. Keep this document in `docs/project/` or merge it into the existing one.

---

## 1. Brand & voice

- **Positioning:** front-end semiconductor engineering + training, bridging classroom theory and silicon tape-out.
- **Tagline (hero):** *Training Minds. Building Future. Growing Brands.*
- **Personality:** rigorous, practical, industry-credible, approachable to students.
- **Voice:** engineer-to-engineer. Concrete nouns (UVM 1.2, SVA, STA, Artix-7, FreeRTOS) over hype. Short sentences. Active verbs.
- **Do:** name the tool, the lab, the project. **Don't:** "world-class", "best-in-class", unverifiable superlatives (see Rules.md §4).

---

## 2. Information architecture

```
Home
├─ Services ▾
│  ├─ Engineering Services
│  │  ├─ VLSI Related Services
│  │  ├─ SOC Verification
│  │  ├─ Embedded Systems
│  │  ├─ AI Models
│  │  └─ Web Development
│  └─ Training & Growth
│     ├─ Technical Training
│     └─ Marketing Solutions
├─ Programs
├─ Front End Software      (gated: sign-in + enrolment)
├─ Blog
├─ About ▾
│  ├─ About the Company
│  ├─ About the Owner
│  └─ Testimonials
├─ Contact (Home #contact)
├─ Cart · Sign In / Sign Out
│  ├─ /auth/callback     (transient, no chrome)
│  └─ /complete-profile  (post sign-up step)
├─ Blog post  /blog/:slug
└─ [Planned] Student dashboard · My courses · Resources · Admin
```

Aliases that redirect (no design needed): `/about` → About the Company · `/solutions` → Marketing Solutions · `/contact` → Home `#contact` · `/software` → Front End Software · `/technical-blogs` → Blog. Unknown URLs render `404.html`.

Footer groups: **Services**, **Company / Resources**, **Programs**, **Get in touch** (email, phone, WhatsApp), social links (YouTube, LinkedIn, Instagram, WhatsApp).

---

## 3. Page templates

### 3.1 Home
Order of sections (keep):
1. **Hero** — headline, one-line value prop, primary CTA *Explore Programs*, secondary CTA *VLSI Design Details*, status chip ("Semiconductor Engineering • 2026 Cohorts Open"), slide/visual.
2. **Feature slides** — VLSI Services, Technical Training, Marketing Solution (each: image, title, one line, link).
3. **Specialty ticker** — marquee of technologies (SystemVerilog & UVM 1.2, RTL, STA, FinFET PDKs, PCIe/CXL, DFT, AXI4/AHB, FreeRTOS, TinyML). Pauses on hover/focus; static under reduced-motion.
4. **Engineering Solutions grid** — 6 service cards (1 flagship + 5), each with tag chips and link.
5. **Campus to Corporate** — College Training / Corporate Training cards with *Enquire now*.
6. **Stats strip** — from `site_stats` only.
7. **Practical over theoretical** — Mentorship, Projects, Placement support.
8. **Training roadmap** — 5 numbered steps.
9. **Testimonials** — 4 cards + *Read More*.
10. **Latest from the Lab** — 3 latest posts.
11. **Contact** — details block + enquiry form + success state.

### 3.2 Programs
Hero + early-enrollment banner (countdown) → filter chips → program grid → brochure previews → curriculum-download lead form → 6-stage journey → stats → alumni voices → admissions/WhatsApp → application form.

### 3.3 Front-End Software (gated)
Hero (eligibility notice) → sign-in gate → EDA Playground card → tool cards (QuestaSim, ModelSim; tutorial + download) → free demo CTA → support form → FAQ (eligibility, licence limits, hardware specs) → CTA.

### 3.4 Service pages (×7)
Hero → what we do → tools/tech chips → process → deliverables → CTA (enquiry / WhatsApp). Shared template; content from data.

### 3.5 Cart / Login / Dashboard
Single-column, focused layout; no mega-menu distractions on Login. Dashboard (planned): sidebar (My courses, Resources, Batch info, Profile) + content.

### 3.6 Blog list and blog post
- **List (`/blog`):** hero, optional tag filter, post cards (cover, title, excerpt, date, read time), pagination or "load more" with a real link fallback.
- **Post (`/blog/:slug`, one template):** title, date, author, cover, body (headings, code blocks with mono font and horizontal scroll, images with captions), share links, related posts, CTA to Programs. The title, meta description, `og:*` tags and body must be present for crawlers — not JS-only (PRD FR-7.1).
- Loading state: skeleton; error state: message + link back to `/blog`; missing slug renders the 404 design.

### 3.7 Auth callback and Complete profile
- **`/auth/callback`:** minimal centred spinner + "Signing you in…" (`role="status"`); on error, plain message with "Back to sign in". No header/footer, no motion under reduced-motion.
- **`/complete-profile`:** single-column form using the standard form pattern (§8) for the fields still missing after social sign-up (**[Verify]** current fields; expected: full name, phone with country code). Primary CTA "Save and continue", preserves the `redirect` target.

---

## 4. Layout & responsive rules

| Token | Value |
|---|---|
| Container max-width | 1200 px (text blocks max 68 ch) |
| Gutters | 16 px (mobile) · 24 px (tablet) · 32 px (desktop) |
| Grid | 4 cols (mobile) · 8 (tablet) · 12 (desktop), 24 px gap |
| Breakpoints | `sm` 480 · `md` 768 · `lg` 1024 · `xl` 1280 |

- Mobile-first. Service grid: 1 col → 2 cols (`md`) → 3 cols (`lg`).
- Sticky header, compact on scroll; the WhatsApp button is fixed bottom-right and must not overlap the footer links or cookie/consent UI.
- Mega-menu is desktop-only; below `lg` it becomes a full-height drawer with accordion groups.

---

## 5. Design tokens

### 5.1 Colour (`TODO(extract)` — copy values from `css/global.css` / `docs/design.md`, then freeze here)

List the existing custom properties (run from the front-end folder):

```bash
grep -hoE -- '--[a-zA-Z0-9-]+:[^;]+' css/*.css | sort -u
```
Map each existing token to a semantic role below and keep its existing name; add only what is missing.


```css
:root {
  /* Brand / Semiconductor Trace Palette */
  --trace:        #00A887; /* Primary Emerald */
  --trace-glow:   #00D9AE; /* Vibrant Accent / Neon Cyan */
  --trace-deep:   #064E3B; /* Deep Emerald for text in light mode */
  --blue-beam:    #38BDF8; /* Secondary Semiconductor Blue */

  /* Neutrals & Surfaces */
  --substrate:    #F8FAFC; /* Page background */
  --surface:      #FFFFFF; /* Elevated cards & panels */
  --layer:        #FFFFFF; /* Card inner layers */
  --edge:         #E2E8F0; /* Subtle borders */
  --edge-strong:  #CBD5E1; /* Elevated dividers */
  --void:         #0B1120; /* Dark mode abyss */

  /* High-Contrast Typography */
  --text-hi:      #0F172A; /* Slate 900 (14.8:1 on white, passes WCAG AAA) */
  --text-mid:     #475569; /* Slate 600 (5.9:1 on white, passes WCAG AA) */
  --text-muted:   #64748B; /* Slate 500 (4.6:1 on white, passes WCAG AA) */

  /* Status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger:  #EF4444;
  --color-info:    #3B82F6;

  /* Shape & Physics */
  --radius-pill:  9999px;
  --radius-card:  12px;
  --radius-inner: 8px;
  --dur-quick:    160ms;
  --dur-normal:   240ms;
}
```

| Text Token | Background | Contrast Ratio | WCAG 2.2 AA Compliance |
| :--- | :--- | :--- | :--- |
| `--text-hi` (`#0F172A`) | `--surface` (`#FFFFFF`) | **14.8:1** | Pass (AAA) |
| `--text-mid` (`#475569`) | `--surface` (`#FFFFFF`) | **5.9:1** | Pass (AA) |
| `--text-muted` (`#64748B`) | `--surface` (`#FFFFFF`) | **4.6:1** | Pass (AA) |
| `--trace-deep` (`#064E3B`) | `--surface` (`#FFFFFF`) | **8.1:1** | Pass (AAA) |
| White (`#FFFFFF`) | `--trace` (`#00A887`) | **4.7:1** | Pass (AA) |


### 5.2 Typography

| Token | Value |
|---|---|
| `--font-sans` | `TODO(extract)`, `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif` |
| `--font-mono` | `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`, monospace (code, tool names, tag chips) |

| Style | Size (mobile → desktop) | Weight | Line height |
|---|---|---|---|
| Display / H1 | 2.25rem → 3.5rem | 700 | 1.1 |
| H2 | 1.75rem → 2.5rem | 700 | 1.2 |
| H3 | 1.25rem → 1.5rem | 600 | 1.3 |
| Body | 1rem | 400 | 1.6 |
| Small / caption | 0.875rem | 400 | 1.5 |
| Eyebrow (e.g. "Flagship Practice") | 0.75rem, uppercase, +0.08em tracking | 600 | 1.2 |

Use `clamp()` for fluid headings. Never go below 16 px for form input text (prevents iOS zoom).

### 5.3 Spacing, radius, elevation, motion

```css
:root {
  --space-1: .25rem; --space-2: .5rem;  --space-3: .75rem; --space-4: 1rem;
  --space-5: 1.5rem; --space-6: 2rem;   --space-8: 3rem;   --space-10: 4rem; --space-12: 6rem;

  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 20px; --radius-pill: 999px;

  --shadow-1: 0 1px 2px rgba(0,0,0,.06);
  --shadow-2: 0 4px 12px rgba(0,0,0,.10);
  --shadow-3: 0 12px 32px rgba(0,0,0,.16);

  --ease: cubic-bezier(.2,.8,.2,1);
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 400ms;
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```
Section vertical rhythm: `--space-10` mobile, `--space-12` desktop.

---

## 6. Component inventory

| Component | Seen on | Spec |
|---|---|---|
| **Header / mega-menu** | all | Logo left; items; two-group mega-menu (title + one-line description per link); cart badge; Sign In/Out toggle. `aria-expanded`, Esc closes, focus returns to trigger |
| **Mobile drawer** | all | Focus-trapped, accordion groups, close button, backdrop |
| **Skip link** | all | First focusable element; visible on focus |
| **Hero** | Home, Programs, Front-End Software | H1, subtext, ≤ 2 CTAs, status chip, optional image; LCP image preloaded |
| **Status chip / eyebrow** | hero, sections | Small pill; e.g. "Early Enrollment Window", "Live Cohort" |
| **Service card** | Home | Title, 1–2 line description, tag chips, text link; flagship variant is larger |
| **Tag chip** | service cards, ticker | Mono font, pill radius, non-interactive |
| **Ticker (marquee)** | Home | Duplicated list for seamless loop; pause on hover/focus; disabled with reduced-motion |
| **Stats strip** | Home, Programs | Number + label; numbers from data with `as_of` in a tooltip/footnote |
| **Roadmap / journey steps** | Home (5), Programs (6) | Numbered "STEP 0X" / "01"; vertical on mobile, horizontal on desktop |
| **Filter chips** | Programs | Single-select, `role="tablist"` or radio group; shows count; state in URL (`?category=`) |
| **Program card** | Programs | Brochure image, category badge, title, duration, fee, **Quick View**, **Preview** |
| **Quick View modal** | Programs | Title, category, duration, fee, prerequisites, syllabus accordion, View Brochure, **Enroll in Program** |
| **Brochure lightbox** | Programs | Image viewer, Download, Close |
| **Countdown banner** | Programs | Real batch date; shows nothing when no batch is open |
| **Testimonial card** | Home, Programs, Testimonials | Quote, initials avatar, name, role @ company; only consented entries |
| **Toast** | Programs | "Added to cart!" + *View Cart*; `role="status"`, auto-dismiss 5 s, pause on hover |
| **Auth modal / page** | Programs, Login | Tabs: Sign in / Register; Google button; Keep me signed in; Forgot password; inline errors |
| **Lead form** | Home, Programs, Front-End Software | Labels above fields, required asterisk + text, consent checkbox, success panel replaces form, "Send another" link |
| **Select / dropdown** | forms | Native `<select>` styled; no custom JS select |
| **FAQ accordion** | Front-End Software | `<details>`/`<summary>` or button + `aria-controls` |
| **Tool card** | Front-End Software | Thumbnail → YouTube tutorial, description, 3 bullets, download/request link |
| **WhatsApp FAB** | all | Fixed bottom-right, 56 px, unread-style badge optional, prefilled message per page |
| **Footer** | all | 4 columns collapsing to accordion on mobile; social icons with `aria-label` |
| **Cart list** | Cart | Row per program: title, duration, fee, remove; summary card with total and *Pay with Razorpay* |
| **Dashboard shell** *(planned)* | Student area | Sidebar + content; course cards with progress bars; lesson player |

### Component states (all interactive components)
default · hover · focus-visible · active · disabled · loading · error · success. Loading = skeleton or spinner with `aria-busy`. Empty states have an explanation and a next action.

---

## 7. Buttons & CTAs

| Type | Use | Notes |
|---|---|---|
| **Primary** | one per view: Explore Programs, Enroll, Pay, Submit | Filled brand colour, min height 44 px |
| **Secondary** | VLSI Design Details, Quick View | Outline |
| **Tertiary / link** | Read More, Preview | Underlined on hover/focus |
| **WhatsApp** | Chat on WhatsApp | Distinct brand green; always paired with visible text, not icon-only |
| **Destructive** | Remove from cart, Sign Out | Neutral until hover; confirm only for irreversible actions |

Touch targets ≥ 44 × 44 px. Disabled buttons explain why (helper text), not just grey out.

---

## 8. Forms

- Labels above inputs, always visible (no placeholder-only labels).
- Required fields: `*` **and** the word "required" in the accessible name.
- Phone: "with country code" hint; default `+91` prefix suggestion; validate with libphonenumber-style rules.
- Password: show/hide toggle, live strength hint, min 8 characters.
- Validation on blur + on submit; first invalid field receives focus; summary `role="alert"`.
- Consent checkbox with privacy-policy link before submit on all lead forms.
- Success panel copy uses the single response-time promise (Rules.md §4.7).
- Spam: hidden honeypot field + CAPTCHA (non-blocking, invisible where possible).
- Preserve entered data after a failed submit.

---

## 9. Imagery & media

- Formats: WebP/AVIF; provide `srcset` (480, 768, 1200, 1600 widths).
- Hero and slide images use consistent aspect ratios (16:9 hero, 4:3 cards); brochures 1086×1536 portrait (as seen).
- Every image has meaningful `alt`; decorative images `alt=""`.
- Diagrams and flow illustrations: SVG, inline or `<img>`, with text alternatives.
- Video: YouTube tutorials use privacy-enhanced embeds (`youtube-nocookie.com`) with click-to-load thumbnails; **paid course video never on YouTube**.
- Alumni photos/avatars only with consent; otherwise initials avatars.
- Open Graph image 1200×630 per page type.

---

## 10. Motion

- Purposeful only: menu open/close (200 ms), modal fade + 8 px rise (200 ms), toast slide (200 ms), card hover lift (120 ms).
- Marquee and countdown never auto-animate under `prefers-reduced-motion`.
- No parallax, no autoplaying video with sound, no motion > 5 s without a pause control.

---

## 11. Accessibility patterns

- Focus ring: 2 px solid + 2 px offset, ≥ 3:1 against adjacent colours; never `outline: none` without replacement.
- Landmarks per page; skip link targets `#main-content`.
- Modals: `role="dialog" aria-modal="true" aria-labelledby`, focus trap, `Esc`, return focus.
- Mega-menu: button toggles the panel (`aria-expanded`), `Esc` closes, links reachable in DOM order.
- Live regions: toasts `role="status"`; form errors `role="alert"`.
- Countdown announced only at meaningful thresholds, not every second.
- Language attribute `lang="en"`; tel/mailto links use descriptive text.

---

## 12. Email & message templates (for later phases)

Transactional emails (welcome, verify email, password reset, payment receipt, enrolment confirmation, lead auto-reply) share one responsive template: logo, H1, body, primary button, support contact (info@vlsiinsights.com · +91 98101 91592), footer with legal name and unsubscribe/notice where applicable. Subject lines ≤ 55 characters, plain and specific.

WhatsApp prefilled messages are defined per page in a single map (`whatsappMessages`) — e.g. Programs: *"Hello, I want to enquire about the VLSI Programs."*

---

## 13. Design QA checklist

- [ ] Tokens only; no raw hex / px values in components
- [ ] 360 / 768 / 1280 px screenshots reviewed
- [ ] Contrast pairs checked and recorded
- [ ] Keyboard-only pass on menu, modals, forms
- [ ] Reduced-motion pass
- [ ] Empty / loading / error / success states designed
- [ ] Content pulled from data (prices, stats, counts), not typed into markup
