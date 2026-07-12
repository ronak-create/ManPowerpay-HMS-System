# DPDP Act 2023 — Compliance Notes

How ManpowerPay maps to India's **Digital Personal Data Protection Act, 2023**
(DPDP) and where the operator/Employer still has work to do. This is an engineering
compliance reference, **not** legal advice — confirm obligations with counsel.

## Roles

| DPDP term | Who | Notes |
| --- | --- | --- |
| Data Principal | Employee / admin whose data is processed | |
| Data Fiduciary | The **Employer** for its employee data; the **platform operator** for account data | Multi-tenant: each Employer is a distinct fiduciary |
| Data Processor | The **platform operator**, processing employee data on the Employer's instructions | Governed by the customer agreement / DPA |

A **Data Processing Addendum (DPA)** between the operator and each Employer should
record the processor relationship, sub-processors, and security commitments.

## Principle-by-principle mapping

| DPDP principle | Status | Implementation |
| --- | --- | --- |
| **Lawful purpose & purpose limitation** | ✅ Built | Data is used only for HR/payroll functions the Employer configures. |
| **Data minimisation** | ✅ Built | Only fields needed for payroll/statutory filing are collected; exports and API responses omit password hashes and reset tokens. |
| **Security safeguards** | ✅ Built | AES-256-GCM on Aadhaar/PAN/bank; bcrypt password hashing; TLS; per-tenant query scoping; rate-limiting + account lockout; append-only audit log. |
| **Storage limitation / retention** | ⚙️ Partial | Audit-log pruning is automated (`AUDIT_LOG_RETENTION_DAYS`). Statutory HR records follow labour/tax retention law; document a per-tenant deletion SLA on offboarding. |
| **Accuracy** | ✅ Built | Admins can correct employee records; corrections to attendance are tracked with reason + actor. |
| **Data principal rights** (access, correction, erasure, nomination) | ⚙️ Partial | Tenant self-service export exists (`/api/company/export`). Correction is available in-app. A formal erasure workflow + request log should be defined operationally. |
| **Consent & notice** | ⚙️ Operator to complete | Publish the privacy notice (`PRIVACY_POLICY.md`) and capture consent where the Employer relies on it rather than legal obligation. |
| **Breach notification** | ⚙️ Operator to complete | Define the incident runbook (detect → contain → notify Board/affected principals within DPDP timelines). See below. |
| **Grievance redressal** | ⚙️ Operator to complete | Name a Grievance Officer in the privacy policy and monitor the mailbox. |
| **Children's data** | N/A | The platform processes employee (adult) data; do not onboard minors. |

## Sub-processors (keep current)

| Sub-processor | Purpose | Data exposed |
| --- | --- | --- |
| Supabase (Postgres + Storage), Mumbai `ap-south-1` | Primary datastore + document/payslip storage | All tenant data (sensitive fields encrypted at app layer) |
| Render | Backend API compute | Data in transit during request handling |
| Vercel | Frontend hosting | No persistent personal data (static assets) |
| Razorpay | Subscription billing | Employer billing contact + payment metadata (no employee data) |
| {{EMAIL_PROVIDER}} (SMTP) | OTP / credential emails | Recipient email + one-time content |

Data residency: primary data is hosted in **India (Mumbai)**. If any sub-processor
processes data outside India, confirm it is not in a restricted jurisdiction under
DPDP rules.

## Security controls already in the codebase

- **Field-level encryption** — `backend/src/utils/crypto.js` (AES-256-GCM). Requires
  `ENCRYPTION_KEY` (64 hex chars); **if unset, sensitive fields are stored in
  plaintext**. Setting this is a compliance prerequisite, not optional.
- **Tenant isolation** — `backend/src/config/db.js` Prisma extension auto-scopes
  every query to the caller's `companyId`; verified against cross-tenant reads.
- **Audit trail** — `audit_logs` table; retention via `AUDIT_LOG_RETENTION_DAYS`.
- **Auth hardening** — bcrypt hashes, JWT with expiry, login rate-limit, account
  lockout, forced password reset for provisioned employees.

## Breach-response runbook (to formalise)

1. **Detect** — monitor logs/alerts (see Sentry in the ops setup).
2. **Contain** — rotate `JWT_SECRET`/`ENCRYPTION_KEY` and provider keys as needed;
   revoke sessions.
3. **Assess** — scope which tenants/principals and which fields were affected (audit
   log + DB).
4. **Notify** — inform the Data Protection Board and affected principals within the
   timelines prescribed by the DPDP rules; notify affected Employers per the DPA.
5. **Remediate & record** — patch the cause; log the incident and actions taken.

## Operator checklist before onboarding real customers

- [ ] `ENCRYPTION_KEY` set in production **before the first real employee** is created.
- [ ] Privacy policy published with a named Grievance Officer.
- [ ] DPA template signed with each Employer.
- [ ] Sub-processor list reviewed and kept current.
- [ ] Backup + retention policy in effect (`BACKUP_AND_RETENTION_POLICY.md`).
- [ ] Breach runbook owned by a named person.
- [ ] `.env.production` secrets rotated (historic secrets were committed early in
      development — rotate anything that ever touched git).
