# Backup & Data Retention Policy

Operational policy for backing up ManpowerPay data and how long each class of data
is kept. Pair this with `DPDP_COMPLIANCE.md` and `PRIVACY_POLICY.md`.

## 1. What must be backed up

| Asset | Store | Backup mechanism |
| --- | --- | --- |
| Relational data (all tenant records) | Supabase Postgres (Mumbai) | Provider automated backups + Point-in-Time Recovery |
| Uploaded documents & payslip PDFs | Supabase Storage bucket `manpowerpay` | Provider storage durability; periodic export (below) |
| Secrets/config | Render & Vercel env | Not in git — record in a password manager |

Application code and schema live in git; migrations in `backend/prisma/migrations`.

## 2. Database backups (Supabase)

- **Automated daily backups** are enabled by the Supabase plan. Verify the plan
  includes **Point-in-Time Recovery (PITR)** for production; the free tier's backup
  window is limited.
- **Recovery objectives (targets):**
  - RPO (max data loss): **≤ 24h** on daily backups, **≤ 5 min** with PITR.
  - RTO (max downtime to restore): **≤ 4h**.
- **Restore drill:** perform a test restore into a scratch project at least
  **quarterly**; confirm `prisma migrate status` is clean and row counts are sane.

## 3. Logical export (defence in depth)

Beyond provider backups, keep an independent copy:

- **Per-tenant:** Employer admins can self-export from **Company Settings → Data
  Export** or `GET /api/company/export?format=json` — a full JSON archive
  (credentials excluded). Recommended before major changes or offboarding.
- **Operator-level (all tenants):** a periodic `pg_dump` of the database, stored
  encrypted off-provider (e.g. an object store in a different account/region), is
  advised for disaster recovery. Retain the last **7 daily** and **4 weekly** dumps.

## 4. Retention schedule

| Data class | Retention | Enforced by |
| --- | --- | --- |
| Employee & payroll records (payslips, Form 16, statutory) | Duration of subscription + statutory minimum under Indian labour/tax law (typically several years) | Manual policy; do not auto-delete |
| Attendance & leave | Same as payroll (feeds statutory calculations) | Manual policy |
| **Operational audit logs** | Rolling window, default **365 days** | Automated — `AUDIT_LOG_RETENTION_DAYS` |
| OTP / password-reset tokens | Expire in minutes; rows are short-lived | Application logic |
| Backups / dumps | Daily 7 / weekly 4 (see §3) | Backup job rotation |

Statutory retention overrides convenience: **never** prune payroll or tax records to
save space. The automated pruning job only touches `audit_logs`.

## 5. Audit-log pruning job

`AUDIT_LOG_RETENTION_DAYS` controls the window (default `365`; set `0` to disable).

Run the job on a schedule on the host:

```bash
cd backend
npm run prune:audit     # node scripts/pruneAuditLogs.js
```

- It deletes `audit_logs` rows older than the window across all tenants and exits
  non-zero on failure (so a scheduler can alert).
- Schedule it **daily** via Render Cron Job, a host cron entry, or a GitHub Actions
  scheduled workflow.

## 6. Secrets & key management

- `ENCRYPTION_KEY` protects Aadhaar/PAN/bank fields — **back it up securely and
  separately from the database**. Losing it makes those encrypted fields
  unrecoverable; leaking it defeats the encryption. There is no re-encrypt job for
  rows written while it was unset.
- Rotate `JWT_SECRET`, provider keys and SMTP credentials on any suspected exposure.
- Historic secrets committed during early development must be treated as
  compromised and rotated.

## 7. Ownership

Assign an owner for: running restore drills, verifying the pruning job, and rotating
keys. Record who holds the `ENCRYPTION_KEY` backup.
