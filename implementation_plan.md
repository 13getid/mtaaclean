# Implementation Plan
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026

Progress key: ✅ Done | 🔄 In Progress | ⬜ Not Started | ⚠️ Blocked

---

## Phase 0 — Understand and Plan

**Objective:** Inspect the repository, create all documentation, confirm architecture and scope, identify assumptions and open decisions.

**Status:** 🔄 In Progress

### Tasks

- [x] Inspect existing `d:\Projects` directory
- [x] Confirm no existing MtaaClean files need to be preserved
- [x] Create project directory structure
- [x] Write `docs/PRD.md`
- [x] Write `docs/TRD.md`
- [x] Write `docs/APP_FLOW.md`
- [x] Write `docs/UI_UX_DESIGN_BRIEF.md`
- [x] Write `docs/backend_schema.md`
- [x] Write `docs/TEST_PLAN.md`
- [x] Write `docs/SECURITY_AND_PRIVACY.md`
- [x] Write `docs/RESEARCH_AND_ASSUMPTIONS.md`
- [x] Write `README.md`
- [x] Write `.env.example`
- [x] Write `implementation_plan.md` (this file)
- [ ] Student review and approval of all documentation
- [ ] Confirm: Clerk account created and publishable key available
- [ ] Confirm: Supabase project created and URL/anon key available
- [ ] Confirm: Mombasa County boundary data source agreed

**Expected result:** Complete documentation suite; no code yet; student understands and has approved the architecture.

**Definition of done:** Student has reviewed and approved this plan and all linked documents. All open decisions in `RESEARCH_AND_ASSUMPTIONS.md` have been resolved or explicitly deferred.

---

## Phase 1 — Frontend Foundation

**Objective:** Set up the React/Vite/TypeScript/Tailwind stack, establish design tokens, build the responsive landing page, and add basic navigation.

**Dependencies:** Phase 0 approved.

**Status:** ✅ Done

### Files to create

```
package.json
vite.config.ts
tsconfig.json
tailwind.config.ts
index.html
src/main.tsx
src/App.tsx
src/index.css           (Tailwind base + Google Fonts import)
src/lib/constants.ts    (colour tokens, map centre, status labels)
src/types/index.ts      (shared TypeScript types)
src/components/ui/Button.tsx
src/components/ui/Badge.tsx
src/components/ui/Card.tsx
src/components/layout/Navbar.tsx
src/components/layout/Footer.tsx
src/pages/LandingPage.tsx
src/pages/NotFound.tsx
```

### Tasks in order

- [x] Configure `package.json`, Vite, and TypeScript (`tsconfig.json`)
- [x] Install Tailwind CSS and configure `tailwind.config.ts` with brand palette
- [x] Add Google Fonts (Space Grotesk + Inter) via Google Fonts & index.html
- [x] Create `src/lib/constants.ts` with palette, status styles, and Tudor config
- [x] Create shared TypeScript types (`src/types/index.ts`)
- [x] Create reusable `Button`, `Badge`, and `Card` components
- [x] Build responsive `Navbar` (with desktop links & mobile animated menu)
- [x] Build `Footer` with project description, placeholders, and academic disclaimer
- [x] Build `LandingPage` with all sections: hero, how-it-works, map preview placeholder, why-it-matters, CTA strip
- [x] Build `NotFound` (404) page with navigation back home
- [x] Verify strict typecheck (`tsc --noEmit`) passes with 0 errors
- [x] Verify production build (`vite build`) succeeds cleanly

### Manual testing steps

- Open the dev server (`npm run dev`) and visit `http://localhost:5173`.
- Resize the browser to mobile width (375px); confirm the layout does not break.
- Tab through all interactive elements; confirm visible focus states.
- Check that fonts load correctly.
- Check colour contrast using browser DevTools accessibility panel.

### Definition of done

