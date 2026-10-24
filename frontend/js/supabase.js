// Supabase Client Initialization & Robust Ready Guarantee
var SUPABASE_URL = window.SUPABASE_URL || 'https://riipijrgucqigndcjwre.supabase.co';
var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaXBpanJndWNxaWduZGNqd3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTk3NjQsImV4cCI6MjEwNDUzNTc2NH0.LD3-e8JT0eS8-sDR1bXqJq4-06MV9G8he2PH-o_3K2M';

var sb = null;

function initSupabaseClient() {
  if (window.sb && window.sb.auth) {
    sb = window.sb;
    return window.sb;
  }
  var sbLib = (typeof window !== 'undefined' && window.supabase) || (typeof supabase !== 'undefined' ? supabase : null);
  if (sbLib && typeof sbLib.createClient === 'function') {
    try {
      sb = sbLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          detectSessionInUrl: true,
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true
        }
      });
      if (typeof window !== 'undefined') {
        window.sb = sb;
        window.SUPABASE_URL = SUPABASE_URL;
        window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
        try {
          window.dispatchEvent(new CustomEvent('supabase:ready', { detail: sb }));
        } catch (evErr) {}
      }
      return sb;
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
    }
  }
  return null;
}

// Immediate attempt
initSupabaseClient();

// If CDN took time to load (common on mobile networks), poll up to 5 seconds
if (!window.sb) {
  var sbPollTries = 0;
  var sbPollTimer = setInterval(function () {
    sbPollTries++;
    if (initSupabaseClient() || sbPollTries >= 100) {
      clearInterval(sbPollTimer);
    }
  }, 50);
}

// Expose safe getter globally
window.getSupabaseClient = function () {
  return window.sb || initSupabaseClient();
};

// Global Handler for Service & Consultation Enquiry Forms
window.handleFormSubmit = async function (e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  var form = (e && e.target) ? e.target : document.activeElement ? document.activeElement.closest('form') : null;
  if (!form) return false;

  var submitBtn = form.querySelector('button[type="submit"]');
  var origBtnContent = submitBtn ? submitBtn.innerHTML : '';

  // Find or create error banner
  var errorEl = form.querySelector('.form-submit-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-submit-error';
    errorEl.style.cssText = 'color:#F87171;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px 16px;margin-top:16px;font-size:0.875rem;line-height:1.4;display:none;text-align:left;';
    form.appendChild(errorEl);
  }
  errorEl.style.display = 'none';

  // Extract form inputs generically
  var inputs = form.querySelectorAll('input, select, textarea');
  var name = '';
  var email = '';
  var phone = '';
  var selects = [];
  var extraFields = [];
  var requirements = '';

  inputs.forEach(function (input) {
    var type = (input.type || '').toLowerCase();
    var val = input.value ? input.value.trim() : '';
    var fieldName = input.name || input.id || input.getAttribute('placeholder') || '';

    if (type === 'submit' || type === 'button' || type === 'hidden') return;

    if (type === 'email') {
      email = val;
    } else if (type === 'tel') {
      phone = val;
    } else if (input.tagName.toLowerCase() === 'textarea') {
      requirements = val;
    } else if (input.tagName.toLowerCase() === 'select') {
      if (val) selects.push(val);
    } else if (type === 'text') {
      if (!name && (fieldName.toLowerCase().includes('name') || !fieldName)) {
        name = val;
      } else if (val) {
        extraFields.push((fieldName ? fieldName + ': ' : '') + val);
      }
    }
  });

  if (!name || !email) {
    errorEl.textContent = 'Please provide both your name and email address.';
    errorEl.style.display = 'block';
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';
  }

  var pageTitle = document.title ? document.title.split('|')[0].trim() : 'Service Consultation';
  var focusArea = selects.join(' | ');
  var extraNotes = extraFields.length ? ' [' + extraFields.join(', ') + '] ' : ' ';
  var fullMessage = '[' + pageTitle + (focusArea ? ' - ' + focusArea : '') + ']' + extraNotes + (requirements || 'No additional details provided.');

  var isSuccess = false;

  // 1. Try Supabase Client
  try {
    var client = window.sb || (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function'
      ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
      : null);

    if (client && client.from) {
      var res = await client.from('contact_submissions').insert({
        name: name,
        email: email,
        phone: phone,
        message: fullMessage
      });
      if (!res.error) {
        isSuccess = true;
      }
    }
  } catch (sbErr) {
    console.warn('Supabase client failed, falling back to API:', sbErr);
  }

  // 2. Fallback to Express Backend /api/contact
  if (!isSuccess) {
    try {
      var apiRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          subject: '[' + pageTitle + '] Engineering Consultation Request',
          message: fullMessage
        })
      });
      if (apiRes.ok) {
        isSuccess = true;
      }
    } catch (apiErr) {
      console.warn('Backend API contact fallback unreachable:', apiErr);
    }
  }

  // 3. Fallback to local queue if completely offline/static
  if (!isSuccess) {
    try {
      var queued = JSON.parse(localStorage.getItem('vlsi_queued_inquiries') || '[]');
      queued.push({ name: name, email: email, phone: phone, message: fullMessage, pageTitle: pageTitle, date: new Date().toISOString() });
      localStorage.setItem('vlsi_queued_inquiries', JSON.stringify(queued));
      isSuccess = 'queued';
    } catch (qErr) {}
  }

  if (isSuccess === true) {
    if (typeof window.showToast === 'function') {
      window.showToast('Consultation Submitted', 'Thank you! Our engineering lab team will reach out to you shortly.', 'success');
    }
    // Success: Hide form and display success card
    form.style.display = 'none';
    var container = form.closest('section') || form.parentNode;
    var successBox = (container && container.querySelector('#formSuccessMessage')) || document.getElementById('formSuccessMessage');
    if (successBox) {
      successBox.style.display = 'block';
      try {
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {}
    }
    if (window.lucide && lucide.createIcons) {
      lucide.createIcons();
    }
    return false;
  } else if (isSuccess === 'queued') {
    if (typeof window.showToast === 'function') {
      window.showToast('Request Queued Offline', 'You appear to be offline. Your request has been safely saved locally and will send when reconnected.', 'info');
    }
    errorEl.textContent = 'You appear to be offline. Your consultation request has been stored locally and will be automatically submitted once your network connection is restored.';
    errorEl.style.color = '#38BDF8';
    errorEl.style.background = 'rgba(56, 189, 248, 0.12)';
    errorEl.style.borderColor = 'rgba(56, 189, 248, 0.3)';
    errorEl.style.display = 'block';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
    return false;
  } else {
    errorEl.textContent = 'Submission could not be completed. Please check your network connection and try again.';
    errorEl.style.display = 'block';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
    return false;
  }
};

