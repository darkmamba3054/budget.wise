// nav.js — dropdown nav, plain script
(function () {
  var groups = [
    {
      label: 'Overview',
      pages: [
        { href: 'index.html',    label: 'Dashboard' },
        { href: 'calendar.html', label: 'Calendar'  },
      ]
    },
    {
      label: 'Money',
      pages: [
        { href: 'expenses.html', label: 'Expenses'            },
        { href: 'bills.html',    label: 'Bills & Subscriptions' },
        { href: 'paycheck.html', label: 'Paycheck Simulator'  },
      ]
    },
    {
      label: 'Planning',
      pages: [
        { href: 'savings.html', label: 'Savings Goals'    },
        { href: 'trends.html',  label: 'Spending Trends'  },
        { href: 'tracker.html', label: 'YTD Tracker'      },
      ]
    },
    {
      label: 'Debt',
      pages: [
        { href: 'debt.html',       label: 'Debt Tracker'    },
        { href: 'settlement.html', label: 'Debt Settlement' },
      ]
    },
    {
      label: 'Growth',
      pages: [
        { href: 'networth.html', label: 'Net Worth' },
        { href: 'journal.html',  label: 'Journal'   },
      ]
    },
    {
      label: 'Tools',
      pages: [
        { href: 'checker.html',  label: 'Purchase Checker' },
        { href: 'messages.html', label: 'Messages'         },
      ]
    },
  ];

  var current = location.pathname.split('/').pop() || 'index.html';

  function isGroupActive(group) {
    return group.pages.some(function(p) { return p.href === current; });
  }

  var groupsHtml = groups.map(function(g) {
    var active   = isGroupActive(g) ? 'active' : '';
    var dropItems = g.pages.map(function(p) {
      var cur = p.href === current ? 'current' : '';
      return '<a href="' + p.href + '" class="' + cur + '">' + p.label + '</a>';
    }).join('');
    return '<div class="nav-group">' +
      '<button class="nav-group-btn ' + active + '">' + g.label + '</button>' +
      '<div class="nav-dropdown">' + dropItems + '</div>' +
    '</div>';
  }).join('');

  document.write(
    '<nav>' +
      '<div class="nav-inner">' +
        '<a class="nav-brand" href="index.html"><img src="images/logo.png" alt="CheckMate Budget" style="height:36px;width:auto;vertical-align:middle;margin-right:8px;">CheckMate Budget</a>' +
        '<div class="nav-groups">' + groupsHtml + '</div>' +
        '<div class="nav-user-area" id="nav-user-area">' +
          '<div class="nav-user-placeholder"></div>' +
        '</div>' +
      '</div>' +
    '</nav>'
  );
})();

// Load user info after DOM ready
document.addEventListener('DOMContentLoaded', function() {
  var userArea = document.getElementById('nav-user-area');
  if (!userArea) return;

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

      userArea.innerHTML =
        '<div class="nav-user-btn">' +
          '<div class="nav-avatar">' + initials + '</div>' +
          '<span class="nav-username">' + name + '</span>' +
        '</div>' +
        '<div class="nav-user-menu">' +
          '<a href="settings.html">Settings</a>' +
          '<div class="nav-user-divider"></div>' +
          '<a href="#" class="nav-signout" onclick="navSignOut()">Sign out</a>' +
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
