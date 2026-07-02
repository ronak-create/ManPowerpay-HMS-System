# ManPowerPay HMS — Production Readiness & Commercialization Audit

**Prepared for:** Ronak Parmar / Kesarix Technology
**Date:** 2 July 2026
**Scope:** Full inspection of the HMS (HR + payroll) codebase ahead of a commercial multi-tenant SaaS launch (free/demo tier + Razorpay-billed paid tiers).
**Stack audited:** Node + Express 5 + Prisma 5 + Supabase Postgres (backend, on Render) · React 18 + Vite + Tailwind + Zustand (frontend, on Vercel).

Every finding below was hand-verified against the source with file and line references. This report is deliberately report-only — no code has been changed. It ends with a phased roadmap so you can decide what to green-light.

---

## 1. Executive summary

**Verdict:** This is a genuinely capable, feature-complete HMS for a *single company* — payroll engine, attendance, leave, statutory (EPF/ESIC/PT/TDS), payslips, Form 16, resignations, audit logging, and a clean React UI are all present. That is a strong foundation.

**But it is not yet safe or structured to sell as a commercial SaaS.** There are two categories of showstoppers:

1. **Live secrets are committed to the git repository** — the production Supabase database password and the JWT signing secret are both in tracked files. Anyone with repo access (or anyone the repo is ever shared with) has full control of your production database and can forge login tokens for any user. This must be remediated before anything else.
2. **The architecture is single-tenant.** There is exactly one `Company` row and no `companyId` on employees, payroll, attendance, etc. To sell to many companies from one deployment (your stated model), tenancy has to be built in — it cannot be bolted on trivially.

Alongside those, there is a cluster of **money-correctness and date/timezone bugs** in the payroll engine that would produce visibly wrong payslips for real customers (over/underpayment), and the usual pre-launch gaps (no tests, no input validation despite the library being installed, files stored on a disk that Render wipes on every deploy).

None of this is unusual for a project at this stage, and none of it is fatal. The rest of this document is the fix list, prioritized.

| Severity | Count | Theme |
|---|---|---|
| 🔴 Critical | 7 | Leaked secrets, default passwords, unencrypted PII, auth weaknesses |
| 🟠 High | 8 | Payroll money math, timezone/date bugs, non-atomic writes |
| 🟡 Medium | 9 | Missing indexes, no validation, ephemeral file storage, N+1 |
| 🔵 Commercial gap | — | Multi-tenancy, billing, plans, generic payroll, launch table-stakes |

---

## 2. 🔴 Critical — Security (fix before any launch)

### 2.1 Production secrets committed to git
`backend/.env.production` is tracked in the repository and contains **real live credentials**:
- Supabase DB password `Ronak_DB_2026_Secure_X9L2m7` (both pooler and direct connection URLs)
- The production `JWT_SECRET`
- SMTP account `info@kesarixtechnology.com`

`backend/.env.example:1` contains a **second real** Supabase password (`R1o2n3a4k5@`, URL-encoded as `R1o2n3a4k5%40`) for the same database host — example files should never hold real credentials.

**Impact:** Full read/write access to all employee, salary, and bank data; ability to forge a valid JWT for any user (including admin) using the leaked secret. This is the single most urgent item.

**Remediation (in order):**
1. **Rotate the Supabase database password** and **generate a new `JWT_SECRET`** (rotating the JWT secret logs everyone out — expected).
2. Move all secrets to the Render / Vercel dashboard environment settings; never in files.
3. Remove `.env.production` and the real values in `.env.example` from the working tree; ensure `.gitignore` covers them (it already ignores `.env`).
4. Purge them from git history (`git filter-repo` or BFG) so they're not recoverable from old commits.
> These touch live infrastructure, so they're yours to authorize/execute — I will not rotate live credentials without your say-so.

### 2.2 Hardcoded / default passwords
- Seed admin: `admin@manpowerpay.com` / `Admin@1234` — `prisma/seed.js:10`, and the password is printed to the console at `:81`.
- Default employee password `Welcome@1234` is hardcoded — `employee.controller.js:185` (bulk) and `:402` (single create).
- **Demo credentials are rendered on the public login page** — `LoginPage.jsx:137-140` shows `admin@manpowerpay.com / Admin@1234` to every visitor.

