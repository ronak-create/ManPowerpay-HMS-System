# Privacy Policy — ManpowerPay

> **Template.** Replace every `{{PLACEHOLDER}}` with your details and have it reviewed
> by legal counsel before publishing. This reflects how the ManpowerPay platform
> actually handles data as of the current release; keep it in sync with the product.

**Effective date:** {{EFFECTIVE_DATE}}
**Data Fiduciary:** {{LEGAL_ENTITY_NAME}}, {{REGISTERED_ADDRESS}}
**Contact / Grievance Officer:** {{GRIEVANCE_OFFICER_NAME}}, {{GRIEVANCE_EMAIL}}, {{GRIEVANCE_PHONE}}

---

## 1. Who we are

ManpowerPay is a multi-tenant HR and payroll platform. Each customer organisation
("Employer") is a separate tenant. This policy explains how {{LEGAL_ENTITY_NAME}}
(the platform operator) processes personal data, and how Employers, as data
fiduciaries for their own employees, use the platform.

- For **platform account holders** (Employer admins), {{LEGAL_ENTITY_NAME}} is the
  data fiduciary.
- For **employee records** entered by an Employer, the **Employer** is the data
  fiduciary and {{LEGAL_ENTITY_NAME}} acts as a **data processor** on the Employer's
  instructions.

## 2. What data we process

| Category | Examples | Source |
| --- | --- | --- |
| Identity | Name, email, mobile, gender, date of birth | Employer / self |
| Government IDs | PAN, Aadhaar number, UAN, PF/ESIC numbers | Employer |
| Financial | Bank account number, IFSC, salary/CTC, payslips, advances | Employer |
| Employment | Designation, department, site, dates of joining/leaving, attendance, leave | Employer |
| Account & security | Password hash, login timestamps, audit logs, IP address | System |

We do **not** sell personal data or use it for advertising.

## 3. Purpose of processing

Data is processed solely to deliver payroll, attendance, leave, statutory
compliance (EPF/ESIC/PT/TDS, Form 16) and related HR functions requested by the
Employer, and to operate, secure and support the platform.

## 4. Legal basis

Processing is based on: (a) the contract with the Employer; (b) the Employer's
lawful basis for processing its employees' data, including legal obligations under
Indian labour and tax law; and (c) consent where required.

## 5. How we protect data

- **Encryption in transit:** all traffic is served over HTTPS/TLS.
- **Encryption at rest for sensitive fields:** Aadhaar, PAN and bank account
  numbers are encrypted with AES-256-GCM before storage (per-field, application
  layer). Database storage is additionally encrypted at rest by the hosting
  provider.
- **Tenant isolation:** every record carries a tenant id and all queries are
  automatically scoped to the requesting Employer, so one Employer can never read
  another's data.
- **Access control:** role-based access (admin/employee); passwords are stored as
  bcrypt hashes; login is rate-limited and accounts lock after repeated failures.
- **Auditability:** privileged actions are written to an append-only audit log.

## 6. Data sharing

We share personal data only with:
- **Sub-processors** strictly necessary to run the service (cloud hosting/database,
  email delivery, payment gateway). See `docs/DPDP_COMPLIANCE.md` for the list.
- **Statutory authorities**, where the Employer directs us to file returns or where
  required by law.

## 7. Retention

- Employee and payroll records are retained for the duration of the Employer's
  subscription and thereafter as required by Indian statutory record-keeping rules.
- **Operational audit logs** are retained for a rolling window (default 365 days;
  see `docs/BACKUP_AND_RETENTION_POLICY.md`).
- On account closure, data is deleted or returned per the Employer agreement.

## 8. Your rights

Data principals may request access, correction, or erasure of their personal data,
and may nominate another individual to exercise rights in the event of death or
incapacity. Employees should first contact their Employer (the data fiduciary for
their records). Platform-level requests: {{GRIEVANCE_EMAIL}}.

Employers can export a complete copy of their tenant's data at any time from
**Company Settings → Data Export** (or `GET /api/company/export`).

## 9. Grievance redressal

Complaints may be sent to the Grievance Officer named above. We will acknowledge and
respond within the timelines required by the Digital Personal Data Protection Act,
2023 and its rules.

## 10. Changes

We may update this policy; material changes will be notified to Employer admins. The
"Effective date" above reflects the current version.
