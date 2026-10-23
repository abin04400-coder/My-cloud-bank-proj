document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const loginScreen = $("#login-screen");
  const app = $("#app");
  const pageNames = { dashboard: "Dashboard", transfers: "Transfers", bills: "Pay bills", loans: "Loans", security: "Security" };

  $("#today").textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  $("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    // Deliberately simulated login. No credentials are sent or stored.
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
  });
  $("#logout").addEventListener("click", () => {
    app.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    $("#password").value = "";
  });

  function navigate(page) {
    if (!pageNames[page]) return;
    $$(".page").forEach((section) => section.classList.toggle("hidden", section.id !== `page-${page}`));
    $$(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
    $("#page-title").textContent = pageNames[page];
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $$("[data-page]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.page)));

  const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
  function renderTransactions(transactions) {
    $("#transactions-body").innerHTML = transactions.map((item) => `
      <tr>
        <td><span class="txn-name">${escapeHTML(item.name)}</span><span class="txn-sub">${escapeHTML(item.detail)}</span></td>
        <td>${escapeHTML(item.date)}</td>
        <td><span class="pill success">${escapeHTML(item.status)}</span></td>
        <td class="right ${item.amount < 0 ? "amount-negative" : "amount-positive"}">${item.amount < 0 ? "−" : "+"}${money(Math.abs(item.amount))}</td>
      </tr>`).join("");
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  let transactions = [];
  CloudBankAPI.getDashboard().then((data) => {
    transactions = data.transactions;
    $("#balance").textContent = money(data.balance);
    renderTransactions(transactions);
  }).catch(() => {
    $("#transactions-body").innerHTML = '<tr><td colspan="4">Unable to load demo data.</td></tr>';
  });

  $("#transfer-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = { recipient: $("#recipient").value.trim(), account: $("#account").value.trim(), amount: Number($("#amount").value), note: $("#note").value.trim() };
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) return;
    try {
      const result = await CloudBankAPI.transfer(payload);
      $("#transfer-message").textContent = `Demo only: transfer was not sent. Reference ${result.reference}.`;
      $("#transfer-form").reset();
    } catch (error) {
      $("#transfer-message").textContent = error.message || "Could not submit demo transfer.";
    }
  });

  $$("[data-bill]").forEach((button) => button.addEventListener("click", () => {
    $("#bill-message").textContent = `Demo only: ${button.dataset.bill} bill payment simulated. No payment was made.`;
  }));

  function calculateEMI() {
    const principal = Number($("#loan-amount").value);
    const annualRate = Number($("#interest").value);
    const months = Number($("#months").value);
    if (!(principal > 0) || !(annualRate >= 0) || !(months > 0)) {
      $("#emi-value").textContent = "Enter valid values";
      $("#emi-total").textContent = "";
      return;
    }
    const rate = annualRate / 1200;
    const emi = rate === 0 ? principal / months : principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    $("#emi-value").textContent = money(emi);
    $("#emi-total").textContent = `Estimated total repayment: ${money(emi * months)}`;
  }
  $("#calculate-emi").addEventListener("click", calculateEMI);
  ["loan-amount", "interest", "months"].forEach((id) => $(`#${id}`).addEventListener("change", calculateEMI));
  calculateEMI();

  $("#pin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const pin = $("#new-pin").value;
    $("#pin-message").textContent = /^\d{4,6}$/.test(pin) ? "Demo only: PIN change simulated. No PIN was saved." : "Enter 4 to 6 digits.";
    $("#pin-form").reset();
  });

  $("#export-csv").addEventListener("click", exportCSV);
  $("#view-all").addEventListener("click", () => {
    navigate("dashboard");
    $("#transactions-body").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  function exportCSV() {
    const header = ["Transaction", "Details", "Date", "Status", "Amount (INR)"];
    const rows = transactions.map((item) => [item.name, item.detail, item.date, item.status, item.amount]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cloudbank-demo-statement.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
});
