# WorkHub — Product Requirements Document (v2)

**Status:** v1 delivered (scoped) | v1.1 and v2 roadmap defined
**Supersedes:** WorkHub v1 Final PRD (frozen scope reference, retained in Appendix A)

---

## 1. Product Vision

WorkHub is an internal work management platform for MSMEs, combining agile execution, accountability, and corporate discipline — without enterprise complexity or enterprise price tags. It replaces the spreadsheet-plus-WhatsApp-plus-email stack most MSMEs run their operations on today with a single, role-aware system of record.

## 2. What Changed From the Frozen v1 Scope

The original v1 PRD defined 5 roles, full timesheets, sprint planning/capacity tracking, and audit logging. To ship a working, demoable, production-shaped system in the available build window, **this delivered release (v1) intentionally narrows that scope** rather than shipping five half-finished modules. Section 3 below states delivered vs deferred explicitly — this is a scoping decision, not an oversight, and is designed to extend cleanly into the roadmap in Section 6.

## 3. Delivered in v1

### Roles
- **Employee** — task execution, self-service leave, own profile/documents.
- **Manager** — project oversight, approvals, cross-report visibility.
- **Admin** — system owner, master data control, permission engine control.
- *(Team Lead and HR are deferred to v2 — see Section 6. Their responsibilities are currently absorbed by Manager and Admin respectively so no workflow is blocked.)*

### Authentication & Security
- Stateless JWT auth (access + refresh), signed and validated with `jjwt`.
- **Audience (`aud`) claim explicitly validated** on every request — a token issued for a different client/audience is rejected outright, not just checked for signature validity.
- Refresh token rotation, stored hashed server-side, single-use.
- RBAC enforced with `@PreAuthorize` at the controller layer on every endpoint — never inferred from the frontend alone.
- Multi-tenant isolation: every query is scoped to `org_id` derived from the authenticated principal, not from client-supplied input. Verified with cross-org access tests.
- No OTP / email verification in v1 (explicit scope decision, not a gap — see Section 6 for when this changes).

### Core Workflow
- **Work Items** (Task / Bug / Test Case) — full CRUD, dynamic filtering, status transitions enforced against DB-driven master data (an invalid status is rejected at the API, not just hidden in the UI).
- **Projects** — group Work Items, immutable `projectKey`.
- **Comments** — threaded under Work Items, users can delete only their own.
- **Documents** — polymorphic attachment module (attach to profile, work item, etc.), swappable storage backend (local disk in v1, one config change to S3), MIME/size-validated uploads, owner-or-Admin delete.
- **Kanban Board** — the home experience, drag-and-drop via dnd-kit, collapsible backlog, sprint header (goal/progress/days left), role-aware drag rules (Employees move only their own items; Managers move any item in-project).

### HR & Performance
- **Leave Requests** — self-service submission, DB-driven leave types, Manager/Admin approval, self-approval explicitly blocked.
- **Performance Reviews** — Manager-authored reviews per employee per period, rating validation.

### Master Data
- All dropdown values (status, priority, severity, leave type, etc.) are DB rows, editable only by Admin — no redeploy needed to change a dropdown.

## 4. Deliberately Deferred (Not Missed — Scoped Out)

| Item | Frozen v1 required it? | Status | Why deferred |
|---|---|---|---|
| Team Lead & HR roles | Yes | Deferred to v2 | Manager/Admin currently absorb these responsibilities; splitting them is a permissions-config change, not a rebuild. |
| Timesheets (task-based start/end time) | Yes | Deferred to v1.1 | Requires a time-entry engine and weekly submission/draft states — scoped as its own release. |
| Sprint planning & capacity tracking | Yes | Deferred to v1.1 | Builds on top of the existing sprint header; needs a planning UI, not new architecture. |
| Immutable audit logs (system-level) | Yes | Deferred to v1.1 | App-level actions are already logged at the service layer; promoting this to a queryable, immutable audit trail is the remaining work. |
| **Role-specific reports & dashboards** (Employee: sprint progress; Team Lead: burndown; Manager: cross-project health; Admin: org analytics) | Yes | **Gap — highest-priority next item** | Every module needed to *produce* this data now exists (Work Items, Leave, Performance, org scoping). No dashboard/reporting layer has been built to *surface* it yet. This is the most visible gap between "data exists" and "business value is visible," and is the first thing scheduled in v1.1. |
| Leave calendar view | Yes | Deferred to v1.1 | List-based leave view ships in v1; calendar visualization is a presentation layer addition, not a data-model change. |

## 5. Explicitly Out of Scope (Unchanged From Frozen v1)

Calendar UI (org-wide), payroll, attendance punch-in/out, productivity scoring, third-party integrations. These remain intentionally excluded — WorkHub's value is calm, accountability-first work management, not becoming an HRMS.

## 6. Roadmap

**v1.1 (next, incremental on current architecture — no re-platforming)**
- Role-specific dashboards/reports (closes the gap in Section 4 — this is the single highest-value next release)
- Immutable audit log surfaced as a queryable Admin screen
- Leave calendar view
- Move JWT storage from `localStorage` to httpOnly cookies (security hardening — see README "Known Trade-offs")
- Sprint planning & capacity tracking UI

**v2**
- Team Lead and HR roles, with the permission engine already built to support new roles without code changes
- Timesheets (task-based time entry, weekly draft/submit/approve)
- Notifications (in-app, email digest)
- S3-backed document storage (config swap, already abstracted)

**v3**
- Attendance and productivity scoring — **only if** MSME customer feedback asks for it; the original PRD deliberately excluded these to avoid becoming a surveillance tool, and that principle should hold unless there's a clear customer-driven reason to revisit it
- Payroll integration hooks (export, not a payroll engine)
- Mobile app
- Optional SSO/OTP for customers who need it (kept optional — many MSME users churn on friction-heavy login)
- Multi-organization support per install (current model is single-org; needed for a true multi-tenant SaaS offering, not just multi-tenant *data isolation*, which already exists)

---

## Appendix A: Original Frozen v1 Scope (Reference)

*(Full text of the original "WorkHub v1 – Final Product Requirements Document," retained verbatim for traceability. Roles: Admin, Manager, Team Lead, HR, Employee. Includes original Sections 1–16 covering vision, roles, auth, org/users, work items, projects/sprints, kanban, work item types, comments/audit, leave management, timesheets, reports/dashboards, configuration constraints, and out-of-scope items — see original PRD document for full text.)*
