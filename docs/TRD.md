# Technical Requirements Document (TRD)
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026
**Status:** Draft — awaiting review

---

## 1. Technology Stack and Rationale

### Frontend

| Technology | Version Target | Reason |
|------------|---------------|--------|
| React | 18.x | Widely taught, large ecosystem, component model suits a multi-view reporting app |
| TypeScript | 5.x | Catches type errors at build time; improves maintainability for a solo developer |
| Vite | 5.x | Fast dev server, minimal config, recommended for new React projects |
| React Router | 6.x | Declarative client-side routing; supports nested routes for the portal and dashboard |
| Tailwind CSS | 3.x | Utility-first; no separate CSS file maintenance; pairs well with component-based design |
| Framer Motion | 11.x | Accessible, purposeful animation without writing raw CSS keyframes |
| Lucide React | latest | Consistent, tree-shakeable icon set |
| React Hook Form + Zod | latest | Performant form state; Zod schema reuse for shared validation with the backend types |
| Leaflet + React Leaflet | latest | Mature, permissive-licence map library; works well with OpenStreetMap tiles |

### Authentication

| Technology | Reason |
|------------|--------|
| Clerk | Provides registration, login, OAuth, and JWT issuance without building auth from scratch. Clerk JWTs can be verified by Supabase and FastAPI. Free tier is sufficient for a student project. |

### Backend

| Technology | Reason |
|------------|--------|
| FastAPI (Python 3.11+) | Lightweight, fast to write, good async support, automatic OpenAPI docs. Only used for trusted server-side operations: status transitions, role changes, coordinate validation, audit logging. |
| Supabase (PostgreSQL) | Managed Postgres with built-in Row Level Security, storage, and a JavaScript client. Eliminates the need to manage a database server. |
| Supabase Storage | Managed object storage for report photographs. Integrates with Supabase RLS for access control. |

### Why this architecture and not a simpler one?

A pure frontend + Supabase approach (no FastAPI) is tempting but creates a problem: if the frontend calls Supabase directly with a JWT, then complex business logic (permitted status transitions, coordinate boundary validation, role grants) must be enforced entirely by RLS policies or database functions. This is fragile and hard to test. A thin FastAPI layer handles these trusted operations and keeps security reasoning clear. The FastAPI backend never exposes the service-role key to the browser.

---

## 2. System Architecture

```
Browser (React + TypeScript)
        │
        ├─── Public tile server (OpenStreetMap / configured provider)
        │
        ├─── Clerk (authentication, JWT issuance)
        │
        ├─── Supabase JS client (read-only resident operations via RLS + Clerk JWT)
        │           └── Supabase PostgreSQL (RLS enforced)
        │           └── Supabase Storage (photo retrieval)
        │
        └─── FastAPI backend (trusted server-side operations)
                    │
                    ├── Validates Clerk JWT on every request
                    ├── Enforces status transition rules
                    ├── Validates coordinates against Mombasa boundary
                    ├── Writes to Supabase using service-role key (server-side only)
                    └── Records audit log entries
```

### What lives where

| Operation | Handler | Why |
|-----------|---------|-----|
| User registration / login | Clerk | Out-of-scope for us to build |
| Read resident's own reports | Supabase JS client (RLS) | Low risk; RLS policy enforces ownership |
| Submit a new report (write) | FastAPI | Coordinate validation; photo path association; audit entry |
| Upload a photo | Supabase JS client (Storage) | Client uploads directly to Storage; backend receives the path |
| Change report status | FastAPI | Transition rules and audit logging must happen on a trusted server |
| Assign a report | FastAPI | Privileged operation; must not be callable by residents |
| Grant/revoke staff role | FastAPI | Admin-only; must use service-role key to update Clerk metadata |
| Public map markers | Supabase JS client (RLS) | Read-only; RLS strips private fields |
| View audit logs | FastAPI | Admin-only; service-role read |

---

## 3. Frontend Responsibilities

- Render all UI views using React components.
- Manage route-level access control (redirect unauthorized users) as a UX convenience — not as security.
- Obtain the Clerk JWT and attach it as a `Bearer` token to API and Supabase requests.
- Validate form inputs client-side using Zod schemas (mirroring server-side validation) for fast feedback.
- Handle loading, error, and empty states for every data-fetching operation.
- Display the Leaflet map; capture selected coordinates; pass them to the backend for validation.
- Upload photos to Supabase Storage and pass the storage path to the backend.

---

## 4. Backend (FastAPI) Responsibilities

- Verify the Clerk JWT on every protected request using Clerk's JWKS endpoint.
- Extract the user's `clerk_user_id` and `role` from the verified token or from the `profiles` table.
- Validate submitted coordinates against the Mombasa County bounding polygon (GeoJSON stored in the backend).
- Enforce permitted report-status transitions (see Section 8).
- Write reports, status history, assignments, and audit log entries to Supabase using the service-role key.
- Grant or revoke the `staff` role via the Clerk Management API (server-side only).
- Never expose the service-role key or Clerk secret key to the browser.

---

## 5. Authentication and Authorization

### Authentication flow

