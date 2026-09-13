// Supabase Client Initialization
var SUPABASE_URL = window.SUPABASE_URL || 'https://riipijrgucqigndcjwre.supabase.co';
var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaXBpanJndWNxaWduZGNqd3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTk3NjQsImV4cCI6MjEwNDUzNTc2NH0.LD3-e8JT0eS8-sDR1bXqJq4-06MV9G8he2PH-o_3K2M';

var sb = null;
try {
  var sbLib = (typeof window !== 'undefined' && window.supabase) || (typeof supabase !== 'undefined' ? supabase : null);
  if (sbLib && typeof sbLib.createClient === 'function') {
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
    }
  } else {
    console.warn('Supabase JS client library not ready yet.');
  }
} catch (e) {
  console.error('Error initializing Supabase client:', e);
}

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
  var focusArea = '';
  var requirements = '';

  inputs.forEach(function (input) {
    var type = (input.type || '').toLowerCase();
    var val = input.value ? input.value.trim() : '';
    if (type === 'text' && !name) {
      name = val;
    } else if (type === 'email') {
      email = val;
    } else if (type === 'tel') {
      phone = val;
    } else if (input.tagName.toLowerCase() === 'select') {
      focusArea = val;
    } else if (input.tagName.toLowerCase() === 'textarea') {
      requirements = val;
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
    var fullMessage = '[' + pageTitle + (focusArea ? ' - ' + focusArea : '') + '] ' + (requirements || 'No additional details provided.');

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
    errorEl.style.display = 'block';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
    return false;
  }
};