- Landing page renders correctly on desktop and mobile.
- All navigation links are present (some may be placeholders).
- Tailwind classes use the brand palette exclusively.
- No TypeScript errors (`npm run tsc --noEmit`).
- No console errors.

---

## Phase 2 — Authentication and Permissions

**Objective:** Integrate Clerk, implement the three-role model, set up the `profiles` table, configure Supabase RLS with Clerk JWTs, and protect routes.

**Dependencies:** Phase 1 done. Clerk account and Supabase project ready.

**Status:** ✅ Done

### Files to create/modify

```
src/lib/clerk.ts          (Clerk integration & App wrapper)
src/lib/supabase.ts       (Supabase client with Clerk JWT injection)
src/hooks/useProfile.ts   (fetch current user's profile & role)
src/components/auth/ProtectedRoute.tsx
src/components/auth/RoleGuard.tsx
src/pages/SignInPage.tsx
src/pages/SignUpPage.tsx
backend/app/main.py
backend/app/config.py
backend/app/auth.py       (Clerk JWKS verification & require_role dependency)
backend/app/webhooks.py   (Clerk user.created / user.updated webhook handler)
backend/app/supabase_client.py
backend/requirements.txt
Supabase SQL migrations:
  backend/app/migrations/001_create_profiles.sql
  backend/app/migrations/002_profiles_rls.sql
```

### Tasks in order

- [x] Configure `@clerk/clerk-react` with `<ClerkProvider>` and publishable key
- [x] Create authenticated Supabase client wrapper (`src/lib/supabase.ts`)
- [x] Create `useProfile` hook querying user role and application profile
- [x] Implement `<ProtectedRoute>` redirecting unauthenticated users to `/sign-in`
- [x] Implement `<RoleGuard>` enforcing resident, staff, and admin access boundaries
- [x] Build `/sign-in` and `/sign-up` brutalist pages
- [x] Build FastAPI backend skeleton with CORS, health check, and `/api/auth/me`
- [x] Implement Clerk JWKS RS256 token verification in `backend/app/auth.py`
- [x] Implement Svix-verified Clerk webhook in `backend/app/webhooks.py`
- [x] Generate database migrations for `profiles` table and Supabase RLS policies
- [x] Update Navbar to display sign-in state, `UserButton`, and role badges
- [x] Verify typecheck and production build pass with 0 errors

### Manual testing steps

- Register a new user; confirm a `profiles` row appears in Supabase.
- Log in; confirm the dashboard shows the correct user name.
- Manually set `role = 'staff'` in the database; log in again; confirm staff routes are accessible.
- Attempt to access `/admin` as a resident; confirm redirect/403.
- Check the FastAPI `/health` endpoint returns 200.

### Definition of done

- A resident can register and log in.
- Profile is created automatically.
- Protected routes enforce role-based access.
- Supabase RLS correctly restricts data access by user.
- No secret keys in frontend code.

---

## Phase 3 — Reporting

**Objective:** Build the report submission form with photo upload and location selection, save reports to the database, and display the resident's own reports.

**Dependencies:** Phase 2 done.

**Status:** ✅ Done

### Files to create

```
src/features/reports/NewReportPage.tsx
src/features/reports/MyReportsPage.tsx
src/features/reports/ReportDetailPage.tsx
src/features/reports/components/ReportForm.tsx
src/features/reports/components/PhotoUpload.tsx
src/features/reports/components/LocationPicker.tsx
src/features/reports/hooks/useSubmitReport.ts
src/features/reports/hooks/useMyReports.ts
src/features/reports/schemas/reportSchema.ts
backend/app/routes/reports.py
backend/app/schemas/report.py
backend/app/services/coordinate_validator.py
backend/app/data/mombasa_boundary.geojson
Supabase SQL migrations:
  backend/app/migrations/003_create_reports.sql
  backend/app/migrations/004_create_report_photos.sql
  backend/app/migrations/005_create_status_history.sql
```

