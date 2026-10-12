# Product Requirements Document (PRD)
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026
**Author:** Final-Year IT Student Project
**Status:** Draft — awaiting review

---

## 1. Project Overview and Problem Statement

Illegal dumping and uncollected waste are persistent public health and environmental problems in urban areas including Mombasa, Kenya. Residents frequently observe waste accumulation but have no clear, accessible channel to report it to responsible authorities. When reports do occur — typically by phone or in-person — there is no systematic way to track whether the issue has been reviewed, assigned, or resolved.

**MtaaClean Mombasa** is a web-based incident reporting and tracking system designed to give residents a simple way to submit waste-related reports (including a photograph and a map location), and to give authorized staff a structured workflow for reviewing, assigning, and resolving those reports.

The system aims to demonstrate how a digital reporting workflow can improve visibility, accountability, and follow-up for waste-related incidents. It is a final-year student project and is **not** officially affiliated with Mombasa County Government or any waste-management organization.

---

## 2. Target Users and Their Needs

### 2.1 Residents
Residents are members of the public in or near Mombasa County who observe waste-related problems.

**Needs:**
- A quick, low-friction way to report an incident with a photo and location.
- Confidence that their report has been received and is being actioned.
- The ability to check the current status of their own reports.
- Privacy — their personal details must not be exposed to other users or the public.

### 2.2 Authorized Staff
Staff are individuals granted operational access by an administrator. They may be responsible for reviewing, assigning, and progressing reports.

**Needs:**
- A clear queue of incoming reports with key details (location, photo, description).
- Filters for status, area, and date so they can prioritize work.
- The ability to assign a report to a specific team or staff member.
- The ability to update a report's status and add progress notes.
- The ability to record resolution evidence (e.g., an after-cleanup photograph).

### 2.3 Administrator
The administrator manages system access and monitors overall activity.

**Needs:**
- The ability to view registered users and their roles.
- The ability to grant or revoke staff access.
- A high-level view of system-wide activity and report volumes.
- An audit trail of important system events.

---

## 3. Project Objectives

1. Provide residents with a simple, accessible web interface for submitting waste incident reports.
2. Enable authorized staff to manage a structured report-review-and-resolution workflow.
3. Display reports on an interactive map focused exclusively on Mombasa County.
4. Enforce role-based access control so that residents, staff, and administrators have clearly separated permissions.
5. Maintain an audit trail of important status changes.
6. Produce a well-documented, testable application suitable for a final-year project demonstration.

---

## 4. Scope and Non-Goals

### 4.1 In Scope (MVP)

| # | Feature |
|---|---------|
| 1 | Resident registration and login (via Clerk) |
| 2 | Submission of a waste incident report |
| 3 | Photograph upload as supporting evidence |
| 4 | Map-based location selection (Mombasa County) |
| 5 | Resident report-status tracking |
| 6 | Staff dashboard for reviewing and updating reports |
| 7 | Assignment of a report to a staff member or team |
| 8 | Completion notes and optional after-cleanup photo upload |
| 9 | Public/resident map of reports within Mombasa |
| 10 | Simple dashboard with report counts by status, area, and date |
| 11 | Basic search and filtering |
| 12 | Audit trail for important status changes |

### 4.2 Explicitly Out of Scope (MVP)

- AI-powered image recognition or automatic waste classification.
- IoT sensors, smart bins, or GPS truck tracking.
- Route optimization.
- M-Pesa or other payment integration.
- Real-time chat or messaging.
- Native Android or iOS application.
- Multi-county or nationwide deployment.
- Microservices or distributed architecture.

These may be discussed as future improvements in the project report but will not be implemented.

---

## 5. Functional Requirements

### 5.1 Authentication and User Management
- FR-01: A visitor can register as a resident using email/password or a supported OAuth provider via Clerk.
- FR-02: A registered resident can log in and log out.
- FR-03: The system supports three roles: `resident`, `staff`, `admin`.
- FR-04: Role assignment is controlled by an administrator and cannot be self-assigned.
- FR-05: Protected routes and API endpoints check the user's role before granting access.

