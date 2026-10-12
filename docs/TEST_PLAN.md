# Test Plan
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026

---

## 1. Testing Objectives

This document defines the manual and automated tests that will be used to verify:
1. Correct functionality of each user-facing feature.
2. Correct enforcement of role-based access control.
3. Security boundaries (data isolation, server-side validation).
4. Usability across screen sizes.
5. Accessibility of key pages.

---

## 2. Test Categories

| Category | Method | Phase |
|----------|--------|-------|
| UI component unit tests | Vitest + React Testing Library | 1–6 |
| Backend unit tests | pytest | 2–5 |
| Manual functional tests | Browser testing per test case below | 1–6 |
| Security boundary tests | Manual API and browser tests | 2–5 |
| Accessibility audit | Browser axe extension | 6 |
| Responsive layout tests | Browser DevTools device emulation | 1–6 |

---

## 3. Test Environment

- **Development:** `http://localhost:5173` (frontend) + `http://localhost:8000` (FastAPI)
- **Test database:** Supabase project (separate from any future production project)
- **Test users:** At minimum three accounts: one resident, one staff, one admin

---

## 4. Functional Test Cases

### 4.1 Authentication

| ID | Description | Steps | Expected result |
|----|-------------|-------|----------------|
| AUTH-01 | New user registration | Click Sign Up, enter valid email/password, confirm | Account created; profile row exists in `profiles`; redirect to resident dashboard |
| AUTH-02 | Duplicate email registration | Attempt to register with an already-used email | Clerk shows error; no duplicate profile |
| AUTH-03 | Login | Enter valid credentials | Redirected to dashboard |
| AUTH-04 | Failed login | Enter wrong password | Clerk shows error; no redirect |
| AUTH-05 | Logout | Click logout | Session cleared; redirect to landing page |
| AUTH-06 | Access protected route while logged out | Visit `/reports/new` without being logged in | Redirect to sign-in page |

### 4.2 Report Submission

| ID | Description | Steps | Expected result |
|----|-------------|-------|----------------|
| REP-01 | Successful report submission | Log in as resident; fill all fields; submit | Report appears in My Reports with status `Submitted`; confirmation shown |
| REP-02 | Missing description | Submit without entering description | Inline error: "Description is required" |
| REP-03 | Description too short | Enter 5-character description; submit | Error: "Description must be at least 20 characters" |
| REP-04 | Missing photo | Submit without uploading a photo | Error: "At least one photograph is required" |
| REP-05 | Invalid photo type | Upload a PDF file | Error: "File must be a JPG, PNG, or WebP image" |
| REP-06 | Photo too large | Upload a 10 MB image | Error: "File must be under 5 MB" |
| REP-07 | Missing location | Submit without selecting a map location | Error: "A location within Mombasa County must be selected" |
| REP-08 | Out-of-area location | Manually enter coordinates for Nairobi; submit | Server returns error: "Location must be within Mombasa County" |
| REP-09 | Valid in-area location | Click within the Mombasa map boundary | Coordinates captured and accepted |

### 4.3 Report Tracking

| ID | Description | Steps | Expected result |
|----|-------------|-------|----------------|
| TRK-01 | View My Reports | Log in as resident; go to My Reports | List shows own reports only |
| TRK-02 | View report detail | Click a report in My Reports | Detail page shows description, photos, location, current status |
| TRK-03 | View status history | Open a report that has had status changes | Timeline shows each change with actor and timestamp |
| TRK-04 | Access another user's report by URL | Log in as Resident A; manually navigate to a report ID belonging to Resident B | 404 page or empty result; report data not shown |
| TRK-05 | Empty state | Log in as a new resident with no reports | My Reports shows empty state message and CTA |

### 4.4 Staff Workflow