### Tasks in order

- [x] Apply Supabase database migrations for `reports`, `report_photos`, `status_history` with RLS
- [x] Define Zod schema enforcing >= 20 characters, 10MB photo, and Tudor coordinates
- [x] Build `PhotoUpload` component with drag-and-drop, preview, and mime validation
- [x] Build `LocationPicker` with GPS detection and Tudor presets
- [x] Build `ReportForm` using React Hook Form + Zod resolver
- [x] Implement `useSubmitReport` uploading evidence to Supabase Storage and calling FastAPI
- [x] Implement FastAPI `POST /api/reports` with Clerk JWT check, ray-casting boundary validation, and audit entry
- [x] Build `MyReportsPage` displaying submitted reports, badges, and empty states
- [x] Build `ReportDetailPage` showing photo evidence and status timeline
- [x] Add routes in `App.tsx`: `/report`, `/reports`, `/reports/:id`
- [x] Verify strict typecheck and production build pass with 0 errors

### Manual testing steps

- Submit a report with a description, photo, and location; confirm it appears in My Reports.
- Submit with description < 20 characters; confirm validation error.
- Submit with no photo; confirm validation error.
- Submit with coordinates outside Mombasa (manually set in the form); confirm server-side rejection.
- Open My Reports; confirm only the logged-in user's reports are shown.
- Attempt to access `/reports/:otherId` directly; confirm 404 or empty.

### Definition of done

- Complete report submission works end-to-end.
- Photos are stored in Supabase Storage.
- Reports appear in My Reports with the correct status.
- Status history shows the initial `submitted` entry.
- Invalid inputs are rejected with clear messages.

---

## Phase 4 — Map and Geographic Restrictions

**Objective:** Add the full Leaflet map, display appropriately filtered report markers, validate coordinates server-side, and test out-of-area rejection.

**Dependencies:** Phase 3 done.

**Status:** ✅ Done

### Files to create

```
src/features/map/MombasaMap.tsx
src/features/map/ReportMarker.tsx
src/features/map/MapPage.tsx
src/features/reports/components/LocationPicker.tsx  (updated with interactive Leaflet map)
backend/app/data/mombasa_boundary.geojson
backend/app/services/coordinate_validator.py
backend/app/routes/reports.py                      (public /map/public endpoint)
```

### Tasks in order

- [x] Configure Leaflet and React-Leaflet with brutalist SVG status markers (`ReportMarker.tsx`)
- [x] Integrate interactive Leaflet map with click-to-pin into `LocationPicker.tsx`
- [x] Create sanitized public map endpoint `GET /api/reports/map/public` in FastAPI
- [x] Build `MombasaMap` with interactive markers, status filter buttons, and Tudor polygon boundary
- [x] Build public `MapPage` route at `/map` and link in navbar
- [x] Verify strict typecheck and production build pass with 0 errors

### Definition of done

- Map renders centred on Mombasa.
- Clicking the map in the report form captures coordinates.
- Markers appear for submitted reports.
- Coordinates outside Mombasa County are rejected by the server.
- Map marker popups contain no private user data.

---

## Phase 5 — Staff Workflow

**Objective:** Add the staff dashboard with report review, assignment, status updates, and resolution. Record status history. Enforce permitted transitions.

**Dependencies:** Phase 4 done.

**Status:** ✅ Done

### Files to create

```
src/features/staff/StaffDashboardPage.tsx
src/features/staff/StaffReportDetailPage.tsx
src/features/staff/components/ReportQueue.tsx
src/features/staff/components/AssignmentForm.tsx
src/features/staff/components/StatusUpdateForm.tsx
src/features/staff/components/ResolutionForm.tsx
src/features/staff/hooks/useStaffOperations.ts
backend/app/routes/staff.py
backend/app/schemas/staff.py
backend/app/services/transition_validator.py
Supabase SQL: backend/app/migrations/006_create_assignments.sql
```