**Impact:** Predictable credentials; the login page literally hands out the admin login. **Remediation:** env-driven seed credentials, per-employee random temp passwords with forced change on first login, and remove the demo-credentials block from the login page.

### 2.3 Password-reset OTP is brute-forceable
`auth.controller.js:53` issues a 6-digit OTP (1,000,000 combinations) with a 10-minute window, and there is **no rate limit or attempt counter** on `/api/auth/reset-password` (only `/api/auth/login` is throttled — `app.js:69`). An attacker can try thousands of OTPs per minute. **Remediation:** rate-limit the reset/OTP endpoints, add a per-OTP attempt counter that invalidates after N tries.

### 2.4 Unencrypted PII (DPDP Act exposure)
`schema.prisma:235-241` stores `aadhaarNo`, `pan`, and `bankAccountNo` in plaintext — the schema comments even say "Store encrypted", but nothing does. For an Indian HR product this is a Digital Personal Data Protection Act 2023 liability. **Remediation:** application-level AES-GCM encryption for these fields (key in env / a KMS), decrypt only at point of use.

### 2.5 File uploads accept any file type
Multer configs set size limits only — no MIME or magic-number checks: `employee.routes.js:8-11` (documents, 5 MB), `company.routes.js:7-11` (logos, 2 MB). A user can upload an executable or HTML payload. **Remediation:** whitelist content types and verify file headers (magic numbers), not just the extension.

### 2.6 Payslip download path not validated
`payslip.controller.js:93` reads `payslip.pdfPath` from the DB and serves it without confirming the resolved path stays inside the intended storage directory — a path-traversal risk if that value is ever influenced by input. **Remediation:** resolve and assert the path is within the storage root (moot once files move to Supabase Storage with signed URLs — see 4.4).

### 2.7 JWT / session weaknesses
Single 8-hour access token, **no refresh token, no logout/revocation** (`auth.controller.js`), and the token is stored in `localStorage` (`authStore.js:11`) where any XSS can read it. **Remediation:** short-lived access token + refresh token (refresh in an HttpOnly cookie), server-side revocation on logout/password-change.

---

## 3. 🟠 High — Payroll correctness (money & dates)

These produce *wrong numbers on real payslips* — the most damaging class of bug for a payroll product because customers notice immediately and lose trust.

### 3.1 All money is stored as floating-point
Every monetary column is `Float` (double precision): `Employee.annualCTC` (`schema.prisma:244`), all `Payslip` amounts (`:388-390, 399-405`), `AdvanceLoan` amounts (`:422-426`), `LeaveBalance` (`:330-332`), `PtSlab` (`:147-149`), `Company.otMultiplier` (`:117`). The engine's `round()` helper (`payroll.engine.js:143`) is applied at 30+ sites but floats still accumulate error across a month/year. **Remediation:** migrate to `Decimal @db.Decimal(12,2)` and do arithmetic with a decimal library; centralize rounding in one `money` helper.

### 3.2 Earnings breakdown never reconciles to gross
In `payroll.engine.js`, gross is `monthlyCTC + OT` (`:42`) but the earnings line items (`:46-60`) are computed independently from components (Basic %, HRA % of basic, fixed allowances). Nothing forces `sum(earnings) === gross`. The seed's "Special Allowance … residual" (`seed.js:69`, value 0) is meant to absorb the difference, but the engine **never computes a residual** — so the sum of the payslip's earning lines will not equal the gross figure shown. **Remediation:** compute the residual component as `gross − sum(other earnings)`, and assert reconciliation (`gross − deductions === net`, `sum(components) === gross`) before saving.

### 3.3 `workingDaysBase = 26` can overpay
With `workingDaysBase === 26` (`payroll.controller.js:47`), a 31-day month where an employee is present ~30 days yields `daysWorked > 26`, so `proRateFactor = daysWorked / 26 > 1` (`payroll.engine.js:18`) and `grossActual = monthlyCTC × proRateFactor` **exceeds full salary**. `lwpDays` clamps to 0 but the pro-rate factor is uncapped. **Remediation:** cap `proRateFactor` at 1.0 and define the 26-day-base policy explicitly.

### 3.4 Unmarked attendance is silently treated as unpaid leave
`payroll.controller.js:69` — `lwpDays = max(0, workingDays − daysWorked)`. Days with **no attendance record at all** are counted the same as unpaid absence, so a mid-month joiner or any month with gaps gets docked. **Remediation:** distinguish "absent" / "unmarked" / "approved LWP"; base pro-rating on the employee's actual eligible days in the month.

