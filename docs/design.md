# VLSI Insights — Design System

## Brief

Audience: Engineering students, working professionals, college placement teams, corporate L&D.
Primary job: Convert visitors into leads for VLSI training programs and services.
Tone: Technically precise, authoritative, approachable. Not corporate-stiff, not startup-casual.
Visual reference: The geometry and layering of integrated circuit layouts — not as decoration, but as structural logic.

---

## Color Tokens

```css
:root {
  /* Backgrounds */
  --void:       #07090F; /* near-black base */
  --substrate:  #0D1117; /* page background */
  --surface:    #121820; /* section backgrounds */
  --layer:      #161E2A; /* card / elevated surfaces */
  --edge:       #1E2A3A; /* borders, dividers */

  /* Accents */
  --trace:      #00C9A7; /* primary: teal, circuit trace */
  --signal:     #4F8EF7; /* secondary: blue, signal voltage */
  --copper:     #D4870A; /* tertiary: amber, solder joints */

  /* Text */
  --text-hi:    #E8EAED; /* headings */
  --text-mid:   #94A3B8; /* body */
  --text-lo:    #475569; /* captions, meta */

  /* Semantic */
  --focus:      #00C9A7;
  --error:      #F87171;
}
```

**Palette rationale:** Deep navy reads as the substrate of a PCB under lab lighting. Teal is the accent because it maps to the phosphor glow of oscilloscope traces — the color engineers actually associate with live signal work. Amber is used only for high-value actions (primary CTA, badge highlights) to stay sparse and retain pop.

---

## Typography

```css
/* Families */
--font-display: 'Space Grotesk', sans-serif;   /* headings, nav */
--font-body:    'Inter', sans-serif;            /* body, labels, UI */

/* Scale */
--text-xs:   0.75rem;   /* 12px — captions */
--text-sm:   0.875rem;  /* 14px — labels, meta */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — lead paragraphs */
--text-xl:   1.375rem;  /* 22px — subheadings */
--text-2xl:  1.75rem;   /* 28px — section headings */
--text-3xl:  2.25rem;   /* 36px — page-level headings */
--text-4xl:  3rem;      /* 48px — hero secondary */
--text-5xl:  4rem;      /* 64px — hero primary */

/* Weights */
--weight-normal:    400;
--weight-medium:    500;
--weight-semibold:  600;
--weight-bold:      700;

/* Line heights */
--leading-tight:  1.15;
--leading-snug:   1.35;
--leading-base:   1.6;
--leading-loose:  1.8;

/* Letter spacing */
--tracking-tight:  -0.02em;  /* large display text */
--tracking-normal:  0em;
--tracking-wide:    0.04em;  /* small labels only */
```

**Typography rules:**
- Display text (hero, section heads) uses Space Grotesk, weight 700, tracking -0.02em
- Body and UI text uses Inter weight 400/500
- Max line length: 68 characters for body, no limit for display
- No all-caps outside navigation items
- No single-word accent coloring in headlines

---

## Spacing Scale

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
--space-20:  80px;
--space-24:  96px;
--space-32: 128px;

/* Section vertical padding */
--section-y: clamp(80px, 10vw, 140px);
```

---

## Layout

**Grid:** 12-column, 24px gutters, max-width 1280px, centered with 48px side padding on desktop.

**Alignment:** Left-aligned throughout. Content is not centered on the page except for isolated stat/callout moments.

**Section structure:** Each section opens with a small-label + heading pair (left), then content follows. No decorative dividers between sections — whitespace is the separator.

**Breakpoints:**
```
mobile:  < 640px
tablet:  640px–1024px
desktop: > 1024px
```

---

## Animation Tokens

```css
/* Easing */
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* subtle overshoot */

/* Durations */
--dur-fast:   150ms;
--dur-base:   300ms;
--dur-slow:   600ms;
--dur-enter: 1000ms;
```

**Animation philosophy:**
- One orchestrated page-load sequence only: hero text reveals in staggered lines, a circuit-trace SVG path draws itself underneath (stroke-dashoffset animation), then fades to 5% opacity and persists as a background texture.
- Scroll-triggered: only section headings and stat numbers. Section headings slide from y:20 to y:0 on IntersectionObserver enter. Stat counters count up when in view.
- Hover: card border draws a teal trace path on hover (SVG overlay or outline animation). Nav links underline grows from left with `transform: scaleX()`.
- All motion respects `prefers-reduced-motion: reduce`.
- No fade-slide-up on every content block. No animated entrance on cards en masse.

---

## Component Conventions

### Cards
```
background:       var(--layer)
border:           1px solid var(--edge)
border-radius:    8px
padding:          32px
hover border:     var(--trace) via transition (not shadow)
hover transform:  translateY(-2px), duration: 300ms ease-out-expo
```

No drop shadows on cards. Border color change on hover is the interaction signal.

### Buttons
```
Primary:   bg var(--trace), text var(--void), weight 600, radius 4px, px 28px py 12px
Secondary: border 1px var(--trace), text var(--trace), bg transparent
Hover:     primary lightens 8%; secondary bg var(--trace) at 10% opacity
```

### Navigation
```
Background: var(--substrate) at 85% opacity, backdrop-filter: blur(12px)
Position:   sticky top-0, z-index 100
Height:     64px
Links:      Inter 500, var(--text-mid), hover var(--text-hi)
Underline:  var(--trace), scaleX from 0 to 1 on hover
Active:     var(--trace) color
```

### Form inputs
```
background:      var(--surface)
border:          1px solid var(--edge)
border-radius:   4px
focus border:    var(--trace)
focus shadow:    0 0 0 2px rgba(0, 201, 167, 0.15)
padding:         12px 16px
font:            Inter 400 var(--text-base)
```

---

## Icon / Visual System

- Use **Lucide Icons** (consistent stroke weight 1.5px, size 20px inline, 24px standalone)
- The decorative circuit trace is a single SVG path drawn in the hero. Reuse the same path (scaled) as a subtle bg texture in the footer.
- No stock photo collage. Hero uses a full-bleed dark image (engineers at a workstation, desaturated and overlaid with a 70% dark gradient).
- Service icons: outlined geometric shapes (not filled), teal stroke, no drop shadow.

---

## Accessibility Floor

- Minimum contrast: 4.5:1 for body text, 3:1 for large text. Teal on void passes at all sizes.
- All interactive elements have visible focus rings (2px var(--trace) offset 2px).
- Images have alt text.
- Form inputs have associated labels (not just placeholder text).
- Skip-to-content link at top of DOM.
- ARIA roles on nav, main, footer.
