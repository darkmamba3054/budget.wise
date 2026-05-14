// nav.js — injects the nav and marks the active link
(function () {
  const pages = [
    { href: 'index.html',    label: 'Dashboard' },
    { href: 'expenses.html', label: 'Expenses' },
    { href: 'bills.html',    label: 'Bills & Subscriptions' },
    { href: 'savings.html',  label: 'Savings Goals' },
    { href: 'checker.html',  label: 'Purchase Checker' },
    { href: 'calendar.html',  label: 'Calendar' },
    { href: 'paycheck.html',  label: 'Paycheck Simulator' },
    { href: 'debt.html',      label: 'Debt Tracker' },
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
      </div>
    </nav>
  `);
})();
