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
    errorEl.style.cssText = 'color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:0.875rem;line-height:1.4;display:none;text-align:left;';
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

  try {
    var client = window.sb || (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function'
      ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
      : null);

    if (!client) {
      throw new Error('Database client not ready. Please refresh the page and try again.');
    }

    var pageTitle = document.title ? document.title.split('|')[0].trim() : 'Service Consultation';
    var focusArea = selects.join(' | ');
    var extraNotes = extraFields.length ? ' [' + extraFields.join(', ') + '] ' : ' ';
    var fullMessage = '[' + pageTitle + (focusArea ? ' - ' + focusArea : '') + ']' + extraNotes + (requirements || 'No additional details provided.');

    var res = await client
      .from('contact_submissions')
      .insert({
        name: name,
        email: email,
        phone: phone,
        message: fullMessage
      });

    if (res.error) {
      if (res.error.code === '42501') {
        throw new Error('Supabase RLS Policy: Anonymous INSERT is disabled on table "contact_submissions". Please add an INSERT policy for anon users in the Supabase dashboard.');
      }
      throw res.error;
    }

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
  } catch (err) {
    console.error('Consultation form submission error:', err);
    errorEl.textContent = err.message || 'Submission failed. Please check your connection and try again.';
    if (typeof window.showToast === 'function') {
      window.showToast('Submission Failed', err.message || 'Please check your connection and try again.', 'error');
    }
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
