/*
 * CloudBank API helper.
 * DEMO_MODE uses fake in-browser data and does NOT authenticate real users.
 * Set DEMO_MODE to false when your Node.js API endpoints are ready.
 */
window.CloudBankAPI = (() => {
  const DEMO_MODE = true;

  const sampleTransactions = [
    { id: "TXN-1048", name: "Fresh Mart", detail: "Groceries", date: "Today, 10:42 AM", amount: -2450, status: "Completed", icon: "▧" },
    { id: "TXN-1047", name: "Salary credit", detail: "Income", date: "Yesterday", amount: 65000, status: "Completed", icon: "↙" },
    { id: "TXN-1046", name: "Electricity bill", detail: "Utilities", date: "18 Oct 2026", amount: -1840, status: "Completed", icon: "ϟ" },
    { id: "TXN-1045", name: "Transfer to Rahul", detail: "Bank transfer", date: "17 Oct 2026", amount: -5000, status: "Completed", icon: "⇄" },
    { id: "TXN-1044", name: "Coffee House", detail: "Food & drink", date: "16 Oct 2026", amount: -360, status: "Completed", icon: "☕" }
  ];

  const state = {
    user: { name: "Alex Morgan", email: "alex@example.com" },
    balance: 128450.75,
    transactions: [...sampleTransactions],
    loans: [{ id: "LN-001", type: "Personal loan", principal: 200000, rate: 10.5, months: 24, status: "Active", paid: 10 }],
    bills: []
  };

  async function request(path, options = {}) {
    if (DEMO_MODE) return demoRequest(path, options);
    const response = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || payload.message || "Request failed");
    return payload;
  }

  async function demoRequest(path, options) {
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};
    await new Promise(resolve => setTimeout(resolve, 180));

    if (path === "/api/auth/login" && method === "POST") {
      state.user.email = body.email || state.user.email;
      const part = state.user.email.split("@")[0].replace(/[._-]+/g, " ");
      state.user.name = part.replace(/\b\w/g, c => c.toUpperCase()) || "Demo User";
      return { ok: true, user: state.user, demo: true };
    }
    if (path === "/api/balance" && method === "GET") {
      return { balance: state.balance, currency: "INR", account_number: "•••• 4821" };
    }
    if (path === "/api/transactions" && method === "GET") return { transactions: state.transactions };
    if (path === "/api/transfer" && method === "POST") {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid transfer amount.");
      if (amount > state.balance) throw new Error("Insufficient demo balance.");
      state.balance = Math.round((state.balance - amount) * 100) / 100;
      state.transactions.unshift({
        id: `TXN-${Date.now().toString().slice(-6)}`,
        name: body.recipient || "Demo recipient",
        detail: "Bank transfer",
        date: "Just now",
        amount: -amount,
        status: "Completed",
        icon: "⇄"
      });
      return { ok: true, balance: state.balance, demo: true };
    }
    if (path === "/api/bills" && method === "POST") {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid bill amount.");
      if (amount > state.balance) throw new Error("Insufficient demo balance.");
      state.balance = Math.round((state.balance - amount) * 100) / 100;
      state.transactions.unshift({ id: `BILL-${Date.now().toString().slice(-6)}`, name: body.provider || "Demo bill", detail: "Bill payment", date: "Just now", amount: -amount, status: "Completed", icon: "▤" });
      return { ok: true, demo: true };
    }
    if (path === "/api/loans" && method === "GET") return { loans: state.loans };
    if (path === "/api/loans" && method === "POST") {
      const loan = { id: `LN-${Date.now().toString().slice(-5)}`, type: body.loan_type || "Personal loan", principal: Number(body.amount), rate: 10.5, months: Number(body.tenure_months), status: "Pending review", paid: 0 };
      if (!loan.principal || loan.principal < 10000) throw new Error("Loan amount must be at least ₹10,000.");
      state.loans.unshift(loan);
      return { ok: true, loan, demo: true };
    }
    if (path === "/api/pin/change" && method === "POST") {
      if (!/^\d{4,6}$/.test(body.new_pin || "")) throw new Error("PIN must contain 4 to 6 digits.");
      if (body.new_pin !== body.confirm_pin) throw new Error("New PIN and confirmation do not match.");
      return { ok: true, demo: true };
    }
    throw new Error(`Demo endpoint not implemented: ${method} ${path}`);
  }

  return {
    isDemo: () => DEMO_MODE,
    request,
    getState: () => state
  };
})();
