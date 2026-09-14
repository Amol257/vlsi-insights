# VLSI Insights — UI/UX Engineering & Anti-Slop Checklist (V2: Surgical & Code-Level)

> **Audited with**: `emil-design-eng` (micro-interactions, physical spring physics, active states), `impeccable` (craft audit, AI marker elimination, typographic hierarchy), and `gpt-taste` (asymmetric bento variance, wide editorial layouts, authentic technical hardware aesthetics).

---

## 1. Core Architectural Differences: V1 vs. V2

| Dimension | Checklist V1 (Conceptual) | Checklist V2 (Surgical & Code-Targeted) |
| :--- | :--- | :--- |
| **Granularity** | Broad phase guidelines & design philosophy | Exact files, CSS selectors, line numbers, and copy rewrites |
| **AI Slop Elimination** | Highlighted eyebrows & floating badges | Catches 23+ instances of banned `border-left` accent stripes, 50+ instances of uncurated `transition: all`, and ghost-card shadows |
| **Physics & Motion** | Standard 160ms curve recommendation | Tokenized easing curves (`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`), explicit `@media (hover: hover)` guards, and zero layout-shift transform targets |
| **Hardware Identity** | General "EDA/silicon canvas" recommendation | Replaces floating chip badge divs with an authentic, calibrated Die-Shot / Waveform Inspector canvas anchored directly to EDA engineering workflows |
| **Grid Rhythm** | "Break 6-card grid into bento" | Exact 8-column asymmetric Bento blueprint (1 Heroic 5-col Lead + 3 Modular 3-col Telemetry Cards) |

---

## 2. Hard Anti-Pattern Code Audit (Specific Violations Found)

