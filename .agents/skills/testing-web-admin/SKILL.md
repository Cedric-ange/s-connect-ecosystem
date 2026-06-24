---
name: testing-web-admin
description: Test the SalesConnect Web Admin (Vue 3 + Vite + Tailwind v4) end-to-end. Use when verifying UI changes, Meta Business Suite design, sidebar navigation, or theme colors.
---

# Testing Web Admin (SalesConnect Meta Business Suite)

## Prerequisites

- Node.js 18+ installed
- `web-admin/` dependencies installed (`npm install`)
- Dev server running on port 5178 (`npm run dev`)

## Devin Secrets Needed

None required for UI testing. Backend credentials needed only for real API testing:
- `SALESCONNECT_TEST_EMAIL` (e.g. `manager.fanmilk@salesconnected.ci`)
- `SALESCONNECT_TEST_PASSWORD`

## Setup

```bash
cd /home/ubuntu/s-connect-ecosystem/web-admin
npm install
npm run dev -- --port 5178 &
```

Wait for Vite to confirm the server is running before opening the browser.

## Auth Bypass (when backend is down)

The backend at `backendsfa-gdqw.onrender.com` might be down or have CORS issues. To test authenticated pages without the backend:

1. Open browser DevTools console (F12)
2. Set localStorage tokens:
   ```js
   localStorage.setItem('token', 'mock-token');
   localStorage.setItem('tenantId', '0c51a134-6d94-4d59-b8ff-ba113177b54b');
   ```
3. Navigate to the target page (e.g. `/dashboard`)
4. **Important:** The auth guard checks `isAuthenticated = !!token && !!user`. Token loads from localStorage but `user` is null on page load. You must inject the user into Pinia store via console:
   ```js
   // Get the Pinia store from the Vue app instance
   const app = document.querySelector('#app').__vue_app__;
   const pinia = app.config.globalProperties.$pinia;
   const authStore = pinia._s.get('auth');
   authStore.user = { id: '1', firstName: 'Admin', lastName: 'Test', email: 'admin@test.com', role: 'ADMIN' };
   ```
5. **Critical:** Use `router.push('/dashboard')` via console instead of `window.location.href` to avoid full page reload which clears in-memory Pinia state.
   ```js
   app.config.globalProperties.$router.push('/dashboard');
   ```

## Key Test Areas

### 1. Login Page (Meta Split-Screen)
- URL: `/login`
- Two side-by-side panels: left white branding, right gray (#F0F2F5) form
- Blue circle "S" logo, Facebook blue (#1877F2) button
- Organization, Email, Password fields with eye toggle
- "Mot de passe oublie?" link, "Creer un nouveau compte" button

### 2. Dashboard (Meta Accueil)
- White sidebar with blue logo, account selector, 10 nav items
- Active nav item: dark background (#1B2A3B) with white text
- Top bar: hamburger toggle, "Creer une publicite"/"Creer une publication" buttons
- 3 activity cards, weekly plan section, performance cards

### 3. Sidebar Navigation
All pages to verify (click each sidebar item):
- Accueil, Notifications, Gestionnaire de pub, Agenda, Contenu
- Statistiques, Messagerie, Utilisateurs, Points de Vente, Territoires
- Bottom items: Rechercher, Parametres, Aide

### 4. Sidebar Toggle
- Click hamburger icon in top bar
- Sidebar collapses to icon-only rail (~40-60px), labels disappear
- Click again: expands back to ~240px with labels

### 5. Statistics Sub-Navigation
- Left sub-nav with 7 tabs: Vue d'ensemble, Plan, Resultats, Audience, Prospects, Messages, Benchmarking
- Active tab gets dark bg (#1B2A3B), inactive tabs revert
- "Contenus" sub-section below with Presentation/Contenu/Publicites

### 6. CSS Color Variables
Verify via DevTools console:
```js
JSON.stringify({
  primary: getComputedStyle(document.body).getPropertyValue('--color-primary'),
  surface: getComputedStyle(document.body).getPropertyValue('--color-surface'),
  bg: getComputedStyle(document.body).backgroundColor
})
```
Expected: `primary=#1877F2`, `surface=#F0F2F5`, `bg=rgb(240, 242, 245)`

## Tips

- The dev server might use a different port if 5178 is taken. Check Vite output.
- CORS errors in console from the backend are expected when backend is down — they don't affect UI testing.
- When recording, maximize browser first: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`
- Tailwind v4 uses `@theme` blocks in `style.css` for color variables, not `tailwind.config.js`.
- The auth store is at `web-admin/src/stores/auth.ts`. Key: `isAuthenticated = computed(() => !!token.value && !!user.value)`.
