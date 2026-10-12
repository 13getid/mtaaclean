# Research and Assumptions Document
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.2 (Phase 0 — Approved)
**Date:** October 2026

## Decisions Confirmed at Phase 0 Approval

| Decision | Choice | Notes |
|----------|--------|-------|
| Geographic boundary | Tudor Sub-county, Mombasa | Primary focus area; bounding polygon must be sourced and labelled as a demonstration boundary |
| Profile creation trigger | Clerk webhook → FastAPI → Supabase insert | Provides most control and clear server-side audit trail |
| Landing page photography | Abstract graphics (no real photography in MVP) | Avoids licensing risk; graphics will use the brand palette |

This document distinguishes between **verified facts**, **reasonable assumptions**, and **items that require field research or explicit approval** before implementation depends on them.

---

## 1. Verified Facts

| # | Fact | Source |
|---|------|--------|
| 1 | Mombasa County is a coastal county in Kenya; its approximate centre is at latitude -4.0435°, longitude 39.6682° | Standard geographic knowledge |
| 2 | Leaflet is a widely used, MIT-licensed JavaScript mapping library | leafletjs.com |
| 3 | OpenStreetMap tiles are available under the OpenStreetMap Tile Usage Policy; heavy or commercial use requires a different provider | openstreetmap.org/copyright |
| 4 | Supabase offers a PostgreSQL database with Row Level Security, Storage, and a free tier | supabase.com |
| 5 | Clerk offers user authentication with JWT issuance and a free tier | clerk.com |
| 6 | FastAPI is a Python web framework suitable for small REST APIs; it generates automatic OpenAPI documentation | fastapi.tiangolo.com |
| 7 | GADM (Global Administrative Areas) provides downloadable boundary data for Kenyan counties | gadm.org |
| 8 | The Kenyan government operates the Kenya Open Data Portal | opendata.go.ke |

---

## 2. Reasonable Assumptions (not verified but considered plausible)

| # | Assumption | Why assumed | Risk if wrong |
|---|-----------|------------|--------------|
| A1 | The Clerk free tier supports at least 10,000 monthly active users | Clerk's published pricing mentions a generous free tier | Very low: this is a student demo with <100 users |
| A2 | The Supabase free tier provides at least 500 MB of database storage and 1 GB of file storage | Supabase published pricing as of late 2025 | Low: reset the project if limits are reached |
| A3 | GADM Mombasa County boundary data, if used, accurately represents the administrative boundary | GADM is widely used in academic projects | Medium: boundary may not match official county limits; must be labelled as a demonstration boundary |
| A4 | A Clerk webhook can be used to create a Supabase profile on user registration | Common pattern documented in Clerk and Supabase docs | Low: alternative is a Supabase trigger or a frontend call on first login |
| A5 | React Leaflet is compatible with React 18 | Leaflet/React Leaflet documentation | Low: check version compatibility during Phase 4 |
| A6 | A single Render or Railway free-tier instance is sufficient to serve the FastAPI backend for a demonstration | Common student project deployment | Low: for demo purposes, single instance is fine |

---

## 3. Items Requiring Research or Approval (open questions)

| # | Question | Who resolves | Priority |
|---|---------|-------------|----------|
| R1 | **Mombasa County boundary source:** Which specific dataset will be used for the Mombasa County boundary polygon used in coordinate validation? GADM Level 1 Kenya data includes Mombasa County. The student must download, verify, and document the source before implementation. | Student + mentor | High (blocks Phase 4) |
| R2 | **Tile provider for production:** The OpenStreetMap tile usage policy prohibits heavy use without prior permission. For a public-facing demo, should we use Stadia Maps (free tier) or another provider? This must be decided before deployment. | Student | Medium (blocks Phase 8) |
| R3 | **Photography for landing page:** Will the student photograph the Mombasa environment themselves, or use a licensed stock image service? A specific image must be identified before the landing page is finalized. | Student | Medium (blocks Phase 1 polish) |
| R4 | **University AI acknowledgement policy:** The student must check their university's current policy on acknowledging AI assistance in the final project report and submission. | Student | High (academic integrity) |
| R5 | **Ethical approval for usability testing:** If the student intends to conduct usability testing with participants (Phase 7 optional), does their university require ethical approval for this? | Student + supervisor | Medium (blocks Phase 7 usability test) |
| R6 | **Formal affiliation disclaimer:** Has any formal permission been sought from Mombasa County Government? If not, the system must prominently state that it is not affiliated with or endorsed by any government body. This disclaimer must appear on the landing page and in the project report. | Student | High |
| R7 | **Ward/area names for Mombasa:** Are the area names used in the application (e.g., "Nyali", "Likoni", "Kisauni") based on verified administrative data or are they approximations? This affects the label used in the UI and the project documentation. | Student | Low (use well-known names but label as demonstration) |

---

## 4. Design Assumptions

| # | Assumption | Notes |
|---|-----------|-------|
| D1 | The neo-brutalism visual style is appropriate for a civic reporting tool aimed at Kenyan residents | This is a design hypothesis; usability testing (Phase 7) may surface feedback |
| D2 | English is the primary language of the interface | Swahili localisation is out of scope for the MVP; this must be noted as a limitation |
| D3 | Residents have access to a smartphone or laptop with a modern browser | The system does not need to support feature phones or SMS interfaces in the MVP |
| D4 | A resident submitting a report can upload a photograph from their device's camera or gallery | Standard file input behaviour on mobile browsers; no native camera API is needed |

---

## 5. Technology Assumptions

| # | Assumption | Notes |
|---|-----------|-------|
| T1 | Clerk's JWT template can be configured to include the user's `role` as a custom claim | This is a standard Clerk feature; verify during Phase 2 |
| T2 | Supabase's JWT verification works correctly with Clerk's JWKS URL | This must be tested at the start of Phase 2 before any feature depends on it |
| T3 | PostGIS is not available on Supabase free tier by default | Supabase does enable PostGIS extensions; verify availability. If available, use `ST_Within` for coordinate validation instead of the Python GeoJSON approach |
| T4 | React Hook Form with Zod is sufficient for all form validation needs | Standard approach; no known issues |

---

## 6. Explicitly Excluded Claims

The following claims must **not** be made in the project report, application UI, or demonstration:

- "MtaaClean is used by Mombasa County Government."
- "MtaaClean has reduced illegal dumping by X%."
- "MtaaClean serves Y residents."
- Any statistics about real-world impact without actual deployment and evaluation data.
- Any official government partnership or endorsement.
- Any claim that the geographic boundary data is the official Mombasa County boundary unless verified from the official government GIS office.

---

## 7. Revision History

| Date | Change | Author |
|------|--------|--------|
| October 2026 | Initial draft created in Phase 0 | AI-assisted |
