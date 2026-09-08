/**
 * VLSI Insights - Master Client Application Script
 * Provides global navigation, drawer, accordion, and cart synchronization.
 */

(function() {
  function initApp() {
    // 1. Initialize Lucide Icons safely
    if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // 2. Mobile Navigation Drawer
    let hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');

    let lastOpenTime = 0;

    function openDrawer() {
      if (!mobileDrawer) return;
      lastOpenTime = Date.now();
      mobileDrawer.classList.add('open');
      if (drawerOverlay) {
        drawerOverlay.classList.add('active');
        drawerOverlay.classList.add('open');
      }
      if (hamburgerBtn) {
        hamburgerBtn.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer(force) {
      if (!mobileDrawer) return;
      if (!force && (Date.now() - lastOpenTime < 350)) return;
      mobileDrawer.classList.remove('open');
      if (drawerOverlay) {
        drawerOverlay.classList.remove('active');
        drawerOverlay.classList.remove('open');
      }
      if (hamburgerBtn) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }

    function toggleDrawer(open) {
      if (!mobileDrawer) return;
      if (open === true) {
        openDrawer();
      } else if (open === false) {
        closeDrawer(true);
      } else {
        if (mobileDrawer.classList.contains('open')) {
          closeDrawer(false);
        } else {
          openDrawer();
        }
      }
    }

    window.openDrawer = openDrawer;
    window.closeDrawer = closeDrawer;
    window.toggleDrawer = toggleDrawer;

    let drawerStateBeforeClick = false;

    if (hamburgerBtn) {
      const cleanHamburger = hamburgerBtn.cloneNode(true);
      hamburgerBtn.parentNode.replaceChild(cleanHamburger, hamburgerBtn);
      hamburgerBtn = cleanHamburger;
      hamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      });
    }

    if (drawerOverlay) {
      drawerOverlay.onclick = function(e) {
        e.preventDefault();
        closeDrawer(true);
      };
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.onclick = function(e) {
        e.preventDefault();
        closeDrawer(true);
      };
    }

    document.querySelectorAll('.drawer-close-trigger').forEach(trigger => {
      trigger.onclick = function() {
        closeDrawer(true);
      };
    });

    // 3. Mobile Navigation Accordions
    function setupAccordion(toggleBtn, accordionEl) {
      if (!toggleBtn || !accordionEl) return;
      const cleanToggle = toggleBtn.cloneNode(true);
      toggleBtn.parentNode.replaceChild(cleanToggle, toggleBtn);
      cleanToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = accordionEl.classList.toggle('open');
        cleanToggle.setAttribute('aria-expanded', String(isOpen));
        const icon = cleanToggle.querySelector('svg, i');
        if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }

    setupAccordion(document.getElementById('mobileServicesToggle'), document.getElementById('mobileServicesAccordion'));
    setupAccordion(document.getElementById('mobileAboutToggle'), document.getElementById('mobileAboutAccordion'));

    // 4. Cart Badge Synchronization
    function updateCartBadge() {
      try {
        const items = JSON.parse(localStorage.getItem('vlsi_cart') || '[]');
        const count = items.reduce((sum, item) => sum + (item.qty || 1), 0);
        document.querySelectorAll('.cart-badge').forEach(badge => {
          badge.textContent = String(count);
          badge.setAttribute('data-count', String(count));
          badge.setAttribute('data-visible', count > 0 ? 'true' : 'false');
          if (count > 0) {
            badge.style.display = 'flex';
          } else {
            badge.style.display = 'none';
          }
        });
      } catch (e) {
        console.error('Error updating cart badge:', e);
      }
    }

    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);
    window.addEventListener('vlsi_cart_updated', updateCartBadge);

    // 5. Stat Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length > 0) {
      const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0 });

      statNumbers.forEach(el => observer.observe(el));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
