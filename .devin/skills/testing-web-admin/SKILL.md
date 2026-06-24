---
name: testing-web-admin
description: Test the SalesConnect Web Admin (Vue 3) login and multi-tenant flow end-to-end. Use when verifying auth, tenant selection, or API integration changes.
---

# Testing SalesConnect Web Admin

## Prerequisites

- Node.js 18+ installed
- Clone the `s-connect-ecosystem` monorepo
- Backend deployed at the URL configured in `web-admin/.env` (VITE_API_URL)

## Setup

```bash
cd web-admin
npm install
npm run dev
# Dev server starts at http://localhost:5177/
```

## Key Architecture

- **Multi-tenant**: All API requests require `X-Tenant-ID` header (injected via axios interceptor in `src/services/api.ts`)
- **Tenant selection**: Login page fetches tenants from `/api/tenants/public/list`. If this fails (404/500), falls back to a text input for manual UUID entry
- **Auth guard**: Router `beforeEach` hook in `src/router/index.ts` redirects unauthenticated users to `/login`
- **Token storage**: JWT token stored in localStorage as `token`, tenant ID as `tenantId`

## Test Credentials

- Tenant ID: Use one from the tenants table (e.g. `0c51a134-6d94-4d59-b8ff-ba113177b54b` for "Fan Milk International")
- Email: `manager.fanmilk@salesconnected.ci`
- Password: `Salesconnected2026`

## Devin Secrets Needed

No secrets required for frontend testing. Backend credentials are seed data in the database.

## Core Test Cases

### 1. Auth Guard
- Navigate to `/dashboard` without token in localStorage
- Expected: Redirects to `/login`

### 2. Tenant Selector Fallback
- If `/api/tenants/public/list` returns error, login page should show text input (not dropdown)
- If endpoint succeeds, should show dropdown with tenant names

### 3. Form Validation
- Submit with empty Organisation field -> error "Veuillez sélectionner votre organisation"
- Note: HTML5 `required` attribute also blocks submission; Vue custom validation is second layer

### 4. X-Tenant-ID Header
- Open DevTools Network tab before submitting login
- Fill organisation UUID, email, password, submit
- Verify POST to `/api/auth/login` includes `X-Tenant-ID` header with the UUID value
- Verify request body has `{email, password}` (tenant ID is NOT in body, only header)

### 5. Password Toggle
- Click eye icon next to password field
- Input type should change from `password` to `text`

## Known Issues & Workarounds

- **Backend 500 on login**: If JWT_SECRET is not configured on Render, login will return 500. This is a backend deployment issue, not a frontend bug. Test that the error is handled gracefully (error banner shown, no crash).
- **Tenants endpoint 404**: The `/api/tenants/public/list` endpoint exists in the monorepo but may not be deployed if using the separate `backendSFA` repo on Render. The fallback text input is the expected behavior in this case.
- **HTML5 validation blocking**: If you need to test Vue-level validation (e.g. empty tenant), you may need to remove the `required` attribute via DevTools console first: `document.querySelector('input[placeholder*="Organisation"]').removeAttribute('required')`

## Tips

- Use DevTools Network tab (filter by XHR) to verify headers on API calls
- The primary brand color is `#38BDF8` (cyan blue) - verify logo/button colors match
- Dashboard and other pages require auth; inject a mock token in localStorage to test them:
  ```js
  localStorage.setItem('token', 'mock-token');
  localStorage.setItem('tenantId', '0c51a134-6d94-4d59-b8ff-ba113177b54b');
  ```
- After injecting mock auth, navigate to `/dashboard` to test protected pages
