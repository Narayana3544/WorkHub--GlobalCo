# WorkHub

**A calm, accountability-first work management platform for MSMEs.**
Jira-style execution + document management + leave management + performance reviews, in one role-aware portal — without enterprise complexity or enterprise pricing.

Full scope, delivered-vs-deferred breakdown, and roadmap: see [`WorkHub_PRD_v2.md`](./WorkHub_PRD_v2.md).

---

## 🚀 Live Demo

| | URL |
|---|---|
| **Frontend** | [work-hub-global-co.vercel.app](https://work-hub-global-co.vercel.app) |
| **Backend API** | [reasonable-presence-production-599b.up.railway.app](https://reasonable-presence-production-599b.up.railway.app) |

### Demo Credentials

| Field | Value |
|-------|-------|
| Email | `admin@workhub.com` |
| Password | `Admin@123` |
| Role | ADMIN |
| Organization | GlobalCo |

> **First-time setup:** If the database has been reset, register a new account via the **Create Account** tab on the login page. The first user registered in an organization is automatically assigned the **ADMIN** role.

---

## Why WorkHub Exists (Business Value)

Most MSMEs run their operations on a patchwork of spreadsheets, WhatsApp groups, and email threads — leave requests get lost, task ownership is unclear, and there's no single source of truth for "who did what." Enterprise tools (Jira, BambooHR, Lattice) solve this but are priced and configured for companies 10x the size, with onboarding overhead an MSME can't absorb.

WorkHub's bet: **one login, one portal, four things an MSME actually needs day-to-day** — task execution, documents, leave, and performance — with just enough structure to create accountability, and not one screen more.

## User POV ↔ Business POV Alignment

Every module is designed to give the end user something they want *and* the business something it needs, at the same time — not as a trade-off.

| Module | What the user gets | What the business gets |
|---|---|---|
| Kanban Board | A focused, uncluttered view of "what's mine, what's next" | Real-time visibility into work distribution and bottlenecks, without a manager having to ask |
| Documents | One place to find their own files, no more digging through email | A defensible record of who uploaded/owns what, with access control instead of shared drives |
| Leave Management | Self-service request + status tracking, no chasing a manager over WhatsApp | An approval trail with self-approval blocked by design — audit-safe by default |
| Performance Reviews | Visibility into their own review history in one place | Structured, dated records instead of scattered notes — useful the moment there's a dispute |
| RBAC / Admin | Employees never see controls that aren't theirs — less confusion, less risk of mistakes | Admin can change *who can do what* without a code deployment |

## Getting Started (Easy Usage)

1. Log in with your email and password (no OTP step — kept deliberately frictionless for v1; see PRD roadmap for when this changes).
2. You land on your **Kanban board** — your assigned work, nothing else, by default.
3. Your avatar (top right) → **Profile** for your details and documents.
4. **Leave** and **Performance** are reachable from the sidebar, scoped to what your role can see.
5. Managers and Admins see additional queues (approvals, permissions) — everyone else never sees a control they can't use, by design, not just by convention.

## Error Handling Philosophy

A generic "Something went wrong" is a support ticket waiting to happen. WorkHub returns structured errors from the API — `{ code, message, field }` — and the frontend maps them to specific, actionable copy:

- **Validation errors** surface inline, on the exact field, not as a toast disconnected from the form.
- **Permission errors (403)** say *"You don't have permission to do this — contact your Admin,"* not a raw HTTP status.
- **Expired session** triggers a silent token refresh first; only shows a login prompt if the refresh itself fails.
- **File upload errors** (wrong type, too large) are caught client-side before the request fires, so the user isn't waiting on a round-trip to find out.
- **Network/offline** state is distinguished from a real server error, so users aren't told "leave request failed" when it was actually their wifi.

## Reports & Dashboards — Known Gap

The original PRD scoped per-role dashboards (Employee sprint progress, Team Lead burndown, Manager cross-project health, Admin org analytics). **All the underlying data already exists** — every module is org-scoped and queryable — but the dashboard/reporting layer itself has not been built yet. This is the single most visible gap between "the data is there" and "the business value is visible," and it's the first item scheduled in the v1.1 roadmap rather than something left open-ended. See the PRD for the full deferred-items table.

## What's Unique Here

- **Tenant isolation by construction, not convention** — every query derives `org_id` from the authenticated token, never from client input. Tested with cross-org access attempts, not just assumed.
- **Master data is data, not code** — status/priority/leave-type dropdowns live in the database and are Admin-editable. Changing a dropdown never requires a deploy.
- **Swappable file storage** — local disk today, S3 via a config change, because MSME customers grow and their storage needs shouldn't force a rewrite.
- **Role-aware interaction, not just role-aware visibility** — the Kanban board doesn't just hide buttons from Employees, it rejects an invalid drag at the interaction layer, with the same rule enforced again server-side.
- **Self-approval is structurally blocked** on leave requests — not a UI convention, a rule.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Security, JWT (`jjwt`), Flyway migrations, H2 (dev) / PostgreSQL (prod)
- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, dnd-kit, TanStack React Query, Axios
- **Design system:** Shared CSS custom properties (`--color-*`) for a single global theme across every screen, with light/dark mode support

## Known Trade-offs (v1, by design)

- JWT stored in `localStorage` for v1 build speed — httpOnly cookie migration is scoped for v1.1, noted here deliberately rather than left implicit.
- No OTP/email verification — kept out to reduce login friction for MSME users who are often non-technical; revisited only as an optional, not mandatory, feature in v3.

## What's Deferred (Not Missing — Scoped)

Team Lead & HR roles, timesheets, sprint planning/capacity tracking, immutable audit log UI, leave calendar view. Full rationale and target release for each is in the PRD's Section 4 and 6.

---

## Project Structure

This repository is organized as a **Monorepo**:

```
WorkHub--GlobalCo/
├── backend/          # Spring Boot 3 Java application (Maven)
├── frontend/         # React + TypeScript application (Vite)
├── uploads/          # Local file storage (dev only)
└── .github/workflows/ci.yml  # CI/CD pipeline
```

## CI/CD Pipeline Architecture

### Frontend Deployment (Vercel)

The frontend is deployed automatically via **Vercel's GitHub integration**:
- On every push to `main`, Vercel detects changes and triggers a build.
- **Root Directory** is set to `frontend/` in Vercel project settings.
- **Framework Preset:** Vite — builds with `npm run build`, serves from `dist/`.
- **SPA Routing:** `vercel.json` rewrites all routes to `index.html` for client-side routing.
- The `VITE_API_URL` environment variable is configured in the Vercel dashboard to point to the Railway backend.

Additionally, the GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs `mvn test` and `npm run build` in parallel on every push/PR to `main`, and can deploy via `amondnet/vercel-action` when Vercel secrets are configured.

### Backend Deployment (Railway)

The backend is auto-deployed via **Railway's native Git integration**:
- On every push to `main`, Railway detects changes in the `/backend` directory.
- It provisions Java 17, runs `mvn clean package`, provisions a PostgreSQL database, and deploys the application container.
- Flyway migrations run automatically on boot to keep the database schema in sync.
- **CORS** is configured in `SecurityConfig.java` to allow requests from the Vercel production domain and preview deployments.

### Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_API_URL` | Vercel Dashboard | `https://reasonable-presence-production-599b.up.railway.app` |
| `SPRING_PROFILES_ACTIVE` | Railway | `prod` |
| `DB_URL` | Railway (auto-provisioned) | PostgreSQL connection URL |
| `DB_USERNAME` | Railway (auto-provisioned) | PostgreSQL username |
| `DB_PASSWORD` | Railway (auto-provisioned) | PostgreSQL password |
| `WORKHUB_JWT_SECRET` | Railway | JWT signing secret |

---

## Local Development Quick Start

**Backend:**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
Runs on `http://localhost:8080` with an in-memory H2 database.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. By default connects to `http://localhost:8080` (the local backend).

To point the frontend at a remote backend during local dev:
```bash
VITE_API_URL=https://reasonable-presence-production-599b.up.railway.app npm run dev
```