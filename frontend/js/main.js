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
      // Re-assert auth state on drawer open so mobile drawer footer is always 100% fresh
      const cached = getStoredUser();
      if (cached) {
        const mLink = document.getElementById('mobileSignInLink');
        const mMenu = document.getElementById('mobileUserMenu');
        if (mLink) {
          mLink.hidden = true;
          mLink.style.setProperty('display', 'none', 'important');
        }
        if (mMenu) {
          mMenu.hidden = false;
          mMenu.style.setProperty('display', 'flex', 'important');
          const mName = document.getElementById('mobileUserName');
          const mAv = document.getElementById('mobileUserAvatar');
          const name = (cached.user_metadata && cached.user_metadata.full_name) ||
                       (cached.email ? cached.email.split('@')[0] : '') ||
                       'User';
          if (mName) mName.textContent = name;
          if (mAv) mAv.textContent = (name.charAt(0) || 'U').toUpperCase();
        }
      }
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
    setupAccordion(document.getElementById('mobileTechTrainingToggle'), document.getElementById('mobileTechTrainingAccordion'));
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
    function getStoredUser() {
      // 1. Check project-specific token key first
      const primaryKey = 'sb-riipijrgucqigndcjwre-auth-token';
      try {
        const raw = localStorage.getItem(primaryKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.user) return parsed.user;
          if (parsed && parsed.currentSession && parsed.currentSession.user) return parsed.currentSession.user;
          if (parsed && parsed.session && parsed.session.user) return parsed.session.user;
        }
      } catch (e) {}

      // 2. Check project-specific user key
      try {
        const userRaw = localStorage.getItem('sb-riipijrgucqigndcjwre-auth-token-user');
        if (userRaw) {
          const parsedUser = JSON.parse(userRaw);
          if (parsedUser && (parsedUser.id || parsedUser.email)) return parsedUser;
        }
      } catch (e) {}

      // 3. Scan all keys with individual try/catch per key (skipping non-json code-verifiers)
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (
            key.endsWith('-code-verifier') ||
            key.endsWith('-flows-code-verifier') ||
            key.endsWith('-provider-token') ||
            key.endsWith('-refresh-token')
          ) {
            continue;
          }
          if (key.startsWith('sb-') || key.includes('auth-token') || key.includes('supabase')) {
            try {
              const raw = localStorage.getItem(key);
              if (raw && (raw.startsWith('{') || raw.startsWith('['))) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.user) return parsed.user;
                if (parsed && parsed.currentSession && parsed.currentSession.user) return parsed.currentSession.user;
                if (parsed && parsed.session && parsed.session.user) return parsed.session.user;
                if (parsed && parsed.id && parsed.email) return parsed;
              }
            } catch (innerErr) {}
          }
        }
      } catch (e) {}
      return null;
    }

    function applyNavAuth(session) {
      const signInLink       = document.getElementById('navSignInLink');
      const userMenu         = document.getElementById('navUserMenu');
      const userNameEl       = document.getElementById('navUserName');
      const avatarEl         = document.getElementById('navUserAvatar');
      const mobileSignInLink = document.getElementById('mobileSignInLink');
      const mobileUserMenu   = document.getElementById('mobileUserMenu');
      const mobileUserName   = document.getElementById('mobileUserName');
      const mobileAvatarEl   = document.getElementById('mobileUserAvatar');

      const user = session && (session.user || (session.email ? session : null));
      const isValidUser = !!(user && (user.id || user.email));

      if (isValidUser) {
        const name    = (user.user_metadata && user.user_metadata.full_name) ||
                        (user.email ? user.email.split('@')[0] : '') ||
                        'User';
        const initial = (name.charAt(0) || 'U').toUpperCase();

        if (signInLink) {
          signInLink.hidden = true;
          signInLink.style.setProperty('display', 'none', 'important');
        }
        if (mobileSignInLink) {
          mobileSignInLink.hidden = true;
          mobileSignInLink.style.setProperty('display', 'none', 'important');
        }

        if (userMenu) {
          userMenu.hidden = false;
          userMenu.style.setProperty('display', 'inline-flex', 'important');
        }
        if (userNameEl) { userNameEl.textContent = name; }
        if (avatarEl)   { avatarEl.textContent = initial; }

        if (mobileUserMenu) {
          mobileUserMenu.hidden = false;
          mobileUserMenu.style.setProperty('display', 'flex', 'important');
        }
        if (mobileUserName) { mobileUserName.textContent = name; }
        if (mobileAvatarEl) { mobileAvatarEl.textContent = initial; }
      } else {
        if (signInLink) {
          signInLink.hidden = false;
          signInLink.style.removeProperty('display');
        }
        if (mobileSignInLink) {
          mobileSignInLink.hidden = false;
          mobileSignInLink.style.removeProperty('display');
        }
        if (userMenu) {
          userMenu.hidden = true;
          userMenu.style.setProperty('display', 'none', 'important');
        }
        if (mobileUserMenu) {
          mobileUserMenu.hidden = true;
          mobileUserMenu.style.setProperty('display', 'none', 'important');
        }
      }

      // 6.b In-page Auth Prompt Banner & EDA Tool Button (front-end-software.html)
      const authBanner = document.getElementById('authPromptBanner');
      const edaBtn     = document.getElementById('btnEdaPlaygroundAccess');
      if (isValidUser) {
        if (authBanner) {
          authBanner.hidden = true;
          authBanner.style.setProperty('display', 'none', 'important');
        }
        if (edaBtn) {
          edaBtn.href = 'https://edaplayground.com/';
          edaBtn.target = '_blank';
          edaBtn.rel = 'noopener noreferrer';
          edaBtn.setAttribute('aria-label', 'Tap here for EDA Playground tool access');
          edaBtn.innerHTML = '<span>Tap here</span> <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>';
        }
      } else {
        if (authBanner) {
          authBanner.hidden = false;
          authBanner.style.removeProperty('display');
        }
        if (edaBtn) {
          edaBtn.href = 'login.html?redirect=front-end-software.html';
          edaBtn.removeAttribute('target');
          edaBtn.removeAttribute('rel');
          edaBtn.setAttribute('aria-label', 'Sign in to access EDA Playground tool');
          edaBtn.innerHTML = '<span>Sign in to Access</span> <i data-lucide="lock" style="width: 16px; height: 16px;"></i>';
        }
      }

      // 6.c Auto-populate user info in consultation/software forms if authenticated
      if (isValidUser) {
        const userName = (user.user_metadata && user.user_metadata.full_name) || '';
        const userEmail = user.email || '';
        const swNameInput = document.getElementById('swName');
        const swEmailInput = document.getElementById('swEmail');
        if (swNameInput && !swNameInput.value && userName) {
          swNameInput.value = userName;
        }
        if (swEmailInput && !swEmailInput.value && userEmail) {
          swEmailInput.value = userEmail;
        }
      }

      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }

    function getSbClient() {
      if (typeof window.getSupabaseClient === 'function') {
        const c = window.getSupabaseClient();
        if (c && c.auth) return c;
      }
      if (window.sb && window.sb.auth) return window.sb;
      if (typeof sb !== 'undefined' && sb && sb.auth) return sb;

      const sbLib = (typeof window !== 'undefined' && window.supabase) || (typeof supabase !== 'undefined' ? supabase : null);
      if (sbLib && typeof sbLib.createClient === 'function') {
        const url = window.SUPABASE_URL || 'https://riipijrgucqigndcjwre.supabase.co';
        const key = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaXBpanJndWNxaWduZGNqd3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTk3NjQsImV4cCI6MjEwNDUzNTc2NH0.LD3-e8JT0eS8-sDR1bXqJq4-06MV9G8he2PH-o_3K2M';
        try {
          const c = sbLib.createClient(url, key, {
            auth: {
              detectSessionInUrl: true,
              flowType: 'pkce',
              persistSession: true,
              autoRefreshToken: true
            }
          });
          window.sb = c;
          return c;
        } catch (e) {}
      }
      return null;
    }

    // Wait until window.sb is ready (CDN may load async), then wire up auth
    function initNavAuth() {
      // 1. Immediately hydrate from localStorage (zero-latency, prevents mobile flash of "Sign In")
      const cachedUser = getStoredUser();
      if (cachedUser) {
        applyNavAuth({ user: cachedUser });
      }

      // 2. Wire live auth listener
      let wired = false;
      const tryWire = () => {
        if (wired) return true;
        const client = getSbClient();
        if (client && client.auth) {
          wired = true;
          wireNavAuth(client);
          return true;
        }
        return false;
      };

      if (!tryWire()) {
        window.addEventListener('supabase:ready', (e) => {
          if (!wired) {
            wired = true;
            wireNavAuth(e.detail || getSbClient());
          }
        }, { once: true });

        let tries = 0;
        const poll = setInterval(() => {
          tries++;
          if (tryWire() || tries >= 60) {
            clearInterval(poll);
          }
        }, 50);
      }
    }

    function wireNavAuth(client) {
      if (!client || !client.auth) return;

      // Register listener FIRST so we never miss INITIAL_SESSION or SIGNED_IN
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          applyNavAuth(null);
        } else if (session && session.user) {
          applyNavAuth(session);
        } else if (event === 'INITIAL_SESSION') {
          if (session && session.user) {
            applyNavAuth(session);
          } else {
            // Safeguard: Do NOT wipe cached user if localStorage has session
            const cached = getStoredUser();
            if (cached) {
              applyNavAuth({ user: cached });
            } else {
              applyNavAuth(null);
            }
          }
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'SIGNED_IN') {
          if (session && session.user) {
            applyNavAuth(session);
          }
        }
      });

      // Explicit fallback: call getSession() in case INITIAL_SESSION already fired
      client.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          applyNavAuth(session);
        } else {
          const cached = getStoredUser();
          if (cached) {
            applyNavAuth({ user: cached });
          } else {
            applyNavAuth(null);
          }
        }
      }).catch(() => {
        const cached = getStoredUser();
        if (cached) applyNavAuth({ user: cached });
      });
    }

    initNavAuth();

    // Re-check and hydrate auth on pageshow (handles mobile Safari & Chrome BFCache restoration!)
    window.addEventListener('pageshow', () => {
      const cached = getStoredUser();
      if (cached) {
        applyNavAuth({ user: cached });
      }
    });

    // Sync auth changes across tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key && (e.key.startsWith('sb-') || e.key.includes('auth-token'))) {
        const cached = getStoredUser();
        if (cached) {
          applyNavAuth({ user: cached });
        } else {
          applyNavAuth(null);
        }
      }
    });

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
      const client = getSbClient();
      if (client && client.auth) {
        try { await client.auth.signOut(); } catch (err) {}
      }
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('-auth-token'))) {
            localStorage.removeItem(k);
          }
        }
      } catch (err) {}
      applyNavAuth(null);
      window.location.reload();
    };

    document.getElementById('signOutBtn')?.addEventListener('click', handleSignOut);
    document.getElementById('mobileSignOutBtn')?.addEventListener('click', handleSignOut);

    // Navbar scroll-triggered blur and shadow
    const navHeader = document.querySelector('header.navbar, .navbar');
    if (navHeader) {
      const handleScroll = () => {
        if (window.scrollY > 30) {
          navHeader.classList.add('is-scrolled');
        } else {
          navHeader.classList.remove('is-scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // 7. Light Theme Enforcement (Default light mode, cleans up accidental dark mode)
    try {
      localStorage.removeItem('vlsi_theme');
      localStorage.removeItem('theme');
    } catch (e) {}

    function applyTheme() {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark-mode');
      if (document.body) {
        document.body.classList.remove('dark-mode');
      }
    }

    applyTheme();

    // 8. Scroll Progress Bar & Scroll-to-Top Button (Sections 3 & 5 Checklist)
    const progressBar = document.getElementById('scrollProgressBar');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    let isTicking = false;

    if (progressBar) {
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');
    }

    const onWindowScroll = () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;

          if (progressBar && docHeight > 0) {
            const pct = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
            progressBar.style.width = pct + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(pct).toString());
          }

          if (scrollTopBtn) {
            if (scrollY > 400) {
              scrollTopBtn.classList.add('is-visible');
            } else {
              scrollTopBtn.classList.remove('is-visible');
            }
          }

          isTicking = false;
        });
        isTicking = true;
      }
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    onWindowScroll();

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 9. Cookie Consent Banner & Settings Manager
    (function initCookieConsentSystem() {
      let consentGiven = null;
      try {
        consentGiven = localStorage.getItem('vlsi_cookie_consent') || sessionStorage.getItem('vlsi_cookie_session_dismissed');
      } catch (e) {}

      let cookieBanner = document.getElementById('cookieConsentBanner');
      if (!cookieBanner) {
        cookieBanner = document.createElement('div');
        cookieBanner.id = 'cookieConsentBanner';
        cookieBanner.className = 'cookie-banner';
        cookieBanner.setAttribute('role', 'region');
        cookieBanner.setAttribute('aria-label', 'Cookie Consent');
        cookieBanner.innerHTML = `
          <div class="cookie-banner__text">
            We use cookies to keep your session secure and make the site work smoothly. You can choose to accept all cookies or just the essential ones. Review our <a href="/privacy-policy" style="color:var(--trace);text-decoration:underline;">Privacy Policy</a> and <a href="/terms" style="color:var(--trace);text-decoration:underline;">Terms &amp; Conditions</a>.
          </div>
          <div class="cookie-banner__actions">
            <button type="button" class="cookie-btn--accept" id="cookieAcceptBtn">Accept All</button>
            <button type="button" class="cookie-btn--decline" id="cookieDeclineBtn">Essential Only</button>
          </div>
        `;
        document.body.appendChild(cookieBanner);
      }

      const dismissCookie = (pref) => {
        try {
          localStorage.setItem('vlsi_cookie_consent', pref);
          sessionStorage.setItem('vlsi_cookie_session_dismissed', 'true');
        } catch (e) {}
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => {
          cookieBanner.hidden = true;
          cookieBanner.style.display = 'none';
        }, 300);
      };

      window.openCookieSettings = function() {
        if (cookieBanner) {
          cookieBanner.hidden = false;
          cookieBanner.style.display = 'flex';
          cookieBanner.style.opacity = '1';
          cookieBanner.style.transform = 'translateX(-50%) translateY(0)';
        }
      };

      const bindButtons = () => {
        document.getElementById('cookieAcceptBtn')?.addEventListener('click', () => dismissCookie('all'));
        document.getElementById('cookieDeclineBtn')?.addEventListener('click', () => dismissCookie('essential'));
      };

      bindButtons();

      if (!consentGiven) {
        cookieBanner.hidden = false;
        cookieBanner.style.display = 'flex';
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => {
          cookieBanner.style.opacity = '1';
          cookieBanner.style.transform = 'translateX(-50%) translateY(0)';
        }, 300);
      }
    })();

    // 10. Copy-to-Clipboard Utility (Section 5 Checklist)
    window.copyToClipboard = function(text) {
      if (!text) return;
      const copyPromise = (navigator.clipboard && navigator.clipboard.writeText)
        ? navigator.clipboard.writeText(text)
        : new Promise((resolve, reject) => {
            try {
              const ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              resolve();
            } catch (err) {
              reject(err);
            }
          });

      copyPromise.then(() => {
        let toast = document.querySelector('.copied-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.className = 'copied-toast';
          toast.textContent = 'Copied to clipboard!';
          document.body.appendChild(toast);
        }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }).catch(err => {
        console.error('Failed to copy text:', err);
      });
    };

    // 11. Performance Debounce Helper (Sections 3 & 6 Checklist)
    window.vlsiDebounce = function(fn, delay = 300) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
      };
    };

    // 12. Accessible FAQ Accordion Handler (Section 5 Checklist)
    document.querySelectorAll('.faq-trigger').forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        const item = this.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');
        const parentList = item.closest('.faq-list');

        if (parentList) {
          parentList.querySelectorAll('.faq-item.open').forEach(other => {
            if (other !== item) {
              other.classList.remove('open');
              other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
            }
          });
        }
        if (isOpen) {
          item.classList.remove('open');
          this.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // 13. Full Site Search Engine & Shortcut (Section 5 Checklist)
    const siteIndex = [
      { title: 'VLSI Related Services & RTL Design', cat: 'Engineering', url: '/vlsi-designs.html' },
      { title: 'SoC & UVM Testbench Verification', cat: 'Engineering', url: '/soc-verification.html' },
      { title: 'Embedded Systems & MCU Firmware', cat: 'Engineering', url: '/embedded-systems.html' },
      { title: 'Edge AI & Embedded Machine Learning', cat: 'Engineering', url: '/ai-models.html' },
      { title: 'Web Application Development & Portals', cat: 'Engineering', url: '/web-development.html' },
      { title: 'Corporate Technical Training Cohorts', cat: 'Training', url: '/technical-training.html' },
      { title: 'Semiconductor Training Programs (11 Tracks)', cat: 'Training', url: '/programs.html' },
      { title: 'EDA Software (QuestaSim, ModelSim Guides)', cat: 'Software', url: '/front-end-software.html' },
      { title: 'Technical Semiconductor Blog & Research', cat: 'Articles', url: '/technical-blogs.html' },
      { title: 'About the Company & Engineering Culture', cat: 'Company', url: '/about-company.html' },
      { title: 'About the Founder & Leadership', cat: 'Leadership', url: '/about-owner.html' },
      { title: 'Industry Testimonials & Student Placements', cat: 'Reviews', url: '/testimonials.html' },
      { title: 'Contact Engineering & Advisory Team', cat: 'Contact', url: '/index.html#contact' }
    ];

    const searchBackdrop = document.getElementById('searchModalBackdrop');
    const searchInput = document.getElementById('searchModalInput');
    const searchResults = document.getElementById('searchModalResults');
    const searchTriggers = document.querySelectorAll('.nav-search-trigger');

    function openSearch() {
      if (!searchBackdrop) return;
      searchBackdrop.classList.add('is-open');
      searchBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          renderSearchResults('');
        }
      }, 50);
    }

    function closeSearch() {
      if (!searchBackdrop) return;
      searchBackdrop.classList.remove('is-open');
      searchBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function renderSearchResults(query) {
      if (!searchResults) return;
      const q = (query || '').trim().toLowerCase();
      const filtered = q
        ? siteIndex.filter(item => item.title.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q))
        : siteIndex.slice(0, 6);

      if (filtered.length === 0) {
        searchResults.innerHTML = '<li class="search-modal__empty">No matching semiconductor tracks or services found.</li>';
        return;
      }

      // Strictly use CSS contract classes: search-result-item, search-result-item__title, search-result-item__cat
      searchResults.innerHTML = filtered.map(item => `
        <li role="option">
          <a href="${item.url}" class="search-result-item">
            <span class="search-result-item__title">${item.title}</span>
            <span class="search-result-item__cat">${item.cat}</span>
          </a>
        </li>
      `).join('');
    }

    searchTriggers.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openSearch(); }));

    if (searchBackdrop) {
      searchBackdrop.addEventListener('click', (e) => {
        if (e.target === searchBackdrop || e.target.classList.contains('search-modal__kbd') || e.target.closest('.search-modal-close-btn')) {
          closeSearch();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', window.vlsiDebounce((e) => {
        renderSearchResults(e.target.value);
      }, 200));
    }

    // Ctrl+K / Cmd+K global search trigger
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchBackdrop && searchBackdrop.classList.contains('is-open')) {
          closeSearch();
        } else {
          openSearch();
        }
      }
      if (e.key === 'Escape' && searchBackdrop && searchBackdrop.classList.contains('is-open')) {
        closeSearch();
      }
    });

    // 14. UTM Parameter Preservation & Tracking (Section 5 Checklist)
    (function preserveUtmParameters() {
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const urlParams = new URLSearchParams(window.location.search);
      let capturedUtm = {};
      let hasUtmInUrl = false;

      utmKeys.forEach(key => {
        const val = urlParams.get(key);
        if (val) {
          capturedUtm[key] = val;
          hasUtmInUrl = true;
        }
      });

      if (hasUtmInUrl) {
        try { sessionStorage.setItem('vlsi_utm_params', JSON.stringify(capturedUtm)); } catch (e) {}
      } else {
        try {
          const stored = sessionStorage.getItem('vlsi_utm_params');
          if (stored) capturedUtm = JSON.parse(stored);
        } catch (e) {}
      }

      if (Object.keys(capturedUtm).length > 0) {
        document.querySelectorAll('a[href]').forEach(link => {
          const href = link.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
          try {
            const url = new URL(href, window.location.origin);
            if (url.origin === window.location.origin) {
              Object.entries(capturedUtm).forEach(([k, v]) => {
                if (!url.searchParams.has(k)) {
                  url.searchParams.set(k, v);
                }
              });
              link.setAttribute('href', url.pathname + url.search + url.hash);
            }
          } catch (e) {}
        });

        document.querySelectorAll('form').forEach(form => {
          Object.entries(capturedUtm).forEach(([k, v]) => {
            if (!form.querySelector(`input[name="${k}"]`)) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = k;
              input.value = v;
              form.appendChild(input);
            }
          });
        });
      }
    })();

    // 15. Newsletter Subscription Handler (Section 5 Checklist: Async response await & error handling)
    const newsletterForm = document.getElementById('footerNewsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmailInput');
        const successMsg = document.getElementById('newsletterSuccessMsg');
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        let errorMsg = document.getElementById('newsletterErrorMsg');

        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.id = 'newsletterErrorMsg';
          errorMsg.style.color = '#EF4444';
          errorMsg.style.fontSize = '0.8125rem';
          errorMsg.style.marginTop = '8px';
          errorMsg.style.display = 'none';
          newsletterForm.appendChild(errorMsg);
        }

        const email = emailInput ? emailInput.value.trim() : '';
        if (!email || !email.includes('@')) {
          errorMsg.textContent = 'Please enter a valid email address.';
          errorMsg.style.display = 'block';
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Subscribing...';
        }
        errorMsg.style.display = 'none';

        try {
          // Send to backend or Supabase if available, with graceful fallback
          const client = getSbClient();
          if (client && client.from) {
            const { error } = await client.from('newsletter_subscribers').insert([{ email, created_at: new Date().toISOString() }]);
            if (error && error.code !== '23505') throw error; // Ignore duplicate key errors
          } else {
            // Simulated network latency when offline or backend unavailable
            await new Promise(r => setTimeout(r, 600));
          }

          // Persist success state
          try {
            localStorage.setItem('vlsi_newsletter_subscribed', email);
          } catch (err) {}

          if (successMsg) {
            successMsg.style.display = 'block';
          }
          newsletterForm.style.display = 'none';
        } catch (err) {
          console.error('Newsletter subscription failed:', err);
          errorMsg.textContent = 'Unable to subscribe right now. Please try again.';
          errorMsg.style.display = 'block';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();


