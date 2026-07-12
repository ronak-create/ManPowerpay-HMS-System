# ManpowerPay API Reference

REST API for the ManpowerPay HR/payroll platform. All endpoints are prefixed with
`/api` and served by the Express backend (`backend/src`).

- **Base URL:** `https://<host>/api` (local dev: `http://localhost:5000/api`)
- **Content type:** `application/json` (file downloads return the relevant binary
  type with a `Content-Disposition: attachment` header)

## Authentication

Bearer JWT. Obtain a token from `POST /api/auth/login`, then send it on every
protected request:

```
Authorization: Bearer <token>
```

Tokens expire per `JWT_EXPIRES_IN` (default 8h). A `401` clears the client session.
Roles are `admin` and `employee`; admin-only endpoints return `403` for employees.

## Multi-tenancy

Every request is automatically scoped to the caller's company (`companyId` embedded
in the user record). You can only ever read or write your own tenant's data — there
is no cross-tenant access, and no tenant id is accepted from the client for scoping.

## Response envelope

Success responses use a consistent envelope:

```json
{ "statusCode": 200, "data": { }, "message": "Success", "success": true }
```

Errors:

```json
{ "statusCode": 400, "message": "Human-readable reason", "success": false, "errors": [] }
```

Common status codes: `400` validation, `401` unauthenticated, `403` wrong role,
`404` not found, `402` plan/employee-limit exceeded, `429` rate-limited, `500` server.

## Rate limits

- `POST /api/auth/login` — 20 requests / 15 min / IP
- All `/api/*` — 200 requests / min / IP
- `GET /api/health` and the Razorpay webhook are exempt.

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | public | Self-serve signup: creates company + admin + defaults + free plan |
| POST | `/login` | public | Returns JWT + user + company branding |
| POST | `/forgot-password` | public | Sends an OTP to the user's email |
| POST | `/reset-password` | public | Resets password using the OTP |
| GET | `/me` | any | Current user + company `{ id, name, logoPath, brandColor }` |
| POST | `/change-password` | any | Change own password (also clears forced-reset flag) |

## Company — `/api/company`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/logo`, `/:companyId/logo` | public | Company logo image (id-keyed form is tenant-safe) |
| GET | `/` | any | Company profile + config |
| PUT | `/` | admin | Update profile / brand color |
| POST | `/logo` | admin | Upload logo (multipart, ≤2 MB, image only) |
| POST | `/holidays` · DELETE `/holidays/:id` | admin | Manage holiday calendar |
| PUT | `/pt-slabs` | admin | Replace Professional Tax slabs |
| GET/PUT | `/statutory-config` | admin (PUT) | Per-tenant EPF/ESIC/PT/TDS rule overrides |
| POST/DELETE | `/sites`, `/departments` | admin | Manage sites & departments |
| POST/GET | `/advance-loans` | admin | Create / list salary advances |
| GET | `/export` | admin | Full tenant data export — `?format=json\|excel&includeAuditLogs=true` |

## Employees — `/api/employees`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/meta` | admin | Dropdown metadata (depts, sites, templates) |
| GET | `/bulk-template` | admin | Download the bulk-import Excel template |
| POST | `/bulk-upload` | admin | Validate an uploaded bulk sheet (dry run) |
| POST | `/bulk-finalize` | admin | Commit bulk import; returns generated credentials |
| GET | `/` · GET `/:id` | admin | List / fetch employees |
| POST | `/` | admin | Create employee (returns `tempPassword`; enforces plan limit → `402`) |
| PUT | `/:id` · PATCH `/:id/status` | admin | Update / activate-deactivate |
| POST | `/:id/documents` | admin | Upload an employee document |
| GET | `/:id/appointment-letter`, `/:id/relieving-letter` | admin | Generate letter PDFs |

## Attendance — `/api/attendance`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/team` | admin | Team attendance for a date |
| GET | `/bulk-template` · POST `/bulk-upload` | admin | Bulk attendance import |
| POST | `/bulk` | admin | Mark/update attendance for many employees |
| PATCH | `/:id` | admin | Correct a single record (tracks reason + actor) |
| GET | `/employee/:empId`, `/summary/:empId` | any | An employee's attendance / monthly summary |

## Leaves — `/api/leaves`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | any | List leave requests (scoped by role) |
| POST | `/` | any | Apply for leave |
| PATCH | `/:id/approve` · `/:id/reject` | admin | Decide a request (atomic) |
| PATCH | `/:id/cancel` | any | Cancel own pending request |
| GET | `/balance/:empId` · POST `/balance/init` | any / admin | Leave balances |
| GET | `/download/:empId` | any | Leave report export |

## Payroll — `/api/payroll`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | admin | List payroll runs |
| POST | `/run` | admin | Create/recompute a draft run for `{ month, year }` |
| GET | `/:runId` | admin | Run details with payslips |
| PATCH | `/:runId/approve` · `/:runId/lock` | admin | Approve → lock (locking recovers advances + locks attendance) |
| GET | `/:runId/bank-file` | admin | NEFT bank file (CSV) for a locked run |

## Salary templates — `/api/salary-templates`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET · POST · PUT `/:id` · DELETE `/:id` | | admin | CRUD salary templates (delete blocked while employees are assigned) |

## Payslips — `/api/payslips`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` · GET `/:id` | any | List / fetch payslips (employees see only their own) |
| GET | `/:id/pdf` | any | Payslip PDF (path-safe download) |
| POST | `/run/:runId/generate-all` · `/run/:runId/email` | admin | Batch-generate / email payslips |

## Form 16 — `/api/form16`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/:empId` | any | Form 16 records for an employee |
| POST | `/generate-all` | admin | Generate Form 16 for the financial year |

## Statutory reports — `/api/statutory`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/epf-ecr` · `/esic` · `/pt` | admin | EPF ECR / ESIC / PT return files |

## Reports — `/api/reports`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/dashboard/admin` | admin | Dashboard KPIs + payroll trend |
| GET | `/attendance` · `/payroll-summary` · `/headcount` · `/advance-ledger` | admin | Reports (`?format=excel` for download) |
| GET | `/payroll-trend` | admin | Last-6-months net-pay trend |
| GET | `/audit-logs` | admin | Paginated, filterable audit trail |

## Resignations — `/api/resignations`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | any | List resignations |
| POST | `/apply` | any | Employee submits resignation |
| PATCH | `/:id/withdraw` | any | Withdraw own request |
| PATCH | `/:id/approve` · `/:id/reject` | admin | Decide |
| GET | `/:id/letter` | any | Relieving/acceptance letter PDF |
| DELETE | `/purge/:employeeId` | admin | Purge resignation records for an employee |

## Notifications — `/api/notifications`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | any | List own notifications |
| PATCH | `/read-all` · `/:id/read` | any | Mark read |

## Billing — `/api/billing`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | admin | Current plan, usage, available plans, `gatewayConfigured` |
| POST | `/checkout` | admin | Start a plan change (free = immediate; paid = Razorpay subscription) |
| POST | `/verify` | admin | Verify Razorpay signature and activate the paid plan |
| POST | `/webhook` | public (HMAC) | Razorpay webhook — raw body, signature-verified |

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | public | Liveness probe (`{ status: "ok" }`, no DB touch) |

---

Dormant integrations (no-op until configured via env): **Razorpay** billing
(`RAZORPAY_*`), **Supabase Storage** for files (`SUPABASE_*`), **PII encryption**
(`ENCRYPTION_KEY`), and **Sentry** error tracking (`SENTRY_DSN`). See
`backend/.env.example`.
