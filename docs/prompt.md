# VLSI Insights — Master Build Prompt

Use this prompt to build the full website. Read design.md and components.md before starting.
The output is a single-file HTML artifact (HTML + CSS + JS, no external build step).
Tailwind CDN is allowed. Import Space Grotesk and Inter from Google Fonts.
Use Lucide icons via CDN.

---

## Prompt

Build a modern, animated single-page website for **VLSI Insights** — a semiconductor training and services company based in India. The site must faithfully follow the token system in `design.md`. Do not deviate from the color palette, typography, or animation rules defined there.

### Tech stack
- Plain HTML5, CSS custom properties, vanilla JS
- Google Fonts: Space Grotesk (700) + Inter (400, 500, 600)
- Lucide Icons via `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- No React, no build step, no external CSS frameworks

---

### Sections (in order)

#### 1. Navigation
- Sticky, glassmorphic: `background: rgba(13,17,23,0.85)`, `backdrop-filter: blur(12px)`
- Left: logo mark (SVG — small circuit node icon) + "VLSI Insights" in Space Grotesk 700
- Right: links — Home, Services, Programs, Blog, About
- Active link color: `var(--trace)`
- Underline hover: `transform: scaleX()` from left, `var(--trace)`, 300ms
- Mobile: hamburger toggling a slide-in drawer from right

#### 2. Hero
- Full viewport height
- Background: dark image (engineers at workstation) with `linear-gradient(to bottom, rgba(7,9,15,0.7) 0%, rgba(7,9,15,0.95) 100%)`
- Left-aligned content, vertically centered, max 640px wide
- **Page-load animation sequence** (staggered, runs once):
  1. `0ms`: circuit trace SVG path draws itself (stroke-dashoffset from full length to 0), 800ms, ease-out
  2. `200ms`: headline line 1 "Training Minds" fades + slides up from y:30, 600ms ease-out-expo
  3. `400ms`: headline line 2 "Building Future" same treatment
  4. `600ms`: subheadline "Growing Brands" same treatment
  5. `900ms`: body paragraph fades in
  6. `1100ms`: CTA buttons fade in
- After animation: trace SVG persists at 5% opacity as background texture
- Headlines: Space Grotesk 700, `clamp(2.5rem, 6vw, 4.5rem)`, `var(--text-hi)`, tracking -0.02em
- Two CTAs side by side: "Explore Programs" (primary) + "Our Services" (secondary)
- Below fold indicator: animated chevron-down, fades out on first scroll

#### 3. Services Strip
- Full-width horizontal scroll on mobile, 3+3 grid on desktop
- Six services: AI Models, Embedded Systems, VLSI Designs, SOC Verification, Digital Marketing, Web Development
- Each tile: `var(--layer)` background, Lucide icon in `var(--trace)`, service name, one-line description
- Hover: border color transitions from `var(--edge)` to `var(--trace)`, card shifts `translateY(-2px)`
- No drop shadows. No numbered markers (services are not a sequence).
- Section label: "What we do" in Inter 500 `var(--text-lo)` tracking-wide, above left-aligned heading "Our Services"

#### 4. Programs
- Three cards side-by-side (stack on mobile): Student Training, College Training, Corporate Training
- Each card: icon, title, two-sentence description, "Know more" link
- Card design: `var(--layer)` bg, 1px `var(--edge)` border, 8px radius, 32px padding
- On hover: border becomes `var(--trace)`, an SVG corner accent (two short lines forming an L at top-left) draws in
- Section has a left-column heading ("From Campus to Corporate") and right-column cards layout on desktop
- Scroll-triggered heading reveal: y:20 to y:0, opacity 0 to 1, once, 600ms ease-out-expo

#### 5. Stats Bar
- Full-width `var(--surface)` band
- Four stats: "500+ Students Trained", "3 Training Tracks", "10+ Corporate Partners", "5 Years of Excellence"
- Numbers count up when scrolled into view (IntersectionObserver + requestAnimationFrame counter)
- Left-aligned within a 4-column grid
- Number: Space Grotesk 700 `clamp(2rem, 4vw, 3rem)` `var(--trace)`
- Label: Inter 400 `var(--text-mid)`

#### 6. Marketing Solutions
- Two-column on desktop: left is a description block, right is a vertical list
- Services listed: Digital Marketing, IVR Solutions, Call Centre Solutions
- Each list item has a `var(--trace)` left border-left accent (4px), not a bullet
- Copper-colored label badge above section heading: "Solutions"

#### 7. Contact
- Two-column: left is contact info + a short sentence, right is the form
- Form fields: Name, Email, Phone (with country code), Message (textarea)
- Submit button: primary style, full-width on mobile
- On submit: JS validation with inline error states (red border + error message below field)
- No page reload — show a success state inline (green checkmark + "We'll be in touch" message)
- WhatsApp CTA below the form: teal button with WhatsApp icon linking to `wa.me/+919810191592`

#### 8. Footer
- Dark background `var(--void)`
- Left: logo + one-line description
- Center: quick links (Services, Programs, Blog, About)
- Right: "Get in touch" with email + WhatsApp
- Bottom bar: copyright line, left-aligned
- Background: the circuit trace SVG reused at 4% opacity as a watermark

---

### Animation rules (enforced)

- Page-load sequence: hero only. No other section has a load animation.
- Scroll-triggered: section headings (`.section-heading`) and stat counters only.
- Hover: border color + translateY on cards; underline scaleX on links. That is all.
- Do NOT add: fade-slide-up on every paragraph, staggered card entrances en masse, parallax backgrounds, looping background animations.
- All transitions use `var(--ease-out-expo)` or `var(--dur-base)` from the token system.
- Wrap all JS animations in a `prefers-reduced-motion` check:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  // run animations
}
```

---

### DO NOT

- Use generic card shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.1)`)
- Use all-caps section labels
- Add a middle-dot separator (`·`) in any meta text
- Append `→` to button or link text
- Use a warm cream (#F4F1EA) or terracotta (#D97757) anywhere
- Use tinted near-black (#0B0B0B) — use `var(--void)` instead
- Add numbered markers (01/02/03) to sections
- Center-align body content blocks
- Add a hero gradient that goes light-to-dark with white text (it must go dark-to-darker)