// ==========================================================================
// TOAST NOTIFICATION UTILITY
// ==========================================================================
window.showToast = function(title, message, type, duration) {
  type = type || 'success';
  duration = duration || 4000;

  var container = document.getElementById('vlsiToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'vlsiToastContainer';
    container.className = 'vlsi-toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'vlsi-toast vlsi-toast--' + type;

  var iconSvg = type === 'success'
    ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00A887" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    : type === 'error'
    ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

  toast.innerHTML = [
    '<div class="vlsi-toast__icon">' + iconSvg + '</div>',
    '<div class="vlsi-toast__body">',
    '  <div class="vlsi-toast__title">' + title + '</div>',
    message ? '  <div class="vlsi-toast__message">' + message + '</div>' : '',
    '</div>',
    '<button type="button" class="vlsi-toast__close" aria-label="Close notification">&times;</button>',
    '<div class="vlsi-toast__progress"></div>'
  ].join('');

  container.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('show'); });

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      if (type === 'success') navigator.vibrate([30, 40, 30]);
      else if (type === 'error') navigator.vibrate([60, 50, 60]);
    } catch(e) {}
  }

  function dismiss() {
    toast.classList.remove('show');
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 350);
  }

  toast.querySelector('.vlsi-toast__close').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
};

// ==========================================================================
// CLIENT-SIDE PERFORMANCE CACHE & MEMOIZATION (Checklists 3 & 6)
// ==========================================================================
window.vlsiCache = (function() {
  var memoryStore = new Map();

  return {
    get: function(key) {
      var item = memoryStore.get(key);
      if (item) {
        if (Date.now() < item.exp) {
          return item.data;
        }
        memoryStore.delete(key);
      }

      try {
        var raw = sessionStorage.getItem('vlsi_cache_' + key);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Date.now() < parsed.exp) {
            memoryStore.set(key, parsed);
            return parsed.data;
          }
          sessionStorage.removeItem('vlsi_cache_' + key);
        }
      } catch (e) {}

      return null;
    },

    set: function(key, data, ttlMs) {
      ttlMs = ttlMs || 300000; // Default: 5 minutes TTL
      var entry = {
        data: data,
        exp: Date.now() + ttlMs
      };
      memoryStore.set(key, entry);
      try {
        sessionStorage.setItem('vlsi_cache_' + key, JSON.stringify(entry));
      } catch (e) {}
    },

    has: function(key) {
      return this.get(key) !== null;
    },

    delete: function(key) {
      memoryStore.delete(key);
      try {
        sessionStorage.removeItem('vlsi_cache_' + key);
      } catch (e) {}
    },

    clear: function(prefix) {
      if (!prefix) {
        memoryStore.clear();
      } else {
        memoryStore.forEach(function(val, k) {
          if (k.indexOf(prefix) === 0) memoryStore.delete(k);
        });
      }
      try {
        var prefixToMatch = 'vlsi_cache_' + (prefix || '');
        var keysToRemove = [];
        for (var i = 0; i < sessionStorage.length; i++) {
          var sKey = sessionStorage.key(i);
          if (sKey && sKey.indexOf(prefixToMatch) === 0) {
            keysToRemove.push(sKey);
          }
        }
        for (var j = 0; j < keysToRemove.length; j++) {
          sessionStorage.removeItem(keysToRemove[j]);
        }
      } catch (e) {}
    }
  };
})();

// ==========================================================================
// PAGE-LOAD QUEUE FLUSH: Send any offline-queued inquiries
// ==========================================================================
window.flushQueuedInquiries = async function() {
  try {
    var queued = JSON.parse(localStorage.getItem('vlsi_queued_inquiries') || '[]');
    if (!queued.length) return;
    
    var remaining = [];
    for (var i = 0; i < queued.length; i++) {
      var item = queued[i];
      var sent = false;
      
      // Try Supabase
      try {
        var client = window.sb || (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function'
          ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
          : null);
        if (client && client.from) {
          var res = await client.from('contact_submissions').insert({
            name: item.name,
            email: item.email,
            phone: item.phone,
            message: item.message
          });
          if (!res.error) sent = true;
        }
      } catch (e) {}
      
      // Try Express backend
      if (!sent) {
        try {
          var apiRes = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: item.name, email: item.email, phone: item.phone, message: item.message })
          });
          if (apiRes.ok) sent = true;
        } catch (e) {}
      }
      
      if (!sent) remaining.push(item);
    }
    
    if (remaining.length) {
      localStorage.setItem('vlsi_queued_inquiries', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('vlsi_queued_inquiries');
    }
  } catch (e) {}
};

// Auto-flush on page load and when connection returns
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.flushQueuedInquiries);
  } else {
    window.flushQueuedInquiries();
  }
  window.addEventListener('online', window.flushQueuedInquiries);
}

