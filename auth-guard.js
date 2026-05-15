// auth-guard.js
// Checks Supabase session using localStorage directly (no import needed)
// Supabase stores session in localStorage as 'sb-{ref}-auth-token'
(function() {
  if (window.location.href.includes('login.html')) return;
  
  // Check localStorage for any Supabase session key
  const hasSession = Object.keys(localStorage).some(k => k.includes('auth-token') || k.includes('sb-'));
  
  if (!hasSession) {
    window.location.replace('login.html');
  }
})();
