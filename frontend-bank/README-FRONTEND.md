# CloudBank frontend (Cognito sign-in and sign-up UI)

Static HTML/CSS/JavaScript frontend served by Nginx. No npm or package.json is required for the frontend.

## Cognito setup required

1. Open `public/js/auth.js` and replace `YOUR_COGNITO_DOMAIN` and `YOUR_COGNITO_APP_CLIENT_ID` with your Cognito User Pool domain prefix/domain and app client ID.
2. Use a **public app client without a client secret**. Configure Cognito Managed Login/Hosted UI with Authorization code grant and PKCE; allow the `openid`, `email`, and `profile` scopes.
3. Enable self-service sign-up in the User Pool. Configure email verification as desired.
4. Add the exact site URL (for example `https://your-domain.example/`) to both the app client's Allowed callback URLs and Allowed sign-out URLs. Use HTTPS for a real hosted site.
5. Build/redeploy the frontend container after editing the config.

## What the buttons do

- **Login** redirects to Cognito's hosted sign-in page.
- **Create Account** redirects to Cognito's hosted sign-up page. Cognito handles registration and any configured verification steps.
- After Cognito redirects back, the frontend exchanges the authorization code using PKCE.

## Important limitations

- This is an educational portfolio demo, not a real banking application.
- The dashboard still uses sample data (`public/js/api.js` has `DEMO_MODE = true`). Cognito registration creates a Cognito user identity; it does **not** automatically create a PostgreSQL profile, account, balance, or transactions. Add backend user provisioning and JWT verification before connecting protected API routes.
- Tokens are stored in `sessionStorage` for this demo. A production-grade architecture should consider a backend-for-frontend with secure HttpOnly cookies and proper security review. Never store real banking credentials or data here.
- The Cognito flow has been integrated in the files but has not been tested against your specific User Pool/domain. Test it after configuring the values and callback URLs.

## Nginx

The Nginx template expects `BACKEND_URL`, for example `http://backend:3000`, for `/api/` proxying. The current demo API remains in demo mode until the backend is ready.
