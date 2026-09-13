# VLSI Insights — UI Improvement Plan

Audited against the actual repo (`Amol257/vlsi-insights`), specifically `css/global.css`
(the documented "source of truth") vs. the inline `<style>` blocks duplicated in every
page's `<head>`.

---

## Part 1 — Problems Found (with proof) & Fixes

### Problem 1: Primary CTA buttons render dark navy instead of brand emerald
- **Where:** `index.html`, inline `<style>` (and same pattern on other pages)
- **Evidence:** `css/global.css` defines `.btn-primary { background: var(--trace) }` (emerald `#00A887`).
  The inline `<style>` block in `index.html` (loaded *after* `global.css`, same CSS specificity → wins
  the cascade) redefines `.btn-primary { background: #0F172A; border: 1px solid #0F172A }` — a hardcoded
  near-black that ignores the `--trace` brand token entirely.
- **Fix:** Delete the duplicate `.btn-primary` (and `:hover`/`:active`) rule from the inline block so
  `global.css` governs. Result: CTAs go back to the intended emerald brand color.

### Problem 2: ~57% of every page is duplicated CSS
- **Where:** All 22 `.html` files
- **Evidence:** 74 shared component selectors (`.btn-primary`, `.testimonial-card`, `.footer`,
  `.stats-grid`, etc.) are defined in **both** `global.css` and each page's inline `<style>`, directly
  contradicting `global.css`'s own header comment: *"Source of truth for all design tokens, resets, and
  shared components. Do NOT add page-specific rules here."*
  Measured duplication: `index.html` 1916/3352 lines inline, `programs.html` 1821/3885,
  `front-end-software.html` 1337/2139 — same pattern on 18 of 22 pages.
- **Fix:** Strip the duplicated shared-component rules out of each page's inline block. Keep only
  genuinely page-unique CSS inline (or move it to its own file). This halves page weight on most routes
  and removes the risk of future silent drift like Problem 1.

### Problem 3: Font fallback stack is inconsistent across pages
- **Where:** `about-owner.html`, `programs.html`, `front-end-software.html`, `post.html`, `blog.html`
- **Evidence:** `global.css`/`index.html` use `'Space Grotesk', sans-serif`. The five pages above use
  `'Space Grotesk', -apple-system, sans-serif` in their inline copy — a token value that has drifted from
  its source of truth.
- **Fix:** Standardize the fallback stack to one value (recommend keeping it simple: `sans-serif`) across
  every inline copy, or better, remove the duplicate declaration entirely once Problem 2 is fixed.

---

## Part 2 — UI Improvement Ideas

### A. Architecture (do first — Part 1 problems overlap here)
- Remove inline `<style>` duplication across all pages
- Restore `.btn-primary` to `var(--trace)`
- Unify font-fallback stacks

### B. Typography
- Add Space Grotesk weights 500/600 (currently only 700 is loaded) for finer heading hierarchy
- Widen size contrast between H1 (`--text-5xl`) and section headers so hierarchy feels more editorial
- Add `text-wrap: balance` to headings to prevent awkward line breaks
- Apply `--tracking-tight` consistently across all display-font headings

### C. Color & Surface
- Add a subtle gradient-mesh or radial glow (using `--trace`/`--signal`) behind the hero to tie into the
  existing animated circuit-trace elements
- Add a gradient underline or left-border accent bar on major section headings ("Our Services",
  "Practical over theoretical")
- Use `--copper` more deliberately as a genuine third accent (e.g., a featured testimonial or premium
  badge) instead of leaving it under-used

### D. Cards & Components
- Keep the "Our Services" 6-card grid as-is (uniform tiles, no featured/larger variant)
- Add a consistent `box-shadow` lift on hover across all card types (currently only border-color +
  translateY, no shadow)
- Convert the testimonials grid into a horizontal auto-scroll/drag carousel with edge fade, reusing the
  existing hero slider-arrow logic
- Give the stats row a card background + top accent line per stat once populated

### E. Motion & Scroll Animation
- Extend the existing `.section-heading-group.revealed` scroll-reveal pattern to stagger-reveal the
  icon-cards inside each grid (80–100ms delay per card)
- Add a scale/opacity entrance plus an animated connecting line to the "STEP 01–05" roadmap as it scrolls
  into view
