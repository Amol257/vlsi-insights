const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseKey = env.SUPABASE.SERVICE_ROLE_KEY || env.SUPABASE.ANON_KEY;
let supabase = null;

if (env.SUPABASE.URL && supabaseKey) {
  try {
    supabase = createClient(env.SUPABASE.URL, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Supabase] Initialized server client at:', env.SUPABASE.URL);
  } catch (err) {
    console.error('[Supabase] Initialization error:', err.message);
  }
} else {
  console.warn('[Supabase] Missing credentials for server client initialization');
}

module.exports = supabase;
