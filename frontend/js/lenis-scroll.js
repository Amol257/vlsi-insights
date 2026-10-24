/**
 * ============================================================================
 * Lenis Smooth Scroll Integration
 * Darkroom Engineering (@darkroomengineering/lenis)
 * ============================================================================
 * Provides buttery-smooth momentum scrolling, anchor interception,
 * scroll-to-top binding, and modal scroll-lock coordination.
 */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.info('[Lenis] Reduced motion preferred. Native scrolling preserved.');
    return;
  }

  function setupLenis() {
    if (window.__lenisInitialized) return;
    if (typeof window.Lenis === 'undefined') return;

    try {
      var lenis = new window.Lenis({
        lerp: 0.12,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.2,
        touchMultiplier: 1.5,
        infinite: false,
        autoRaf: true
      });

      // Expose globally for page components, drawers, and consoles
      window.lenis = lenis;
      window.__lenisInitialized = true;

      // Ensure html and body receive the lenis class
      document.documentElement.classList.add('lenis', 'lenis-smooth');

      // Intercept anchor clicks (e.g. #contact, #curriculum, #pricing) for smooth scroll with header offset
      document.addEventListener('click', function (e) {
        var anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        var href = anchor.getAttribute('href');
        if (!href || href === '#' || href === '#!' || href === '#0') return;

        try {
          var targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            var nav = document.querySelector('.navbar');
            var navHeight = nav ? nav.offsetHeight : 80;
            lenis.scrollTo(targetEl, {
              offset: -navHeight - 16,
              duration: 1.2
            });
          }
        } catch (selErr) {
          // Ignore invalid selector syntax
        }
      });

      // Bind scroll-to-top button
      var scrollTopBtn = document.getElementById('scrollTopBtn');
      if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function (e) {
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.2 });
        });
      }

      // Hook into mobile navigation drawer & search modal to lock/unlock scroll
      var mobileDrawer = document.getElementById('mobileDrawer');
      if (mobileDrawer && typeof MutationObserver !== 'undefined') {
        var drawerObserver = new MutationObserver(function () {
          if (mobileDrawer.classList.contains('open')) {
            lenis.stop();
          } else {
            lenis.start();
          }
        });
        drawerObserver.observe(mobileDrawer, { attributes: true, attributeFilter: ['class'] });
      }

      var searchModal = document.getElementById('searchModalBackdrop');
      if (searchModal && typeof MutationObserver !== 'undefined') {
        var modalObserver = new MutationObserver(function () {
          var isShown = searchModal.classList.contains('active') || searchModal.getAttribute('aria-hidden') === 'false';
          if (isShown) {
            lenis.stop();
          } else {
            lenis.start();
          }
        });
        modalObserver.observe(searchModal, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
      }

      // Dispatch event to announce Lenis ready
      window.dispatchEvent(new CustomEvent('lenis:ready', { detail: lenis }));
      console.log('✓ Lenis smooth scroll initialized');
    } catch (err) {
      console.warn('[Lenis] Initialization error:', err);
    }
  }

  // If Lenis script is already loaded
  if (typeof window.Lenis !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupLenis);
    } else {
      setupLenis();
    }
  } else {
    // Dynamically load lenis.min.js if not included in the page <head>/<body>
    var script = document.createElement('script');
    script.src = (window.location.pathname.includes('/pages/')) ? '../js/lenis.min.js' : 'js/lenis.min.js';
    script.defer = true;
    script.onload = function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLenis);
      } else {
        setupLenis();
      }
    };
    document.head.appendChild(script);
  }
})();
