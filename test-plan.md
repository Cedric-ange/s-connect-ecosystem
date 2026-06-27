# Test Plan: Multi-Tenant Login Flow (PR #1 - Merged)

## What Changed
PR #1 added Vue Web Admin and React Native Mobile apps to the s-connect-ecosystem monorepo, connected to the live backend at `https://backendsfa-gdqw.onrender.com/api`. Key features:
- Multi-tenant login with organization selector (dropdown from API or text input fallback)
- X-Tenant-ID header injection on all API requests via axios interceptor
- Auth guard redirecting unauthenticated users to `/login`
- Form validation requiring organization selection before login

## Environment
- Web Admin dev server: http://localhost:5177/
- Backend: https://backendsfa-gdqw.onrender.com/api (tenants endpoint not deployed, returns 404)
- Known limitation: Backend login returns 500 (JWT_SECRET missing on Render)

## Test Cases

### Test 1: Auth Guard Redirect
**Action**: Navigate to `http://localhost:5177/dashboard` directly (no auth token in localStorage)
**Expected**: URL changes to `/login`, login page renders
**Broken if**: Dashboard loads without auth, or page shows blank/error

### Test 2: Login Page Renders with Tenant Text Input (Fallback)
**Action**: On login page, observe the form fields
**Expected**:
- "SalesConnect" heading with blue logo (bg-primary = #38BDF8)
- "Organisation" label with TEXT INPUT (not dropdown) with placeholder "ID Organisation (UUID)"
- "Email" input with placeholder "email@example.com"
- "Mot de passe" input with placeholder dots
- "Se connecter" submit button in primary blue
**Broken if**: Shows dropdown instead of text input (means API returned tenants when it shouldn't), or fields are unstyled/missing

### Test 3: Empty Tenant Validation
**Action**: Leave Organisation field empty, fill email="test@test.com" and password="test123", click "Se connecter"
**Expected**: Red error banner appears with exact text "Veuillez sélectionner votre organisation"
**Broken if**: Form submits without error, or different error message appears, or no visual feedback

### Test 4: X-Tenant-ID Header Injection on Login Request
**Action**: 
1. Open Network tab in DevTools
2. Fill Organisation = "0c51a134-6d94-4d59-b8ff-ba113177b54b"
3. Fill email = "manager.fanmilk@salesconnected.ci"
4. Fill password = "Salesconnected2026"
5. Click "Se connecter"
**Expected**:
- POST request to `https://backendsfa-gdqw.onrender.com/api/auth/login`
- Request headers contain `X-Tenant-ID: 0c51a134-6d94-4d59-b8ff-ba113177b54b`
- Request body contains `{"email":"manager.fanmilk@salesconnected.ci","password":"Salesconnected2026"}`
- Response is 500 (expected due to missing JWT secrets on backend)
- Error message displayed to user (not a crash/blank screen)
**Broken if**: X-Tenant-ID header is missing, or request goes to wrong URL, or app crashes on error response

### Test 5: Password Visibility Toggle
**Action**: Type "test123" in password field, click the eye icon
**Expected**: Input type changes from "password" to "text", revealing "test123"
**Broken if**: Toggle doesn't work, or password remains hidden

## Pass Criteria
- Tests 1-4 MUST pass (core multi-tenant auth flow)
- Test 5 is minor UX validation
