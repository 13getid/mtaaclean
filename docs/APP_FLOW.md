# App Flow Document
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026

---

## 1. Public Visitor Flow

```mermaid
flowchart TD
    A[User opens mtaaclean.app] --> B[Landing page loads]
    B --> C{User action?}
    C -- "Browse map" --> D[Scroll to map preview section]
    C -- "Learn how it works" --> E[Read how-it-works section]
    C -- "Report Waste CTA" --> F{Logged in?}
    C -- "Track a report" --> F
    F -- "No" --> G[Clerk sign-in / sign-up modal]
    G --> H[Registration / Login]
    H --> I[Redirect to Resident Dashboard]
    F -- "Yes" --> I
    D --> C
    E --> C
```

---

## 2. Resident Registration and Login Flow

```mermaid
flowchart TD
    A[Click 'Sign Up'] --> B[Clerk sign-up form]
    B --> C[Enter email and password OR use OAuth]
    C --> D[Clerk verifies email if required]
    D --> E[Clerk issues JWT]
    E --> F[FastAPI webhook OR Supabase trigger creates profile record]
    F --> G[Profile stored: clerk_user_id, role='resident']
    G --> H[Resident Dashboard shown]
    
    A2[Returning user: click 'Log In'] --> B2[Clerk sign-in form]
    B2 --> C2[Credentials verified by Clerk]
    C2 --> E
```

> **Note:** The profile creation trigger must be tested carefully in Phase 2. If a profile already exists for the `clerk_user_id`, the operation must be idempotent (no duplicate insert).

---

## 3. Report Submission Flow

```mermaid
flowchart TD
    A[Resident clicks 'Report Waste'] --> B[New Report form page]
    B --> C[Step 1: Enter description min 20 chars]
    C --> D[Step 2: Upload photograph]
    D --> E{Valid file? ≤ 5 MB, image type}
    E -- "No" --> F[Show validation error]
    F --> D
    E -- "Yes" --> G[Photo staged for upload]
    G --> H[Step 3: Select location on map]
    H --> I[Click on Mombasa map]
    I --> J[Coordinates captured]
    J --> K{Server-side: within Mombasa County boundary?}
    K -- "No" --> L[Show 'Location must be within Mombasa County']
    L --> H
    K -- "Yes" --> M[Location confirmed]
    M --> N[Review and submit]
    N --> O[Client uploads photo to Supabase Storage]
    O --> P{Upload successful?}
    P -- "No" --> Q[Show upload error; allow retry]
    Q --> O
    P -- "Yes" --> R[Client sends report data + photo path to FastAPI]
    R --> S[FastAPI validates JWT, validates coordinates, writes report record]
    S --> T{Write successful?}
    T -- "No" --> U[Show generic error; preserve form state]
    T -- "Yes" --> V[Show success confirmation with report ID]
    V --> W[Redirect to My Reports]
```

---

## 4. Photo Upload Flow

```mermaid
flowchart TD
    A[User selects file] --> B{Client validation}
    B -- "Invalid type or > 5 MB" --> C[Inline error: 'Image must be JPG, PNG or WEBP under 5 MB']
    B -- "Valid" --> D[Preview shown in form]
    D --> E[On form submit: upload to Supabase Storage]
    E --> F[Storage path returned: report-photos/clerk_user_id/timestamp_filename.jpg]
    F --> G[Path included in FastAPI report creation payload]
    G --> H[FastAPI stores path in report_photos table]
    H --> I[Photo retrievable via signed URL for authorized users]
```

---

## 5. Report Tracking Flow (Resident)

```mermaid
flowchart TD
    A[Resident opens 'My Reports'] --> B[Fetch reports WHERE reporter_id = current user]
    B --> C{Any reports?}
    C -- "No" --> D[Empty state: 'You haven't reported any issues yet. Report one now.']
    C -- "Yes" --> E[Report list: ID, description snippet, area, status badge, date]
    E --> F[Resident clicks a report]
    F --> G[Report detail page]
    G --> H[Show: description, photos, location on mini-map, current status]
    G --> I[Show: status history timeline - who changed what and when]
    I --> J{Status = Resolved?}
    J -- "Yes" --> K[Show resolution notes and after-cleanup photo if present]
    J -- "No" --> L[Show current status explanation]
```

---

## 6. Staff Review and Assignment Flow