### 2.1 Banned Left-Border Accent Stripes (`border-left: 4px solid var(--trace)`)
*Violates `impeccable` core anti-pattern ban: "Never add left border accent stripes to cards/callouts. It is an instant AI slop tell."*
- **[web-development.html:L210](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/web-development.html#L210)**
- **[vlsi-designs.html:L220](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/vlsi-designs.html#L220)**
- **[technical-training.html:L219](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/technical-training.html#L219)**
- **[soc-verification.html:L210](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/soc-verification.html#L210)**
- **[marketing-solutions.html:L219](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/marketing-solutions.html#L219)**
- **[embedded-systems.html:L210](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/embedded-systems.html#L210)**
- **[ai-models.html:L210](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/ai-models.html#L210)**
- **[index.html:L1681](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L1681)**
- **[css/global.css:L781](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/css/global.css#L781)**
- **Fix**: Remove side stripes entirely. Replace with a 1px continuous boundary (`border: 1px solid rgba(15, 23, 42, 0.08)`), subtle surface elevation (`background: #FFFFFF`), and deliberate typography/pill tags.

### 2.2 Indiscriminate `transition: all` Layout Thrashing
*Violates `emil-design-eng`: "NEVER use `transition: all`. Always specify the exact properties being transitioned (`transform`, `opacity`, `background-color`). Transitions on `all` cause browser reflows and stutter on interactive hover."*
- **[css/global.css:L569](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/css/global.css#L569)** (`transition: all 0.25s ease;`)
- **[css/footer.css:L126](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/css/footer.css#L126)** (`transition: all 0.2s ease !important;`)
- **[index.html:L578, L730, L762, L787, L1306, L1504](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L578)**
- **Fix**: Restrict to `transition: transform 180ms var(--ease-out), opacity 180ms var(--ease-out), background-color 150ms ease, border-color 150ms ease;`.

### 2.3 Numbered Eyebrows AI Scaffolding
*Violates `impeccable` & `gpt-taste`: "Numbered section titles (`01 — What We Do`, `02 — Learning Tracks`) are the #1 tell of generic AI landing page generators."*
- **[index.html:L2562](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2562)**: `01 — What We Do` &rarr; Rewrite to: `Specialized Semiconductor Practices`
- **[index.html:L2667](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2667)**: `02 — Learning Tracks` &rarr; Rewrite to: `Silicon Curriculum & Certifications`
- **[index.html:L2781](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2781)**: `03 — Our Approach` &rarr; Rewrite to: `Production Tape-Out Methodology`
- **[index.html:L2872](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2872)**: `04 — Verified Engineers` &rarr; Rewrite to: `Industry Alumni in Production`
- **[index.html:L2972](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2972)**: `05 — Technical Insights` &rarr; Rewrite to: `Semiconductor Briefs & Engineering Notes`
- **[index.html:L3125](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L3125)**: `06 — Direct Engineering Channel` &rarr; Rewrite to: `Consult with Our Physical Design Leads`

### 2.4 Floating AI Chip Badges & 3-Line Formulaic Heading
*Violates `impeccable` & `emil-design-eng`: Generic badge tags floating over circuit SVGs scream AI-generated novelty.*
- **[index.html:L2402-2425](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2402-L2425)**: Floating chip badges (`RTL → GDSII Flow`, `CLK: 1.2 GHz Locked`, `UVM 1.2 Verified`, `5nm FinFET Ready`).
- **[index.html:L2430-2434](file:///c:/Users/acer/Desktop/Antigravity/VLSI%20Insights/Website/index.html#L2430-L2434)**: Headline `Training Minds / Building Future / Growing Brands` (triplet cliché).
- **Fix**:
  - Replace the 3-line formula with authoritative technical positioning: `From RTL Architecture to Silicon Tape-Out`.
  - Subhead: `Empowering engineers and semiconductor enterprises with production-grade ASIC design, UVM verification, and precision physical closure.`
  - Replace floating detached badges with an integrated, interactive **Silicon Telemetry & Architecture Board** inside the right-hand canvas.

### 2.5 Ghost-Card Drop Shadows & Washed-out Borders
*Violates `impeccable` & `emil-design-eng`: "A border + soft heavy drop shadow is the classic ghost card tell."*
- Currently in `index.html` and `css/global.css`: Cards pair heavy fuzzy shadows (`box-shadow: 0 12px 24px -10px rgba(0,0,0,0.08)`) with faint borders (`rgba(0,0,0,0.06)`).
- **Fix**: Use crisp optical borders (`1px solid #E2E8F0` or `#E5E7EB`), crisp 1px highlight inner rim (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(15, 23, 42, 0.04)`), and deliberate hover elevations (`0 6px 16px -4px rgba(15, 23, 42, 0.08)`).

---

## 3. Detailed Execution Blueprint (Phase-by-Phase)

### Phase 1: CSS Foundation & Physics Tokens (`css/global.css` & `css/navbar.css`)
- [ ] **Tokenize Motion System**:
  - Define exact cubic-bezier timing curves in `:root`:
    ```css
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --dur-snappy: 160ms;
    --dur-smooth: 240ms;
    ```
- [ ] **Enforce Micro-Tactile `:active` States**:
  - Add instant physical press feedback across all interactive elements (`.btn-primary`, `.btn-secondary`, `.whatsapp-cta`, `.card`, `.nav-link`):
    ```css
    @media (hover: hover) and (pointer: fine) {
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 168, 135, 0.25);
      }
    }
    .btn-primary:active {
      transform: scale(0.97) translateY(0);
      transition: transform var(--dur-snappy) var(--ease-out);
    }
    ```
- [ ] **Transform-Origin & Directional Dropdown Physics** (`css/navbar.css`):
  - Fix dropdown animation: specify `transform-origin: top left;` or `top center;`. Dropdown scales in smoothly from `scale(0.96) translateY(-6px)` to `scale(1) translateY(0)` with `opacity` transition, eliminating linear slide-in.
- [ ] **Purge `transition: all`**:
  - Replace every wildcard `transition: all` with targeted properties (`transform, opacity, border-color, background-color, box-shadow`).
- [ ] **Strict `@media (prefers-reduced-motion: reduce)`**:
  - Disable keyframe loops (circuit pulsing, marquee ribbons, radar pings) for accessibility compliance.

### Phase 2: AI-Slop Eradication on Landing Page (`index.html`)
- [ ] **Eliminate Floating Novelty Badges**:
  - Remove `.floating-chip-element` divs orbiting the hero. Reclaim clean whitespace and technical clarity.
- [ ] **Rewrite Hero Copy & Editorial Balance**:
  - Replace `Training Minds / Building Future / Growing Brands` with an authoritative engineering statement.
  - Implement `text-wrap: balance` on `.hero-headline` and `.hero-body`.
  - Tighten display tracking: `letter-spacing: -0.025em;`.
- [ ] **Replace Numbered Section Scaffolding**:
  - Replace all `01 — What We Do` through `06 — Direct Engineering Channel` with contextual engineering headers.
- [ ] **Audit & Fix Card Accent Stripes**:
  - Replace all `border-left: 4px solid var(--trace)` instances with clean, architectural 1px bordered containers.

### Phase 3: Layout Variance & Bento Dynamics (`index.html` & `css/global.css`)
- [ ] **De-templatize "What We Do" (Services Section)**:
  - Replace the monotonous 3x2 uniform card grid with an asymmetrical **Semiconductor Bento Grid**:
    - **Card 1 (Heroic 2-span)**: *Front-End Design & ASIC Synthesis* (Featured deep-dive card with architectural diagram preview and tech stack chips: SystemVerilog, Synopsys Design Compiler, Cadence Genus).
    - **Card 2 (Single-span)**: *UVM 1.2 Verification Testbenches* (Constraint-random verification metrics, functional coverage closure).
    - **Card 3 (Single-span)**: *Physical Design & STA Closure* (Floorplanning, CTS, timing slack closure).
    - **Card 4 (Horizontal full-width or compact dual)**: *Embedded Firmware & Digital Solutions*.
- [ ] **Refactor Journey / Timeline Flow**:
  - Upgrade the rigid step boxes into a continuous **Silicon Tape-Out Pipeline** with verified checkpoint states:
    `Architecture Spec` &rarr; `RTL Design` &rarr; `UVM Verification` &rarr; `Synthesis & STA` &rarr; `Physical Layout & Tape-Out`.

### Phase 4: Contrast, Typography & Polish
- [ ] **Contrast Audit**:
  - Ensure all subheadings, body paragraphs, and meta labels pass WCAG AA (minimum 4.5:1 on light backgrounds).
  - Elevate muted text from `#64748B` to `#334155` for high-density readability.
- [ ] **Zero Cumulative Layout Shift (CLS)**:
  - Set explicit `width`, `height`, and `aspect-ratio` on all slide imagery and logo icons.

---

## 4. Summary of Options for User Choice

- **Option A (Proceed with Checklist 1 - `UI_ELEVATION_CHECKLIST.md`)**:
  Focuses on macro design philosophy, executive summaries, high-level component refinement, and standard phased execution.
- **Option B (Proceed with Checklist 2 - `UI_ELEVATION_CHECKLIST_V2.md` - RECOMMENDED)**:
  Surgical, code-level execution that fixes specific banned CSS line items (`border-left`, `transition: all`), strips exact line numbers of AI boilerplate (`01 — ...`, floating badges), injects Emil's physical spring/active tokens, and re-architects the services grid into an authentic semiconductor bento.

---
*Created per request using emil-design-eng, impeccable, and gpt-taste.*
