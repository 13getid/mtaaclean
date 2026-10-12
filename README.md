# MtaaClean Mombasa

**A Waste Collection and Illegal Dumping Reporting System for Mombasa County, Kenya**



## Project Overview

MtaaClean  is a web-based incident reporting and tracking system that enables residents to report waste-related problems — illegal dumping, overflowing bins, uncollected waste — by submitting a description, photograph, and map location. Authorized staff can review, assign, and resolve reports through a dedicated dashboard.

The system demonstrates how a digital reporting workflow can improve visibility, accountability, and follow-up for waste-related incidents at the local level.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Authentication | Clerk |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Backend API | FastAPI (Python 3.11+) |
| Maps | Leaflet + React Leaflet |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |

---

## Project Structure

```
mtaaclean-mombasa/
├── src/                    # React frontend
│   ├── components/         # Shared UI components
│   ├── features/           # Feature-oriented modules (reports, map, dashboard)
│   ├── pages/              # Top-level page components
│   ├── lib/                # Supabase client, constants, helpers
│   ├── hooks/              # Shared custom hooks
│   ├── types/              # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── backend/                # FastAPI backend
│   └── app/
│       ├── main.py
│       ├── auth.py
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── data/           # GeoJSON boundary file
│       └── migrations/     # SQL migration files
├── docs/                   # Project documentation
│   ├── PRD.md
│   ├── TRD.md
│   ├── APP_FLOW.md
│   ├── UI_UX_DESIGN_BRIEF.md
│   ├── backend_schema.md
│   ├── TEST_PLAN.md
│   ├── SECURITY_AND_PRIVACY.md
│   └── RESEARCH_AND_ASSUMPTIONS.md
├── implementation_plan.md  # Phase-by-phase development checklist
├── .env.example            # Environment variable template
├── .gitignore
└── README.md               # This file
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product requirements, user stories, MVP success criteria |
| [TRD](docs/TRD.md) | Technical stack, architecture, API responsibilities, security |
| [APP_FLOW](docs/APP_FLOW.md) | User flows with Mermaid diagrams |
| [UI/UX Design Brief](docs/UI_UX_DESIGN_BRIEF.md) | Visual direction, colour palette, layout descriptions |
| [Backend Schema](docs/backend_schema.md) | Database tables, RLS policies, ER diagram |
| [Test Plan](docs/TEST_PLAN.md) | Functional, security, accessibility, and responsive tests |
| [Security & Privacy](docs/SECURITY_AND_PRIVACY.md) | Security model, data privacy, known limitations |
| [Research & Assumptions](docs/RESEARCH_AND_ASSUMPTIONS.md) | Verified facts, assumptions, open questions |
| [Implementation Plan](implementation_plan.md) | Phase-by-phase development checklist |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- A [Clerk](https://clerk.com) account
- A [Supabase](https://supabase.com) project

### Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `backend/.env` (backend), then fill in your keys:

```bash
cp .env.example .env.local
cp .env.example backend/.env
```

See `.env.example` for descriptions of each variable.

### Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API runs at `http://localhost:8000`. OpenAPI docs at `http://localhost:8000/docs`.

### Database Setup

Apply migrations in order using the Supabase SQL Editor or Supabase CLI:

```
backend/app/migrations/001_create_profiles.sql
backend/app/migrations/002_create_reports.sql
...
backend/app/migrations/009_create_rls_policies.sql
```

See [Backend Schema](docs/backend_schema.md) for full details.

---

## Development Phases

See [Implementation Plan](implementation_plan.md) for the complete phase checklist.

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Planning and documentation | 🔄 In Progress |
| 1 | Frontend foundation (landing page, design system) | ⬜ Not Started |
| 2 | Authentication and permissions | ⬜ Not Started |
| 3 | Report submission | ⬜ Not Started |
| 4 | Map and geographic restrictions | ⬜ Not Started |
| 5 | Staff workflow | ⬜ Not Started |
| 6 | Dashboard and polish | ⬜ Not Started |
| 7 | Testing and evaluation | ⬜ Not Started |
| 8 | Deployment and presentation | ⬜ Not Started |

---

## Roles

| Role | Description |
|------|-------------|
| Resident | Submits reports; views own reports; tracks status |
| Staff | Reviews reports; assigns; updates status; resolves |
| Administrator | Manages users; grants/revokes staff access; views audit log |

---

## Report Lifecycle

```
Submitted → Under Review → Assigned → In Progress → Resolved
                                    ↘ (directly) ↗
Any status → Rejected (staff/admin only, reason required)
```

---

## Disclaimer

This is an academic project. It is not affiliated with, endorsed by, or connected to Mombasa County Government or any other government or waste management authority. All demonstration data used in the application is fictional. Statistics shown in the application are labelled as demonstration data unless they are derived from real usage.

---


