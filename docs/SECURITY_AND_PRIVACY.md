# Security and Privacy Document
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026

---

## 1. Security Principles

This project applies the following principles:

1. **Least privilege** — Each user, API call, and database operation is granted only the permissions it needs.
2. **Defence in depth** — Security is enforced at multiple layers: React route guards (UX), FastAPI middleware (business logic), and Supabase RLS (data layer). No single layer is trusted exclusively.
3. **Never trust the client** — Frontend role checks are UX conveniences only. All privileged operations are validated server-side.
4. **Secret separation** — Secret keys never appear in frontend code or environment variables prefixed with `VITE_`.
5. **Minimal data exposure** — Only the data required for each operation is returned. Private fields are never included in public-facing API responses.

---

## 2. Authentication Security

### Clerk
- Clerk handles credential storage, hashing, and session management. We do not store passwords.
- JWT tokens issued by Clerk are signed with Clerk's private key. They can be verified using Clerk's published JWKS endpoint.
- JWTs have a short expiry (default: 60 seconds for Supabase sessions; Clerk sessions are managed separately). The FastAPI backend must verify the token on every request, not cache the result indefinitely.
- If a JWT is expired or invalid, FastAPI returns `401 Unauthorized`.

### Token handling
- The Clerk JWT is retrieved client-side using `getToken()` from the Clerk React hook.
- It is passed in the `Authorization: Bearer {token}` header to both FastAPI and Supabase.
- It is never stored in `localStorage` or cookies by our code (Clerk manages its own session storage).

---

## 3. Authorization Security

### Role enforcement
- The `role` field in `profiles` is the authoritative source of a user's application role.
- The role is also stored in Clerk's `publicMetadata` so it appears in the JWT.
- Supabase RLS policies reference the role from the JWT claim (`auth.jwt() -> 'app_metadata' ->> 'role'`).
- FastAPI extracts the role from the verified JWT claims and applies role checks before processing requests.
- **The `profiles.role` column is not writable by any authenticated Supabase client.** Only FastAPI (using the service-role key) can change a user's role.

### What residents cannot do
- Read or write another resident's `reports`, `report_photos`, or `status_history` records.
- Change the status of any report.
- Assign a report.
- Grant themselves or others a higher role.
- Access staff or admin routes (both frontend guard and backend enforcement).

### What staff cannot do
- Create reports on behalf of residents.
- Change a user's role.
- Delete audit log entries.
- Perform status transitions that are not in the permitted transition table.

### What administrators cannot do
- Arbitrarily edit report content after submission.
- Delete audit log entries.

---

## 4. API Security

### FastAPI
- Every protected route uses a dependency that:
  1. Extracts the `Authorization` header.
  2. Verifies the JWT signature using Clerk's JWKS endpoint (cached with a short TTL).
  3. Checks the token expiry.
  4. Extracts `clerk_user_id` and `role`.
  5. Returns `401` if the token is invalid or expired.
  6. Returns `403` if the role is insufficient.
- CORS is configured in FastAPI to accept requests only from the known frontend origin (`ALLOWED_ORIGINS`).
- Rate limiting is not implemented in the MVP but is noted as a future improvement.

### Supabase
- The anon key (`VITE_SUPABASE_ANON_KEY`) is safe to include in the frontend because RLS policies enforce data access. Without a valid Clerk JWT, RLS policies return no rows.
- The service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is stored only in FastAPI's `.env` file and is never sent to the browser.

---

## 5. Data Privacy

### What data is collected
| Data type | Where stored | Who can see it |
|-----------|-------------|----------------|
| Name, email (from Clerk) | Clerk + `profiles` table | Resident (own), Staff/Admin (email only) |
| Phone number | `profiles` table | Staff, Admin |
| Report description | `reports` table | Resident (own), Staff, Admin |
| Report location (lat/lng) | `reports` table | Resident (own), Staff, Admin, Public map (lat/lng only) |
| Report photographs | Supabase Storage | Resident (own), Staff, Admin |
| IP addresses | Not stored by us | Not applicable |
| Device/browser info | Not stored | Not applicable |

### What is visible on the public map
- Report latitude and longitude.
- Report status.
- Report type / area name.
- Submission date (rounded to day only — implementation decision to confirm).

**Never visible on the public map:**
- Reporter name.
- Reporter email or phone.
- Reporter Clerk user ID.
- Full description (only area name / type label).
- Photographs.

### Data retention
- Reports and status history are retained for the life of the project unless explicitly deleted by an administrator.
- If a resident requests deletion of their data (right to erasure), an administrator must manually delete their profile and reports. There is no automated deletion workflow in the MVP.
- This limitation must be disclosed in the project's privacy notice.

---

## 6. Photo Storage Security

- Photos are stored in a **private** Supabase Storage bucket.
- No photo URL is publicly guessable.
- Access requires a signed URL generated by FastAPI, which first verifies that the requester is authorized to view the report.
- Signed URLs expire after 1 hour.
- Residents can only obtain signed URLs for their own report photos.

---

## 7. Input Validation and Injection Prevention

- All text inputs are validated on the client (Zod) and on the server (FastAPI Pydantic models).
- Coordinate inputs are validated against a numerical range (Mombasa bounding box) and then against the county polygon.
- Supabase uses parameterized queries via its client library; raw SQL string interpolation is not used.
- FastAPI uses Pydantic for request body validation; no raw string SQL is constructed from user input.
- File uploads are validated for MIME type and size before storage.

---

## 8. Environment and Secret Management

| Secret | Where stored | Who can access |
|--------|-------------|----------------|
| `CLERK_SECRET_KEY` | FastAPI `.env` | FastAPI process only |
| `SUPABASE_SERVICE_ROLE_KEY` | FastAPI `.env` | FastAPI process only |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend `.env.local` | Public (safe to expose) |
| `VITE_SUPABASE_ANON_KEY` | Frontend `.env.local` | Public (safe to expose; RLS enforces access) |
| `VITE_SUPABASE_URL` | Frontend `.env.local` | Public (safe to expose) |

- `.env` and `.env.local` files are listed in `.gitignore`.
- `.env.example` is committed to the repository with placeholder values.
- Production secrets are configured in the hosting platform's environment variable settings, not in committed files.

---

## 9. Known Security Limitations (MVP)

| Limitation | Risk | Mitigation |
|-----------|------|-----------|
| No rate limiting on report submission | Spam/flood | Noted; mitigate post-MVP |
| No email verification for phone number | Phone could be fake | Acceptable for MVP; phone is optional |
| No automated right-to-erasure workflow | GDPR risk | Admin manual process; disclosed in privacy notice |
| Signed URL expiry (1 hour) | Link sharing risk | Acceptable for MVP; reduce expiry in production |
| Mombasa boundary check uses a demo polygon | May allow slightly out-of-area submissions | Document boundary source; acceptable for MVP |
| No HTTPS enforced in development | Man-in-the-middle in dev | Production deployments use HTTPS via Vercel/Render |
