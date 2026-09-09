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
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');

    function openDrawer() {
      if (!mobileDrawer) return;
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
          closeDrawer(true);
        } else {
          openDrawer();
        }
      }
    }

    window.openDrawer = openDrawer;
    window.closeDrawer = closeDrawer;
    window.toggleDrawer = toggleDrawer;

    if (hamburgerBtn) {
      hamburgerBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      };
    }

    if (drawerOverlay) {
      drawerOverlay.onclick = (e) => {
        e.preventDefault();
        closeDrawer(true);
      };
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.onclick = (e) => {
        e.preventDefault();
        closeDrawer(true);
      };
    }

    document.querySelectorAll('.drawer-close-trigger').forEach(trigger => {
      trigger.onclick = () => {
        closeDrawer(true);
      };
    });

    // Auto-close drawer on viewport resize to desktop (>= 1024px)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeDrawer(true);
      }
    });

    // 3. Mobile Navigation Accordions
    function setupAccordion(toggleBtn, accordionEl) {
      if (!toggleBtn || !accordionEl) return;
      // Clear any conflicting inline display styles
      accordionEl.style.removeProperty('display');
      toggleBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = accordionEl.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        accordionEl.style.removeProperty('display');
      };
    }

    setupAccordion(document.getElementById('mobileServicesToggle'), document.getElementById('mobileServicesAccordion'));
    setupAccordion(document.getElementById('mobileAboutToggle'), document.getElementById('mobileAboutAccordion'));

    // 3b. Desktop Dropdown Click Toggles & Outside-Click Handling
    const desktopServicesBtn = document.getElementById('desktopServicesBtn');
    const desktopServicesItem = document.getElementById('desktopServicesItem');
    const desktopAboutBtn = document.getElementById('desktopAboutBtn');
    const desktopAboutItem = document.getElementById('desktopAboutItem');

    function setupDesktopDropdown(btn, item, otherItem, otherBtn) {
      if (!btn || !item) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (otherItem) {
          otherItem.classList.remove('open');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    }

    setupDesktopDropdown(desktopServicesBtn, desktopServicesItem, desktopAboutItem, desktopAboutBtn);
    setupDesktopDropdown(desktopAboutBtn, desktopAboutItem, desktopServicesItem, desktopServicesBtn);

    document.addEventListener('click', (e) => {
      if (desktopServicesItem && !desktopServicesItem.contains(e.target)) {
        desktopServicesItem.classList.remove('open');
        if (desktopServicesBtn) desktopServicesBtn.setAttribute('aria-expanded', 'false');
      }
      if (desktopAboutItem && !desktopAboutItem.contains(e.target)) {
        desktopAboutItem.classList.remove('open');
        if (desktopAboutBtn) desktopAboutBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (desktopServicesItem) {
          desktopServicesItem.classList.remove('open');
          if (desktopServicesBtn) desktopServicesBtn.setAttribute('aria-expanded', 'false');
        }
        if (desktopAboutItem) {
          desktopAboutItem.classList.remove('open');
          if (desktopAboutBtn) desktopAboutBtn.setAttribute('aria-expanded', 'false');
        }
        closeDrawer(true);
      }
    });

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

    // 6. Supabase Nav Authentication State
    async function updateNavAuth() {
      const client = (typeof window !== 'undefined' && window.sb) || (typeof sb !== 'undefined' ? sb : null);
      if (!client || !client.auth) return;
      try {
        const { data: { session } } = await client.auth.getSession();
        const signInLink = document.getElementById('navSignInLink');
        const userMenu = document.getElementById('navUserMenu');
        const userNameEl = document.getElementById('navUserName');

        // Mobile counterparts
        const mobileSignInLink = document.getElementById('mobileSignInLink');
        const mobileUserMenu = document.getElementById('mobileUserMenu');
        const mobileUserName = document.getElementById('mobileUserName');

        if (session && session.user) {
          if (signInLink) {
            signInLink.hidden = true;
            signInLink.style.display = 'none';
          }
          if (mobileSignInLink) {
            mobileSignInLink.hidden = true;
            mobileSignInLink.style.display = 'none';
          }

          const name = session.user.user_metadata?.full_name
            || session.user.email.split('@')[0];
          const initial = (name && name.length > 0) ? name.charAt(0).toUpperCase() : 'U';

          if (userMenu) {
            userMenu.hidden = false;
            userMenu.style.display = 'inline-flex';
            if (userNameEl) userNameEl.textContent = name;
            const avatarEl = document.getElementById('navUserAvatar');
            if (avatarEl) avatarEl.textContent = initial;
          }
          if (mobileUserMenu) {
            mobileUserMenu.hidden = false;
            mobileUserMenu.style.display = 'flex';
            if (mobileUserName) mobileUserName.textContent = name;
            const mobileAvatarEl = document.getElementById('mobileUserAvatar');
            if (mobileAvatarEl) mobileAvatarEl.textContent = initial;
          }
        } else {
          if (signInLink) {
            signInLink.hidden = false;
            signInLink.style.display = 'inline-flex';
          }
          if (mobileSignInLink) {
            mobileSignInLink.hidden = false;
            mobileSignInLink.style.display = 'flex';
          }
          if (userMenu) {
            userMenu.hidden = true;
            userMenu.style.display = 'none';
          }
          if (mobileUserMenu) {
            mobileUserMenu.hidden = true;
            mobileUserMenu.style.display = 'none';
          }
        }

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      } catch (err) {
        console.error('Error updating nav auth:', err);
      }
    }

    updateNavAuth();

    // Hook navbar Sign In buttons to in-page auth modal if present on the page
    const handleSignInClick = (e) => {
      if (typeof window.openAuthModal === 'function') {
        e.preventDefault();
        window.openAuthModal();
      }
    };
    document.getElementById('navSignInLink')?.addEventListener('click', handleSignInClick);
    document.getElementById('mobileSignInLink')?.addEventListener('click', handleSignInClick);

    // Sign out handlers
    const handleSignOut = async (e) => {
      if (e) e.preventDefault();
      const client = (typeof window !== 'undefined' && window.sb) || (typeof sb !== 'undefined' ? sb : null);
      if (client && client.auth) {
        try { await client.auth.signOut(); } catch (err) {}
      }
      try {
        localStorage.removeItem('sb-riipijrgucqigndcjwre-auth-token');
      } catch (err) {}
      updateNavAuth();
      window.location.reload();
    };

    document.getElementById('signOutBtn')?.addEventListener('click', handleSignOut);
    document.getElementById('mobileSignOutBtn')?.addEventListener('click', handleSignOut);

    // Listen to Supabase auth state change for live nav sync
    const sbClient = (typeof window !== 'undefined' && window.sb) || (typeof sb !== 'undefined' ? sb : null);
    if (sbClient && sbClient.auth) {
      sbClient.auth.onAuthStateChange(() => {
        updateNavAuth();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