| ID | Description | Steps | Expected result |
|----|-------------|-------|----------------|
| STAFF-01 | View all reports | Log in as staff; open Staff Dashboard | All reports visible |
| STAFF-02 | Filter by status | Apply filter: status = "Submitted" | Only submitted reports shown |
| STAFF-03 | Filter by date | Apply date range filter | Only reports within range shown |
| STAFF-04 | Mark Under Review | Open a Submitted report; click "Mark Under Review" | Status changes to Under Review; status_history updated |
| STAFF-05 | Assign a report | Open an Under Review report; select a staff member; save | Status changes to Assigned; assignment record created |
| STAFF-06 | Mark In Progress | Open an Assigned report; click "Mark In Progress" | Status changes to In Progress |
| STAFF-07 | Resolve a report | Open In Progress report; add notes; click "Mark Resolved" | Status changes to Resolved; resolution notes saved |
| STAFF-08 | Reject a report | Open any non-resolved report; click Reject; enter reason | Status changes to Rejected; reason stored and visible to resident |
| STAFF-09 | Invalid transition | Attempt to go from Submitted directly to Resolved | Server returns error; status unchanged |
| STAFF-10 | Reject without reason | Attempt to reject without entering a reason | Validation error; action not performed |

### 4.5 Map

| ID | Description | Steps | Expected result |
|----|-------------|-------|----------------|
| MAP-01 | Map loads | Open the landing page or map page | Leaflet map renders centred on Mombasa |
| MAP-02 | Report markers shown | Submit a report; view map | Marker appears at correct location |
| MAP-03 | Marker popup | Click a map marker | Popup shows: report type, status, area — no private data |
| MAP-04 | Map viewport restriction | Attempt to pan the map far outside Mombasa | Map pans but location picker rejects out-of-area coordinates |

### 4.6 Admin Area

| ID | Description | Steps | Expected result |
|----|-------------|-------|----------------|
| ADMIN-01 | View users | Log in as admin; open Admin Area | User list visible with roles |
| ADMIN-02 | Grant staff role | Select a resident; click "Grant Staff Access" | Role changes to staff; audit log entry created |
| ADMIN-03 | Revoke staff role | Select a staff member; click "Revoke Staff Access" | Role changes to resident; audit log entry created |
| ADMIN-04 | Self-promotion attempt | Log in as resident; attempt POST /api/admin/grant-role with own ID | 403 Forbidden |
| ADMIN-05 | View audit log | Open Audit Log in Admin Area | Log entries visible; sorted newest first |

---

## 5. Security Boundary Tests

| ID | Description | Expected result |
|----|-------------|----------------|
| SEC-01 | Resident accesses staff route | 403 or redirect |
| SEC-02 | Resident reads another resident's report via API | 404 or empty array |
| SEC-03 | Resident updates a report status via direct API call | 403 |
| SEC-04 | Unauthenticated request to protected API endpoint | 401 |
| SEC-05 | Expired JWT presented to FastAPI | 401 |
| SEC-06 | Out-of-area coordinates submitted via API (bypassing frontend) | 422 with clear error |
| SEC-07 | Resident submits a report for another user ID | Server uses authenticated user's ID; the submitted `reporter_id` is ignored |
| SEC-08 | No service-role key in browser network requests | Inspect all XHR/Fetch requests; confirm no `service_role` key present |

---

## 6. Accessibility Tests

Run the axe browser extension on each of these pages and fix all critical and serious violations:

- Landing page
- New Report form
- My Reports list
- Report detail page
- Staff Dashboard
- Staff report detail

Specific checks:
- All form inputs have labels.
- Error messages are associated with their inputs.
- Colour contrast passes on all text.
- All interactive elements are keyboard reachable.
- Focus order is logical.

---

## 7. Responsive Layout Tests

Test each of the following pages at these widths using browser DevTools:

| Width | Represents |
|-------|-----------|
| 375px | Small mobile (iPhone SE) |
| 390px | Modern mobile (iPhone 14) |
| 768px | Tablet (iPad portrait) |
| 1024px | Small laptop |
| 1280px | Desktop |

Pages: Landing, My Reports, New Report, Staff Dashboard, Admin Area.

---

## 8. Test Evidence

After completing testing in Phase 7, record results in a separate test evidence document:
- Screenshot or description of each test case result.
- List of bugs found and their resolution status.
- List of known limitations that were not fixed and the reason.
