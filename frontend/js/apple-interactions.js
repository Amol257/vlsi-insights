/**
 * apple-interactions.js
 * Premium Apple-HIG interaction layer for VLSI Insights
 * 
 * Features:
 * 1. Magnetic hover effect on buttons
 * 2. Spring-physics 3D card tilt on hover
 * 3. Staggered IntersectionObserver reveal with spring timing
 * 4. Ripple click effects
 * 5. Ambient particle canvas for dark sections
 * 6. Scroll depth navigation dots
 * 7. Page transition overlay
 * 8. Animated border cards
 * 9. Progress ring animation
 * 10. Floating badge parallax micro-motion
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     UTILITY: RAF-throttled event handler
     ========================================================================== */
  function rafThrottle(fn) {
    let rafId = null;
    return function (...args) {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        fn.apply(this, args);
        rafId = null;
      });
    };
  }

  /* ==========================================================================
     1. APPLE-STYLE REVEAL ANIMATIONS (IntersectionObserver with stagger)
     ========================================================================== */
  function initAppleReveal() {
    const revealEls = document.querySelectorAll(
      '.apy-reveal, .apy-reveal-left, .apy-reveal-right, .apy-reveal-scale'
    );
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     2. MAGNETIC HOVER EFFECT (buttons are attracted to cursor)
     ========================================================================== */
  function initMagneticHover() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 768) return;

    const magneticEls = document.querySelectorAll('.magnetic-btn');
    
    magneticEls.forEach((el) => {
      const strength = parseFloat(el.dataset.magneticStrength) || 0.3;

      function handleMouseMove(e) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) * strength;
        const dy = (e.clientY - centerY) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      function handleMouseLeave() {
        el.style.transform = '';
      }

      el.addEventListener('mousemove', rafThrottle(handleMouseMove));
      el.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /* ==========================================================================
     3. SPRING 3D TILT (perspective card hover with depth layers)
     ========================================================================== */
  function initSpringTilt() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 768) return;

    const tiltCards = document.querySelectorAll('.spring-tilt-card');

    tiltCards.forEach((card) => {
      const maxTilt = parseFloat(card.dataset.maxTilt) || 6;
      const perspective = parseFloat(card.dataset.perspective) || 900;

      card.style.perspective = perspective + 'px';

      function handleMouseMove(e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateX = (y - 0.5) * -maxTilt * 2;
        const rotateY = (x - 0.5) * maxTilt * 2;

        card.style.transition = 'none';
        card.style.transform = `
          perspective(${perspective}px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale3d(1.02, 1.02, 1.02)
        `;

        // Shine effect
        const shimmer = card.querySelector('.tilt-shimmer');
        if (shimmer) {
          const angle = Math.atan2(y - 0.5, x - 0.5) * 180 / Math.PI;
          shimmer.style.background = `linear-gradient(
            ${angle + 90}deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.06) 40%,
            rgba(255,255,255,0.14) 50%,
            rgba(255,255,255,0.06) 60%,
            rgba(255,255,255,0) 100%
          )`;
        }
      }

      function handleMouseLeave() {
        card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform = '';
      }

      card.addEventListener('mousemove', rafThrottle(handleMouseMove));
      card.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /* ==========================================================================
     4. RIPPLE CLICK EFFECT (material + Apple hybrid)
     ========================================================================== */
  function initRipple() {
    document.querySelectorAll('.ripple-container').forEach((el) => {
      el.addEventListener('click', function (e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-wave';
        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
        `;

        el.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ==========================================================================
     5. AMBIENT PARTICLE CANVAS (for dark stat sections)
     ========================================================================== */
  function initAmbientParticles() {
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('ambientParticleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.6 + 0.1,
        color: Math.random() > 0.6 ? '#00A887' : (Math.random() > 0.5 ? '#2563EB' : '#FFFFFF')
      };
    }

    function initParticles() {
      particles = Array.from({ length: 60 }, createParticle);
    }

    function drawConnections() {
      const maxDist = 90;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 168, 135, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawConnections();

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animFrame = requestAnimationFrame(tick);
    }

    // Start only when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!animFrame) {
            resize();
            initParticles();
            tick();
          }
        } else {
          if (animFrame) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(canvas.closest('.particle-canvas-wrap') || canvas.parentElement);
    window.addEventListener('resize', rafThrottle(resize));
  }

  /* ==========================================================================
     6. SCROLL DEPTH NAVIGATION DOTS
     ========================================================================== */
  function initScrollDepthNav() {
    const guide = document.getElementById('scrollDepthGuide');
    if (!guide) return;

    const sections = Array.from(
      document.querySelectorAll('section[id], [data-scroll-section]')
    ).filter(s => s.id || s.dataset.scrollSection);

    if (sections.length < 2) return;

    // Build dots
    sections.forEach((sec, i) => {
      const dot = document.createElement('div');
      const title = sec.dataset.scrollTitle || sec.id || '';
      dot.setAttribute('data-title', title);
      dot.setAttribute('aria-label', title);
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.addEventListener('click', () => {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      guide.appendChild(dot);
    });

    const dots = guide.querySelectorAll('.scroll-depth-dot');

    function updateActiveDot() {
      const scrollMid = window.scrollY + window.innerHeight * 0.4;
      let activeIndex = 0;

      sections.forEach((sec, i) => {
        const top = sec.getBoundingClientRect().top + window.scrollY;
        if (scrollMid >= top) activeIndex = i;
      });

      dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));

      // Show guide only after first scroll
      if (window.scrollY > 120) {
        guide.classList.add('visible');
      } else {
        guide.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', rafThrottle(updateActiveDot), { passive: true });
    updateActiveDot();
  }

  /* ==========================================================================
     7. PROGRESS RING ANIMATION (animated on scroll-in)
     ========================================================================== */
  function initProgressRings() {
    const rings = document.querySelectorAll('.progress-ring-fill');
    if (!rings.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    rings.forEach((ring) => observer.observe(ring));
  }

  /* ==========================================================================
     8. FLOATING BADGE PARALLAX (subtle depth scroll effect)
     ========================================================================== */
  function initFloatingBadgeParallax() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 992) return;

    const badges = document.querySelectorAll('.floating-badge');
    if (!badges.length) return;

    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    window.addEventListener('scroll', rafThrottle(() => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      if (scrollY > heroHeight) return;

      const progress = scrollY / heroHeight;
      badges.forEach((badge, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const amount = progress * 30 * dir;
        badge.style.transform = `translateY(${amount}px)`;
      });
    }), { passive: true });
  }

  /* ==========================================================================
     9. SECTION HEADING COUNTER ANIMATION (number count-up with spring easing)
     ========================================================================== */
  function initCountUpAnimation() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target._counted) return;
        entry.target._counted = true;

        const target = parseFloat(entry.target.dataset.countTo);
        const suffix = entry.target.dataset.countSuffix || '';
        const decimals = entry.target.dataset.countDecimals ? parseInt(entry.target.dataset.countDecimals) : 0;
        const duration = 1600;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Spring-like easing out
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          entry.target.textContent = current.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     10. ANIMATED BENTO BAR CHARTS (animate bars on scroll reveal)
     ========================================================================== */
  function initBentoBars() {
    if (prefersReducedMotion) return;

    const bentoBarSets = document.querySelectorAll('.bento-bar-chart');
    if (!bentoBarSets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target._barAnimated) return;
        entry.target._barAnimated = true;

        const bars = entry.target.querySelectorAll('.bento-bar');
        bars.forEach((bar, i) => {
          const rawHeight = parseFloat(bar.dataset.height || (30 + Math.random() * 70));
          const scaleVal = Math.min(Math.max(rawHeight / 100, 0.05), 1.0);
          bar.style.transform = 'scaleY(0)';
          setTimeout(() => {
            bar.style.transition = `transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${i * 45}ms`;
            bar.style.transform = `scaleY(${scaleVal})`;
          }, 60);
        });

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    bentoBarSets.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     11. SPOTLIGHT MOUSE GRADIENT (card track cursor)
     ========================================================================== */
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    if (!cards.length || prefersReducedMotion) return;

    cards.forEach((card) => {
      card.addEventListener('mousemove', rafThrottle((e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }));
    });
  }

  /* ==========================================================================
     12. PAGE TRANSITION (fade-white on navigation)
     ========================================================================== */
  function initPageTransition() {
    const overlay = document.getElementById('pageTransitionOverlay');
    if (!overlay || prefersReducedMotion) return;

    // Fade in on load
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 300ms ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.pointerEvents = 'none';
      }, 320);
    });

    // Fade out before navigation
    document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto"]):not([href^="tel"])').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('javascript')) return;
        e.preventDefault();
        overlay.style.pointerEvents = 'all';
        overlay.style.opacity = '1';
        setTimeout(() => {
          window.location.href = href;
        }, 240);
      });
    });
  }

  /* ==========================================================================
     13. HERO FLOATING CHIPS ENHANCED PARALLAX (spring scroll response)
     ========================================================================== */
  function initHeroChipsParallax() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 992) return;

    const chips = document.querySelectorAll('.floating-chip-element');
    if (!chips.length) return;

    const speeds = [0.12, 0.18, 0.08, 0.15];

    window.addEventListener('scroll', rafThrottle(() => {
      const scrollY = window.scrollY;
      if (scrollY > window.innerHeight) return;

      chips.forEach((chip, i) => {
        const speed = speeds[i % speeds.length];
        const direction = i % 2 === 0 ? 1 : -1;
        chip.style.transform += ` translateY(${scrollY * speed * direction}px)`;
      });
    }), { passive: true });
  }

  /* ==========================================================================
     14. BENTO GRID STATS COUNTER (for the bento cells with data-count-to)
     ========================================================================== */
  function initBentoCounters() {
    // Already handled by initCountUpAnimation() above
    // This ensures bento-specific counters get the right format
    document.querySelectorAll('.bento-stat-number[data-count-to]').forEach((el) => {
      if (!el.dataset.countDecimals && !el.textContent.includes('.')) {
        el.dataset.countDecimals = '0';
      }
    });
  }

  /* ==========================================================================
     15. SECTION LABEL ANIMATED LINE (left border sweep on reveal)
     ========================================================================== */
  function initSectionLabelAnimations() {
    if (prefersReducedMotion) return;

    const labels = document.querySelectorAll('.apy-feature-eyebrow, .section-label, .minimal-lead-badge');
    if (!labels.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    labels.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-12px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  }

  /* ==========================================================================
     16. LIVE SIGNAL INDICATORS (auto-animate any .live-signal on page)
     ========================================================================== */
  function initLiveSignals() {
    // Just ensure the CSS animations for .live-signal__ring are running
    // This is declarative CSS  -  no JS needed, but we add dynamic "data live" badge
    document.querySelectorAll('.live-signal').forEach((el) => {
      // Randomize ring animation offset for variety
      const ring = el.querySelector('.live-signal__ring');
      if (ring) {
        ring.style.animationDelay = (Math.random() * 2) + 's';
      }
    });
  }

  /* ==========================================================================
     17. BENTO GRID REVEAL (staggered scale-up when each cell enters view)
     ========================================================================== */
  function initBentoReveal() {
    if (prefersReducedMotion) return;

    const bentoGrids = document.querySelectorAll('.apple-feature-bento');
    if (!bentoGrids.length) return;

    bentoGrids.forEach((grid) => {
      const cells = grid.querySelectorAll('.bento-cell');
      cells.forEach((cell) => {
        cell.style.opacity = '0';
        cell.style.transform = 'translateY(20px) scale(0.97)';
        cell.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cells2 = entry.target.querySelectorAll('.bento-cell');
            cells2.forEach((cell, i) => {
              setTimeout(() => {
                cell.style.opacity = '1';
                cell.style.transform = 'translateY(0) scale(1)';
              }, i * 80);
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(grid);
    });
  }

  /* ==========================================================================
     18. CURSOR SPOTLIGHT UPGRADE (enhanced gradient intensity)
     ========================================================================== */
  function initEnhancedSpotlight() {
    // Already handled by initSpotlightCards + CSS
    // Add additional glow on service-tile hover
    document.querySelectorAll('.service-tile, .service-card--equal, .bento-cell').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.style.setProperty('--spotlight-opacity', '1');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--spotlight-opacity', '0');
      });
    });
  }

  /* ==========================================================================
     19. CHIP ELEMENT HOVER GLOW (interactive floating chip tags)
     ========================================================================== */
  function initChipHoverGlow() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.floating-chip-element, .floating-badge').forEach((chip) => {
      chip.addEventListener('mouseenter', () => {
        chip.style.boxShadow = '0 12px 32px -6px rgba(0, 168, 135, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.95)';
        chip.style.transform = (chip.style.transform || '') + ' scale(1.05)';
      });
      chip.addEventListener('mouseleave', () => {
        chip.style.boxShadow = '';
        chip.style.transform = chip.style.transform.replace(/ scale\([\d.]+\)/, '');
      });
    });
  }

  /* ==========================================================================
     20. HERO HEADLINE STAGGER (each line enters with spring delay)
     ========================================================================== */
  function initHeroHeadlineSpring() {
    if (prefersReducedMotion) return;

    const heroLines = document.querySelectorAll('.headline-line');
    heroLines.forEach((line, i) => {
      line.style.animationTimingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
      line.style.animationDuration = '0.65s';
    });
  }

  /* ==========================================================================
     21. BENTO SEGMENTED FILTER (Apple-style interactive switcher)
     ========================================================================== */
  function initBentoFilter() {
    const filterBtns = document.querySelectorAll('[data-bento-filter]');
    const bentoCells = document.querySelectorAll('.apple-feature-bento .bento-cell');
    if (!filterBtns.length || !bentoCells.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.bentoFilter;
        filterBtns.forEach((b) => b.classList.toggle('active', b === btn));

        bentoCells.forEach((cell) => {
          const cats = (cell.dataset.bentoCategory || 'all').split(' ');
          if (filter === 'all' || cats.includes(filter)) {
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            cell.style.filter = 'none';
            cell.style.pointerEvents = 'auto';
          } else {
            cell.style.opacity = '0.28';
            cell.style.transform = 'scale(0.975)';
            cell.style.filter = 'grayscale(0.5)';
            cell.style.pointerEvents = 'none';
          }
        });
      });
    });
  }

  /* ==========================================================================
     22. FEATURE ROW REVEAL (Silicon Pathways staggered row reveal)
     ========================================================================== */
  function initFeatureRowReveal() {
    if (prefersReducedMotion) return;

    const rows = document.querySelectorAll('.apy-feature-row');
    if (!rows.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10) * 100;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    rows.forEach((row) => {
      row.style.opacity = '0';
      row.style.transform = 'translateY(28px)';
      observer.observe(row);
    });
  }

  /* ==========================================================================
     21. APPLE-STYLE HERO PERSONA SEGMENTED SWITCHER
     ========================================================================== */
  function initHeroPersonaSwitcher() {
    const pill = document.querySelector('.apple-segmented-pill');
    const thumb = document.getElementById('heroSegmentThumb');
    const tabs = document.querySelectorAll('.apple-segmented-tab');
    const heroBody = document.getElementById('heroBody');
    const heroCtas = document.getElementById('heroCtas');
    const heroSpecText = document.getElementById('heroSpecText');
    const heroSpecsRow = document.getElementById('heroSpecsRow');

    if (!pill || !thumb || !tabs.length || !heroBody || !heroCtas) return;

    const primaryBtn = heroCtas.querySelector('.btn-primary');
    const secondaryBtn = heroCtas.querySelector('.btn-secondary');

    const personaData = {
      graduates: {
        body: "Master front-end RTL design, UVM testbench architecture, and STA timing closure on live Synopsys and Cadence flows, engineered for first-pass silicon sign-off.",
        primaryText: "Explore 16-Week Syllabus",
        primaryHref: "/programs.html",
        secondaryText: "Consult an Advisor",
        secondaryHref: "/index.html#contact",
        specs: "EDA Tools Provided · No Prior Tape-Out Needed · 94.6% Placed"
      },
      engineers: {
        body: "Advance your semiconductor expertise across multi-corner STA sign-off, CDC/RDC synchronization, and FinFET timing ECO closure. Built for working professionals.",
        primaryText: "View Advanced Syllabus",
        primaryHref: "/programs.html",
        secondaryText: "Schedule Technical Call",
        secondaryHref: "/index.html#contact",
        specs: "Weekend Labs · Sign-Off Calibrated · 1-on-1 Mentors"
      },
      enterprise: {
        body: "Turnkey semiconductor capability building, customized RTL-to-GDSII onboarding programs, and production-mapped engineering workshops trusted by Tier-1 design houses.",
        primaryText: "Explore Corporate Tracks",
        primaryHref: "/vlsi-designs.html",
        secondaryText: "Request Team Consultation",
        secondaryHref: "/index.html#contact",
        specs: "Custom Syllabi · 10+ Tier-1 Partners · Dedicated Labs"
      }
    };

    function updateThumb(tab) {
      if (!tab) return;
      thumb.style.width = tab.offsetWidth + 'px';
      thumb.style.transform = `translateX(${tab.offsetLeft}px)`;
    }

    const activeTab = document.querySelector('.apple-segmented-tab.active') || tabs[0];
    requestAnimationFrame(() => updateThumb(activeTab));

    window.addEventListener('resize', () => {
      const current = document.querySelector('.apple-segmented-tab.active');
      if (current) updateThumb(current);
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const persona = tab.getAttribute('data-persona');
        const data = personaData[persona];
        if (!data) return;

        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        updateThumb(tab);

        heroBody.style.transition = 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
        heroBody.style.opacity = '0';
        heroBody.style.transform = 'translateY(4px)';

        if (heroSpecsRow) {
          heroSpecsRow.style.transition = 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
          heroSpecsRow.style.opacity = '0';
        }

        setTimeout(() => {
          heroBody.textContent = data.body;
          if (primaryBtn) {
            primaryBtn.textContent = data.primaryText;
            primaryBtn.setAttribute('href', data.primaryHref);
          }
          if (secondaryBtn) {
            secondaryBtn.textContent = data.secondaryText;
            secondaryBtn.setAttribute('href', data.secondaryHref);
          }
          if (heroSpecText) {
            heroSpecText.textContent = data.specs;
          }

          heroBody.style.opacity = '1';
          heroBody.style.transform = 'translateY(0)';
          if (heroSpecsRow) {
            heroSpecsRow.style.opacity = '1';
          }
        }, 180);
      });
    });
  }

  /* ==========================================================================
     22. ROADMAP INTERACTIVE STEPPER (Desktop + Mobile Compact Stepper)
     ========================================================================== */
  function initRoadmapStepper() {
    const panel = document.querySelector('.journey-panel');
    if (!panel) return;

    const steps = panel.querySelectorAll('.journey-step');
    const tabs = panel.querySelectorAll('.journey-tab-btn');
    const counter = document.getElementById('journeyStepCounter');
    const prevBtn = document.getElementById('journeyPrevBtn');
    const nextBtn = document.getElementById('journeyNextBtn');
    const laserLine = document.getElementById('journeyLaserLine');

    if (!steps.length) return;

    let currentStep = 0;

    function setStep(idx) {
      if (idx < 0 || idx >= steps.length) return;
      currentStep = idx;

      steps.forEach((s, i) => {
        s.classList.toggle('active', i === idx);
      });

      tabs.forEach((t, i) => {
        t.classList.toggle('active', i === idx);
      });

      if (counter) {
        counter.textContent = `Stage ${idx + 1} of ${steps.length}`;
      }

      if (prevBtn) {
        prevBtn.disabled = (idx === 0);
        prevBtn.style.opacity = (idx === 0) ? '0.4' : '1';
        prevBtn.style.pointerEvents = (idx === 0) ? 'none' : 'auto';
      }
      if (nextBtn) {
        nextBtn.disabled = (idx === steps.length - 1);
        nextBtn.style.opacity = (idx === steps.length - 1) ? '0.4' : '1';
        nextBtn.style.pointerEvents = (idx === steps.length - 1) ? 'none' : 'auto';
      }

      if (laserLine) {
        const scaleVal = (idx + 1) / steps.length;
        laserLine.style.transform = `scaleY(${scaleVal})`;
      }
    }

    steps.forEach((s, i) => {
      s.addEventListener('click', () => setStep(i));
    });

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => setStep(i));
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setStep(currentStep - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setStep(currentStep + 1);
      });
    }

    setStep(0);
  }

  /* ==========================================================================
     INIT  -  Run all on DOMContentLoaded
     ========================================================================== */
  function init() {
    initAppleReveal();
    initMagneticHover();
    initSpringTilt();
    initRipple();
    initAmbientParticles();
    initScrollDepthNav();
    initProgressRings();
    initFloatingBadgeParallax();
    initCountUpAnimation();
    initBentoBars();
    initSpotlightCards();
    initPageTransition();
    initBentoCounters();
    initSectionLabelAnimations();
    initLiveSignals();
    initBentoReveal();
    initEnhancedSpotlight();
    initChipHoverGlow();
    initHeroHeadlineSpring();
    initBentoFilter();
    initFeatureRowReveal();
    initHeroPersonaSwitcher();
    initRoadmapStepper();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