- Add a scroll-triggered shadow/backdrop-blur to the sticky nav once scrolled past the hero
- Add a focus-visible ring (`--focus`) consistently across all CTA buttons for keyboard users

### F. Effects
- Glassmorphism treatment on the contact form (`backdrop-filter: blur()` + translucent `--layer`
  background) instead of a flat white card
- Subtle noise/grain or fine grid-pattern overlay alternating between `--substrate`/`--surface` sections,
  reinforcing the "PCB substrate" theme the tokens are named after
- Use `tabular-nums` on the stat counters so digits don't jitter width during count-up

---

## Part 3 — Modern / Aesthetic Ideas

*Note: none of these touch the "Our Services" 6-tile grid, which stays as-is per request.*

### Layout
- Bento-grid layout (mixed cell sizes) for one or two sections instead of uniform equal-sized tiles
- Split-screen hero: text/CTA on one half, animated circuit-trace/chip visual on the other
- Increase vertical spacing between sections for more breathing room

### Visual Style
- Hairline (1px) borders with a subtle inner glow (using `--trace` at low opacity) on hover instead of flat borders
- Duotone/monochrome tint on any photography once added, using the emerald/copper palette
- Thin animated conic-gradient border on one hero CTA or the flagship service card

### Navigation
- Floating/pill-shaped nav that shrinks and gains a frosted-glass backdrop on scroll
- Active-section indicator (dot or underline) that slides to match scroll position

### Micro-details
- Custom cursor (small circuit-node dot that scales on hover over buttons/cards)
- Infinite marquee/ticker strip of tech keywords (RTL, UVM, GDSII, DFT...) below the hero
- Code-comment-style section labels (e.g. `// 01 — Services`) echoing the engineering theme

### Scroll Experience
- Horizontal scroll-snap for the roadmap/steps section instead of vertical stacking
- Pin-and-reveal parallax on the hero (text fades while chip graphic scales/rotates on scroll)

---

## Checklist

### Fixes (Problems 1–3)
- [x] Remove duplicate `.btn-primary` rule from `index.html` inline `<style>`
- [x] Audit and remove all 74 duplicated shared-component selectors from every page's inline `<style>`
- [x] Confirm `global.css` values render correctly on every page after removal
- [x] Standardize font-fallback stack across `about-owner.html`, `programs.html`,
      `front-end-software.html`, `post.html`, `blog.html`

### Typography
- [x] Load Space Grotesk 500/600 weights
- [x] Increase H1/H2 size contrast
- [x] Add `text-wrap: balance` to headings
- [x] Apply `--tracking-tight` consistently

### Color & Surface
- [x] Add gradient/glow background behind hero
- [x] Add accent underline/border to major section headings
- [x] Introduce `--copper` as a deliberate third accent somewhere visible

### Cards & Components
- [x] Add hover `box-shadow` across all card types
- [x] Convert testimonials to auto-scroll/drag carousel
- [x] Style stats row with card background + accent line

### Motion & Animation
- [x] Stagger scroll-reveal for icon-cards
- [x] Animate roadmap steps with connecting line
- [x] Add scroll-triggered nav shadow/blur
- [x] Add consistent focus-visible ring on all CTAs

### Effects
- [x] Glassmorphism contact form
- [x] Grain/grid texture overlay on alternating sections
- [x] `tabular-nums` on stat counters

### Modern/Aesthetic (Part 3)
- [x] Bento-grid layout for at least one section (excluding Our Services)
- [x] Split-screen hero (text vs. animated chip visual)
- [x] Increase vertical spacing/negative space between sections
- [x] Hairline-border cards with subtle inner glow on hover
- [x] Duotone/monochrome tint on photography once added
- [x] Animated conic-gradient border on hero CTA or flagship card
- [x] Floating pill-shaped nav with frosted-glass shrink-on-scroll
- [x] Active-section indicator in nav
- [x] Custom cursor (circuit-node dot) on interactive elements
- [x] Infinite marquee/ticker strip of tech keywords below hero
- [x] Code-comment-style section labels (e.g. `// 01 — Services`)
- [x] Horizontal scroll-snap for roadmap/steps section
- [x] Pin-and-reveal parallax effect on hero