### 3.5 Timezone / date handling is inconsistent (off-by-one-day risk)
Render runs in UTC; your customers are in IST (UTC+5:30). The code mixes UTC and local date handling:
- Holiday matching builds keys with `.toISOString()` (UTC) then filters with `d.getDay()` (local) — `payroll.controller.js:46-49`, `leave.controller.js:13-14, 21-24`.
- `attendance.controller.js:122-123` uses `new Date()` + `setHours(0,0,0,0)`.
Around midnight IST this shifts dates by a day, corrupting attendance, holiday exclusion, and working-day counts. **Remediation:** add a company `timezone` field, store dates as date-only consistently, and do all day-boundary math in the company timezone via one date helper.

### 3.6 Leave approval is not atomic → balance can be double-spent
`leave.controller.js:126-136`: balance is read, then decremented, then `applyLeaveToAttendance` runs as a **separate** transaction. Two concurrent approvals can both pass the check and both decrement; if attendance update fails, balance is already spent. **Remediation:** conditional update `UPDATE … SET balance = balance − :d WHERE balance >= :d` plus attendance writes inside **one** `$transaction`.

### 3.7 Only the first advance loan is deducted; balance can go negative
`payroll.controller.js:88` uses `emp.advanceLoans[0]` — an employee with two active loans only repays one. At lock time `newBalance = balanceRemaining − emi` (`:173`) can go negative with no floor. **Remediation:** iterate all active loans, and floor the recovery at the outstanding balance.

### 3.8 TDS financial-year aggregation is fragile
`payroll.controller.js:72-86` aggregates prior-FY TDS with a hand-rolled `OR` over month ranges and has no mechanism to recompute when an employee's projected tax changes mid-year. **Remediation:** model the financial year explicitly and recompute remaining-month TDS from the latest projection each run.

*(Also: `report.controller.js:112` matches deduction names by substring — `includes('TDS')` also matches "MTDS" — and Excel SUM formulas at `:124` are positional, so a missing component shifts columns and mis-sums. Fix with exact-code matching and keyed columns.)*

---

## 4. 🟡 Medium — Performance & robustness

- **4.1 Missing DB indexes** on hot query columns: `attendance(employeeId, date)`, `leave_requests(employeeId, status)`, `payslips(employeeId)`, `audit_logs(createdAt)`, `employees(departmentId, siteId)`. Full-table scans grow with data. (`schema.prisma`)
- **4.2 N+1 query** in bulk attendance upload — per-row `findUnique` by `empCode` (`attendance.controller.js:235-250`). Batch with a single `where: { empCode: { in: [...] } }`.
- **4.3 Zod is a dependency but used nowhere.** All validation is ad-hoc `if` checks; e.g. `Boolean(epfApplicable)` turns the string `"false"` into `true` (`employee.controller.js:402`). Build a Zod validation middleware layer.
- **4.4 Generated files live on Render's ephemeral disk** (`uploads/…`). Render wipes the filesystem on every deploy/restart, so **payslip and letter PDFs silently disappear**. Move all generated files and uploads to Supabase Storage with signed download URLs.
- **4.5** Concurrent payslip-PDF generation race (`payslip.controller.js` check-then-write); **audit logs grow unbounded** (no retention policy); **mailer fails silently with no retry** (`utils/mailer.js`); several **list endpoints have no pagination**; **no Prisma connection-pool / statement-timeout config** for the Supabase pooler; **no request/correlation IDs** for debugging production issues.

> **Verified NOT a bug:** `app.get("/{*splat}", …)` in `app.js:94` is correct Express 5 syntax (path-to-regexp v8; a bare `*` throws in Express 5). Your "wildcard syntax fix" commits were right. This block only runs when Render serves the built frontend; normally Vercel serves it.

---

## 5. 🔵 Commercialization gap analysis

Mapped to your decisions: **multi-tenant SaaS · generic/configurable payroll · Razorpay · India-first.**

