# ManPowerPay HMS — Refinement Handoff (from Fable 5 → Opus)

> **Read this first.** This is the execution brief for refining ManPowerPay HMS into a production-ready, commercially launchable multi-tenant SaaS. A 3-agent codebase sweep is COMPLETE — do not redo the exploration. This file contains: (1) the client's confirmed decisions, (2) verified audit findings with file:line evidence, (3) the target architecture and code-structure improvements, and (4) the phased execution plan. Start with Phase 0, produce `AUDIT_REPORT.md` early (client wants to review it), then proceed phase by phase with the client's go-ahead between phases.

---

## Client's confirmed decisions (do not re-ask)

- **Multi-tenant SaaS**: one deployment serves many companies (free/demo tier + paid tiers). Dedicated per-client deployments possible later on request.
- **Generic/configurable payroll engine**: no hardcoded statutory rules as the primary model; ship the Indian statutory set (EPF/ESI/PT/TDS) as a default component template.
- **Razorpay** for subscription billing (client is in India; Stripe unavailable).
- **Sequence**: produce the written audit report first for client review, then implement. The client HAS now authorized code improvements and structural changes as part of this engagement — this is a full refinement, not audit-only. Still pause for explicit client approval before: destructive migrations, secret rotation, anything touching the live production DB.

## Stack (verified ✅)

- Backend: Node + **Express 5** + Prisma 5 + Supabase Postgres, deployed on **Render** (ephemeral filesystem!). Entry: `backend/src/app.js`.
- Frontend: React 18 + Vite + Tailwind + Zustand + axios, deployed on **Vercel**. 21 pages, 18 components, clean modular `src/` layout.
- No tests, no TypeScript, no ESLint, no CI anywhere. Zod is a backend dependency but used nowhere.

## ⚠️ Known false finding — do not "fix"

`backend/src/app.js:94` — `app.get("/{*splat}", ...)` is **correct Express 5 syntax** (path-to-regexp v8; bare `*` throws in Express 5). An exploration agent falsely flagged it as broken. Verified-OK ✅. It only runs when Render serves the frontend build (normally Vercel does).

---

# PART 1 — Verified audit findings

## CRITICAL — Security emergencies

- ✅ **Secrets committed to git** (verified via `git ls-files` + file reads):
  - `backend/.env.production` — real Supabase DB password `Ronak_DB_2026_Secure_X9L2m7` (pooler + direct URLs), production `JWT_SECRET`, SMTP user `info@kesarixtechnology.com`.
  - `backend/.env.example:1` — a **second** real DB password `R1o2n3a4k5@` (URL-encoded `R1o2n3a4k5%40`) for the same Supabase host.
  - `frontend/.env.production` — Render API URL (low risk, but tracked).
  - Fix: user rotates Supabase password + JWT secret (invalidates sessions); purge files from git history (`git filter-repo`); env vars live only in Render/Vercel dashboards; sanitize `.env.example`.
- **Default/hardcoded passwords**: seed admin `admin@manpowerpay.com / Admin@1234` (`prisma/seed.js:10`, logged at `:81`); employee default `Welcome@1234` (`employee.controller.js:185,402`); demo credentials rendered on login page (`LoginPage.jsx:~137-140`).
- **OTP reset brute-forceable**: 6-digit OTP, 10-min expiry, **no rate limit** on `/api/auth/reset-password`, no attempt counter (`auth.controller.js:53`; `app.js` rate-limits only `/api/auth/login`).
- **Uploads lack type validation**: multer in `employee.routes.js:8-11` (5MB docs) and `company.routes.js:7-11` (2MB logos) — size limits only; no MIME/magic-number checks.
- **Payslip download path**: `payslip.controller.js:93` reads `payslip.pdfPath` unvalidated — resolved path must stay inside the storage root.
- **Unencrypted PII**: Aadhaar, PAN, bank account plaintext despite schema comments saying "store encrypted" (`schema.prisma:235-242`). DPDP Act 2023 exposure.
- **JWT weaknesses**: single 8h token, no refresh, no revocation/logout; token in localStorage (`authStore.js:11`) — XSS-exfiltratable.

## HIGH — Correctness bugs (money & dates)

