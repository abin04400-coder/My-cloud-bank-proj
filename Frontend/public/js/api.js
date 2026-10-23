/*
 * CloudBank demo API adapter.
 * This file currently uses local sample data. It does NOT call a real bank
 * or backend. Keep DEMO_MODE true until the Node.js API is ready and tested.
 */
const DEMO_MODE = true;
const API_BASE_URL = "/api";

const demoTransactions = [
  { name: "Salary credit", detail: "ACME Technologies", date: "22 Oct 2026", amount: 32500, status: "Completed", type: "credit" },
  { name: "Grocery store", detail: "FreshMart", date: "21 Oct 2026", amount: -2450.75, status: "Completed", type: "debit" },
  { name: "Internet bill", detail: "FiberNet", date: "20 Oct 2026", amount: -899, status: "Completed", type: "debit" },
  { name: "Transfer received", detail: "From Taylor", date: "18 Oct 2026", amount: 5000, status: "Completed", type: "credit" },
  { name: "Coffee shop", detail: "Bean & Co.", date: "17 Oct 2026", amount: -320, status: "Completed", type: "debit" }
];

const CloudBankAPI = {
  async getDashboard() {
    if (DEMO_MODE) return { balance: 84250.75, transactions: demoTransactions };
    const response = await fetch(`${API_BASE_URL}/dashboard`, { credentials: "include" });
    if (!response.ok) throw new Error("Could not load dashboard");
    return response.json();
  },
  async transfer(payload) {
    if (DEMO_MODE) return { success: true, demo: true, reference: `DEMO-${Date.now()}`, payload };
    const response = await fetch(`${API_BASE_URL}/transfers`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Transfer request failed");
    return response.json();
  }
};
