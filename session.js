// session.js — auto logout after 4 hours of inactivity
// Loaded on every protected page after nav.js

(function() {
  var TIMEOUT_MS  = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  var WARNING_MS  = TIMEOUT_MS - (5 * 60 * 1000); // warn 5 minutes before
  var timer       = null;
  var warnTimer   = null;
  var warnShown   = false;

  function resetTimer() {
    clearTimeout(timer);
    clearTimeout(warnTimer);
    warnShown = false;

    // Remove warning banner if showing
    var banner = document.getElementById('session-warning');
    if (banner) banner.remove();

    // Set warning timer (5 min before logout)
    warnTimer = setTimeout(function() {
      if (warnShown) return;
      warnShown = true;
      showWarning();
    }, WARNING_MS);

    // Set logout timer
    timer = setTimeout(function() {
      doLogout();
    }, TIMEOUT_MS);
  }

  function showWarning() {
    // Don't show on login page
    if (window.location.pathname.includes('login.html')) return;

    var banner = document.createElement('div');
    banner.id = 'session-warning';
    banner.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2a2318;color:white;padding:14px 20px;border-radius:12px;font-size:13px;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 24px rgba(0,0,0,0.2);display:flex;align-items:center;gap:12px;max-width:320px;';
    banner.innerHTML =
      '<div>⏱ Your session will expire in <strong>5 minutes</strong> due to inactivity.</div>' +
      '<button onclick="document.getElementById(\'session-warning\').remove();window._resetSessionTimer();" style="background:var(--green);color:white;border:none;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;white-space:nowrap;font-family:DM Sans,sans-serif;">Stay logged in</button>';
    document.body.appendChild(banner);
  }

  function doLogout() {
    // Store message to show on login page
    localStorage.setItem('session-expired', '1');
    // Sign out of Supabase
    var lib = window.supabase || window.supabasejs;
    if (lib && window.SUPABASE_URL && window.SUPABASE_KEY) {
      try {
        var db = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
        db.auth.signOut().then(function() {
          window.location.replace('login.html');
        });
      } catch(e) {
        window.location.replace('login.html');
      }
    } else {
      window.location.replace('login.html');
    }
  }

  // Expose reset function globally so the banner button can call it
  window._resetSessionTimer = resetTimer;

  // Activity events that reset the timer
  var events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach(function(e) {
    document.addEventListener(e, resetTimer, { passive: true });
  });

  // Start timer on load
  document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('login.html')) {
      resetTimer();
    }
  });

})();