- **Float money everywhere**: all monetary columns are `Float` in `schema.prisma` (CTC, payslip amounts, loans, leave balances, PT slabs, otMultiplier). Migrate to `Decimal @db.Decimal(12,2)`. Payroll engine `round()` (`payroll.engine.js:143`) used at 30+ calc sites; add a gross-vs-sum-of-components reconciliation assert.
- **Timezone bugs**: `new Date()` + `setHours(0,0,0,0)` UTC/local mixing (`attendance.controller.js:122-123`); holiday matching mixes `.toISOString()` (UTC) with date-fns `format()` (local) (`attendance.controller.js:46`, `report.controller.js:34`). Off-by-one-day risk for IST business on UTC Render servers. Fix: date-only storage discipline + compute in company timezone (store `tz` per company).
- **Unmarked attendance counted as LWP**: `payroll.controller.js:69` — `lwpDays = workingDays - daysWorked`; mid-month joiners / unmarked days get docked pay. Distinguish absent / unmarked / approved-LWP.
- **Leave approval not atomic**: `leave.controller.js:125-136` — balance decrement and `applyLeaveToAttendance` in separate transactions; concurrent approvals double-spend. Use conditional update (`WHERE balance >= :days`) inside one transaction.
- **Advance loans**: only `advanceLoans[0]` deducted (`payroll.controller.js:88`); balance can go negative on lock (`:171-177`).
- **Report/export fragility**: substring deduction matching (`report.controller.js:112` — `includes()` matches "TDS" inside "MTDS") and positional Excel SUM formulas (`:124`).
- **TDS FY aggregation**: OR-clause over month ranges (`payroll.controller.js:72-86`) fragile across FY boundaries; no mid-year recalc mechanism.

## MEDIUM — Performance & robustness

- **Missing indexes**: `attendance(employeeId, date)`, `leave_requests(employeeId, status)`, `payslips(employeeId)`, `audit_logs(createdAt)`, `employees(departmentId, siteId)`.
- **N+1** in bulk attendance upload (`attendance.controller.js:235-250` — per-row `findUnique` by empCode); batch with `in` query.
- **Zod unused** — ad-hoc validation everywhere; e.g. `Boolean(epfApplicable)` turns string `"false"` into `true` (`employee.controller.js:402`).
- **PDFs on local disk** (`uploads/`) — Render's filesystem is ephemeral; payslips vanish on redeploy. Move to Supabase Storage.
- Concurrent payslip-PDF generation race (`payslip.controller.js:106-113`); unbounded audit logs; silent mailer failures, no retry (`utils/mailer.js:29`); several unpaginated list endpoints; no Prisma pool/timeout config (`config/db.js`); no request/correlation IDs.

---

# PART 2 — Target architecture & code-structure improvements

## Backend restructure (incremental, per-module — don't big-bang)

Current: fat controllers doing validation + business logic + Prisma queries + PDF/Excel generation inline. Target per module:

```
src/modules/<module>/
  <module>.routes.js       # routing + requireRole + validate(schema) only
  <module>.schema.js       # Zod schemas (parse req.body/query/params)
  <module>.controller.js   # thin: parse → call service → respond
  <module>.service.js      # business logic, transactions, tenant-scoped
```

Cross-cutting additions:
- `src/middleware/validate.js` — Zod middleware (`validate(schema)`), one error shape.
- `src/middleware/tenant.js` — resolves `companyId` from JWT claim; every service call receives it (see multi-tenancy below).
- `src/lib/storage.js` — storage abstraction (Supabase Storage adapter; local-disk adapter for dev). All PDF/upload writes go through it.
- `src/lib/money.js` — decimal-safe money helpers (Prisma `Decimal` in/out, rounding policy in ONE place).
- `src/lib/dates.js` — company-timezone date helpers (date-only handling, working-day calc). Kill scattered `new Date()` math.
- `src/lib/logger.js` — pino structured logging + request IDs; replace console.* and morgan.
- Central error classes (`ApiError`, `ValidationError`) consumed by `errorHandler`.

Priority order for the refactor: **payroll → leaves → attendance → employees** (highest correctness risk first). Other modules can stay fat-controller until touched.

## Multi-tenancy design

- Add `companyId` to every tenant-owned model (User, Employee, Attendance, LeaveRequest/Balance, PayrollRun, Payslip, SalaryTemplate, AdvanceLoan, Holiday, Site, Department, Notification, AuditLog, Resignation…).
- Composite uniques replace globals: `@@unique([companyId, empCode])`, `@@unique([companyId, month, year])` for PayrollRun, email stays globally unique on User.
- JWT carries `companyId`; `tenant.js` middleware injects it; **no Prisma query on tenant data without a `companyId` filter** — enforce via service-layer convention + a Prisma client extension ($extends) that auto-injects the filter as a safety net.
- Self-serve signup: company registration → admin user → onboarding wizard (company profile, leave policy, salary components, first employees).
- Per-tenant branding (logo, payslip header) and later per-tenant SMTP.

## Plans, tiers & Razorpay

- Models: `Plan` (code, name, priceMonthly, employeeLimit, features JSON), `Subscription` (companyId, planId, status, currentPeriodEnd, razorpaySubscriptionId), `PaymentEvent` (webhook audit trail).
- Free tier default on signup (suggest: ≤10 employees, watermarked payslips, no bulk exports); paid tiers lift limits.
- `requireFeature('x')` / employee-count enforcement middleware at create-employee and feature endpoints.
- Razorpay Subscriptions: plan creation, checkout, webhooks (`subscription.activated/charged/halted/cancelled`) with signature verification, grace period on failed charge, invoice records. Keep the gateway behind a `billing.service.js` so provider can be swapped.

