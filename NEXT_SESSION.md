# ManPowerPay — Resume Here (next session)

**Branch:** `refinement/phase-0-1-hardening` (14 commits ahead of `main`, not yet merged/pushed).
**Goal:** refine ManPowerPay HMS into a production-ready, commercial multi-tenant SaaS.
Client decisions: multi-tenant (shared-DB **auto-scoping**), generic/configurable payroll, **Razorpay** billing, India-first.

## Done & verified this session
- **Phase 0 + all of Phase 1** — auth hardening (Zod validation, password policy, OTP rate-limit + attempt counter, per-employee temp passwords, forced-reset gate), payroll correctness fixes + **golden-master tests** (`backend/tests/`), atomic leave approval, upload MIME validation + path safety + N+1 fix, **Decimal money** migration, **PII encryption** (AES-256-GCM), DB indexes, **timezone** normalization (`utils/dates.js`), **Supabase Storage** abstraction (`lib/storage.js`), frontend temp-password modal + `/change-password` gate.
- **Phase 2 — tenancy foundation (verified isolated on live DB):**
  - `companyId` on all tenant models; AsyncLocalStorage context (`lib/tenantContext.js`) bound in `verifyJWT`; auto-scoping Prisma extension in `config/db.js`.
  - Self-serve signup: `POST /api/auth/register` + frontend `/signup`.
  - Billing: `Plan`/`Subscription`/`PaymentEvent` models, `lib/plan.js` limit enforcement (402), `GET /api/billing`. Plans seeded: free(10)/starter(50)/growth(500).

## Next up (Phase 2 remaining)
1. **Generic configurable payroll engine** — no external deps; do with golden-master parity vs current engine. *Good first task next session.*
2. **Razorpay** — BLOCKED on user providing Razorpay key/secret + webhook secret. Build checkout + signature-verified webhooks on the existing Subscription/PaymentEvent models.
3. **Frontend billing/upgrade UI** (against `GET /api/billing`) + per-tenant branding.
4. Lower priority: refresh-token/HttpOnly-cookie auth, wider Zod coverage.

## How to resume / verify
- Backend env comes from `backend/.env.production` (DB creds still work; user is migrating to a new **Supabase Mumbai** project — then run `npx prisma migrate deploy`).
- Run tests: `cd backend && npm test` (15 pass). Boot: `npm run dev`. Frontend: `cd frontend && npm run build`.
- Migrations are proper files in `backend/prisma/migrations` (9 total); no schema drift.
- **Gotchas:** set `ENCRYPTION_KEY` (64 hex) to activate PII encryption; set `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` to activate cloud storage; `company_default` tenant has no subscription (ungated); tenant-scoped composite keys mean `findUnique({empCode})`/`findUnique({month_year})` must be `findFirst` (auto-scoped).
- Full context in memory: `manpowerpay-refinement`, `manpowerpay-infra`. Findings: `AUDIT_REPORT.md`. Original plan: `AUDIT_HANDOFF_FOR_OPUS.md`.

## Reminders for the user
- Rotate the secrets still in git history (`backend/.env.production`) — user said they'd handle.
- Provide Razorpay keys when ready for billing.
- Decide backend host (recommended: Fly.io Mumbai) — Render account is suspended.
