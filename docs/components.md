# VLSI Insights — Component Library

Reference this when building individual sections. Each component is self-contained.

---

## CircuitTrace (SVG)

The signature visual element. Used in the hero and as a footer watermark.

```svg
<!-- Hero trace — draws in on page load -->
<svg class="circuit-trace" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M0 150 H80 L120 110 H220 L260 150 H340 L380 90 H460 L500 150 H600"
    stroke="var(--trace)"
    stroke-width="1.5"
    stroke-linecap="round"
    class="trace-path"
  />
  <!-- Node dots at key intersections -->
  <circle cx="120" cy="110" r="3" fill="var(--trace)" class="trace-node" />
  <circle cx="260" cy="150" r="3" fill="var(--trace)" class="trace-node" />
  <circle cx="380" cy="90"  r="3" fill="var(--trace)" class="trace-node" />
</svg>
```

```css
.circuit-trace {
  position: absolute;
  bottom: 10%;
  left: 0;
  width: 100%;
  opacity: 0;
  pointer-events: none;
}

.trace-path {
  stroke-dasharray: var(--path-length); /* set via JS: path.getTotalLength() */
  stroke-dashoffset: var(--path-length);
  transition: stroke-dashoffset 800ms var(--ease-out-expo),
              opacity 400ms ease;
}
```

```js
// On page load
const path = document.querySelector('.trace-path');
const len = path.getTotalLength();
path.style.setProperty('--path-length', len);
path.style.strokeDashoffset = len;

setTimeout(() => {
  path.style.strokeDashoffset = 0;
  path.closest('.circuit-trace').style.opacity = 1;
}, 0);

// After draw, fade to watermark
setTimeout(() => {
  path.closest('.circuit-trace').style.opacity = 0.05;
}, 900);
```

---

## NavBar

```html
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <a href="#" class="nav-logo" aria-label="VLSI Insights home">
    <svg><!-- circuit node icon --></svg>
    <span>VLSI Insights</span>
  </a>
  <ul class="nav-links" role="list">
    <li><a href="#services" class="nav-link">Services</a></li>
    <li><a href="#programs" class="nav-link">Programs</a></li>
    <li><a href="#blog" class="nav-link">Blog</a></li>
    <li><a href="#about" class="nav-link">About</a></li>
  </ul>
  <button class="nav-hamburger" aria-label="Open menu" aria-expanded="false">
    <i data-lucide="menu"></i>
  </button>
</nav>
```

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--space-12);
  background: rgba(13, 17, 23, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--edge);
}

.nav-link {
  position: relative;
  font-family: var(--font-body);
  font-weight: var(--weight-medium);
  color: var(--text-mid);
  text-decoration: none;
  transition: color var(--dur-base) ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 1.5px;
  background: var(--trace);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--dur-base) var(--ease-out-expo);
}

.nav-link:hover,
.nav-link[aria-current="page"] {
  color: var(--text-hi);
}

.nav-link:hover::after,
.nav-link[aria-current="page"]::after {
  transform: scaleX(1);
}
```

---

## ServiceTile

```html
<article class="service-tile" role="article">
  <div class="service-icon">
    <i data-lucide="cpu"></i>  <!-- swap icon per service -->
  </div>
  <h3 class="service-name">VLSI Designs</h3>
  <p class="service-desc">RTL layout, physical design, and full verification cycles.</p>
</article>
```

```css
.service-tile {
  padding: var(--space-8);
  background: var(--layer);
  border: 1px solid var(--edge);
  border-radius: 8px;
  transition:
    border-color var(--dur-base) ease,
    transform var(--dur-base) var(--ease-out-expo);
}

.service-tile:hover {
  border-color: var(--trace);
  transform: translateY(-2px);
}

.service-icon {
  width: 40px;
  height: 40px;
  color: var(--trace);
  margin-bottom: var(--space-5);
}

.service-name {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--text-xl);
  color: var(--text-hi);
  margin-bottom: var(--space-2);
}

.service-desc {
  font-size: var(--text-sm);
  color: var(--text-mid);
  line-height: var(--leading-base);
}
```

**Service icon map:**

| Service | Lucide icon |
|---|---|
| AI Models | `brain` |
| Embedded Systems | `microchip` |
| VLSI Designs | `cpu` |
| SOC Verification | `shield-check` |
| Digital Marketing | `trending-up` |
| Web Development | `code-2` |

---

## ProgramCard

```html
<div class="program-card">
  <div class="program-card__corner" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M0 20 L0 0 L20 0" stroke="var(--trace)" stroke-width="1.5"/>
    </svg>
  </div>
  <i data-lucide="graduation-cap" class="program-icon"></i>
  <h3 class="program-title">Student Training</h3>
  <p class="program-desc">
    Transform engineering students into industry-ready VLSI professionals
    through hands-on RTL and verification projects.
  </p>
  <a href="#" class="program-link">Know more</a>