### Tasks in order

- [x] Apply Supabase database migration for `assignments` with RLS (`006_create_assignments.sql`)
- [x] Build `ReportQueue` with status pills and search bar
- [x] Build `AssignmentForm` with staff member dropdown and dispatch notes
- [x] Build `StatusUpdateForm` with valid next-state options and rejection justification validation
- [x] Build `ResolutionForm` with completion notes and after-cleanup photo evidence upload
- [x] Implement FastAPI `PATCH /api/reports/{id}/status` with transition state graph validation
- [x] Implement FastAPI `POST /api/reports/{id}/assign` with auto-transition to `assigned`
- [x] Implement FastAPI `GET /api/staff/reports` and `GET /api/staff/members`
- [x] Mount staff routes (`/staff`, `/staff/reports/:id`) guarded by `<RoleGuard allowedRoles={['staff', 'admin']}>`
- [x] Verify strict typecheck and production build pass with 0 errors

### Definition of done

- Staff can review, assign, progress, and resolve reports.
- All transition rules are enforced by the server.
- Invalid transitions return a clear error.
- Residents cannot access staff routes.
- Status history is correctly recorded for each transition.

---

## Phase 6 — Dashboard and Polish

**Objective:** Add meaningful summary counts and filters, improve all loading/error/empty states, apply purposeful Framer Motion, and complete responsive and accessibility work.

**Dependencies:** Phase 5 done.

**Status:** ⬜ Not Started

### Tasks

1. Resident dashboard: report counts by status.
2. Staff dashboard: summary bar (submitted today, in progress, resolved this week).
3. Admin area: user list, role management, audit log view.
4. Consistent loading skeletons across all list views.
5. Consistent empty states with helpful CTA.
6. Framer Motion: page transitions, success feedback, staggered list entrance.
7. Responsive audit: test all pages at 375px, 768px, 1280px.
8. Accessibility audit using browser axe extension; fix issues.

### Definition of done

- All pages have loading, empty, and error states.
- Reduced motion preference is respected.
- No accessibility violations in axe audit for key pages.
- All pages render correctly at three breakpoints.

---

## Phase 7 — Testing and Evaluation

**Objective:** Execute the test plan, verify all security boundaries, document results and limitations.

**Dependencies:** Phase 6 done.

**Status:** ⬜ Not Started

### Tasks

1. Execute all test cases in `docs/TEST_PLAN.md`.
2. Record results in a test evidence document.
3. Fix identified bugs.
4. Document limitations honestly.
5. Optionally: conduct usability test with 2–3 consenting participants.

---

## Phase 8 — Deployment and Presentation

**Objective:** Deploy to a public URL, prepare demonstration data, write the presentation script.

**Dependencies:** Phase 7 done.

**Status:** ⬜ Not Started

### Tasks

1. Deploy frontend to Vercel/Netlify.
2. Deploy FastAPI backend to Render/Railway.
3. Configure all production environment variables.
4. Load demonstration data via a seed script.
5. Write the demonstration script.
6. Prepare architecture diagram for the project panel.
7. Final review of all documentation.

---

## Open Decisions (require student approval)

| # | Decision | Options | Recommended |
|---|---------|---------|-------------|
| 1 | Mombasa County boundary source | Kenya Open Data (if available), GADM dataset, hand-drawn demonstration polygon | Research GADM; document source |
| 2 | FastAPI hosting for MVP | Render free tier, Railway free tier, local demo only | Render free tier |
| 3 | Map tile provider | OpenStreetMap default tiles, Stadia Maps free tier | OSM default for development; Stadia for production |
| 4 | Profile creation trigger | Clerk webhook → FastAPI → insert, or Supabase DB trigger | Clerk webhook (more control; avoids complex DB triggers) |
| 5 | After-photo storage path | Same bucket as before-photos with `photo_type` column | Same bucket (simpler) |
