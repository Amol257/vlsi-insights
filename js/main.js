/**
 * VLSI Insights - Master Client Application Script
 * Provides global navigation, drawer, accordion, and cart synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // 2. Mobile Navigation Drawer
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  function toggleDrawer(open) {
    if (!mobileDrawer || !drawerOverlay) return;
    const isOpen = open ?? !mobileDrawer.classList.contains('open');
    mobileDrawer.classList.toggle('open', isOpen);
    drawerOverlay.classList.toggle('active', isOpen);
    drawerOverlay.classList.toggle('open', isOpen);
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleDrawer());
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => toggleDrawer(false));
  }
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
  }
  document.querySelectorAll('.drawer-close-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => toggleDrawer(false));
  });

  // 3. Mobile Navigation Accordions
  const mobileServicesToggle = document.getElementById('mobileServicesToggle');
  const mobileServicesAccordion = document.getElementById('mobileServicesAccordion');
  if (mobileServicesToggle && mobileServicesAccordion) {
    mobileServicesToggle.addEventListener('click', () => {
      const isOpen = mobileServicesAccordion.classList.toggle('open');
      mobileServicesToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const mobileAboutToggle = document.getElementById('mobileAboutToggle');
  const mobileAboutAccordion = document.getElementById('mobileAboutAccordion');
  if (mobileAboutToggle && mobileAboutAccordion) {
    mobileAboutToggle.addEventListener('click', () => {
      const isOpen = mobileAboutAccordion.classList.toggle('open');
      mobileAboutToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

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
});
