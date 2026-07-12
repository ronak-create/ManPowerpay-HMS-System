# Deployment Guide

Production topology (India-first):

| Piece | Service | Region |
| --- | --- | --- |
| Database + file storage | Supabase (Postgres + Storage) | Mumbai `ap-south-1` |
| Backend API (Express) | Render web service (`render.yaml` blueprint) | Singapore (closest Render region) |
| Frontend (React/Vite) | Vercel | Mumbai `bom1` |
| Payments | Razorpay Subscriptions | — |

Deploy in this order: **Supabase → Render → Vercel → Razorpay webhook**. Each later step needs a value produced by the earlier one.

---

## 1. Supabase (database + storage)

1. Create a project in region **Mumbai (ap-south-1)**. Save the database password.
2. From **Dashboard → Connect**, copy both pooler connection strings:
   - **Transaction pooler** (`...pooler.supabase.com:6543`) → becomes `DATABASE_URL` (append `?pgbouncer=true`)
   - **Session pooler** (`...pooler.supabase.com:5432`) → becomes `DIRECT_URL` (Prisma migrations use this)

   > Do **not** use the direct host (`db.<ref>.supabase.co`) on Render — it is IPv6-only and Render's outbound network is IPv4-only, so Prisma fails with `P1001`. The direct host only works from networks with IPv6 (it may work on your laptop, which is how this bites people).
   >
   > If the DB password contains special characters, URL-encode them in the connection string (`!`→`%21`, `@`→`%40`, `&`→`%26`, `+`→`%2B`).
3. In **Storage**, create a bucket named `manpowerpay` (private). Uploaded documents and generated payslip PDFs go here because Render's disk is ephemeral.
4. Copy the **service role key** (Settings → API) → becomes `SUPABASE_SERVICE_KEY`. Never expose it to the browser.

Migrations and seed run from your machine (or CI) against the new DB:

```bash
cd backend
# .env: DATABASE_URL + DIRECT_URL pointing at the new project
npx prisma migrate deploy
SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... SEED_ADMIN_MOBILE=... npm run db:seed
```

The seed creates the billing plans (free/starter/growth), a default company, and the platform admin from the `SEED_ADMIN_*` env vars. There are no hard-coded credentials.

Optionally seed a **public demo tenant** (a realistic "Acme Facilities" company with employees, attendance, leaves, advances and a locked payroll run) so the live site is self-explanatory:

```bash
SEED_DEMO_EMAIL=demo@yourdomain.com SEED_DEMO_PASSWORD='Demo@12345' npm run db:seed:demo
```

It is idempotent — it wipes and rebuilds only the `company_demo` tenant and never touches other data. The demo login is intentionally public; keep it isolated by tenant scoping and never point it at a real admin account.

## 2. Render (backend API)

1. **Render Dashboard → New → Blueprint**, point it at this repo. Render reads `render.yaml`, creates the `manpowerpay-api` service, and prompts for every `sync: false` secret.
2. Fill the secrets (full reference in `backend/.env.example`):

   | Var | Value |
   | --- | --- |
   | `DATABASE_URL` | Supabase **transaction** pooler URL + `?pgbouncer=true` |
   | `DIRECT_URL` | Supabase **session** pooler URL |
   | `JWT_SECRET` | long random string (≥32 chars) |
   | `ENCRYPTION_KEY` | 64 hex chars — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. **If unset, Aadhaar/PAN/bank numbers are stored in plaintext** (encryption stays dormant). Set it before the first employee is created; there is no re-encrypt job for pre-existing rows. |
   | `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | from step 1 — required on Render (ephemeral disk) |
   | `CLIENT_URL` | the deployed frontend origin(s), comma-separated — CORS |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | from step 4 — may be left unset initially; billing checkout stays dormant ("contact support" notice) until set |
   | `SMTP_USER` / `SMTP_PASS` | mailbox for OTP/credential emails (Gmail app password works) |

3. The free-tier build command runs `prisma migrate deploy` on every deploy, so future schema changes apply automatically. On a paid plan move it to `preDeployCommand` (see comment in `render.yaml`).
4. Verify: `https://<service>.onrender.com/api/health` returns 200.

## 3. Vercel (frontend)

1. Import the repo; set the project **Root Directory** to `frontend` (framework: Vite).
2. Environment variable: `VITE_API_URL=https://<render-service>.onrender.com/api` — the axios base falls back to `/api` if unset, which only works in local dev behind the Vite proxy.
3. Set the deployment region to Mumbai (`bom1`) in project settings.
4. SPA rewrite: all routes must serve `index.html` (Vercel does this automatically for Vite projects; if not, add a rewrite `/(.*) → /index.html`).
5. After the first deploy, put the Vercel origin into Render's `CLIENT_URL`.

## 4. Razorpay (billing)

1. In the Razorpay dashboard create/copy the API **Key Id + Secret** (test keys work end-to-end in test mode) and set them in Render.
2. **Settings → Webhooks → Add**: URL `https://<render-service>.onrender.com/api/billing/webhook`, events **`subscription.*`**, and a webhook secret — set the same value as `RAZORPAY_WEBHOOK_SECRET` in Render.
3. Plans are created in Razorpay lazily on first checkout (`ensureRazorpayPlan` caches the id on `Plan.razorpayPlanId`) — no manual plan setup needed.
4. Smoke test: log in as an admin → Billing & Plan → upgrade to Starter with a Razorpay test card → the subscription should flip to `active` and a `PaymentEvent` row should appear.

## Smoke path after any deploy

login → mark attendance → apply/approve leave → run payroll → download payslip. Also confirm `/api/health` and that a new signup (`/signup`) creates an isolated company.

## Operations

- **Audit-log retention:** schedule `npm run prune:audit` (in `backend/`) to run
  **daily** — a Render Cron Job, host cron entry, or a scheduled GitHub Action. It
  deletes `audit_logs` older than `AUDIT_LOG_RETENTION_DAYS` (default 365; `0`
  disables) across all tenants and exits non-zero on failure.
- **Backups & recovery objectives, retention schedule, restore drills:** see
  `docs/BACKUP_AND_RETENTION_POLICY.md`.
- **Tenant data export:** admins can download a full JSON/Excel archive from Company
  Settings → Data Export (`GET /api/company/export`) — useful for backups and DPDP
  data-portability requests.

## Compliance

- `docs/PRIVACY_POLICY.md` — publishable privacy notice (fill placeholders).
- `docs/DPDP_COMPLIANCE.md` — DPDP Act 2023 mapping, sub-processor list, breach
  runbook, and the pre-launch operator checklist.

## Notes

- Secrets live only in Render/Vercel env settings — never in git. `.env` files are gitignored; `backend/.env.example` documents every variable.
- The Razorpay webhook route is mounted with a raw body parser **before** `express.json()` in `app.js`; if you move it, signature verification breaks.
- CI (`.github/workflows/ci.yml`) runs the backend test suite and the frontend build on every push/PR.
