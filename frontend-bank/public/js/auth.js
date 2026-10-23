/* CloudBank Cognito Hosted UI authentication using OAuth authorization code + PKCE.
 * Configure cognitoDomain and clientId below. This is a portfolio demo, not a real banking system.
 */
(() => {
  "use strict";
  const CONFIG = {
    cognitoDomain: "https://YOUR_COGNITO_DOMAIN.auth.YOUR_REGION.amazoncognito.com",
    clientId: "YOUR_COGNITO_APP_CLIENT_ID",
    redirectUri: window.location.origin + "/",
    logoutUri: window.location.origin + "/",
    scopes: ["openid", "email", "profile"]
  };
  const KEYS = { verifier: "cloudbank_pkce_verifier", state: "cloudbank_oauth_state", access: "cloudbank_access_token", id: "cloudbank_id_token", refresh: "cloudbank_refresh_token" };
  function base64Url(bytes) { let binary = ""; bytes.forEach(b => binary += String.fromCharCode(b)); return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }
  function randomString(length = 64) { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return base64Url(bytes); }
  async function challengeFor(verifier) { return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)))); }
  function validateConfig() { if (CONFIG.cognitoDomain.includes("YOUR_COGNITO") || CONFIG.clientId.includes("YOUR_COGNITO")) throw new Error("Configure cognitoDomain and clientId in public/js/auth.js first."); }
  async function startHostedFlow(path) {
    validateConfig();
    const verifier = randomString(64), challenge = await challengeFor(verifier), state = randomString(32);
    sessionStorage.setItem(KEYS.verifier, verifier); sessionStorage.setItem(KEYS.state, state);
    const url = new URL(path, CONFIG.cognitoDomain);
    url.searchParams.set("client_id", CONFIG.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", CONFIG.scopes.join(" "));
    url.searchParams.set("redirect_uri", CONFIG.redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", challenge);
    window.location.assign(url.toString());
  }
  function login() { return startHostedFlow("/oauth2/authorize"); }
  // Cognito's hosted sign-up page collects registration details; it does not create app database records by itself.
  function signUp() { return startHostedFlow("/signup"); }
  async function handleCallback() {
    const current = new URL(window.location.href), error = current.searchParams.get("error");
    if (error) throw new Error("Cognito authentication failed: " + (current.searchParams.get("error_description") || error));
    const code = current.searchParams.get("code"); if (!code) return false;
    const returnedState = current.searchParams.get("state"), savedState = sessionStorage.getItem(KEYS.state), verifier = sessionStorage.getItem(KEYS.verifier);
    if (!returnedState || returnedState !== savedState || !verifier) throw new Error("Sign-in verification failed. Please try again.");
    validateConfig();
    const response = await fetch(new URL("/oauth2/token", CONFIG.cognitoDomain), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", client_id: CONFIG.clientId, code, redirect_uri: CONFIG.redirectUri, code_verifier: verifier }) });
    const tokens = await response.json();
    if (!response.ok || !tokens.access_token) throw new Error(tokens.error_description || tokens.error || "Cognito token exchange failed.");
    sessionStorage.setItem(KEYS.access, tokens.access_token);
    if (tokens.id_token) sessionStorage.setItem(KEYS.id, tokens.id_token);
    if (tokens.refresh_token) sessionStorage.setItem(KEYS.refresh, tokens.refresh_token);
    sessionStorage.removeItem(KEYS.verifier); sessionStorage.removeItem(KEYS.state);
    window.history.replaceState({}, document.title, CONFIG.redirectUri); return true;
  }
  function getAccessToken() { return sessionStorage.getItem(KEYS.access); }
  function logout() { validateConfig(); Object.values(KEYS).forEach(key => sessionStorage.removeItem(key)); const url = new URL("/logout", CONFIG.cognitoDomain); url.searchParams.set("client_id", CONFIG.clientId); url.searchParams.set("logout_uri", CONFIG.logoutUri); window.location.assign(url.toString()); }
  window.CloudBankAuth = { login, signUp, handleCallback, getAccessToken, logout };
})();