</div>
```

```css
.program-card {
  position: relative;
  padding: var(--space-8);
  background: var(--layer);
  border: 1px solid var(--edge);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color var(--dur-base) ease;
}

.program-card__corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 28px;
  height: 28px;
  opacity: 0;
  transition: opacity var(--dur-base) ease;
}

.program-card:hover {
  border-color: var(--trace);
}

.program-card:hover .program-card__corner {
  opacity: 1;
}

.program-icon {
  color: var(--trace);
  width: 28px;
  height: 28px;
  margin-bottom: var(--space-5);
}

.program-title {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--text-xl);
  color: var(--text-hi);
  margin-bottom: var(--space-3);
}

.program-desc {
  font-size: var(--text-base);
  color: var(--text-mid);
  line-height: var(--leading-base);
  margin-bottom: var(--space-6);
}

.program-link {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--trace);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-fast) ease;
}

.program-link:hover {
  border-bottom-color: var(--trace);
}
```

---

## StatCounter

```html
<div class="stat-item">
  <span class="stat-number" data-target="500" data-suffix="+">0</span>
  <span class="stat-label">Students Trained</span>
</div>
```

```js
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out quad
    const eased = 1 - (1 - progress) ** 2;
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
```

---

## SectionHeading (scroll-triggered)

```html
<div class="section-heading-group">
  <p class="section-label">What we do</p>
  <h2 class="section-heading">Our Services</h2>
</div>
```

```css
.section-label {
  font-family: var(--font-body);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  color: var(--text-lo);
  letter-spacing: var(--tracking-wide);
  margin-bottom: var(--space-2);
}

.section-heading {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--text-3xl);
  color: var(--text-hi);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
}

/* Scroll reveal */
.section-heading-group {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity var(--dur-slow) var(--ease-out-expo),
    transform var(--dur-slow) var(--ease-out-expo);
}

.section-heading-group.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

```js
const headingObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      headingObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section-heading-group').forEach(el =>
  headingObserver.observe(el)
);
```

---

## ContactForm

```html
<form class="contact-form" id="contactForm" novalidate>
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" autocomplete="name" required />
    <span class="form-error" role="alert"></span>
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" autocomplete="email" required />
    <span class="form-error" role="alert"></span>
  </div>
  <div class="form-group">
    <label for="phone">Phone (with country code)</label>
    <input type="tel" id="phone" name="phone" autocomplete="tel" placeholder="+91 98101 91592" />
    <span class="form-error" role="alert"></span>
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4" required></textarea>
    <span class="form-error" role="alert"></span>
  </div>
  <button type="submit" class="btn-primary btn-full">Send message</button>
</form>

<!-- Success state (hidden by default) -->
<div class="form-success" id="formSuccess" hidden>
  <i data-lucide="check-circle" style="color: var(--trace)"></i>
  <p>We'll be in touch within one business day.</p>
</div>
```

```js
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  let valid = true;

  form.querySelectorAll('[required]').forEach(field => {
    const error = field.nextElementSibling;
    if (!field.value.trim()) {
      field.classList.add('error');
      error.textContent = 'This field is required.';
      valid = false;
    } else {
      field.classList.remove('error');
      error.textContent = '';
    }
  });

  if (valid) {
    form.hidden = true;
    document.getElementById('formSuccess').hidden = false;
    lucide.createIcons();
  }
});
```

---

## Button Variants

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 28px;
  background: var(--trace);
  color: var(--void);
  font-family: var(--font-body);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: filter var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 28px;
  background: transparent;
  color: var(--trace);
  font-family: var(--font-body);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  border: 1px solid var(--trace);
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition:
    background var(--dur-fast) ease,
    transform var(--dur-fast) ease;
}

.btn-secondary:hover {
  background: rgba(0, 201, 167, 0.08);
  transform: translateY(-1px);
}

.btn-full {
  width: 100%;
  justify-content: center;
}
```

---

## WhatsApp CTA

```html
<a
  href="https://wa.me/919810191592?text=Hello%2C%20I%20want%20to%20enquire%20about%20the%20Job%20Oriented%20Program."
  class="whatsapp-cta"
  target="_blank"
  rel="noopener noreferrer"
>
  <i data-lucide="message-circle"></i>
  Chat on WhatsApp
</a>
```

```css
.whatsapp-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 22px;
  background: #25D366;
  color: #fff;
  font-family: var(--font-body);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  border-radius: 4px;
  text-decoration: none;
  transition: filter var(--dur-fast) ease;
}

.whatsapp-cta:hover {
  filter: brightness(1.08);
}
```

---

## Global Reset Snippet

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--substrate);
  color: var(--text-mid);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-base);
  -webkit-font-smoothing: antialiased;
}

img, svg {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
}

button {
  font: inherit;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
