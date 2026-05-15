// auth-guard.js
// Loaded in <head> of every protected page.
// Redirects to login.html immediately if no session exists.
(async function () {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const { SUPABASE_URL, SUPABASE_KEY } = await import('./supabase.js');
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      window.location.replace('login.html');
    } else {
      // Make session available globally before page scripts run
      window.__supabaseSession = session;
      window.__supabaseClient  = db;
    }
  } catch (e) {
    console.error('Auth guard error:', e);
    window.location.replace('login.html');
  }
})();
