(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
  const state = { page: "dashboard", balanceVisible: true, selectedLoan: "Personal loan" };
  const pageNames = { dashboard: "Overview", transfer: "Transfer money", bills: "Pay bills", loans: "Loans", transactions: "Transactions", security: "Security & PIN" };

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3000);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function transactionRows(items) {
    if (!items.length) return `<tr><td colspan="4" class="empty-state">No transactions yet.</td></tr>`;
    return items.map(tx => `
      <tr>
        <td><div class="transaction-name"><span class="tx-icon">${escapeHTML(tx.icon || "↕")}</span><span>${escapeHTML(tx.name)}<span class="tx-sub">${escapeHTML(tx.detail || tx.id || "")}</span></span></div></td>
        <td>${escapeHTML(tx.date || "Recently")}</td>
        <td class="${tx.amount < 0 ? "amount-negative" : "amount-positive"}">${tx.amount < 0 ? "−" : "+"}${money(Math.abs(Number(tx.amount) || 0))}</td>
        <td><span class="status">${escapeHTML(tx.status || "Completed")}</span></td>
      </tr>`).join("");
  }

  function table(items, limit = null) {
    const shown = limit ? items.slice(0, limit) : items;
    return `<div class="table-wrap"><table><thead><tr><th>DESCRIPTION</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>${transactionRows(shown)}</tbody></table></div>`;
  }

  function heading(title, subtitle, actions = "") {
    return `<div class="page-heading"><div><div class="eyebrow">YOUR FINANCES</div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
  }

  function statCard(label, value, icon, note, extra = "") {
    return `<section class="card stat-card ${extra}"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></section>`;
  }

  function dashboard() {
    const data = window.CloudBankAPI.getState();
    const loan = data.loans[0];
    const balance = state.balanceVisible ? money(data.balance) : "₹ ••••••";
    const loanProgress = loan ? Math.min(100, Math.round((loan.paid || 0) / (loan.months || 1) * 100)) : 0;
    return `${heading(`Good evening, ${escapeHTML(data.user.name.split(" ")[0])} 👋`, "Here’s what’s happening with your money today.", `<button class="btn btn-outline" data-action="download-statement">↓ Download statement</button>`)}
      <div class="grid stats-grid">
        <section class="card stat-card balance-card"><div class="stat-top"><span>Total available balance</span><span class="stat-icon">₹</span></div><div class="balance-inline"><div class="stat-value">${balance}</div><button class="balance-toggle" data-action="toggle-balance" aria-label="Show or hide balance">${state.balanceVisible ? "◉" : "◎"}</button></div><div class="stat-note">Primary account · ${data.accountNumber || "•••• 4821"}</div></section>
        ${statCard("Money received this month", "₹65,000.00", "↙", "Salary and other credits", "")}
        ${statCard("Money spent this month", "₹18,420.00", "↗", "Across 12 transactions", "")}
      </div>
      <div class="grid content-grid">
        <div class="grid">
          <section class="card"><div class="card-header"><div><h2>Recent transactions</h2><p>Your latest account activity</p></div><button class="text-link" data-page="transactions">View all →</button></div>${table(data.transactions, 4)}</section>
          <section class="card loan-card"><div class="loan-top"><div class="loan-type"><span class="stat-icon">⌂</span><div><h2>Active loan</h2><p class="muted" style="margin:3px 0 0;font-size:11px">${loan ? escapeHTML(loan.type) : "No active loan"}</p></div></div><span class="status">${loan ? escapeHTML(loan.status) : "None"}</span></div>
          ${loan ? `<div class="loan-amount">${money(loan.principal)}</div><div class="muted" style="font-size:11px">Original loan amount</div><div class="progress"><span style="width:${loanProgress}%"></span></div><div class="progress-meta"><span>${loan.paid || 0} of ${loan.months} EMIs paid</span><strong>${loanProgress}%</strong></div>` : `<p class="muted">Explore demo loan options.</p><button class="btn btn-primary btn-sm" data-page="loans">Explore loans</button>`}</section>
        </div>
        <div class="grid">
          <section class="card quick-card"><div class="card-header"><div><h2>Quick actions</h2><p>Common tasks, one tap away</p></div></div><div class="quick-actions">
            <button class="quick-action" data-page="transfer"><span class="quick-icon">⇄</span><strong>Transfer money</strong><span>Send to a recipient</span></button>
            <button class="quick-action" data-page="bills"><span class="quick-icon">▤</span><strong>Pay bills</strong><span>Utilities and more</span></button>
            <button class="quick-action" data-page="loans"><span class="quick-icon">⌂</span><strong>Take a loan</strong><span>View loan options</span></button>
            <button class="quick-action" data-page="transactions"><span class="quick-icon">▥</span><strong>Statements</strong><span>Review activity</span></button>
          </div></section>
          <section class="card"><div class="card-header"><div><h2>Finance updates</h2><p>Sample headlines for the demo</p></div><span class="stat-icon">✦</span></div><div class="news-list">
            <article class="news-item"><div class="news-date">OCT<br>23</div><div><strong>Understanding your monthly budget</strong><p>Simple ways to keep track of everyday spending.</p></div></article>
            <article class="news-item"><div class="news-date">OCT<br>21</div><div><strong>What to know before taking a loan</strong><p>Compare rates, fees and repayment terms.</p></div></article>
            <article class="news-item"><div class="news-date">OCT<br>18</div><div><strong>Building an emergency fund</strong><p>Plan ahead for unexpected expenses.</p></div></article>
          </div></section>
        </div>
      </div>`;
  }

  function transferPage() {
    return `${heading("Transfer money", "Send money using this simulated transfer form.")}
      <section class="card panel"><div class="notice warning">Demo only: no real transfer will take place. Never enter a real banking PIN.</div>
      <h2>Recipient details</h2><p class="panel-intro">Enter the demo recipient and amount below.</p>
      <form id="transfer-form"><div class="form-grid">
        <div class="field full"><label for="recipient">Recipient name</label><input id="recipient" name="recipient" placeholder="e.g. Rahul Sharma" required maxlength="80"></div>
        <div class="field"><label for="account-ref">Recipient account reference</label><input id="account-ref" name="account_ref" placeholder="Demo account reference" required maxlength="40"></div>
        <div class="field"><label for="transfer-amount">Amount (INR)</label><input id="transfer-amount" name="amount" type="number" min="1" step="0.01" placeholder="500.00" required></div>
        <div class="field full"><label for="transfer-note">Note (optional)</label><input id="transfer-note" name="note" maxlength="120" placeholder="What is this transfer for?"></div>
      </div><div class="form-actions"><button class="btn btn-outline" type="reset">Clear</button><button class="btn btn-primary" type="submit">Review transfer →</button></div></form></section>`;
  }

  function billsPage() {
    return `${heading("Pay bills", "Manage everyday payments in the CloudBank demo.")}
      <section class="card panel"><div class="notice warning">Demo only: bill payments change only the in-browser sample balance. No biller is contacted.</div><h2>Bill details</h2><p class="panel-intro">Choose a category and enter a sample amount.</p>
      <form id="bill-form"><div class="form-grid">
        <div class="field"><label for="bill-type">Bill category</label><select id="bill-type" name="provider" required><option value="">Choose a category</option><option>Electricity</option><option>Mobile recharge</option><option>Internet</option><option>Water</option><option>Gas</option></select></div>
        <div class="field"><label for="bill-account">Consumer / reference number</label><input id="bill-account" name="reference" required maxlength="50" placeholder="Demo reference number"></div>
        <div class="field"><label for="bill-amount">Amount (INR)</label><input id="bill-amount" name="amount" type="number" min="1" step="0.01" required placeholder="1000.00"></div>
      </div><div class="form-actions"><button class="btn btn-primary" type="submit">Pay demo bill →</button></div></form></section>`;
  }

  function loansPage() {
    const data = window.CloudBankAPI.getState();
    const loanTypes = [
      { name: "Personal loan", icon: "♙", desc: "Flexible personal expenses", rate: "10.5% p.a." },
      { name: "Education loan", icon: "▤", desc: "Study and learning costs", rate: "8.5% p.a." },
      { name: "Home loan", icon: "⌂", desc: "A place to call home", rate: "8.75% p.a." }
    ];
    return `${heading("Loans", "Explore sample loan options and estimate your monthly EMI.")}
      <div class="notice warning">Demo loan applications are not sent to a lender and are not financial offers.</div>
      <div class="loan-option-grid">${loanTypes.map(item => `<button class="loan-option ${state.selectedLoan === item.name ? "selected" : ""}" data-loan-type="${item.name}"><span class="stat-icon">${item.icon}</span><strong>${item.name}</strong><p>${item.desc}</p><p><b>${item.rate}</b></p></button>`).join("")}</div>
      <div class="grid content-grid"><section class="card panel"><h2>Loan application</h2><p class="panel-intro">Adjust the amount and tenure to calculate an approximate EMI.</p>
      <form id="loan-form"><input type="hidden" name="loan_type" value="${escapeHTML(state.selectedLoan)}"><div class="form-stack">
        <div class="field"><label for="loan-amount">Loan amount (INR)</label><input id="loan-amount" name="amount" type="number" min="10000" max="10000000" step="1000" value="200000" required></div>
        <div class="field"><label for="loan-tenure">Tenure</label><select id="loan-tenure" name="tenure_months"><option value="12">12 months</option><option value="24" selected>24 months</option><option value="36">36 months</option><option value="48">48 months</option><option value="60">60 months</option></select></div>
        <div class="field"><label for="loan-purpose">Purpose</label><textarea id="loan-purpose" name="purpose" rows="3" maxlength="250" required placeholder="Briefly describe the purpose"></textarea></div>
      </div><div class="form-actions"><button class="btn btn-primary" type="submit">Submit demo application →</button></div></form></section>
      <section class="card panel"><h2>EMI estimate</h2><p class="panel-intro">Illustrative calculation only; excludes fees and other charges.</p><div class="summary-box">
      <div class="summary-line"><span>Loan amount</span><strong id="emi-principal">₹2,00,000</strong></div><div class="summary-line"><span>Interest rate</span><strong id="emi-rate">10.5% p.a.</strong></div><div class="summary-line"><span>Tenure</span><strong id="emi-months">24 months</strong></div><div class="summary-line total"><span>Monthly EMI</span><strong id="emi-monthly">₹9,277</strong></div>
      </div><h3 class="section-title">Your demo applications</h3>${data.loans.length ? data.loans.map(l => `<div class="security-row"><span class="stat-icon">⌂</span><div class="security-row-copy"><strong>${escapeHTML(l.type)}</strong><p>${money(l.principal)} · ${l.months} months</p></div><span class="status ${l.status === "Pending review" ? "pending" : ""}">${escapeHTML(l.status)}</span></div>`).join("") : `<p class="muted">No applications yet.</p>`}</section></div>`;
  }

  function transactionsPage() {
    const data = window.CloudBankAPI.getState();
    return `${heading("Transactions", "Review your recent demo account activity.", `<button class="btn btn-outline" data-action="download-statement">↓ Export CSV</button>`)}
      <section class="card"><div class="card-header"><div><h2>All transactions</h2><p>Sample data stored in this browser session</p></div><span class="status">${data.transactions.length} records</span></div>${table(data.transactions)}</section>`;
  }

  function securityPage() {
    return `${heading("Security & PIN", "Manage demo security settings.")}
      <div class="notice warning">The PIN form is simulated in demo mode. Do not enter your real banking PIN. Production PIN verification must be handled securely by the backend.</div>
      <section class="card panel"><h2>Change transaction PIN</h2><p class="panel-intro">For this demo, PIN changes are validated in the browser only and are not saved.</p>
      <form id="pin-form"><div class="form-stack">
        <div class="field"><label for="old-pin">Current demo PIN</label><input id="old-pin" name="old_pin" type="password" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" minlength="4" placeholder="4–6 digits" required></div>
        <div class="field"><label for="new-pin">New demo PIN</label><input id="new-pin" name="new_pin" type="password" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" minlength="4" placeholder="4–6 digits" required><small>Use a non-sequential sample PIN. Do not reuse your real PIN.</small></div>
        <div class="field"><label for="confirm-pin">Confirm new PIN</label><input id="confirm-pin" name="confirm_pin" type="password" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" minlength="4" placeholder="Enter PIN again" required></div>
      </div><div class="form-actions"><button class="btn btn-primary" type="submit">Validate demo PIN change</button></div></form></section>
      <section class="card panel"><h2>Account safety</h2>
        <div class="security-row"><span class="stat-icon">✓</span><div class="security-row-copy"><strong>Secure sign-in</strong><p>Real Cognito authentication will be integrated later.</p></div><span class="status pending">Demo only</span></div>
        <div class="security-row"><span class="stat-icon">⌁</span><div class="security-row-copy"><strong>Session protection</strong><p>JWT verification and token revocation belong in the backend.</p></div><span class="status pending">Not connected</span></div>
      </section>`;
  }

  function render() {
    const content = $("#page-content");
    const renderers = { dashboard, transfer: transferPage, bills: billsPage, loans: loansPage, transactions: transactionsPage, security: securityPage };
    content.innerHTML = (renderers[state.page] || dashboard)();
    $("#breadcrumb-page").textContent = pageNames[state.page] || "Overview";
    $$(".nav-link[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === state.page));
    bindPageForms();
    updateEmi();
  }

  function navigate(page) {
    if (!pageNames[page]) return;
    state.page = page;
    $("#sidebar").classList.remove("open");
    $("#mobile-overlay").classList.add("hidden");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateEmi() {
    const amountInput = $("#loan-amount");
    const tenureInput = $("#loan-tenure");
    if (!amountInput || !tenureInput) return;
    const amount = Math.max(0, Number(amountInput.value) || 0);
    const months = Number(tenureInput.value) || 1;
    const annualRate = state.selectedLoan === "Education loan" ? 8.5 : state.selectedLoan === "Home loan" ? 8.75 : 10.5;
    const monthlyRate = annualRate / 1200;
    const emi = monthlyRate === 0 ? amount / months : amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    $("#emi-principal").textContent = money(amount);
    $("#emi-rate").textContent = `${annualRate}% p.a.`;
    $("#emi-months").textContent = `${months} months`;
    $("#emi-monthly").textContent = money(emi);
  }

  function bindPageForms() {
    $("#transfer-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const amount = Number(form.get("amount"));
      if (!Number.isFinite(amount) || amount <= 0) return toast("Enter a valid amount.");
      if (!confirm(`Demo transfer: send ${money(amount)} to ${form.get("recipient")}? No real money will move.`)) return;
      try {
        await window.CloudBankAPI.request("/api/transfer", { method: "POST", body: JSON.stringify({ recipient: form.get("recipient"), account_ref: form.get("account_ref"), amount, note: form.get("note") }) });
        toast("Demo transfer completed. No real money was moved.");
        navigate("dashboard");
      } catch (error) { toast(error.message); }
    });
    $("#bill-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const amount = Number(form.get("amount"));
      if (!confirm(`Demo bill payment: ${money(amount)}? No real biller will be contacted.`)) return;
      try {
        await window.CloudBankAPI.request("/api/bills", { method: "POST", body: JSON.stringify({ provider: form.get("provider"), reference: form.get("reference"), amount }) });
        toast("Demo bill payment recorded.");
        navigate("dashboard");
      } catch (error) { toast(error.message); }
    });
    $("#loan-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await window.CloudBankAPI.request("/api/loans", { method: "POST", body: JSON.stringify({ loan_type: form.get("loan_type"), amount: Number(form.get("amount")), tenure_months: Number(form.get("tenure_months")), purpose: form.get("purpose") }) });
        toast("Demo loan application created. No lender was contacted.");
        render();
      } catch (error) { toast(error.message); }
    });
    $("#pin-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      if (form.get("old_pin") === form.get("new_pin")) return toast("Choose a PIN different from the current demo PIN.");
      try {
        await window.CloudBankAPI.request("/api/pin/change", { method: "POST", body: JSON.stringify({ old_pin: form.get("old_pin"), new_pin: form.get("new_pin"), confirm_pin: form.get("confirm_pin") }) });
        toast("Demo PIN validation passed. No PIN was saved.");
        event.currentTarget.reset();
      } catch (error) { toast(error.message); }
    });
    $("#loan-amount")?.addEventListener("input", updateEmi);
    $("#loan-tenure")?.addEventListener("change", updateEmi);
  }

  function downloadCSV() {
    const rows = [["ID", "Description", "Date", "Amount INR", "Status"], ...window.CloudBankAPI.getState().transactions.map(tx => [tx.id, tx.name, tx.date, tx.amount, tx.status])];
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "cloudbank-demo-transactions.csv"; link.click();
    URL.revokeObjectURL(url);
    toast("Demo statement exported.");
  }

  document.addEventListener("click", async event => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) { event.preventDefault(); navigate(pageButton.dataset.page); return; }
    const loanButton = event.target.closest("[data-loan-type]");
    if (loanButton) {
      state.selectedLoan = loanButton.dataset.loanType;
      render();
      return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "toggle-balance") { state.balanceVisible = !state.balanceVisible; render(); }
    if (action === "download-statement") downloadCSV();
  });

  $("#login-button").addEventListener("click", () => {
    window.CloudBankAuth.login().catch(error => toast(error.message));
  });
  $("#signup-button").addEventListener("click", () => {
    window.CloudBankAuth.signUp().catch(error => toast(error.message));
  });
  $("#signout-button").addEventListener("click", () => {
    window.CloudBankAuth.logout();
  });

  // When Cognito redirects back with an authorization code, exchange it and show the UI.
  window.CloudBankAuth.handleCallback().then(signedIn => {
    if (signedIn || window.CloudBankAuth.getAccessToken()) {
      $("#auth-view").classList.add("hidden");
      $("#app-view").classList.remove("hidden");
      render();
      toast("Cognito authentication succeeded. Banking data is still demo data.");
    }
  }).catch(error => toast(error.message));

  $("#notification-button").addEventListener("click", () => toast("No new demo notifications."));
  $("#menu-toggle").addEventListener("click", () => {
    $("#sidebar").classList.add("open");
    $("#mobile-overlay").classList.remove("hidden");
  });
  $("#mobile-overlay").addEventListener("click", () => {
    $("#sidebar").classList.remove("open");
    $("#mobile-overlay").classList.add("hidden");
  });
})();