1. User registers/logs in via Clerk (handled entirely by Clerk's hosted UI or embedded components).
2. Clerk issues a signed JWT containing the user's ID and custom claims (including the application role).
3. The React app attaches this JWT to all API and Supabase requests.
4. Supabase verifies the JWT using the configured Clerk JWKS URL and applies RLS policies.
5. FastAPI verifies the JWT using the same JWKS URL before processing any request.

### Role model

| Role | How assigned | Access |
|------|-------------|--------|
| `resident` | Default on first login (profile created by a Supabase trigger or FastAPI webhook) | Own reports only |
| `staff` | Granted by an administrator via the admin panel | All reports; status updates; assignment |
| `admin` | Set manually in the database for the initial administrator | Full access; role management; audit logs |

### Authorization rules (enforced server-side)

- Residents may only read and write their own report records (enforced by RLS `auth.uid() = reporter_id`).
- Public map data returns only report location, status, and type — no reporter identity.
- Status transitions are validated in FastAPI; the client cannot call a raw Supabase update to change a status.
- Role changes are performed exclusively via the FastAPI admin endpoint; the client cannot update the `profiles.role` column directly (column is not writable by the `authenticated` role via RLS).

### Clerk–Supabase integration

Supabase is configured to accept JWTs from Clerk by setting the JWT secret or JWKS URL in the Supabase project settings. Supabase's `auth.uid()` function returns the Clerk user ID embedded in the JWT. This must be prototyped and tested in Phase 2 before any feature depends on it.

---

## 6. Database and Storage

See `docs/backend_schema.md` for the full schema.

Key decisions:
- UUID primary keys throughout.
- `profiles.role` is stored in Supabase for fast query-time access; it is also stored as a Clerk public metadata field so it is available in the JWT.
- Images are stored in Supabase Storage. The database stores only the bucket path and MIME type.
- Soft deletes are not used in the MVP; records are retained unless manually removed by an administrator.

### Supabase Storage configuration

- Bucket name: `report-photos` (private).
- Residents can upload to a path prefixed by their own user ID.
- Signed URLs are used to serve photos to authorized users; public read is not enabled.

---

## 7. Map Integration

- **Library:** Leaflet with React Leaflet.
- **Tile provider:** OpenStreetMap tiles via the default tile server (subject to the OpenStreetMap tile usage policy). A configurable `VITE_TILE_URL` environment variable allows switching providers.
- **Initial centre:** `(-4.0435, 39.6682)` (approximate centre of Mombasa Island).
- **Initial zoom:** 12.
- **Geographic restriction:** A bounding polygon for Mombasa County (to be sourced from a verifiable public dataset; the source will be documented in `RESEARCH_AND_ASSUMPTIONS.md`). The FastAPI backend validates submitted coordinates against this polygon.
- **Marker display:** Report markers are shown with a colour coding by status. Private resident details are never included in the map popup payload.

---

## 8. Report-Status Transition Rules

```
submitted  ──► under_review  ──► assigned  ──► in_progress  ──► resolved
                    │                                              ▲
                    └──────────────────────────────────────────────┘
                          (can also resolve directly from assigned)

Any status ──► rejected  (staff or admin only, reason required)
```

| Transition | Who may perform |
|-----------|----------------|
| `submitted` → `under_review` | `staff`, `admin` |
| `under_review` → `assigned` | `staff`, `admin` |
| `assigned` → `in_progress` | `staff`, `admin` |
| `in_progress` → `resolved` | `staff`, `admin` |
| `assigned` → `resolved` | `staff`, `admin` |
| Any → `rejected` | `staff`, `admin` |
| `rejected` → `under_review` | `admin` only (appeal) |

No other transitions are permitted. FastAPI returns a 422 error for invalid transitions.

---

## 9. Security and Privacy Requirements

- All HTTP communication in production uses HTTPS.
- No secret keys in frontend environment variables. `VITE_` prefixed variables are public.
- Supabase service-role key is stored only in the FastAPI backend environment.
- Clerk secret key is stored only in the FastAPI backend environment.
- Supabase RLS policies are the last line of defence for data access.
- Uploaded photos are not publicly accessible; signed URLs have a short expiry.
- Map popups do not reveal `reporter_id`, email, or phone number.
- Coordinate validation on the server prevents injection of out-of-area data.
- Rejected reports include a human-readable reason; this reason is visible to the reporter.
- Audit logs capture user ID, action, timestamp, and any relevant metadata.

---

## 10. Testing Strategy

| Level | Approach |
|-------|---------|
| Unit (frontend) | Vitest + React Testing Library for critical components (form validation, status badge rendering) |
| Unit (backend) | pytest for FastAPI route handlers and transition-validation logic |
| Integration | Manual end-to-end tests following the test plan in `docs/TEST_PLAN.md` |
| Security | Manual boundary tests: try to access another resident's report; try to set own role; submit out-of-area coordinates |
| Accessibility | Browser axe extension audit on key pages |

---

## 11. Deployment Strategy (MVP)

| Service | Platform |
|---------|---------|
| React frontend | Vercel (free tier) or Netlify |
| FastAPI backend | Railway, Render, or a free-tier VPS |
| Database | Supabase (free tier) |
| Storage | Supabase Storage (free tier) |
| Authentication | Clerk (free tier) |

Deployment requires only environment variable configuration; no infrastructure provisioning is needed for the MVP. Full instructions will be in the `README.md`.

---

## 12. Environment Variables

See `.env.example` for the complete list. At a minimum:

### Frontend (`.env.local`)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=http://localhost:8000
VITE_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Backend (`.env`)
```
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ALLOWED_ORIGINS=http://localhost:5173
```
