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
