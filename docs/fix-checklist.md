# VLSI Insights — Fix Checklist

All issues found in the current build. Work through in order.
Check each box when done. Do not skip items in a section.

---

## SECTION 1 — Critical (Site broken until these are fixed)

- [ ] **Link global.css in every HTML page**
  Add inside `<head>` after the existing navbar.css and footer.css links:
  ```html
  <link rel="stylesheet" href="css/global.css">
  ```
  Pages: all 19 `.html` files.

- [ ] **Link main.js in every HTML page**
  Add before `</body>`:
  ```html
  <script src="js/main.js" defer></script>
  ```
  Pages: all 19 `.html` files.

- [ ] **Fix encoding bugs in blog fetch script — index.html**
  Line 2745:
  ```js
  // Wrong
  .trim().slice(0, 160) + 'â€¦'
  // Fix
  .trim().slice(0, 160) + '\u2026'
  ```
  Line 2756:
  ```js
  // Wrong
  '    <span>' + date + ' &nbsp;Â·&nbsp; ' + rt + '</span>'
  // Fix
  '    <span>' + date + ' &nbsp;&middot;&nbsp; ' + rt + '</span>'
  ```

- [ ] **Fix countdown timer resetting on every page load — programs.html**
  Line 2814:
  ```js
  // Wrong — resets for every visitor
  const OFFER_DEADLINE = new Date(Date.now() + (4 * 24 + 18) * 60 * 60 * 1000 + 35 * 60 * 1000);
  // Fix — set a real fixed date, owner updates this for each sale
  const OFFER_DEADLINE = new Date('2026-12-31T23:59:59');
  ```

---

## SECTION 2 — Copy and Data Errors

- [ ] **Fix location — index.html line 2824**
  ```html
  <!-- Wrong -->
  <span>Bengaluru &amp; Delhi NCR, India</span>
  <!-- Fix -->
  <span>Ghaziabad, Delhi NCR, India</span>
  ```

- [ ] **Fix hero body copy hyphen — index.html line 2198**
  ```html
  <!-- Wrong -->
  and targeted digital solutions -
  bridging classroom theory and production silicon execution.
  <!-- Fix -->
  and targeted digital solutions. Built to bridge
  classroom theory and production silicon execution.
  ```

- [ ] **Fix logo image filename — all 19 pages**
  Current: `images/sea_green_vlsiinsights-1-e1759647480900-1536x380.png`
  Rename the actual image file to `logo.png` and update all references:
  ```html
  <img src="images/logo.png" alt="VLSI Insights" class="nav-logo-img">
  ```
  59 references across 19 pages.

- [ ] **Fix page titles — inconsistent separators across pages**
  Some pages use `-`, some use `|`, some use `&mdash;`, two have `?` (encoding failure).
  Standardise all titles to use ` | ` as separator, remove all `&mdash;` from titles.
  Pages with broken `?` separator: `cart.html`, `login.html`.
  Pages using `&mdash;`: `ai-models.html`, `embedded-systems.html`,
  `marketing-solutions.html`, `soc-verification.html`, `technical-training.html`.
  Fix format: `Page Name | VLSI Insights`

- [ ] **Fix &mdash; in page copy — front-end-software.html line 1761**
  ```html
  <!-- Wrong -->
  Register with us &mdash; Get a Free Demo
  <!-- Fix -->
  Register with us. Get a Free Demo
  ```

- [ ] **Fix &mdash; in logo alt text — about-company.html line 918, about-owner.html line 1034**
  ```html
  <!-- Wrong -->
  alt="VLSI Insights &mdash; Empowering Tomorrow's Technology Today"
  <!-- Fix -->
  alt="VLSI Insights"
  ```

- [ ] **Fix &mdash; in cart page copy — cart.html**
  ```html
  <!-- Wrong -->
  Complete your enrollment securely &mdash; powered by Razorpay payment gateway.
  <!-- Fix -->
  Complete your enrollment securely. Powered by Razorpay payment gateway.
  ```

---

## SECTION 3 — CSS Architecture

- [ ] **Rewrite css/navbar.css — remove all 320 !important declarations**
  Use scoped selectors instead. Example:
  ```css
  /* Wrong */
  .nav-link { color: var(--text-mid) !important; }
  /* Fix */
  .navbar .nav-link { color: var(--text-mid); }
  ```
  No `!important` should exist in the final file.

- [ ] **Remove all box-shadows from cards, tiles, panels, and forms — all pages**
  Replace resting shadow with nothing.
  Replace hover shadow with border-color transition only.
  ```css
  /* Wrong */
  .service-tile { box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .service-tile:hover { box-shadow: 0 10px 24px -4px rgba(0,0,0,0.08); }
  /* Fix */
  .service-tile { border: 1px solid var(--edge); }
  .service-tile:hover { border-color: var(--trace); }
  ```
  Total instances by page:
  - index.html: 28
  - programs.html: 25
  - front-end-software.html: 26
  - about-owner.html: 14
  - testimonials.html: 13
  - about-company.html: 11
  - login.html: 10
  - cart.html: 6
  - blog.html: 6
  - post.html: 5
  - all service pages: 6 each

- [ ] **Remove text-transform: uppercase from section labels — all pages**
  The `.section-label` class must never use uppercase. global.css already has a comment
  blocking this. Remove all inline and class-level uppercase overrides.
  Priority pages (most instances):
  - programs.html: 13 instances
  - front-end-software.html: 7 instances
  - about-owner.html: 6 instances
  - index.html: 4 instances
  - all others: 3-5 instances each

