// nav.js — injects the nav, marks the active link, and handles account switcher
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

// Load user info and account switcher after DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const { SUPABASE_URL, SUPABASE_KEY } = await import('./supabase.js');
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data: { session } } = await db.auth.getSession();

    if (!session) {
      // Redirect to login if not on login page
      if (!location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
      }
      return;
    }

    const user = session.user;
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

    // Load accounts this user can view
    const { data: granted } = await db.from('accountability_links')
      .select('*, owner:owner_user_id(id, email, raw_user_meta_data)')
      .eq('partner_user_id', user.id)
      .eq('status', 'active');

    // Current view — stored in sessionStorage
    const viewingId   = sessionStorage.getItem('viewingUserId')   || user.id;
    const viewingName = sessionStorage.getItem('viewingUserName') || name;
    const isOwn = viewingId === user.id;

    let switcherHtml = '';
    if (granted?.length) {
      const options = [
        `<option value="${user.id}|${name}" ${isOwn?'selected':''}>My data</option>`,
        ...granted.map(g => {
          const n = g.owner?.raw_user_meta_data?.full_name || g.owner?.email?.split('@')[0] || 'Partner';
          const selected = viewingId === g.owner.id ? 'selected' : '';
          return `<option value="${g.owner.id}|${n}" ${selected}>${n}'s data</option>`;
        })
      ].join('');
      switcherHtml = `<select id="account-switcher" style="padding:5px 10px;font-size:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);font-family:'DM Sans',sans-serif;color:var(--text);cursor:pointer;margin-right:8px;" onchange="switchAccount(this.value)">${options}</select>`;
    }

    // Viewing banner
    const banner = !isOwn
      ? `<div style="background:var(--amber-l);border-bottom:1px solid #f0c88a;padding:6px 20px;font-size:12px;color:var(--amber);text-align:center;"><strong>👁 Viewing ${viewingName}'s data</strong> — read only &nbsp;·&nbsp; <a href="#" onclick="switchAccount('${user.id}|${name}')" style="color:var(--amber);font-weight:600;">Back to my data</a></div>`
      : '';
    if (banner) {
      const nav = document.querySelector('nav');
      nav.insertAdjacentHTML('afterend', banner);
    }

    navUser.innerHTML = `
      ${switcherHtml}
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--green);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">${initials}</div>
        <span style="font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;">${name}</span>
        <a href="settings.html" style="font-size:12px;color:var(--text2);text-decoration:none;margin-left:4px;">⚙️</a>
      </div>
    `;

    window.switchAccount = (val) => {
      const [id, n] = val.split('|');
      sessionStorage.setItem('viewingUserId',   id);
      sessionStorage.setItem('viewingUserName', n);
      window.location.reload();
    };

    // Expose viewingUserId globally so pages can use it
    window.VIEWING_USER_ID = viewingId;
    window.IS_OWN_ACCOUNT  = isOwn;

  } catch (e) {
    console.warn('Nav auth error:', e);
  }
});