```mermaid
flowchart TD
    A[Staff member logs in] --> B[Staff Dashboard]
    B --> C[Report queue: all reports, newest first]
    C --> D[Apply filters: status / date range / area]
    D --> E[Click on a report]
    E --> F[Report detail panel]
    F --> G{Current status?}
    G -- "submitted" --> H[Button: 'Mark Under Review']
    H --> I[FastAPI: validate transition submitted → under_review]
    I --> J[Status updated; status_history record written]
    G -- "under_review" --> K[Assignment form: select staff member]
    K --> L[FastAPI: validate transition; write assignment record]
    L --> M[Status → assigned]
    G -- "assigned" --> N[Button: 'Mark In Progress']
    N --> O[FastAPI: validate; status → in_progress]
    G -- "in_progress" --> P[Resolution form: notes + optional after photo]
    P --> Q[FastAPI: validate; status → resolved]
    G -- "Any" --> R[Button: 'Reject']
    R --> S[Rejection reason form]
    S --> T[FastAPI: validate; status → rejected; reason stored]
```

---

## 7. Cleanup Progress and Resolution Flow

```mermaid
flowchart TD
    A[Report in 'In Progress'] --> B[Staff opens report detail]
    B --> C[Clicks 'Mark as Resolved']
    C --> D[Resolution modal opens]
    D --> E[Enter resolution notes required]
    E --> F[Optionally upload after-cleanup photo]
    F --> G[Submit]
    G --> H[Client uploads after photo to Storage if provided]
    H --> I[FastAPI receives resolution request]
    I --> J[Validates JWT and role]
    J --> K[Validates transition: in_progress → resolved OR assigned → resolved]
    K --> L[Writes status_history: resolved, actor, timestamp, notes]
    L --> M[Updates report.status = 'resolved']
    M --> N[Resident can now see 'Resolved' status and resolution notes]
```

---

## 8. Administrator Flow

```mermaid
flowchart TD
    A[Admin logs in] --> B[Admin Area]
    B --> C{Admin action?}
    C -- "View users" --> D[User list with roles]
    D --> E[Search by name or email]
    E --> F[Select user]
    F --> G{Current role?}
    G -- "resident" --> H[Button: 'Grant Staff Access']
    H --> I[FastAPI: verify admin JWT; call Clerk Management API; update profiles.role]
    I --> J[Audit log: role granted, admin ID, timestamp]
    G -- "staff" --> K[Button: 'Revoke Staff Access']
    K --> L[FastAPI: same; role → resident]
    L --> J
    C -- "View audit logs" --> M[Audit log table with filters]
    C -- "System summary" --> N[Report count by status, total users, recent activity]
```

---

## 9. Authentication and Authorization Failure Flows

```mermaid
flowchart TD
    A[User visits protected route] --> B{Has valid Clerk JWT?}
    B -- "No" --> C[React Router redirects to /sign-in]
    C --> D[After login, redirect back to original URL]
    B -- "Yes" --> E{Has required role?}
    E -- "No" --> F[403 page: 'You do not have permission to view this page']
    F --> G[Link back to resident dashboard]
    E -- "Yes" --> H[Page rendered]

    A2[API request with invalid/expired JWT] --> I[FastAPI returns 401 Unauthorized]
    I --> J[React client shows 'Session expired — please log in again']
    J --> K[Redirect to sign-in]

    A3[Resident tries to access another resident's report URL directly] --> L[Supabase RLS returns empty result]
    L --> M[404 page shown]
```

---

## 10. Empty, Loading, Error, and Success States

### Loading states
- Skeleton loaders are shown for report lists and map markers while data fetches.
- The Submit button shows a spinner and is disabled during form submission.
- The photo upload area shows a progress indicator.

### Empty states
- **My Reports (no reports):** Illustration + message: *"You haven't reported any issues yet."* + prominent "Report Waste" button.
- **Staff queue (no results matching filters):** *"No reports match your current filters. Try adjusting the date range or status."*
- **Map (no markers in view):** No explicit empty state needed — the map is still useful.

### Error states
- **Network error during data fetch:** *"Something went wrong. Please check your connection and try again."* with a Retry button.
- **Photo upload failure:** *"The photo could not be uploaded. Please try again."* Form state is preserved.
- **Out-of-area location:** *"The selected location is outside Mombasa County. Please select a location within the county boundary."*
- **Invalid status transition (API error):** *"This action cannot be performed in the current report status."*
- **403 Forbidden:** *"You don't have permission to do that."*

### Success states
- **Report submitted:** Green confirmation banner + Report ID + link to My Reports.
- **Status updated (staff):** Inline success message + status badge updates immediately.
- **Role granted/revoked (admin):** Toast notification + user record updates in the list.