- [ ] **Replace hardcoded hex colors with CSS tokens — all pages**
  Mapping:
  ```
  #E2E8F0  →  var(--edge)
  #F1F5F9  →  var(--surface)
  #F8FAFC  →  var(--substrate)
  #0F172A  →  var(--void)
  #1E293B  →  var(--layer)
  #00A887  →  var(--trace)
  ```
  Total instances by page:
  - index.html: 37
  - programs.html: 34
  - front-end-software.html: 27
  - about-owner.html: 18
  - cart.html: 17
  - about-company.html: 16
  - testimonials.html: 16
  - login.html: 19
  - blog.html: 13
  - post.html: 13
  - all service pages: 13 each

- [ ] **Move inline style="" attributes to CSS classes — index.html**
  82 inline style attributes. Each one should be a named class in the page's
  `<style>` block. No `style=""` on any element except truly dynamic values
  set by JavaScript.

- [ ] **Move inline style="" attributes to CSS classes — programs.html**
  82 inline style attributes. Same rule as above.

- [ ] **Move inline style="" attributes to CSS classes — remaining pages**
  Pages with significant inline style counts:
  - vlsi-designs.html: 54
  - marketing-solutions.html: 54
  - technical-training.html: 54
  - ai-models.html: 52
  - embedded-systems.html: 52
  - soc-verification.html: 52
  - web-development.html: 52
  - testimonials.html: 49
  - front-end-software.html: 48
  - login.html: 37
  - post.html: 30
  - technical-blogs.html: 29
  - cart.html: 28

---

## SECTION 4 — Navigation

- [ ] **Add Testimonials to About dropdown — all pages**
  Current About dropdown: About the Company, About the Owner.
  Updated About dropdown: About the Company, About the Owner, Testimonials.
  Apply to both desktop dropdown panel and mobile drawer accordion.

- [ ] **Remove Testimonials as a top-level nav item — all pages**
  After moving it into the About dropdown, remove the standalone nav link.

- [ ] **Rename "Blogs" to "Blog" — all pages**
  Singular. Link stays `blog.html`.

- [ ] **Final desktop nav order — confirm on all pages**
  ```
  Home | Services (dropdown) | Programs | Front End Software | Blog | About (dropdown) | Contact
  ```

---

## SECTION 5 — Page-Specific Fixes

- [ ] **about-owner.html — hide page from nav until owner fills placeholders**
  Add to `<head>`:
  ```html
  <meta name="robots" content="noindex, nofollow">
  ```
  Remove once owner details are filled in.

- [ ] **programs.html — fix filter pill labels**
  ```
  data-filter="6-month"   label: "6 Month"   →  "Mastery"
  data-filter="internship" label: "Fee based" →  "Internship"
  ```

- [ ] **programs.html — fix program subtitle casing (ALL CAPS subtitles)**
  ```
  '4 Months - CORE VLSI VERIFICATION'
    →  '4 months, Core VLSI Verification'

  '1 Month - CORE VLSI ASSERTION TRAINING'
    →  '1 month, SVA and assertion-based verification'

  '2 Months - RASPBERRY PI TRAINING PROGRAM'
    →  '2 months, Raspberry Pi and embedded IoT'

  '3 to 6 Months - REAL-WORLD VLSI INDUSTRY INTERNSHIP'
    →  '3 to 6 months, real-world industry internship'
  ```

- [ ] **programs.html — rename Fee-Based Internship program title**
  ```
  'Fee based internship'  →  'Fee-Based Industry Internship'
  ```

- [ ] **index.html — fix footer social links (placeholder URLs)**
  ```html
  <!-- Wrong -->
  <a href="https://linkedin.com">
  <a href="https://youtube.com">
  <a href="https://github.com">
  <!-- Fix — replace with actual URLs from owner -->
  <a href="https://linkedin.com/company/[ACTUAL-SLUG]">
  <a href="https://youtube.com/@[ACTUAL-CHANNEL]">
  <a href="https://github.com/[ACTUAL-HANDLE]">
  ```

---

## SECTION 6 — Quality Checks (run after all above are done)

- [ ] Confirm global.css tokens are loading correctly — open DevTools,
  check that `--void`, `--trace`, `--substrate` resolve to the correct dark values.

- [ ] Confirm stat counters animate correctly on scroll on the live deploy.

- [ ] Confirm blog fetch loads real WordPress posts. If CORS blocks the request,
  confirm the fallback three hardcoded cards appear instead of blank cards.

- [ ] Confirm countdown timer on programs.html shows the correct fixed
  end date and does not reset on page refresh.

- [ ] Confirm no `?` characters appear in any page title in the browser tab.

- [ ] Confirm no garbled text (`â€¦`, `Â·`) appears in blog card excerpts.

- [ ] Run a search across all HTML files for remaining `!important` in navbar.css.
  Count must be zero.

- [ ] Run a search across all HTML files for remaining `box-shadow`.
  Only allowed location: focus rings and the WhatsApp floating button glow.

- [ ] Run a search across all HTML files for `text-transform: uppercase`.
  Only allowed location: navigation link items if deliberately styled that way.

- [ ] Run a search for `style="` across index.html and programs.html.
  Count should be under 10 each (only JS-driven dynamic values).
