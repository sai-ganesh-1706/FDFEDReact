# CareerNest — ReactFrontend

Merged React (Vite) frontend for CareerNest, combining each teammate's
role-specific build into a single app.

## Status

| Role             | Status                                              |
|------------------|------------------------------------------------------|
| Landing / Login  | Done (public pages)                                   |
| Candidate        | Done — already router-based, used as the reference    |
| Alumni           | Done — converted from `onNavigate` callback pattern    |
| Recruiter        | Done — converted from `activeTab` state pattern        |
| Placement Officer| Done — converted from `currentPage` state pattern      |
| College Admin    | **Pending** — placeholder at `src/roles/college-admin` |
| Super Admin      | **Pending** — placeholder at `src/roles/super-admin`   |

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend
npm run dev
```

Routes: `/` (landing), `/login`, `/candidate/*`, `/alumni/*`, `/recruiter/*`,
`/placement/*`, `/college-admin/*`, `/super-admin/*`.

## Folder structure

```
src/
  app/            AppRouter.jsx (top-level routes), ProtectedRoute.jsx
  shared/         context/AuthContext.jsx, and a home for shared components/layouts/utils
  services/       api.js (shared axios instance) — add one file per backend module here
  public-pages/   landing/, login/ — not role-gated
  roles/
    candidate/    reference implementation (react-router + Context)
    alumni/
    recruiter/
    placement-officer/
    college-admin/  <- placeholder, not built yet
    super-admin/    <- placeholder, not built yet
```

## For whoever builds college-admin / super-admin

Follow the shape of `roles/alumni` or `roles/placement-officer`:
`pages/`, `components/`, `data/` (mock data until wired to `services/`),
`styles/`. Then replace `roles/<role>/<Role>App.jsx` with the real
component tree — it's already mounted at `/college-admin/*` and
`/super-admin/*` in `src/app/AppRouter.jsx`, so nothing else needs to change
to plug it in.

## Known follow-ups (not blockers, but worth doing next)

- `roles/recruiter` still keeps its own data in `localStorage`
  (`careernest_*` keys) instead of calling the backend — replace with
  `services/*.js` calls when that role's API integration starts.
- Auth is currently permissive: `ProtectedRoute` doesn't redirect
  unauthenticated users yet (see the comment in `src/app/ProtectedRoute.jsx`)
  so each role can still be developed/demoed standalone. Flip it on once
  everyone's ready to enforce login.
- CSS is plain (not modules) and scoped only by convention — each role's
  top-level element has its own class, but a global class name collision
  is possible. Worth moving to CSS Modules if that ever bites.
- The production bundle is a single ~770 KB JS chunk since all six role
  apps are bundled together. Consider `React.lazy()` per role route in
  `AppRouter.jsx` to code-split once this matters.