### 5.1 Multi-tenancy (the largest single lift)
Today the schema has one `Company` and no `companyId` on `User`, `Employee`, `Attendance`, `LeaveRequest/Balance`, `PayrollRun`, `Payslip`, `AdvanceLoan`, etc.; `company.controller.js` fetches THE company via `findFirst()`. To serve many companies from one deployment:
- Add `companyId` to every tenant-owned model; replace global uniques with composite ones (`@@unique([companyId, empCode])`, `@@unique([companyId, month, year])` for payroll runs; keep `User.email` globally unique).
- Put `companyId` in the JWT; add tenant-scoping middleware; **no query on tenant data without a `companyId` filter**, enforced with a Prisma client extension as a safety net.
- Self-serve signup → admin user → onboarding wizard (company profile, leave policy, salary components, first employees). Per-tenant branding (logo, payslip header) and later per-tenant SMTP.

### 5.2 Plans, tiers & Razorpay billing
- New models: `Plan` (limits + feature flags), `Subscription` (status, period end, `razorpaySubscriptionId`), `PaymentEvent` (webhook audit trail).
- Free/demo tier default on signup (suggested: ≤10 employees, watermarked payslips, no bulk export); paid tiers lift limits.
- Enforcement middleware (`requireFeature`, employee-count checks) at create-employee and gated endpoints; frontend upgrade prompts on a distinct tier-limit error code.
- Razorpay Subscriptions with signature-verified webhooks (`subscription.activated/charged/halted/cancelled`), grace period, invoice records — kept behind a `billing.service.js` so the provider can be swapped later.

### 5.3 Generic / configurable payroll engine
The engine currently hardcodes EPF/ESIC/PT/TDS math (`payroll.engine.js:87-114`). Move to per-company **pay component definitions** (type earning/deduction/employer-cost; calc flat / % of base / slab / formula; base, cap, floor, taxable, statutory flags). The engine resolves components in dependency order, computes in Decimal, reconciles, and **snapshots the breakdown onto each payslip** so historical payslips never change when config changes. Ship the current Indian statutory logic as a default "India Statutory" component template, and add golden-master tests proving the new engine reproduces the old outputs before retiring the old path.

### 5.4 Launch table-stakes (currently absent)
No automated tests, no TypeScript/ESLint/Prettier, no CI, no error monitoring (Sentry), no API docs, no backup/DR note, no customer data-export (a common enterprise buying objection), no privacy policy / DPDP page, no seeded demo tenant for the sales motion.

---

## 6. Prioritized roadmap

Each phase is gated on your approval; nothing touches live infrastructure without sign-off.

### Phase 0 — Emergency + this report (days)
Rotate Supabase password + JWT secret, purge secrets from git history, sanitize `.env.example`, remove login-page demo credentials, make seed credentials env-driven and stop logging the password.

### Phase 1 — Security & correctness hardening (~2–3 weeks)
Auth overhaul (refresh tokens, reset/OTP rate-limits + attempt counter, password policy, random temp passwords) · Zod validation layer · Decimal money migration with golden-master payroll tests · timezone normalization · atomic leave approval + loan fixes + LWP/unmarked fix + pro-rate cap · upload type validation + path-safe downloads · move files to Supabase Storage · add indexes · fix N+1 · encrypt PII.

### Phase 2 — Multi-tenant + monetization (~4–6 weeks)
Tenancy migration (existing company becomes tenant #1) + scoping middleware + Prisma guard · self-serve signup + onboarding wizard + per-tenant branding · Plan/Subscription models + enforcement · Razorpay subscriptions + webhooks + billing UI · generic payroll component engine + India statutory template.

### Phase 3 — Launch polish (~2 weeks)
Test suites (payroll engine, auth, leave flows) · CI (GitHub Actions) · Sentry · ESLint/Prettier · API docs · deployment docs · demo tenant with realistic seed data · data-export endpoint · audit-log retention · DPDP/privacy page · backup policy.

---

## 7. Top 5 actions right now
1. **Rotate the Supabase DB password and JWT secret** — they're in git; treat as compromised.
2. **Purge the secret files from git history** once rotated.
3. **Remove the demo credentials** from the login page (and the seed console log).
4. **Green-light Phase 1** so the payroll money/date bugs and auth gaps are fixed before any paying customer sees a wrong payslip.
5. **Confirm the multi-tenancy approach** (Phase 2) so tenancy is designed in, not retrofitted painfully later.

*Prepared as a report-only deliverable. On your go-ahead I'll begin Phase 0/1 with small, reviewable commits and a smoke-test pass (login → attendance → leave → payroll → payslip) after each change.*
