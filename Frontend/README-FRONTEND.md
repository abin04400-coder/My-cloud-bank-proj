# CloudBank frontend

A responsive, static banking-dashboard demo built with plain HTML, CSS and JavaScript, intended to be served by Nginx.

## Folder layout

```text
frontend/
├── public/
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── api.js
│       └── app.js
├── nginx/
│   └── default.conf.template
└── README-FRONTEND.md
```

## Current features

- Simulated login and logout
- Dashboard with sample balance and transactions
- Transfer form with a simulated result
- Sample bill payment interactions
- Loan EMI calculator
- Demo security/PIN screen
- Downloadable sample transaction CSV
- Responsive layout for mobile and desktop

## Important safety note

This is a **frontend-only demo**, not a real banking application. It has no real authentication, does not connect to a bank, and does not move or save money. Do not enter real passwords, PINs, account numbers, or personal information.

`public/js/api.js` currently has `DEMO_MODE = true`, so all data is local sample data. A Node.js backend is not included in this ZIP.

## Nginx proxy configuration

`nginx/default.conf.template` expects a `BACKEND_URL` environment variable, for example `http://backend:3000`. The template is intended to be processed with `envsubst` by your Nginx container entrypoint. Ensure `BACKEND_URL` is set before using this config. The demo frontend can still be tested without a backend because demo mode does not call the API.

## Quick local test

If you have Python installed, from the `frontend/public` directory run:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. This quick test serves static files only; it does not test the Nginx reverse proxy.