## Generic payroll component engine

- Replace hardcoded EPF/ESI/PT/TDS math in `payroll.engine.js` with per-company `PayComponent` definitions: `{ code, name, type: earning|deduction|employer_cost, calc: flat|percentOf(base)|slab|formula, base, cap, floor, taxable, statutory }`.
- Engine: resolve components in dependency order → compute on Decimal → reconcile (gross − deductions === net, sum of components === gross) → snapshot the component breakdown JSON onto the payslip (so historical payslips never change when config changes).
- Ship "India Statutory" as a default component template (current EPF/ESI/PT/TDS logic expressed as components) so existing behavior is reproducible; add golden-master tests comparing old engine vs new on sample data BEFORE deleting the old path.

## Frontend improvements

- Remove demo credentials block (`LoginPage.jsx:~137-140`).
- Auth: short-lived access token + refresh (HttpOnly cookie for refresh); fix the one direct `localStorage.getItem('token')` in `PayrollRun.jsx:23` to use the store.
- Add ESLint + Prettier; add Vitest + React Testing Library for critical flows (login, payroll run, leave apply/approve).
- Signup/onboarding pages, plan/billing settings page, upgrade prompts on tier-limit errors (backend returns a distinct error code).
- Keep the existing UI component library — it's clean; polish empty/loading states and mobile nav as touched.

## Ops & launch table stakes

- CI (GitHub Actions): lint + tests + prisma validate on PR.
- Sentry (or similar) on both apps; pino logs on backend.
- Prisma connection pooling config for Supabase pooler; statement timeouts.
- Supabase Storage for all generated files; signed URLs for downloads.
- API docs (OpenAPI via zod-to-openapi since schemas will exist); deployment docs (Render/Vercel env matrix).
- Backup/DR note (Supabase PITR tier), audit-log retention policy, data-export endpoint (CSV/Excel of a company's data — sales objection killer), privacy policy / DPDP page.

---

# PART 3 — Phased execution plan

## Phase 0 — Emergency + audit report (do first)

1. Write `AUDIT_REPORT.md` at repo root from PART 1 (+ roadmap), give it to the client for review. Spot-check exact line numbers with quick Reads before citing (`payroll.engine.js`, `payroll.controller.js`, `leave.controller.js`, `schema.prisma`, `seed.js`, `LoginPage.jsx`).
2. Instruct the client to rotate Supabase DB password + JWT secret (theirs to authorize — don't touch live creds yourself). Then: remove `.env.production`/`.env.example` real values from the working tree, add to `.gitignore`, purge from git history once the client confirms rotation.
3. Remove login-page demo credentials; kill seed console.log of the password; make seed credentials env-driven.

## Phase 1 — Security & correctness hardening (~2–3 wks)

- Auth: refresh tokens, rate limits on reset/OTP endpoints + attempt counter, password policy, random temp passwords with forced first-login change.
- Zod validation layer (`validate.js` + per-module schemas) — start with auth, employees, leaves, payroll.
- Decimal money migration (schema + `money.js` + engine changes) with golden-master payroll tests before/after.
- Timezone normalization via `dates.js` (company tz field; fix attendance/holiday/report date handling).
- Transactions + row-locking on leave approval and loan deduction; fix LWP-vs-unmarked; fix multi-loan deduction; fix negative loan balance.
- Upload MIME/magic-number validation; path-safe downloads; storage abstraction + Supabase Storage migration.
- Indexes migration; fix N+1 bulk upload; PII encryption (app-level AES-GCM via a `crypto.js` lib, keys in env).

## Phase 2 — Multi-tenant + monetization (~4–6 wks)

- Tenancy schema migration + scoping middleware + Prisma client extension guard (this is the big one — migrate existing single company as tenant #1).
- Signup + onboarding wizard; per-tenant branding.
- Plan/Subscription models + enforcement middleware; free-tier limits.
- Razorpay subscriptions + webhooks + billing settings UI.
- Generic payroll component engine + India statutory default template (golden-master parity tests).

## Phase 3 — Launch polish (~2 wks)

- Test suites (payroll engine, auth, leave flows), CI, Sentry, ESLint/Prettier.
- API docs, deployment docs, demo tenant with seeded realistic sample data (for the free/demo tier sales motion).
- Data-export endpoint, audit-log retention, DPDP/privacy docs, backup policy.

## Working rules

- Small commits per logical change; never commit secrets; run the app + existing flows after each module refactor (login → mark attendance → apply/approve leave → run payroll → download payslip is the smoke path).
- Golden-master principle: any payroll math change must reproduce current outputs on sample data first, then fix bugs deliberately with the diff explained.
- Pause for client approval before: destructive schema migrations on the live DB, git-history rewrite, anything billing-money-related going live.