### 5.2 Report Submission
- FR-06: An authenticated resident can submit a new waste incident report.
- FR-07: A report must include: a description (minimum 20 characters), a location (lat/lng within Mombasa County), and at least one photograph.
- FR-08: Submitted coordinates are validated against a Mombasa County bounding polygon on the server side.
- FR-09: Photographs are stored in Supabase Storage. The database stores only the storage reference, not the raw binary.
- FR-10: A newly submitted report receives the status `submitted`.

### 5.3 Report Tracking
- FR-11: A resident can view a list of their own reports and their current statuses.
- FR-12: A resident can view the detail page of one of their own reports, including status history.
- FR-13: A resident cannot view or modify another resident's reports.

### 5.4 Map Display
- FR-14: A map centred on Mombasa County is displayed on the landing page and on the report-tracking views.
- FR-15: The map displays approved/visible report markers filtered to Mombasa County.
- FR-16: Clicking a map marker shows a summary of the report (excluding the reporter's private details).
- FR-17: A resident selecting a location clicks on the map; the coordinates are captured and validated.

### 5.5 Staff Workflow
- FR-18: An authenticated staff member can view a list of all incoming reports.
- FR-19: Staff can filter reports by status, date range, and area.
- FR-20: Staff can update a report's status following the permitted transition table (see Section 7).
- FR-21: Staff can assign a report to a named staff member.
- FR-22: Staff can add progress notes and upload resolution evidence.
- FR-23: Staff cannot create reports on behalf of residents.

### 5.6 Administrator Functions
- FR-24: An administrator can view all users and their roles.
- FR-25: An administrator can grant or revoke the `staff` role.
- FR-26: An administrator can view audit logs.
- FR-27: An administrator cannot arbitrarily change report content.

### 5.7 Audit Trail
- FR-28: Every status transition records: previous status, new status, acting user ID, timestamp, and optional notes.
- FR-29: Selected administrative actions (role changes, deletions) are recorded in `audit_logs`.

---

## 6. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | The application must be usable on modern desktop and mobile browsers without a native app. |
| NFR-02 | Page load times for the main resident views should be acceptable on a typical Kenyan mobile broadband connection (target < 5 s on first load). |
| NFR-03 | All authenticated API requests must carry a verified Clerk JWT. The backend must validate the token on every protected request. |
| NFR-04 | No secret keys or service-role keys may appear in frontend environment variables. |
| NFR-05 | Supabase Row Level Security policies must prevent residents from reading or writing other residents' data, even if the frontend is bypassed. |
| NFR-06 | Uploaded photographs must be stored in a Supabase Storage bucket with appropriate access policies. |
| NFR-07 | The system must provide meaningful error messages for validation failures, network errors, and unauthorized actions. |
| NFR-08 | The interface must meet WCAG 2.1 AA colour-contrast requirements and support keyboard navigation. |
| NFR-09 | The application must be deployable from a single repository by following the documented setup steps. |

---

## 7. User Stories and Acceptance Criteria

### Resident

**US-01 — Submit a report**
> As a resident, I want to submit a waste incident report with a photo and location so that authorities can be informed of the problem.

*Acceptance criteria:*
- I can fill in a description, upload a photo, and select a point on the Mombasa map.
- Submitting with missing or invalid fields shows a clear error message.
- A successful submission shows a confirmation message and the report appears in "My Reports" with status `Submitted`.

**US-02 — Track my report**
> As a resident, I want to see the current status of my reports and a history of status changes so that I know whether my report has been acted on.

*Acceptance criteria:*
- "My Reports" lists all my submitted reports with their current status and submission date.
- Clicking a report shows its full details and a timeline of status changes.
- I cannot see another resident's report details.

**US-03 — View reports on a map**
> As a resident, I want to see where other waste incidents have been reported so that I understand the problem in my area.

*Acceptance criteria:*
- A map centred on Mombasa shows markers for publicly visible reports.
- Clicking a marker shows the report type and status without revealing the reporter's identity.
- The map does not display markers outside Mombasa County.

### Staff

**US-04 — Review incoming reports**
> As a staff member, I want to see a list of all submitted reports, filtered by status and date, so that I can prioritize my work.

*Acceptance criteria:*
- The staff dashboard shows all reports with at minimum: ID, description snippet, area, status, and submission date.
- I can filter by one or more statuses and a date range.
- Reports load within a reasonable time even with a large dataset.

**US-05 — Assign and update a report**
> As a staff member, I want to assign a report to a team member and update its status as work progresses.

*Acceptance criteria:*
- I can select a responsible staff member from a list.
- Saving the assignment transitions the status to `Assigned`.
- I can later update the status to `In Progress` and add notes.
- I cannot skip a non-permitted transition (e.g., directly from `Submitted` to `Resolved`).

**US-06 — Resolve a report**
> As a staff member, I want to mark a report as resolved and optionally upload an after-cleanup photograph.

*Acceptance criteria:*
- I can add resolution notes and optionally upload a photo before marking as `Resolved`.
- The resolution timestamp and actor are recorded in the status history.

### Administrator

**US-07 — Manage staff access**
> As an administrator, I want to grant or revoke the staff role for users so that I can control who can manage reports.

*Acceptance criteria:*
- I can search for a user and assign or remove the `staff` role.
- Role changes are recorded in the audit log.
- A user cannot grant themselves the `staff` role through the UI or the API.

---

## 8. MVP Success Metrics

These metrics define whether the MVP has achieved its goals. Since this is a student project without a production deployment, metrics are verified through demonstration and testing rather than real usage data.

| Metric | Target for MVP |
|--------|---------------|
| A resident can submit a complete report (description + photo + location) | ✅ Demonstrated end-to-end |
| A staff member can review, assign, and resolve the report | ✅ Demonstrated end-to-end |
| Status history is recorded and visible | ✅ At least 3 transitions visible in the UI |
| Map displays reports within Mombasa County only | ✅ Out-of-area coordinates rejected by the server |
| A resident cannot access another resident's report data | ✅ Verified by direct API test |
| Photo upload and retrieval work | ✅ Demonstrated with a real image file |
| The application is deployable from the README instructions | ✅ Successfully deployed by following the guide |

---

## 9. Risks, Assumptions, and Limitations

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Clerk–Supabase JWT integration is more complex than expected | Medium | High | Prototype and test in Phase 2 before building features that depend on it |
| Leaflet map performance on low-end mobile devices | Low | Medium | Limit the number of markers shown at one time; cluster if needed |
| Photo upload file sizes affecting storage costs | Low | Low | Enforce a 5 MB per-photo limit on the client and server |
| Geographic boundary data for Mombasa County may not be authoritative | Medium | Medium | Use a clearly labelled demonstration boundary; document the source |
| Scope creep from adding features beyond the MVP | Medium | High | Refer back to this document; any scope change requires explicit approval |

### Assumptions

- The application will be demonstrated in a controlled environment, not deployed at scale.
- Clerk's free tier is sufficient for the number of test users required.
- Supabase's free tier storage and database limits are sufficient for the MVP.
- The tile provider (OpenStreetMap / equivalent) is used within its acceptable-use policy.
- A single FastAPI backend instance is sufficient; no horizontal scaling is needed.

### Limitations

- The system does not guarantee real-time notification to residents when their report status changes (email notifications are out of scope for the MVP).
- Duplicate detection is best-effort; it does not guarantee perfect deduplication.
- The geographic boundary used for Mombasa County is a demonstration boundary; it may not match official county limits precisely.
- The system is not affiliated with or endorsed by any government body.
