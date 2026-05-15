// nav.js — plain script, no ES modules
(function () {
  const pages = [
    { href: 'index.html',      label: 'Dashboard' },
    { href: 'expenses.html',   label: 'Expenses' },
    { href: 'bills.html',      label: 'Bills & Subscriptions' },
    { href: 'savings.html',    label: 'Savings Goals' },
    { href: 'checker.html',    label: 'Purchase Checker' },
    { href: 'calendar.html',   label: 'Calendar' },
    { href: 'paycheck.html',   label: 'Paycheck Simulator' },
    { href: 'debt.html',       label: 'Debt Tracker' },
    { href: 'settlement.html', label: 'Debt Settlement' },
    { href: 'networth.html',   label: 'Net Worth' },
    { href: 'trends.html',     label: 'Spending Trends' },
    { href: 'tracker.html',    label: 'YTD Tracker' },
    { href: 'journal.html',    label: 'Journal' },
    { href: 'settings.html',   label: 'Settings' },
  ];

  const current = location.pathname.split('/').pop() || 'index.html';
  const links = pages.map(p =>
    `<li><a href="${p.href}" class="${current === p.href ? 'active' : ''}">${p.label}</a></li>`
  ).join('');

  document.write(`
    <nav>
      <div class="nav-inner">
        <a class="nav-brand" href="index.html">&#127807; BudgetWise</a>
        <ul class="nav-links">${links}</ul>
        <div class="nav-user" id="nav-user"></div>
      </div>
    </nav>
  `);
})();

// Load user info after DOM ready using UMD Supabase
document.addEventListener('DOMContentLoaded', function() {
  var navUser = document.getElementById('nav-user');
  if (!navUser) return;

  var supabaseLib = window.supabase || window.supabasejs;
  if (!supabaseLib) { console.warn('Supabase not loaded in nav'); return; }

  try {
    var db = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY);

    db.auth.getSession().then(function(res) {
      var session = res.data && res.data.session;

      if (!session) {
        if (!location.pathname.includes('login.html')) {
          window.location.replace('login.html');
        }
        return;
      }

      window.__supabaseClient  = db;
      window.__supabaseSession = session;
      window.VIEWING_USER_ID   = session.user.id;
      window.IS_OWN_ACCOUNT    = true;

      var user     = session.user;
      var name     = (user.user_metadata && user.user_metadata.full_name) || user.email.split('@')[0];
      var initials = name.split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);

      navUser.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<div style="width:32px;height:32px;border-radius:50%;background:var(--green);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">' + initials + '</div>' +
          '<span style="font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;">' + name + '</span>' +
          '<a href="settings.html" style="font-size:12px;color:var(--text2);text-decoration:none;margin-left:4px;">⚙️</a>' +
          '<a href="#" onclick="navSignOut()" style="font-size:12px;color:var(--red);text-decoration:none;margin-left:4px;font-weight:500;">Sign out</a>' +
        '</div>';

      window.navSignOut = function() {
        db.auth.signOut().then(function() {
          window.location.href = 'login.html';
        });
      };
    });
  } catch(e) {
    console.error('Nav error:', e);
  }
});